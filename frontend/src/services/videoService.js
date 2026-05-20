import { api } from "./api";

/**
 * Get all videos
 */
export const getAllVideos = async ({
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId = "",
} = {}) => {
    try {
        const response = await api.get("/videos", {
            params: {
                page,
                limit,
                query,
                sortBy,
                sortType,
                userId,
            },
        });

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to fetch videos"
        );
    }
};

/**
 * Get single video details
 */
export const getVideoById = async (videoId) => {
    try {
        const response = await api.get(`/videos/${videoId}`);

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to fetch video"
        );
    }
};

/**
 * Add video to watch history
 */
export const addToWatchHistory = async (videoId) => {
    try {
        const response = await api.post(`/watch/${videoId}`);

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to add video to watch history"
        );
    }
};

/**
 * Publish a new video
 */
export const publishAVideo = async (formData, onUploadProgress) => {
    try {
        const response = await api.post("/videos", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        });

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to publish video"
        );
    }
};

/**
 * Update video details (thumbnail, title, description)
 */
export const updateVideo = async (videoId, formData) => {
    try {
        const response = await api.patch(`/videos/${videoId}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to update video"
        );
    }
};

/**
 * Delete a video
 */
export const deleteVideo = async (videoId) => {
    try {
        const response = await api.delete(`/videos/${videoId}`);

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to delete video"
        );
    }
};

/**
 * Toggle video visibility status
 */
export const togglePublishStatus = async (videoId) => {
    try {
        const response = await api.patch(`/videos/toggle/publish/${videoId}`);

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to toggle video publish status"
        );
    }
};