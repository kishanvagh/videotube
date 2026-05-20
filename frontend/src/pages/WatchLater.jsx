import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";
import { getWatchLaterList, toggleWatchLater } from "../services/watchLaterService";

function WatchLater() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWatchLaterVideos = async () => {
    try {
      setLoading(true);
      const response = await getWatchLaterList();
      setVideos(response.data);
    } catch (err) {
      setError(err.message || "Failed to fetch Watch Later videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchLaterVideos();
  }, []);

  const handleRemove = async (videoId) => {
    try {
      // Optimistic update
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      await toggleWatchLater(videoId);
    } catch (err) {
      // Revert/refresh on error
      setError(err.message || "Failed to remove video");
      fetchWatchLaterVideos();
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-accent/5 border border-accent/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-xl animate-fade-in">
        <span className="text-5xl mb-4 block">📌</span>
        <h3 className="text-text-primary font-display font-bold text-xl">Unable to Load Watch Later</h3>
        <p className="text-text-secondary text-sm mt-2">{error}</p>
        <button
          onClick={fetchWatchLaterVideos}
          className="mt-6 px-5 py-2.5 bg-accent hover:bg-accent-hover text-text-primary rounded-xl text-xs font-semibold transition duration-300 shadow-md shadow-accent/15"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-card-bg/30 border border-border-color rounded-3xl max-w-md mx-auto mt-12 backdrop-blur-md animate-fade-in">
        <span className="text-5xl mb-4 block text-accent animate-bounce">📌</span>
        <h3 className="text-text-primary font-display font-bold text-xl">Your Saved Queue is Empty</h3>
        <p className="text-text-secondary text-sm mt-2">
          Discover incredible videos and pin them to watch later at your own cinematic convenience.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-3 bg-accent hover:bg-accent-hover text-text-primary rounded-2xl text-xs font-bold tracking-wide uppercase transition duration-300 shadow-lg shadow-accent/25"
        >
          Explore Creators
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary flex items-center gap-2">
            <span className="text-accent text-2xl">📌</span> Watch Later
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Your personalized high-fidelity cinematic watch queue.
          </p>
        </div>
        <div className="bg-card-bg/25 border border-border-color/80 text-text-secondary text-xs px-4 py-2 rounded-2xl font-semibold backdrop-blur-md">
          {videos.length} {videos.length === 1 ? "video" : "videos"} saved
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <div key={video._id} className="relative group/item">
            <VideoCard video={video} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(video._id);
              }}
              className="absolute top-5 right-5 z-20 opacity-0 group-hover/item:opacity-100 bg-black/80 hover:bg-red-500/20 text-white hover:text-red-400 border border-white/10 hover:border-red-500/40 p-2.5 rounded-full transition-all duration-300 shadow-xl shadow-black/50"
              title="Remove from Watch Later"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4.5 w-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WatchLater;
