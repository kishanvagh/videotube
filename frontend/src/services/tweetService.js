import { api } from "./api";

/**
 * Create a new tweet
 * @param {Object} tweetData { content }
 */
export const createTweet = async (tweetData) => {
    try {
        const response = await api.post("/tweets", tweetData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to create tweet"
        );
    }
};

/**
 * Get all tweets of a user
 */
export const getUserTweets = async (userId) => {
    try {
        const response = await api.get(`/tweets/user/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to fetch user tweets"
        );
    }
};

/**
 * Update a tweet
 */
export const updateTweet = async (tweetId, tweetData) => {
    try {
        const response = await api.patch(`/tweets/${tweetId}`, tweetData);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to update tweet"
        );
    }
};

/**
 * Delete a tweet
 */
export const deleteTweet = async (tweetId) => {
    try {
        const response = await api.delete(`/tweets/${tweetId}`);
        return response.data;
    } catch (error) {
        throw new Error(
            error.response?.data?.message || "Failed to delete tweet"
        );
    }
};
