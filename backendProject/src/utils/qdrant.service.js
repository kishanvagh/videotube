import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "video_transcripts";
const VECTOR_SIZE = 384;

// Initialize Qdrant Client (Default to local Qdrant instance or env QDRANT_URL)
const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
const qdrantApiKey = process.env.QDRANT_API_KEY || undefined;

let client = null;
try {
    client = new QdrantClient({
        url: qdrantUrl,
        apiKey: qdrantApiKey
    });
} catch (err) {
    console.warn("Failed to initialize QdrantClient:", err.message);
}

// In-memory fallback vector storage if Qdrant server is unreachable
const memoryVectorStore = new Map();

/**
 * Generate a deterministic vector embedding for text
 * (Fallback embedding generator or interface for AI embedding APIs)
 */
export const generateEmbedding = async (text) => {
    const textToEmbed = text.trim().toLowerCase();
    
    // Check if Gemini API key is configured for real embeddings
    if (process.env.GEMINI_API_KEY) {
        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        model: "models/text-embedding-004",
                        content: { parts: [{ text: textToEmbed }] }
                    })
                }
            );
            const data = await response.json();
            if (data.embedding?.values) {
                // Return normalized vector or trimmed/padded to 384
                const vec = data.embedding.values;
                return normalizeVector(vec.slice(0, VECTOR_SIZE));
            }
        } catch (e) {
            console.warn("Gemini embedding error, using local feature vector:", e.message);
        }
    }

    // Local deterministic feature hashing vector generator (384 dims)
    const vec = new Array(VECTOR_SIZE).fill(0);
    const words = textToEmbed.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        for (let j = 0; j < word.length; j++) {
            const charCode = word.charCodeAt(j);
            const index = (charCode * (j + 1) + i * 13) % VECTOR_SIZE;
            vec[index] += 1 / (1 + j);
        }
    }

    return normalizeVector(vec);
};

function normalizeVector(vec) {
    let norm = 0;
    for (let i = 0; i < vec.length; i++) {
        norm += vec[i] * vec[i];
    }
    norm = Math.sqrt(norm);
    if (norm === 0) return vec;
    return vec.map((val) => val / norm);
}

function cosineSimilarity(vecA, vecB) {
    let dot = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        dot += vecA[i] * vecB[i];
    }
    return dot;
}

/**
 * Ensure Qdrant collection exists
 */
export const ensureQdrantCollection = async () => {
    if (!client) return false;
    try {
        const collections = await client.getCollections();
        const exists = collections.collections?.some(
            (c) => c.name === COLLECTION_NAME
        );
        if (!exists) {
            await client.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: "Cosine"
                }
            });
            console.log(`Created Qdrant collection '${COLLECTION_NAME}'`);
        }
        return true;
    } catch (error) {
        console.warn("Qdrant server not accessible, using memory fallback vector store:", error.message);
        return false;
    }
};

/**
 * Split text into semantic chunks
 */
export const chunkText = (text, maxLength = 350, overlap = 50) => {
    if (!text || !text.trim()) return [];
    
    const sentences = text.split(/(?<=[.?!])\s+/);
    const chunks = [];
    let currentChunk = "";

    for (const sentence of sentences) {
        if ((currentChunk + " " + sentence).length > maxLength && currentChunk) {
            chunks.push(currentChunk.trim());
            // Keep overlap
            const words = currentChunk.split(" ");
            currentChunk = words.slice(-Math.floor(overlap / 10)).join(" ") + " " + sentence;
        } else {
            currentChunk = currentChunk ? currentChunk + " " + sentence : sentence;
        }
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text.trim()];
};

/**
 * Index video title, description, and transcript into Qdrant Vector DB
 */
export const indexVideoTranscript = async ({ videoId, title, description, transcript }) => {
    const fullText = [
        `Title: ${title}`,
        `Description: ${description}`,
        transcript ? `Transcript: ${transcript}` : ""
    ].filter(Boolean).join("\n\n");

    const textChunks = chunkText(fullText);
    const points = [];
    const memoryRecords = [];

    for (let i = 0; i < textChunks.length; i++) {
        const chunkTextContent = textChunks[i];
        const vector = await generateEmbedding(chunkTextContent);
        
        // String to numeric ID hash for Qdrant point ID
        const pointId = Math.abs(
            (videoId + "_" + i).split("").reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) | 0, 0)
        ) || (i + 1);

        const payload = {
            videoId: videoId.toString(),
            title: title || "",
            chunkText: chunkTextContent,
            chunkIndex: i
        };

        points.push({
            id: pointId,
            vector,
            payload
        });

        memoryRecords.push({
            id: pointId,
            vector,
            payload
        });
    }

    // Save to memory vector store fallback
    memoryVectorStore.set(videoId.toString(), memoryRecords);

    // Upsert into Qdrant DB if available
    const isQdrantReady = await ensureQdrantCollection();
    if (isQdrantReady && client && points.length > 0) {
        try {
            await client.upsert(COLLECTION_NAME, {
                wait: true,
                points
            });
            console.log(`Indexed ${points.length} vector chunks into Qdrant DB for video ${videoId}`);
        } catch (err) {
            console.warn("Failed to upsert points to Qdrant DB, fallback saved:", err.message);
        }
    }

    return { indexedChunks: textChunks.length };
};

/**
 * Search Qdrant vector database for relevant transcript chunks
 */
export const searchVideoChunks = async (videoId, query, limit = 4) => {
    const queryVector = await generateEmbedding(query);

    // Try searching Qdrant DB
    const isQdrantReady = await ensureQdrantCollection();
    if (isQdrantReady && client) {
        try {
            const searchResults = await client.search(COLLECTION_NAME, {
                vector: queryVector,
                limit,
                filter: {
                    must: [
                        {
                            key: "videoId",
                            match: { value: videoId.toString() }
                        }
                    ]
                }
            });

            if (searchResults && searchResults.length > 0) {
                return searchResults.map((hit) => ({
                    score: hit.score,
                    text: hit.payload.chunkText,
                    chunkIndex: hit.payload.chunkIndex
                }));
            }
        } catch (err) {
            console.warn("Qdrant search error, using memory vector fallback:", err.message);
        }
    }

    // Memory store fallback search
    const records = memoryVectorStore.get(videoId.toString()) || [];
    if (records.length === 0) return [];

    const scored = records.map((rec) => ({
        score: cosineSimilarity(queryVector, rec.vector),
        text: rec.payload.chunkText,
        chunkIndex: rec.payload.chunkIndex
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit);
};

/**
 * Generate RAG response using Gemini or intelligent context synthesis
 */
export const generateRAGAnswer = async (videoId, title, description, query, contextChunks) => {
    const contextText = contextChunks.map((c) => c.text).join("\n\n---\n\n");
    
    // Check if Gemini API Key is available
    if (process.env.GEMINI_API_KEY) {
        try {
            const prompt = `You are an AI Video Assistant answering questions about a video.
Video Title: ${title}
Video Description: ${description}

Retrieved Video Transcript / Context Chunks:
${contextText || "No transcript chunks available."}

User Question: ${query}

Provide a helpful, precise, and polite response based strictly on the video content and context provided above.`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                }
            );
            const data = await response.json();
            const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (answer) {
                return answer;
            }
        } catch (err) {
            console.warn("Gemini RAG answer generation error:", err.message);
        }
    }

    // Contextual Synthesis Fallback
    if (!contextChunks || contextChunks.length === 0) {
        return `I don't have transcript details for "${title}" yet. You can upload or update the video transcript to ask questions!`;
    }

    const topChunk = contextChunks[0].text;
    return `Based on the video content for "${title}":\n\n"${topChunk}"\n\n(Relevant segment retrieved from vector DB search).`;
};
