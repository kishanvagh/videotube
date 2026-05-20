import mongoose, { isValidObjectId } from "mongoose";

import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";

import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const watchVideo = asyncHandler(async (req, res) => {

    const { videoId } = req.params;

    // validate id
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id");
    }

    // find video
    const video = await Video.findById(videoId)
        .populate(
            "owner",
            "fullName username avatar"
        );

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // increase views
    video.views += 1;

    await video.save({
        validateBeforeSave: false
    });

    // add to watch history
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $addToSet: {
                watchHistory: video._id
            }
        }
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            "Video watched successfully"
        )
    );
});

export {
    watchVideo
};