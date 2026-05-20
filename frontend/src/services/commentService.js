import { api } from "./api";

/**
 * Get comments for a video
 */
export const getVideoComments = async (videoId) => {
    try {
        const response = await api.get(`/comments/${videoId}`);

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to fetch comments"
        );
    }
};

/**
 * Add new comment
 */
export const addComment = async (videoId, content) => {
    try {
        const response = await api.post(
            `/comments/${videoId}`,
            { content }
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to add comment"
        );
    }
};

/**
 * Delete comment
 */
export const deleteComment = async (commentId) => {
    try {
        const response = await api.delete(
            `/comments/c/${commentId}`
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to delete comment"
        );
    }
};

/**
 * Update comment
 */
export const updateComment = async (
    commentId,
    content
) => {
    try {
        const response = await api.patch(
            `/comments/c/${commentId}`,
            { content }
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to update comment"
        );
    }
};