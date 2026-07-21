import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
    indexVideoTranscript,
    searchVideoChunks,
    generateRAGAnswer
} from "../utils/qdrant.service.js";

/**
 * @desc    Chat with video using RAG & Qdrant vector DB
 * @route   POST /api/v1/videos/:videoId/chat
 * @access  Public
 */
const chatWithVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { question } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (!question || !question.trim()) {
        throw new ApiError(400, "Question is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // 1. Search top matching transcript/context chunks in Qdrant Vector DB
    const searchResults = await searchVideoChunks(videoId, question, 4);

    // If Qdrant didn't find chunks (e.g. video was created before RAG feature or transcript wasn't indexed yet)
    // auto-index title + description + transcript now!
    if (searchResults.length === 0) {
        await indexVideoTranscript({
            videoId: video._id,
            title: video.title,
            description: video.description,
            transcript: video.transcript || ""
        });
    }

    // Re-query Qdrant after indexing
    const contextChunks = searchResults.length > 0 ? searchResults : await searchVideoChunks(videoId, question, 4);

    // 2. Generate RAG completion
    const answer = await generateRAGAnswer(
        videoId,
        video.title,
        video.description,
        question,
        contextChunks
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                answer,
                sources: contextChunks
            },
            "Response generated successfully"
        )
    );
});

/**
 * @desc    Update video transcript & re-index in Qdrant Vector DB
 * @route   POST /api/v1/videos/:videoId/transcript
 * @access  Private
 */
const updateVideoTranscript = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { transcript } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    if (typeof transcript !== "string") {
        throw new ApiError(400, "Transcript text is required");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    if (video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this video's transcript");
    }

    video.transcript = transcript.trim();
    await video.save({ validateBeforeSave: false });

    // Index transcript in Qdrant Vector DB
    const indexResult = await indexVideoTranscript({
        videoId: video._id,
        title: video.title,
        description: video.description,
        transcript: video.transcript
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                video,
                indexedChunks: indexResult.indexedChunks
            },
            "Transcript updated and indexed in Qdrant Vector DB successfully"
        )
    );
});

export {
    chatWithVideo,
    updateVideoTranscript
};
