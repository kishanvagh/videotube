import { useState } from "react";
import { useSelector } from "react-redux";

import {
    updateComment,
    deleteComment,
} from "../services/commentService";

import { formatUploadTime } from "../utils/videoHelpers";

function CommentCard({
    comment,
    onDelete,
    onUpdate,
}) {
    const { user } = useSelector((state) => state.auth);

    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(comment.content);
    const [loading, setLoading] = useState(false);

    const isOwner = user?._id === comment.owner._id;

    // Handle update
    const handleUpdate = async () => {
        try {
            setLoading(true);

            await updateComment(comment._id, editedContent);
            onUpdate(comment._id, editedContent);
            setIsEditing(false);

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await deleteComment(comment._id);
            onDelete(comment._id);
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <div className="bg-card-bg/40 border border-border-color rounded-3xl p-5 transition-all duration-300 hover:bg-card-bg/70 animate-fade-in">

            <div className="flex gap-4">

                {/* Avatar */}
                <img
                    src={comment.owner.avatar}
                    alt={comment.owner.username}
                    className="w-10 h-10 rounded-2xl object-cover border border-border-color shrink-0"
                />

                <div className="flex-1 min-w-0">

                    {/* Header */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-text-primary font-bold text-sm font-display">
                            @{comment.owner.username}
                        </h3>
                        <span className="text-text-muted text-[11px] font-semibold">
                            {formatUploadTime(comment.createdAt)}
                        </span>
                    </div>

                    {/* Content */}
                    {!isEditing ? (
                        <p className="text-text-secondary mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    ) : (
                        <div className="mt-3 space-y-3">
                            <textarea
                                value={editedContent}
                                onChange={(e) => setEditedContent(e.target.value)}
                                className="w-full bg-primary-bg/70 border border-border-color rounded-2xl p-4 text-text-primary outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-300 resize-none"
                                rows={3}
                            />

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className="bg-accent hover:bg-accent-hover px-4 py-2 rounded-xl text-text-primary text-xs font-bold transition-all duration-200 shadow-md shadow-accent/15 cursor-pointer disabled:opacity-50"
                                >
                                    Save
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-text-secondary hover:text-text-primary text-xs font-bold transition-all duration-200 border border-border-color cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    {isOwner && !isEditing && (
                        <div className="flex items-center gap-4 mt-3 pt-1">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-text-secondary hover:text-accent font-semibold transition-all duration-200 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                ✏️ Edit
                            </button>
                            <button
                                onClick={handleDelete}
                                className="text-text-muted hover:text-danger-red font-semibold transition-all duration-200 text-[11px] flex items-center gap-1 cursor-pointer"
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CommentCard;