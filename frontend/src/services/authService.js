import { api } from "./api";

/**
 * Register a new user
 * @param {FormData} userData
 * @returns {Promise<Object>}
 */
export const registerUser = async (userData) => {
    try {
        const response = await api.post("/users/register", userData);

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to register user"
        );
    }
};

/**
 * Login user
 * @param {Object} userData
 * @returns {Promise<Object>}
 */
export const loginUser = async (userData) => {
    try {
        const response = await api.post("/users/login", userData);

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to login"
        );
    }
};

/**
 * Logout current user
 * @returns {Promise<Object>}
 */
export const logoutUser = async () => {
    try {
        const response = await api.post("/users/logout");

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to logout"
        );
    }
};

/**
 * Get currently logged-in user
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
    try {
        const response = await api.get("/users/current-user");

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch current user"
        );
    }
};

/**
 * Refresh access token
 * @returns {Promise<Object>}
 */
export const refreshAccessToken = async () => {
    try {
        const response = await api.post("/users/refresh-token");

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to refresh access token"
        );
    }
};

/**
 * Change user password
 * @param {Object} passwordData
 * @returns {Promise<Object>}
 */
export const changePassword = async (passwordData) => {
    try {
        const response = await api.post(
            "/users/change-password",
            passwordData
        );

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to change password"
        );
    }
};

/**
 * Update account details
 * @param {Object} updatedData
 * @returns {Promise<Object>}
 */
export const updateAccountDetails = async (updatedData) => {
    try {
        const response = await api.patch(
            "/users/update-account",
            updatedData
        );

        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to update account details"
        );
    }
};

/**
 * Get user channel profile by username
 */
export const getUserChannelProfile = async (username) => {
    try {
        const response = await api.get(`/users/c/${username}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch channel profile"
        );
    }
};

/**
 * Get currently logged-in user watch history
 */
export const getWatchHistory = async () => {
    try {
        const response = await api.get("/users/history");
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch watch history"
        );
    }
};