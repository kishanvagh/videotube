import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserChannelProfile } from "../services/authService";
import { getAllVideos } from "../services/videoService";
import { getUserPlaylists } from "../services/playlistService";
import { toggleSubscription } from "../services/subscriptionService";
import SubscribeButton from "../components/SubscribeButton";
import VideoCard from "../components/VideoCard";
import TweetManager from "../components/TweetManager";
import Loader from "../components/Loader";

function Channel() {
    const { username } = useParams();
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Tabs state
    const [activeTab, setActiveTab] = useState("videos"); // "videos" | "playlists" | "tweets" | "about"

    const fetchChannelData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const profileRes = await getUserChannelProfile(username);
            const channelData = profileRes.data;
            setChannel(channelData);

            // Parallel fetch videos & playlists
            const [videosRes, playlistsRes] = await Promise.all([
                getAllVideos({ userId: channelData._id }),
                getUserPlaylists(channelData._id).catch(() => ({ data: [] })), // safe fallback
            ]);

            setVideos(videosRes.data?.videos || videosRes.data || []);
            setPlaylists(playlistsRes.data || []);

        } catch (err) {
            setError(err.message || "Failed to load channel details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (username) {
            fetchChannelData();
        }
    }, [username]);

    // Handle subscribe toggle
    const handleToggleSubscribe = async () => {
        if (!isAuthenticated) {
            alert("Please login to subscribe to channels.");
            return;
        }
        try {
            const response = await toggleSubscription(channel._id);
            setChannel((prev) => ({
                ...prev,
                isSubscribed: response.data.subscribed,
                subscribersCount: response.data.subscribed 
                    ? prev.subscribersCount + 1 
                    : prev.subscribersCount - 1,
            }));
        } catch (err) {
            console.error(err.message);
        }
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-xl animate-fade-in">
                <span className="text-5xl mb-4 block">👥</span>
                <h3 className="text-text-primary font-display font-bold text-xl">Unable to find Channel</h3>
                <p className="text-text-secondary text-sm mt-2">{error}</p>
                <button
                    onClick={fetchChannelData}
                    className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-primary font-semibold rounded-xl text-sm transition duration-300 accent-glow-subtle"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const isOwnChannel = isAuthenticated && user?._id === channel?._id;

    return (
        <div className="space-y-6 pb-12">
            
            {/* Cover Banner */}
            <div className="relative h-44 sm:h-64 rounded-3xl overflow-hidden border border-border-color bg-gradient-to-r from-accent/10 via-secondary-bg to-card-bg/85">
                {channel?.coverImage ? (
                    <img
                        src={channel.coverImage}
                        alt={`${channel.username}'s banner`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/15 via-secondary-bg to-primary-bg flex items-center justify-end p-8">
                        <span className="text-white/5 text-8xl font-display font-black select-none tracking-widest hidden sm:block">
                            CREATOR
                        </span>
                    </div>
                )}
            </div>

            {/* Profile Info details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
                
                <div className="flex items-center gap-5 flex-wrap sm:flex-nowrap">
                    <img
                        src={channel?.avatar || "https://via.placeholder.com/100"}
                        alt={channel?.username}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-primary-bg -mt-10 sm:-mt-14 shadow-xl shrink-0"
                    />
                    <div className="space-y-1">
                        <h2 className="text-2xl font-display font-black text-text-primary">{channel?.fullName}</h2>
                        <div className="flex items-center gap-3 text-sm text-text-secondary flex-wrap">
                            <span className="font-semibold text-accent">@{channel?.username}</span>
                            <span>•</span>
                            <span>{channel?.subscribersCount} subscribers</span>
                            <span>•</span>
                            <span>{channel?.channelsSubscribedToCount} subscribed</span>
                        </div>
                    </div>
                </div>

                {/* Sub Action */}
                <div className="shrink-0">
                    {isOwnChannel ? (
                        <div className="px-5 py-2.5 rounded-full bg-card-bg/60 border border-border-color text-text-primary font-medium text-sm text-center select-none backdrop-blur-xl">
                            My Channel Profile
                        </div>
                    ) : (
                        <SubscribeButton
                            initialSubscribedState={channel?.isSubscribed}
                            initialSubscribersCount={channel?.subscribersCount}
                            onToggle={handleToggleSubscribe}
                        />
                    )}
                </div>

            </div>

            {/* Navigation Tabs bar */}
            <div className="border-b border-border-color mt-8 px-2 flex gap-4 overflow-x-auto text-sm scrollbar-none">
                {[
                    { id: "videos", label: "Videos" },
                    { id: "playlists", label: "Playlists" },
                    { id: "tweets", label: "Community" },
                    { id: "about", label: "About" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`pb-4 px-3 font-semibold transition border-b-2 transition-all duration-300 ${
                            activeTab === tab.id
                                ? "border-accent text-text-primary"
                                : "border-transparent text-text-muted hover:text-text-secondary"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab content panel */}
            <div className="pt-6 px-2">
                
                {/* Videos Tab */}
                {activeTab === "videos" && (
                    <div className="animate-fade-in">
                        {videos.length === 0 ? (
                            <div className="text-center py-16 bg-card-bg/20 border border-border-color rounded-3xl backdrop-blur-md">
                                <p className="text-text-secondary font-medium">This channel has no uploaded videos.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {videos.map((video) => (
                                    <VideoCard key={video._id} video={video} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Playlists Tab */}
                {activeTab === "playlists" && (
                    <div className="animate-fade-in">
                        {playlists.length === 0 ? (
                            <div className="text-center py-16 bg-card-bg/20 border border-border-color rounded-3xl backdrop-blur-md">
                                <p className="text-text-secondary font-medium">This channel has no public playlists.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                {playlists.map((playlist) => (
                                    <div
                                        key={playlist._id}
                                        className="p-6 bg-card-bg/40 border border-border-color rounded-3xl hover:bg-card-bg/70 hover:shadow-lg transition-all duration-300 group cursor-pointer backdrop-blur-md"
                                    >
                                        <span className="text-4xl block mb-3 group-hover:scale-105 duration-300">📂</span>
                                        <h4 className="text-text-primary font-display font-bold text-lg">{playlist.name}</h4>
                                        <p className="text-text-secondary text-xs mt-2 truncate">{playlist.description}</p>
                                        <div className="mt-4 text-[10px] uppercase font-bold text-accent tracking-wider">
                                            {playlist.videos?.length || 0} Videos
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Tweets Tab */}
                {activeTab === "tweets" && (
                    <div className="animate-fade-in">
                        <TweetManager userId={channel?._id} channelOwner={channel} />
                    </div>
                )}

                {/* About Tab */}
                {activeTab === "about" && (
                    <div className="max-w-2xl bg-card-bg/40 border border-border-color rounded-3xl p-6 space-y-6 backdrop-blur-md animate-fade-in">
                        <h4 className="text-text-primary font-display font-bold text-lg">About Creator</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-text-primary">
                            <div>
                                <span className="text-text-muted block text-xs uppercase font-bold tracking-wider">Email Address</span>
                                <span className="mt-1.5 block font-medium text-text-secondary">{channel?.email}</span>
                            </div>
                            <div>
                                <span className="text-text-muted block text-xs uppercase font-bold tracking-wider">Handle</span>
                                <span className="mt-1.5 block font-medium text-accent">@{channel?.username}</span>
                            </div>
                        </div>
                    </div>
                )}

            </div>

        </div>
    );
}

export default Channel;
