import { api } from "./api";

/**
 * Create a new playlist
 * @param {Object} playlistData { name, description }
 */
export const createPlaylist = async (playlistData) => {
    try {
        const response = await api.post("/playlist", playlistData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to create playlist"
        );
    }
};

/**
 * Get playlist by ID
 */
export const getPlaylistById = async (playlistId) => {
    try {
        const response = await api.get(`/playlist/${playlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch playlist"
        );
    }
};

/**
 * Update playlist
 */
export const updatePlaylist = async (playlistId, playlistData) => {
    try {
        const response = await api.patch(`/playlist/${playlistId}`, playlistData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to update playlist"
        );
    }
};

/**
 * Delete playlist
 */
export const deletePlaylist = async (playlistId) => {
    try {
        const response = await api.delete(`/playlist/${playlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to delete playlist"
        );
    }
};

/**
 * Add video to playlist
 */
export const addVideoToPlaylist = async (videoId, playlistId) => {
    try {
        const response = await api.patch(`/playlist/add/${videoId}/${playlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to add video to playlist"
        );
    }
};

/**
 * Remove video from playlist
 */
export const removeVideoFromPlaylist = async (videoId, playlistId) => {
    try {
        const response = await api.patch(`/playlist/remove/${videoId}/${playlistId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to remove video from playlist"
        );
    }
};

/**
 * Get all playlists of a user
 */
export const getUserPlaylists = async (userId) => {
    try {
        const response = await api.get(`/playlist/user/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch user playlists"
        );
    }
};
