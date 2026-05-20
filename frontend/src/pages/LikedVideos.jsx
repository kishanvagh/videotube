import { useEffect, useState } from "react";

import Loader from "../components/Loader";
import VideoCard from "../components/VideoCard";

import { getLikedVideos } from "../services/likeService";

function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setLoading(true);

        const response = await getLikedVideos();

        setVideos(response.data);
      } catch (error) {
        setError(error.message || "Failed to fetch liked videos");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedVideos();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-xl animate-fade-in">
        <span className="text-5xl mb-4 block">❤️</span>
        <h3 className="text-text-primary font-display font-bold text-xl">Unable to Load Liked Videos</h3>
        <p className="text-text-secondary text-sm mt-2">{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-card-bg/30 border border-border-color rounded-3xl max-w-md mx-auto mt-12 backdrop-blur-md animate-fade-in">
        <span className="text-5xl mb-4 block">❤️</span>
        <h3 className="text-text-primary font-display font-bold text-xl">No Liked Videos</h3>
        <p className="text-text-secondary text-sm mt-2">
          Videos you hit the like button on will be showcased here!
        </p>
        <button
          onClick={() => window.location.href = "/"}
          className="mt-6 px-5 py-2.5 bg-accent hover:bg-accent-hover text-text-primary rounded-xl text-xs font-semibold transition duration-300 shadow-md shadow-accent/15"
        >
          Browse Videos
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-display font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
          Liked Videos
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          A showcase of videos you have liked on VideoTube.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
}

export default LikedVideos;
