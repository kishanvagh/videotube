import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllVideos } from "../services/videoService";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";

function Home() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query") || "";

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch videos
    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError("");
                
                const response = await getAllVideos({
                    query: query,
                    limit: 30, // Get more videos for a richer feed
                });

                // Check for potential nested response structures
                const videoData = response.data?.videos || response.data || [];
                setVideos(videoData);

            } catch (err) {
                setError(err.message || "Failed to load videos.");
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [query]);

    // Loading state
    if (loading) {
        return <Loader />;
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-md">
                <span className="text-4xl mb-4 block">⚠️</span>
                <h3 className="text-text-primary font-bold text-lg font-display">Unable to load videos</h3>
                <p className="text-danger-red text-sm mt-2 font-medium">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-primary font-bold rounded-2xl text-sm transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] cursor-pointer"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    // Empty state
    if (videos.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-card-bg/25 border border-border-color rounded-3xl max-w-md mx-auto mt-12 backdrop-blur-md">
                <span className="text-5xl mb-4 block">🔍</span>
                <h3 className="text-text-primary font-bold text-lg font-display">No creations found</h3>
                <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                    {query 
                        ? `We couldn't find any results matching "${query}". Try checking your spelling or search terms.` 
                        : "Start sharing your classic and aesthetic creations by uploading a video above!"}
                </p>
                {query && (
                    <button
                        onClick={() => window.location.href = "/"}
                        className="mt-6 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-border-color text-text-primary rounded-2xl text-xs font-semibold transition duration-300 cursor-pointer"
                    >
                        Clear Search
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            
            {/* Header / Banner */}
            {!query && (
                <div className="p-8 rounded-3xl bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border border-accent/10 mb-8 relative overflow-hidden accent-glow-subtle">
                    <div className="relative z-10 max-w-xl">
                        <span className="px-3 py-1 rounded-full bg-accent/20 border border-accent/30 text-accent text-[10px] uppercase font-bold tracking-wider font-display">Welcome</span>
                        <h2 className="text-3xl font-black text-text-primary mt-3 bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary font-display">
                            Discover Aesthetic Masterpieces
                        </h2>
                        <p className="text-text-secondary text-sm mt-2 leading-relaxed font-medium">
                            Welcome to VideoTube, a premium community designed for developers, designers, and creators to share premium visual stories.
                        </p>
                    </div>
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-gradient-to-l from-accent/10 to-transparent blur-2xl hidden md:block"></div>
                </div>
            )}

            {query && (
                <div className="mb-6">
                    <p className="text-text-secondary text-sm">
                        Search results for <span className="text-text-primary font-semibold">"{query}"</span>
                    </p>
                </div>
            )}

            {/* Video Grid */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
            
        </div>
    );
}

export default Home;
