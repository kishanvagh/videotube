import { api } from "./api";

/**
 * Send a question to the video RAG chatbot powered by Qdrant Vector DB
 */
export const askVideoChatbot = async (videoId, question) => {
    try {
        const response = await api.post(`/videos/${videoId}/chat`, { question });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to get AI chatbot response"
        );
    }
};

/**
 * Upload or update video transcript
 */
export const updateVideoTranscript = async (videoId, transcript) => {
    try {
        const response = await api.post(`/videos/${videoId}/transcript`, { transcript });
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to update transcript"
        );
    }
};
