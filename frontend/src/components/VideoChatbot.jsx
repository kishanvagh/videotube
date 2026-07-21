import { useState } from "react";
import { askVideoChatbot, updateVideoTranscript } from "../services/chatService";

function VideoChatbot({ videoId, videoTitle, initialTranscript, isOwner }) {
    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: `Hi! I'm your AI Video Assistant powered by Qdrant Vector DB. Ask me anything about "${videoTitle || "this video"}"!`,
            sources: []
        }
    ]);
    const [inputQuery, setInputQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [showTranscriptModal, setShowTranscriptModal] = useState(false);
    const [transcriptText, setTranscriptText] = useState(initialTranscript || "");
    const [updatingTranscript, setUpdatingTranscript] = useState(false);
    const [transcriptStatus, setTranscriptStatus] = useState("");

    const quickPrompts = [
        "Summarize this video",
        "What are the main topics?",
        "Key takeaways"
    ];

    const handleSend = async (queryText) => {
        const text = queryText || inputQuery;
        if (!text.trim() || loading) return;

        const userMsg = { sender: "user", text };
        setMessages((prev) => [...prev, userMsg]);
        if (!queryText) setInputQuery("");
        setLoading(true);

        try {
            const res = await askVideoChatbot(videoId, text);
            const botMsg = {
                sender: "bot",
                text: res.data.answer,
                sources: res.data.sources || []
            };
            setMessages((prev) => [...prev, botMsg]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: `⚠️ ${err.message || "Failed to retrieve response from Qdrant Vector DB."}`,
                    sources: []
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTranscript = async () => {
        if (!transcriptText.trim()) return;
        setUpdatingTranscript(true);
        setTranscriptStatus("");
        try {
            await updateVideoTranscript(videoId, transcriptText);
            setTranscriptStatus("✨ Transcript indexed in Qdrant Vector DB successfully!");
            setTimeout(() => {
                setShowTranscriptModal(false);
                setTranscriptStatus("");
            }, 1500);
        } catch (err) {
            setTranscriptStatus(`⚠️ ${err.message}`);
        } finally {
            setUpdatingTranscript(false);
        }
    };

    return (
        <div className="bg-card-bg/40 border border-border-color rounded-3xl p-6 backdrop-blur-md space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border-color pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🤖</span>
                    <div>
                        <h3 className="text-text-primary text-base font-bold font-display">
                            AI Video Chatbot
                        </h3>
                        <p className="text-text-muted text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            Qdrant Vector DB RAG
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setShowTranscriptModal(true)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-border-color text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                    📜 {isOwner ? "Edit Transcript" : "View Transcript"}
                </button>
            </div>

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {quickPrompts.map((prompt, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        disabled={loading}
                        className="text-xs px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 text-accent font-medium whitespace-nowrap transition cursor-pointer disabled:opacity-50"
                    >
                        ⚡ {prompt}
                    </button>
                ))}
            </div>

            {/* Chat Box */}
            <div className="h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex flex-col ${
                            msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                    >
                        <div
                            className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                                msg.sender === "user"
                                    ? "bg-accent text-white font-medium shadow-md shadow-accent/20 rounded-br-none"
                                    : "bg-elevated/80 border border-border-color text-text-primary rounded-bl-none"
                            }`}
                        >
                            <p className="whitespace-pre-wrap">{msg.text}</p>

                            {/* Qdrant Vector Source Badges */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                                    <span className="text-[10px] text-accent font-semibold block uppercase tracking-wider">
                                        🔍 Qdrant Vector Matches:
                                    </span>
                                    {msg.sources.slice(0, 2).map((src, sIdx) => (
                                        <div
                                            key={sIdx}
                                            className="text-[10px] bg-black/20 p-1.5 rounded-lg border border-white/5 text-text-muted italic line-clamp-2"
                                        >
                                            "{src.text}"
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex items-center gap-2 text-xs text-text-muted bg-elevated/50 p-3 rounded-2xl border border-border-color w-fit">
                        <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                        Searching Qdrant Vector DB & generating answer...
                    </div>
                )}
            </div>

            {/* Input Bar */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                }}
                className="flex items-center gap-2 pt-2 border-t border-border-color"
            >
                <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask a question about this video..."
                    className="flex-1 bg-primary-bg/50 border border-border-color rounded-2xl px-4 py-2.5 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !inputQuery.trim()}
                    className="px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-2xl text-xs font-bold transition shadow-lg shadow-accent/15 disabled:opacity-50 cursor-pointer"
                >
                    Send 🚀
                </button>
            </form>

            {/* Transcript Modal */}
            {showTranscriptModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="relative w-full max-w-xl bg-elevated border border-border-color rounded-3xl p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-border-color pb-3">
                            <h3 className="text-base font-bold text-text-primary font-display">
                                📜 Video Transcript & Vector Index
                            </h3>
                            <button
                                onClick={() => setShowTranscriptModal(false)}
                                className="text-text-muted hover:text-text-primary text-sm cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {transcriptStatus && (
                            <div className="text-xs p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent font-medium">
                                {transcriptStatus}
                            </div>
                        )}

                        <p className="text-xs text-text-muted">
                            {isOwner
                                ? "Paste or edit the transcript below. Saving will re-index vectors into Qdrant Vector DB."
                                : "Transcript used for vector search and RAG Q&A."}
                        </p>

                        <textarea
                            value={transcriptText}
                            onChange={(e) => setTranscriptText(e.target.value)}
                            placeholder="Enter video transcript text here..."
                            rows={8}
                            disabled={!isOwner || updatingTranscript}
                            className="w-full p-4 rounded-2xl bg-primary-bg/60 border border-border-color text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition"
                        />

                        <div className="flex justify-end gap-3 pt-2 border-t border-border-color">
                            <button
                                onClick={() => setShowTranscriptModal(false)}
                                className="px-4 py-2 text-xs rounded-xl border border-border-color text-text-secondary hover:bg-white/5 cursor-pointer"
                            >
                                Close
                            </button>
                            {isOwner && (
                                <button
                                    onClick={handleSaveTranscript}
                                    disabled={updatingTranscript || !transcriptText.trim()}
                                    className="px-5 py-2 text-xs font-bold rounded-xl bg-accent text-white hover:bg-accent-hover transition shadow-md shadow-accent/20 cursor-pointer disabled:opacity-50"
                                >
                                    {updatingTranscript ? "Indexing Vectors..." : "Save & Index in Qdrant"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default VideoChatbot;
