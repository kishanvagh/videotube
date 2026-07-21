import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// CORS_ORIGIN may be a single origin or a comma-separated list (e.g. a
// custom domain plus the Vercel production alias). Any *.vercel.app
// deployment of this project (production alias or per-push preview URL)
// is also allowed, since Vercel mints a new preview URL on every push.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

const vercelPreviewPattern = /^https:\/\/videotube-[a-z0-9-]+\.vercel\.app$/i

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true) // non-browser requests (curl, server-to-server)
        if (allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
            return callback(null, true)
        }
        return callback(null, false)
    },
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import healthcheckRouter from "./routes/healthcheck.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"
import likeRouter from "./routes/like.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import watchRouter from "./routes/watch.routes.js";

//routes declaration
app.use("/api/v1/healthcheck", healthcheckRouter)
app.use("/api/v1/users", userRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/watch", watchRouter);
// http://localhost:8000/api/v1/users/register

// Global Error Handler Middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    return res.status(statusCode).json({
        statusCode,
        success: false,
        message,
        errors: err.errors || [],
        data: null
    });
});

export { app }