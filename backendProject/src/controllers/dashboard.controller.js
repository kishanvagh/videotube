import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get Channel Statistics
 * @route   GET /api/v1/dashboard/stats
 * @access  Private
 */
const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user._id;

    /**
     * Total Videos
     */
    const totalVideos = await Video.countDocuments({
        owner: channelId
    });

    /**
     * Total Views
     */
    const totalViewsResult = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ]);

    const totalViews =
        totalViewsResult[0]?.totalViews || 0;

    /**
     * Total Subscribers
     */
    const totalSubscribers =
        await Subscription.countDocuments({
            channel: channelId
        });

    /**
     * Total Likes on all videos
     */
    const userVideos = await Video.find({
        owner: channelId
    }).select("_id");

    const videoIds = userVideos.map(
        (video) => video._id
    );

    const totalLikes = await Like.countDocuments({
        video: {
            $in: videoIds
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalViews,
                totalSubscribers,
                totalLikes
            },
            "Channel stats fetched successfully"
        )
    );
});

/**
 * @desc    Get all channel videos
 * @route   GET /api/v1/dashboard/videos
 * @access  Private
 */
const getChannelVideos = asyncHandler(async (req, res) => {

    const channelVideos = await Video.find({
        owner: req.user._id
    })
        .sort({
            createdAt: -1
        })
        .populate(
            "owner",
            "fullName username avatar"
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            channelVideos,
            "Channel videos fetched successfully"
        )
    );
});

export {
    getChannelStats,
    getChannelVideos
};