import { Router } from "express";

import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";

import {
    chatWithVideo,
    updateVideoTranscript
} from "../controllers/chat.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * PUBLIC ROUTES
 */

// Get all videos
router.route("/")
    .get(getAllVideos);

// RAG Chatbot Q&A on video
router.route("/:videoId/chat")
    .post(chatWithVideo);

// Get single video by ID
router.route("/:videoId")
    .get(getVideoById);


/**
 * PROTECTED ROUTES
 */

router.use(verifyJWT);

// Update transcript & re-index vector DB
router.route("/:videoId/transcript")
    .post(updateVideoTranscript);

// Publish video
router.route("/")
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishAVideo
    );

// Update video
router.route("/:videoId")
    .patch(
        upload.single("thumbnail"),
        updateVideo
    );

// Delete video
router.route("/:videoId")
    .delete(deleteVideo);

// Toggle publish status
router.route("/toggle/publish/:videoId")
    .patch(togglePublishStatus);

export default router;