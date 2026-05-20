import { useState, useEffect } from "react";
import { getWatchHistory } from "../services/authService";
import VideoCard from "../components/VideoCard";
import Loader from "../components/Loader";

function History() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadWatchHistory = async () => {
        try {
            setLoading(true);
            setError("");
            
            const response = await getWatchHistory();
            setHistory(response.data || []);

        } catch (err) {
            setError(err.message || "Failed to load watch history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadWatchHistory();
    }, []);

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-xl animate-fade-in">
                <span className="text-5xl mb-4 block">⏳</span>
                <h3 className="text-text-primary font-display font-bold text-xl">Unable to Load Watch History</h3>
                <p className="text-text-secondary text-sm mt-2">{error}</p>
                <button
                    onClick={loadWatchHistory}
                    className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-primary font-semibold rounded-xl text-sm transition duration-300 accent-glow-subtle"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-card-bg/30 border border-border-color rounded-3xl max-w-md mx-auto mt-12 backdrop-blur-md animate-fade-in">
                <span className="text-5xl mb-4 block">⏳</span>
                <h3 className="text-text-primary font-display font-bold text-xl">Watch History is Empty</h3>
                <p className="text-text-secondary text-sm mt-2">
                    Videos you watch will be listed here chronologically to help you easily re-watch them!
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
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                    Watch History
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Your recently viewed videos on VideoTube.
                </p>
            </div>

            {/* Video List Feed */}
            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {history.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>

        </div>
    );
}

export default History;
