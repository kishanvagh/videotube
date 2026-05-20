import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import Loader from "./Loader";
import CommentCard from "./CommentCard";

import {
    getVideoComments,
    addComment,
} from "../services/commentService";

function CommentsSection({ videoId }) {
    const { isAuthenticated, user } =
        useSelector((state) => state.auth);

    const [comments, setComments] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [commentText, setCommentText] =
        useState("");

    // Fetch comments
    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);

                const response =
                    await getVideoComments(
                        videoId
                    );

                setComments(
                    response.data.comments
                );

            } catch (error) {
                setError(
                    error.message ||
                        "Failed to fetch comments"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [videoId]);

    // Add comment
    const handleAddComment = async () => {
        if (!commentText.trim()) return;

        try {
            const response =
                await addComment(
                    videoId,
                    commentText
                );

            // Optimistic UI update
            const newComment = {
                ...response.data,
                owner: user,
            };

            setComments((prev) => [
                newComment,
                ...prev,
            ]);

            setCommentText("");

        } catch (error) {
            console.error(error.message);
        }
    };

    // Delete comment
    const handleDeleteComment = (
        commentId
    ) => {
        setComments((prev) =>
            prev.filter(
                (comment) =>
                    comment._id !== commentId
            )
        );
    };

    // Update comment
    const handleUpdateComment = (
        commentId,
        updatedContent
    ) => {
        setComments((prev) =>
            prev.map((comment) =>
                comment._id === commentId
                    ? {
                          ...comment,
                          content:
                              updatedContent,
                      }
                    : comment
            )
        );
    };

    // Loading state
    if (loading) {
        return <Loader />;
    }

    return (
        <div className="bg-card-bg/40 border border-border-color backdrop-blur-md rounded-3xl p-6 mt-6">

            {/* Header */}
            <h2 className="text-text-primary text-xl font-bold mb-6 font-display">
                {comments.length} Comments
            </h2>

            {/* Add Comment */}
            {isAuthenticated && (
                <div className="mb-8">

                    <textarea
                        value={commentText}
                        onChange={(e) =>
                            setCommentText(
                                e.target.value
                            )
                        }
                        placeholder="Share your thoughts on this video..."
                        className="w-full bg-primary-bg/40 border border-border-color rounded-2xl p-4 text-text-primary placeholder-text-muted outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all duration-300 text-sm"
                        rows={4}
                    />

                    <div className="flex justify-end mt-3">

                        <button
                            onClick={
                                handleAddComment
                            }
                            className="bg-accent hover:bg-accent-hover text-text-primary font-bold px-6 py-2.5 rounded-2xl shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm cursor-pointer"
                        >
                            Post Comment
                        </button>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <p className="text-danger-red text-sm mb-4">
                    ⚠️ {error}
                </p>
            )}

            {/* Empty State */}
            {comments.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-text-muted">
                        No comments yet. Be the first to share your thoughts!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">

                    {comments.map((comment) => (
                        <CommentCard
                            key={comment._id}
                            comment={comment}
                            onDelete={
                                handleDeleteComment
                            }
                            onUpdate={
                                handleUpdateComment
                            }
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default CommentsSection;