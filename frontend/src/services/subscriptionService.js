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
 * Get subscribers count
 */
export const getChannelSubscribers =
    async (subscriberId) => {
        try {
            const response = await api.get(
                `/subscriptions/u/${subscriberId}`
            );

            return response.data;

        } catch (error) {
            throw new Error(
                error.response?.data?.message ||
                    "Failed to fetch subscribers"
            );
        }
    };