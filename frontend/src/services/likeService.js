import { api } from "./api";

/**
 * Toggle video like
 */
export const toggleVideoLike = async (videoId) => {
    try {
        const response = await api.post(
            `/likes/toggle/v/${videoId}`
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to toggle video like"
        );
    }
};

/**
 * Toggle comment like
 */
export const toggleCommentLike = async (
    commentId
) => {
    try {
        const response = await api.post(
            `/likes/toggle/c/${commentId}`
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to toggle comment like"
        );
    }
};

/**
 * Get liked videos
 */
export const getLikedVideos = async () => {
    try {
        const response = await api.get(
            "/likes/videos"
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to fetch liked videos"
        );
    }
};