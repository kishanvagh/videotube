import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Get all comments of a video
 * @route   GET /api/v1/comments/:videoId
 * @access  Public
 */
const getVideoComments = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Pagination setup
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.max(1, parseInt(limit));

    // Fetch comments
    const comments = await Comment.find({
        video: videoId
    })
        .sort({
            createdAt: -1
        })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .populate(
            "owner",
            "fullName username avatar"
        );

    // Total comments count
    const totalComments =
        await Comment.countDocuments({
            video: videoId
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                comments,
                pagination: {
                    totalComments,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(
                        totalComments / limitNumber
                    ),
                    limit: limitNumber
                }
            },
            "Comments fetched successfully"
        )
    );
});

/**
 * @desc    Add comment to a video
 * @route   POST /api/v1/comments/:videoId
 * @access  Private
 */
const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params;
    const { content } = req.body;

    // Validate videoId
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Create comment
    const comment = await Comment.create({
        content: content.trim(),
        owner: req.user._id,
        video: videoId
    });

    // Populate owner details
    const createdComment = await Comment.findById(
        comment._id
    ).populate(
        "owner",
        "fullName username avatar"
    );

    return res.status(201).json(
        new ApiResponse(
            201,
            createdComment,
            "Comment added successfully"
        )
    );
});

/**
 * @desc    Update comment
 * @route   PATCH /api/v1/comments/:commentId
 * @access  Private
 */
const updateComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;
    const { content } = req.body;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Validate content
    if (!content || !content.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Authorization check
    if (
        comment.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to update this comment"
        );
    }

    // Update comment
    const updatedComment =
        await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: content.trim()
                }
            },
            {
                new: true
            }
        ).populate(
            "owner",
            "fullName username avatar"
        );

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );
});

/**
 * @desc    Delete comment
 * @route   DELETE /api/v1/comments/:commentId
 * @access  Private
 */
const deleteComment = asyncHandler(async (req, res) => {

    const { commentId } = req.params;

    // Validate commentId
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    // Find comment
    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    // Authorization check
    if (
        comment.owner.toString() !==
        req.user._id.toString()
    ) {
        throw new ApiError(
            403,
            "You are not authorized to delete this comment"
        );
    }

    // Delete comment
    await Comment.findByIdAndDelete(commentId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    );
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};