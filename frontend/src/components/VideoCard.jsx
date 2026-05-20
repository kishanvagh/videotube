import { useNavigate } from "react-router-dom";

import {
    formatViews,
    formatDuration,
    formatUploadTime,
} from "../utils/videoHelpers";

function VideoCard({ video }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/video/${video._id}`)}
            className="cursor-pointer group bg-card-bg/20 hover:bg-card-bg/60 border border-transparent hover:border-border-color rounded-3xl p-3.5 transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1"
        >

            {/* Thumbnail Wrapper */}
            <div className="relative overflow-hidden rounded-2xl aspect-video border border-border-color bg-secondary-bg">

                <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Dark Vignette Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-85" />

                {/* Glassmorphic Duration Badge */}
                <span className="absolute bottom-3 right-3 bg-primary-bg/75 backdrop-blur-md border border-white/10 text-text-primary text-[10px] font-bold px-2 py-1 rounded-lg tracking-wider">
                    {formatDuration(video.duration)}
                </span>
            </div>

            {/* Video Metadata details */}
            <div className="flex gap-3 mt-4 px-1">

                {/* Owner Profile Avatar */}
                <img
                    src={video.owner.avatar}
                    alt={video.owner.username}
                    className="w-9 h-9 rounded-2xl object-cover border border-border-color transition-transform duration-300 group-hover:scale-105 shrink-0"
                />

                {/* Content info */}
                <div className="flex-1 min-w-0">

                    {/* Video Title */}
                    <h3 className="text-text-primary font-bold text-sm line-clamp-2 leading-snug font-display transition-colors duration-300 group-hover:text-accent">
                        {video.title}
                    </h3>

                    {/* Creator Handle */}
                    <p className="text-text-secondary text-xs font-medium mt-1.5 hover:text-text-primary transition-colors truncate">
                        {video.owner.username}
                    </p>

                    {/* Views & Timestamps */}
                    <div className="flex items-center gap-1.5 text-text-muted text-[11px] mt-1 font-semibold truncate">
                        <span>{formatViews(video.views)} views</span>
                        <span>•</span>
                        <span>{formatUploadTime(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;