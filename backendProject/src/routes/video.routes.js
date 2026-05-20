import { Router } from "express";

import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
} from "../controllers/video.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

/**
 * PUBLIC ROUTES
 */

// Get all videos
router.route("/")
    .get(getAllVideos);

// Get single video by ID
router.route("/:videoId")
    .get(getVideoById);


/**
 * PROTECTED ROUTES
 */

router.use(verifyJWT);

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