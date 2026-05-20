import { Router } from "express";

import {
    watchVideo
} from "../controllers/watch.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId")
.post(
    verifyJWT,
    watchVideo
);

export default router;