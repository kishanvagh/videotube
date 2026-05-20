import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    getUserTweets,
    createTweet,
    updateTweet,
    deleteTweet,
} from "../services/tweetService";
import { formatUploadTime } from "../utils/videoHelpers";
import Loader from "./Loader";

function TweetManager({ userId, channelOwner }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [content, setContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit State
    const [editingTweetId, setEditingTweetId] = useState(null);
    const [editingContent, setEditingContent] = useState("");

    const isOwnChannel = isAuthenticated && user?._id === userId;

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                setLoading(true);
                const response = await getUserTweets(userId);
                // The response structure typically holds the array directly or inside data
                setTweets(response.data || []);
            } catch (err) {
                setError(err.message || "Failed to load community tweets.");
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchTweets();
        }
    }, [userId]);

    // Handle Create Tweet
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        setError("");

        try {
            const response = await createTweet({ content });
            
            // Optimistic/Live UI update
            const newTweet = {
                ...response.data,
                owner: user || channelOwner,
                createdAt: new Date().toISOString(),
            };

            setTweets((prev) => [newTweet, ...prev]);
            setContent("");
        } catch (err) {
            setError(err.message || "Failed to post tweet.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete Tweet
    const handleDelete = async (tweetId) => {
        if (!window.confirm("Are you sure you want to delete this community post?")) return;

        try {
            await deleteTweet(tweetId);
            setTweets((prev) => prev.filter((t) => t._id !== tweetId));
        } catch (err) {
            setError(err.message || "Failed to delete tweet.");
        }
    };

    // Handle Update Tweet
    const handleUpdate = async (tweetId) => {
        if (!editingContent.trim()) return;

        try {
            await updateTweet(tweetId, { content: editingContent });
            setTweets((prev) =>
                prev.map((t) => (t._id === tweetId ? { ...t, content: editingContent } : t))
            );
            setEditingTweetId(null);
            setEditingContent("");
        } catch (err) {
            setError(err.message || "Failed to update tweet.");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            
            {/* Create Tweet Form */}
            {isOwnChannel && (
                <form
                    onSubmit={handleCreate}
                    className="p-6 bg-card-bg/40 border border-border-color rounded-3xl space-y-4 backdrop-blur-md"
                >
                    <h3 className="text-text-primary font-bold text-lg font-display">Create Community Post</h3>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's on your mind? Share updates, ideas, or announcements..."
                        rows={3}
                        maxLength={500}
                        className="w-full px-5 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 resize-none text-sm"
                    />
                    <div className="flex items-center justify-between text-xs text-text-secondary">
                        <span>{content.length}/500 characters</span>
                        <button
                            type="submit"
                            disabled={isSubmitting || !content.trim()}
                            className="px-6 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-text-primary font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
                        >
                            {isSubmitting ? "Posting..." : "Post Update"}
                        </button>
                    </div>
                </form>
            )}

            {error && (
                <div className="p-4 bg-danger-red/10 border border-danger-red/20 rounded-2xl text-danger-red text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* List Tweets */}
            <div className="space-y-4">
                {tweets.length === 0 ? (
                    <div className="text-center p-8 bg-card-bg/20 border border-border-color rounded-3xl">
                        <p className="text-text-muted text-sm">No community posts yet.</p>
                    </div>
                ) : (
                    tweets.map((tweet) => {
                        const isTweetOwner = isAuthenticated && user?._id === tweet.owner?._id;
                        return (
                            <div
                                key={tweet._id}
                                className="p-6 bg-card-bg/30 border border-border-color rounded-3xl flex gap-4 transition-all duration-300 hover:bg-card-bg/50"
                            >
                                <img
                                    src={tweet.owner?.avatar || "https://via.placeholder.com/44"}
                                    alt={tweet.owner?.username}
                                    className="w-11 h-11 rounded-2xl object-cover border border-border-color"
                                />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between flex-wrap gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-text-primary font-bold text-sm font-display">
                                                {tweet.owner?.fullName}
                                            </span>
                                            <span className="text-text-muted text-xs">
                                                @{tweet.owner?.username}
                                            </span>
                                            <span className="text-border-color text-xs">•</span>
                                            <span className="text-text-secondary text-xs">
                                                {formatUploadTime(tweet.createdAt)}
                                            </span>
                                        </div>

                                        {isTweetOwner && editingTweetId !== tweet._id && (
                                            <div className="flex items-center gap-3 text-xs">
                                                <button
                                                    onClick={() => {
                                                        setEditingTweetId(tweet._id);
                                                        setEditingContent(tweet.content);
                                                    }}
                                                    className="text-text-secondary hover:text-text-primary transition duration-200 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tweet._id)}
                                                    className="text-danger-red/80 hover:text-danger-red transition duration-200 cursor-pointer font-semibold"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {editingTweetId === tweet._id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={editingContent}
                                                onChange={(e) => setEditingContent(e.target.value)}
                                                className="w-full px-4 py-2.5 rounded-xl bg-primary-bg/40 border border-border-color text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 resize-none text-sm"
                                                rows={2}
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleUpdate(tweet._id)}
                                                    className="px-4 py-2 bg-accent hover:bg-accent-hover text-text-primary rounded-xl text-xs font-bold transition duration-300 shadow-md shadow-accent/10 cursor-pointer"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingTweetId(null);
                                                        setEditingContent("");
                                                    }}
                                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-text-primary border border-border-color rounded-xl text-xs font-semibold transition duration-300 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-text-secondary text-sm whitespace-pre-wrap leading-relaxed">
                                            {tweet.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

        </div>
    );
}

export default TweetManager;
