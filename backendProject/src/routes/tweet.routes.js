import { Router } from "express";

import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * Protected Routes
 */
router.use(verifyJWT);

/**
 * Create Tweet
 * GET User Tweets
 */
router.route("/")
    .post(createTweet);

router.route("/user/:userId")
    .get(getUserTweets);

/**
 * Update & Delete Tweet
 */
router.route("/:tweetId")
    .patch(updateTweet)
    .delete(deleteTweet);

export default router;