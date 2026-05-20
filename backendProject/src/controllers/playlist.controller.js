import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * @desc    Create Playlist
 * @route   POST /api/v1/playlists
 * @access  Private
 */
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Validation
    if (!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }

    // Create playlist
    const playlist = await Playlist.create({
        name: name.trim(),
        description: description?.trim() || "",
        owner: req.user._id,
        videos: []
    });

    // Populate owner
    const createdPlaylist = await Playlist.findById(
        playlist._id
    ).populate("owner", "fullName username avatar");

    return res.status(201).json(
        new ApiResponse(
            201,
            createdPlaylist,
            "Playlist created successfully"
        )
    );
});

/**
 * @desc    Get all playlists of a user
 * @route   GET /api/v1/playlists/user/:userId
 * @access  Public
 */
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // Validate userId
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user ID");
    }

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Fetch playlists
    const playlists = await Playlist.find({
        owner: userId
    })
        .populate("owner", "fullName username avatar")
        .populate("videos");

    return res.status(200).json(
        new ApiResponse(
            200,
            playlists,
            "User playlists fetched successfully"
        )
    );
});

/**
 * @desc    Get Playlist by ID
 * @route   GET /api/v1/playlists/:playlistId
 * @access  Public
 */
const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Fetch playlist
    const playlist = await Playlist.findById(
        playlistId
    )
        .populate("owner", "fullName username avatar")
        .populate({
            path: "videos",
            populate: {
                path: "owner",
                select: "fullName username avatar"
            }
        });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
});

/**
 * @desc    Add video to playlist
 * @route   PATCH /api/v1/playlists/:playlistId/videos/:videoId
 * @access  Private
 */
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate IDs
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Authorization check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    // Prevent duplicate video
    if (playlist.videos.includes(videoId)) {
        throw new ApiError(
            400,
            "Video already exists in playlist"
        );
    }

    // Add video
    playlist.videos.push(videoId);

    await playlist.save({ validateBeforeSave: false });

    const updatedPlaylist = await Playlist.findById(
        playlistId
    )
        .populate("owner", "fullName username avatar")
        .populate("videos");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video added to playlist successfully"
        )
    );
});

/**
 * @desc    Remove video from playlist
 * @route   DELETE /api/v1/playlists/:playlistId/videos/:videoId
 * @access  Private
 */
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    // Validate IDs
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID");
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Authorization check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }

    // Remove video
    playlist.videos = playlist.videos.filter(
        (video) => video.toString() !== videoId
    );

    await playlist.save({ validateBeforeSave: false });

    const updatedPlaylist = await Playlist.findById(
        playlistId
    )
        .populate("owner", "fullName username avatar")
        .populate("videos");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Video removed from playlist successfully"
        )
    );
});

/**
 * @desc    Delete Playlist
 * @route   DELETE /api/v1/playlists/:playlistId
 * @access  Private
 */
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Authorization check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to delete this playlist"
        );
    }

    // Delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    );
});

/**
 * @desc    Update Playlist
 * @route   PATCH /api/v1/playlists/:playlistId
 * @access  Private
 */
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    // Validate playlistId
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }

    // Validation
    if (!name || !name.trim()) {
        throw new ApiError(400, "Playlist name is required");
    }

    // Find playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    // Authorization check
    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to update this playlist"
        );
    }

    // Update playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name.trim(),
                description: description?.trim() || ""
            }
        },
        {
            new: true
        }
    )
        .populate("owner", "fullName username avatar")
        .populate("videos");

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedPlaylist,
            "Playlist updated successfully"
        )
    );
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
};