import { api } from "./api";

/**
 * Get all watch later videos for the current user
 * @returns {Promise<Object>}
 */
export const getWatchLaterList = async () => {
    try {
        const response = await api.get("/users/watch-later");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch watch later videos"
        );
    }
};

/**
 * Toggle watch later status of a video
 * @param {string} videoId
 * @returns {Promise<Object>}
 */
export const toggleWatchLater = async (videoId) => {
    try {
        const response = await api.post(`/users/watch-later/${videoId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to toggle watch later state"
        );
    }
};
