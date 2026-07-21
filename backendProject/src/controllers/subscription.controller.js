import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Subscribe / Unsubscribe a channel
 * @route   POST /api/v1/subscriptions/c/:channelId
 * @access  Private
 */
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Prevent self subscription
    if (channelId === req.user._id.toString()) {
        throw new ApiError(
            400,
            "You cannot subscribe to your own channel"
        );
    }

    // Check channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Check already subscribed or not
    const alreadySubscribed = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    // If already subscribed -> unsubscribe
    if (alreadySubscribed) {
        await Subscription.findByIdAndDelete(alreadySubscribed._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    subscribed: false
                },
                "Channel unsubscribed successfully"
            )
        );
    }

    // Create new subscription
    const subscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                subscribed: true,
                subscription
            },
            "Channel subscribed successfully"
        )
    );
});

/**
 * @desc    Get all subscribers of a channel
 * @route   GET /api/v1/subscriptions/c/:channelId
 * @access  Public
 */
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    // Validate channelId
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    // Check channel exists
    const channel = await User.findById(channelId);

    if (!channel) {
        throw new ApiError(404, "Channel not found");
    }

    // Get subscribers
    const subscribers = await Subscription.find({
        channel: channelId
    }).populate(
        "subscriber",
        "fullName username avatar"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribers: subscribers.length,
                subscribers
            },
            "Channel subscribers fetched successfully"
        )
    );
});

/**
 * @desc    Get all channels subscribed by user
 * @route   GET /api/v1/subscriptions/u/:subscriberId
 * @access  Public
 */
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    // Validate subscriberId
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID");
    }

    // Check user exists
    const user = await User.findById(subscriberId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Get subscribed channels
    const subscribedChannels = await Subscription.find({
        subscriber: subscriberId
    }).populate(
        "channel",
        "fullName username avatar"
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSubscribedChannels:
                    subscribedChannels.length,
                subscribedChannels
            },
            "Subscribed channels fetched successfully"
        )
    );
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};