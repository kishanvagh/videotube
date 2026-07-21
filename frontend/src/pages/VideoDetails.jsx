import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import Loader from "../components/Loader";
import CommentsSection from "../components/CommentsSection";
import VideoChatbot from "../components/VideoChatbot";

import LikeButton from "../components/LikeButton";
import SubscribeButton from "../components/SubscribeButton";

import { getVideoById, addToWatchHistory } from "../services/videoService";
import { toggleVideoLike } from "../services/likeService";
import { getWatchLaterList, toggleWatchLater } from "../services/watchLaterService";

import {
  toggleSubscription,
  getChannelSubscribers,
} from "../services/subscriptionService";

import { formatViews, formatUploadTime } from "../utils/videoHelpers";

function VideoDetails() {
  const { videoId } = useParams();
  const { isAuthenticated, user: currentUser } = useSelector((state) => state.auth);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Like state
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Subscription state
  const [subscribed, setSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Watch Later state
  const [isWatchLater, setIsWatchLater] = useState(false);
  const [togglingWatchLater, setTogglingWatchLater] = useState(false);

  // Fetch video details and watch later status
  useEffect(() => {
    const fetchVideoAndStatus = async () => {
      try {
        setLoading(true);

        const response = await getVideoById(videoId);
        setVideo(response.data);

        // OPTIONAL: If backend returns likes count
        setLikesCount(response.data.likesCount || 0);

        // Add to watch history
        await addToWatchHistory(videoId);

        // Fetch subscribers count
        const subscribersResponse = await getChannelSubscribers(
          response.data.owner._id,
        );
        setSubscribersCount(subscribersResponse.data.totalSubscribers);

        // If user is authenticated, check watch later status
        if (isAuthenticated) {
          try {
            const wlResponse = await getWatchLaterList();
            const savedVideos = wlResponse.data || [];
            const exists = savedVideos.some((v) => v._id === videoId);
            setIsWatchLater(exists);
          } catch (wlError) {
            console.error("Failed to check watch later status:", wlError);
          }
        }
      } catch (error) {
        setError(error.message || "Failed to fetch video");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoAndStatus();
  }, [videoId, isAuthenticated]);

  // Toggle video like
  const handleToggleLike = async () => {
    try {
      const response = await toggleVideoLike(videoId);
      setLiked(response.data.liked);
      setLikesCount((prev) => (response.data.liked ? prev + 1 : prev - 1));
    } catch (error) {
      console.error(error.message);
    }
  };

  // Toggle subscription
  const handleToggleSubscription = async () => {
    try {
      const response = await toggleSubscription(video.owner._id);
      setSubscribed(response.data.subscribed);
      setSubscribersCount((prev) =>
        response.data.subscribed ? prev + 1 : prev - 1,
      );
    } catch (error) {
      console.error(error.message);
    }
  };

  // Toggle Watch Later
  const handleToggleWatchLater = async () => {
    if (!isAuthenticated) return;
    try {
      setTogglingWatchLater(true);
      const response = await toggleWatchLater(videoId);
      setIsWatchLater(response.data.isWatchLater);
    } catch (error) {
      console.error("Failed to toggle watch later status:", error.message);
    } finally {
      setTogglingWatchLater(false);
    }
  };

  // Loading
  if (loading) {
    return <Loader />;
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-primary-bg flex items-center justify-center">
        <div className="text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-md">
          <span className="text-4xl mb-4 block">⚠️</span>
          <p className="text-danger-red text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary-bg py-4 px-2 md:px-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-6">
          {/* Video Player */}
          <div className="rounded-3xl overflow-hidden bg-black border border-border-color shadow-2xl relative group select-none">
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="w-full aspect-video scale-100 hover:scale-[1.005] transition-transform duration-700 ease-out"
            />
          </div>

          {/* Title & Actions Block */}
          <div className="bg-card-bg/30 border border-border-color rounded-3xl p-6 backdrop-blur-md space-y-4">
            {/* Title */}
            <h1 className="text-text-primary text-2xl font-black font-display tracking-tight leading-snug">
              {video.title}
            </h1>

            {/* Meta & Social Buttons */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t border-border-color pt-4">
              {/* Views */}
              <div className="text-text-secondary text-sm flex items-center gap-2 font-medium">
                <span>{formatViews(video.views)} views</span>
                <span className="text-text-muted">•</span>
                <span>{formatUploadTime(video.createdAt)}</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <LikeButton
                  initialLikedState={liked}
                  initialLikesCount={likesCount}
                  onToggle={handleToggleLike}
                />

                <SubscribeButton
                  initialSubscribedState={subscribed}
                  initialSubscribersCount={subscribersCount}
                  onToggle={handleToggleSubscription}
                />

                {isAuthenticated && (
                  <button
                    disabled={togglingWatchLater}
                    onClick={handleToggleWatchLater}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold backdrop-blur-md transition-all duration-300 border cursor-pointer ${
                      isWatchLater
                        ? "bg-accent/20 border-accent text-accent shadow-md shadow-accent/20"
                        : "bg-white/5 border-white/10 hover:border-white/20 text-text-primary hover:bg-white/10"
                    }`}
                    title={isWatchLater ? "Remove from Watch Later" : "Save to Watch Later"}
                  >
                    <span className={`text-sm transition-transform duration-300 ${togglingWatchLater ? "animate-spin" : ""}`}>
                      {togglingWatchLater ? "⏳" : "📌"}
                    </span>
                    <span>{isWatchLater ? "Saved" : "Watch Later"}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Channel / Creator Details */}
          <div className="bg-card-bg/40 border border-border-color rounded-3xl p-6 backdrop-blur-md flex items-center gap-4 hover:bg-card-bg/50 transition-all duration-300">
            <img
              src={video.owner.avatar}
              alt={video.owner.username}
              className="w-14 h-14 rounded-2xl object-cover border border-border-color"
            />

            <div>
              <h2 className="text-text-primary font-bold text-lg font-display">
                {video.owner.fullName}
              </h2>
              <p className="text-text-muted text-sm">@{video.owner.username}</p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card-bg/40 border border-border-color rounded-3xl p-6 backdrop-blur-md">
            <h3 className="text-text-primary font-bold mb-3 font-display">Description</h3>
            <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
              {video.description}
            </p>
          </div>

          {/* Comments */}
          <CommentsSection videoId={videoId} />
        </div>

        {/* Sidebar / Recommended & AI Chatbot */}
        <div className="lg:col-span-4 space-y-6">
          {/* RAG AI Chatbot */}
          <VideoChatbot
            videoId={videoId}
            videoTitle={video.title}
            initialTranscript={video.transcript}
            isOwner={Boolean(currentUser?._id && video.owner?._id === currentUser._id)}
          />

          <div className="bg-card-bg/30 border border-border-color rounded-3xl p-6 backdrop-blur-md sticky top-24 space-y-6">
            <h2 className="text-text-primary text-lg font-bold font-display border-b border-border-color pb-3">
              Recommended Creations
            </h2>

            <div className="text-center py-12">
              <span className="text-3xl block mb-2 opacity-50">📂</span>
              <p className="text-text-muted text-sm font-medium">Recommended videos coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetails;
