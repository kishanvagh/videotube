import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Toggle Like on Video
 * @route   POST /api/v1/likes/toggle/v/:videoId
 * @access  Private
 */
const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Check existing like
    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        video: videoId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Video unliked successfully"
            )
        );
    }

    // Create like
    await Like.create({
        likedBy: req.user._id,
        video: videoId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                liked: true
            },
            "Video liked successfully"
        )
    );
});

/**
 * @desc    Toggle Like on Comment
 * @route   POST /api/v1/likes/toggle/c/:commentId
 * @access  Private
 */
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Check comment exists
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Check existing like
    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        comment: commentId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Comment unliked successfully"
            )
        );
    }

    // Create like
    await Like.create({
        likedBy: req.user._id,
        comment: commentId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                liked: true
            },
            "Comment liked successfully"
        )
    );
});

/**
 * @desc    Toggle Like on Tweet
 * @route   POST /api/v1/likes/toggle/t/:tweetId
 * @access  Private
 */
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    // Validate ObjectId
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID");
    }

    // Check tweet exists
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    // Check existing like
    const existingLike = await Like.findOne({
        likedBy: req.user._id,
        tweet: tweetId
    });

    // Unlike
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    liked: false
                },
                "Tweet unliked successfully"
            )
        );
    }

    // Create like
    await Like.create({
        likedBy: req.user._id,
        tweet: tweetId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                liked: true
            },
            "Tweet liked successfully"
        )
    );
});

/**
 * @desc    Get all liked videos
 * @route   GET /api/v1/likes/videos
 * @access  Private
 */
const getLikedVideos = asyncHandler(async (req, res) => {

    // Fetch liked videos
    const likedVideos = await Like.find({
        likedBy: req.user._id,
        video: {
            $exists: true
        }
    }).populate({
        path: "video",
        populate: {
            path: "owner",
            select: "fullName username avatar"
        }
    });

    // Extract only video data
    const videos = likedVideos.map((like) => like.video);

    return res.status(200).json(
        new ApiResponse(
            200,
            videos,
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
};