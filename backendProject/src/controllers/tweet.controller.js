import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create Tweet
 * @route   POST /api/v1/tweets
 * @access  Private
 */
const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    // Validation
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    // Create tweet
    const tweet = await Tweet.create({
        content: content.trim(),
        owner: req.user._id
    });

    // Populate owner details
    const createdTweet = await Tweet.findById(tweet._id).populate(
        "owner",
        "fullName username avatar"
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            createdTweet,
            "Tweet created successfully"
        )
    );
});

/**
 * @desc    Get all tweets of a user
 * @route   GET /api/v1/tweets/user/:userId
 * @access  Public
 */
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Fetch tweets
    const tweets = await Tweet.find({
        owner: userId
    })
        .sort({ createdAt: -1 })
        .populate("owner", "fullName username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            "User tweets fetched successfully"
        )
    );
});

/**
 * @desc    Update Tweet
 * @route   PATCH /api/v1/tweets/:tweetId
 * @access  Private
 */
const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;

    // Validate ObjectId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Tweet content is required");
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Authorization check
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this tweet"
        );
    }

    // Update tweet
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content: content.trim()
            }
        },
        {
            new: true
        }
    ).populate("owner", "fullName username avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedTweet,
            "Tweet updated successfully"
        )
    );
});

/**
 * @desc    Delete Tweet
 * @route   DELETE /api/v1/tweets/:tweetId
 * @access  Private
 */
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Find tweet
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Authorization check
    if (tweet.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this tweet"
        );
    }

    // Delete tweet
    await Tweet.findByIdAndDelete(tweetId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Tweet deleted successfully"
        )
    );
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
};