  import { api } from "./api";

/**
 * Toggle subscription
 */
export const toggleSubscription = async (
    channelId
) => {
    try {
        const response = await api.post(
            `/subscriptions/c/${channelId}`
        );

        return response.data;

    } catch (error) {
        throw new Error(
            error.response?.data?.message ||
            "Failed to toggle subscription"
        );
    }
};

/**
 * Get channel subscribers
 */
export const getChannelSubscribers =
    async (channelId) => {
        try {
            const response = await api.get(
                `/subscriptions/c/${channelId}`
            );

            return response.data;

        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                    "Failed to fetch subscribers"
            );
        }
    };