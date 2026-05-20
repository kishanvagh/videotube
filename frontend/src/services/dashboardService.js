import { api } from "./api";

/**
 * Get channel statistics (total views, subscribers, likes, videos)
 */
export const getChannelStats = async () => {
    try {
        const response = await api.get("/dashboard/stats");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch channel stats"
        );
    }
};

/**
 * Get all videos uploaded by the channel/creator
 */
export const getChannelVideos = async () => {
    try {
        const response = await api.get("/dashboard/videos");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch channel videos"
        );
    }
};
