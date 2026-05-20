import { useState, useEffect } from "react";
import { getChannelStats, getChannelVideos } from "../services/dashboardService";
import { togglePublishStatus, deleteVideo, updateVideo } from "../services/videoService";
import { formatViews, formatUploadTime } from "../utils/videoHelpers";
import Loader from "../components/Loader";

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Editing State
    const [editingVideo, setEditingVideo] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editThumbnail, setEditThumbnail] = useState(null);
    const [editError, setEditError] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError("");
            
            const [statsRes, videosRes] = await Promise.all([
                getChannelStats(),
                getChannelVideos(),
            ]);

            setStats(statsRes.data);
            setVideos(videosRes.data || []);

        } catch (err) {
            setError(err.message || "Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Toggle publish status
    const handleTogglePublish = async (videoId) => {
        try {
            const response = await togglePublishStatus(videoId);
            setVideos((prev) =>
                prev.map((v) =>
                    v._id === videoId ? { ...v, isPublished: response.data.isPublished } : v
                )
            );
        } catch (err) {
            alert(err.message || "Failed to toggle visibility status.");
        }
    };

    // Delete a video
    const handleDeleteVideo = async (videoId) => {
        if (!window.confirm("Are you sure you want to permanently delete this video? This action is irreversible.")) return;

        try {
            await deleteVideo(videoId);
            setVideos((prev) => prev.filter((v) => v._id !== videoId));
            
            // Reload stats to adjust count
            const statsRes = await getChannelStats();
            setStats(statsRes.data);
        } catch (err) {
            alert(err.message || "Failed to delete video.");
        }
    };

    // Save Edit Form
    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editTitle.trim() || !editDesc.trim()) {
            setEditError("Title and description are required.");
            return;
        }

        setEditLoading(true);
        setEditError("");

        try {
            const formData = new FormData();
            formData.append("title", editTitle);
            formData.append("description", editDesc);
            if (editThumbnail) {
                formData.append("thumbnail", editThumbnail);
            }

            const response = await updateVideo(editingVideo._id, formData);
            
            setVideos((prev) =>
                prev.map((v) => (v._id === editingVideo._id ? response.data : v))
            );

            setEditingVideo(null);
        } catch (err) {
            setEditError(err.message || "Failed to update video details.");
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) return <Loader />;

    if (error) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-8 bg-danger-red/5 border border-danger-red/10 rounded-3xl max-w-lg mx-auto mt-12 backdrop-blur-md">
                <span className="text-4xl mb-4 block">📊</span>
                <h3 className="text-text-primary font-bold text-lg font-display">Failed to load Dashboard</h3>
                <p className="text-danger-red text-sm mt-2">{error}</p>
                <button
                    onClick={loadDashboardData}
                    className="mt-6 px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-primary font-bold rounded-2xl text-sm transition shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] cursor-pointer"
                >
                    Retry Loading
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative pb-12">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary font-display">
                    Creator Hub
                </h1>
                <p className="text-text-secondary text-sm mt-1">
                    Manage your premium creations, analyze performance metrics, and configure updates.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                
                {/* Total Views Card */}
                <div className="p-6 bg-card-bg/40 border border-border-color rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-all duration-300 backdrop-blur-md accent-glow-subtle">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest block font-display">Total Views</span>
                    <span className="text-3xl font-black text-text-primary mt-2 block transition-transform group-hover:scale-105 duration-500 font-display">
                        {formatViews(stats?.totalViews || 0)}
                    </span>
                    <span className="absolute bottom-4 right-4 text-3xl opacity-10 grayscale group-hover:opacity-20 transition-all duration-300">👁️</span>
                </div>

                {/* Total Subscribers Card */}
                <div className="p-6 bg-card-bg/40 border border-border-color rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-all duration-300 backdrop-blur-md accent-glow-subtle">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest block font-display">Subscribers</span>
                    <span className="text-3xl font-black text-text-primary mt-2 block transition-transform group-hover:scale-105 duration-500 font-display">
                        {stats?.totalSubscribers || 0}
                    </span>
                    <span className="absolute bottom-4 right-4 text-3xl opacity-10 grayscale group-hover:opacity-20 transition-all duration-300">👥</span>
                </div>

                {/* Total Likes Card */}
                <div className="p-6 bg-card-bg/40 border border-border-color rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-all duration-300 backdrop-blur-md accent-glow-subtle">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest block font-display">Total Likes</span>
                    <span className="text-3xl font-black text-text-primary mt-2 block transition-transform group-hover:scale-105 duration-500 font-display">
                        {formatViews(stats?.totalLikes || 0)}
                    </span>
                    <span className="absolute bottom-4 right-4 text-3xl opacity-10 grayscale group-hover:opacity-20 transition-all duration-300">❤️</span>
                </div>

                {/* Total Videos Card */}
                <div className="p-6 bg-card-bg/40 border border-border-color rounded-3xl relative overflow-hidden group hover:border-accent/20 transition-all duration-300 backdrop-blur-md accent-glow-subtle">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-widest block font-display">Total Videos</span>
                    <span className="text-3xl font-black text-text-primary mt-2 block transition-transform group-hover:scale-105 duration-500 font-display">
                        {stats?.totalVideos || 0}
                    </span>
                    <span className="absolute bottom-4 right-4 text-3xl opacity-10 grayscale group-hover:opacity-20 transition-all duration-300">📹</span>
                </div>

            </div>

            {/* Video Manager Section */}
            <div className="p-6 bg-card-bg/20 border border-border-color rounded-3xl overflow-hidden backdrop-blur-md">
                <h3 className="text-text-primary font-bold text-lg mb-6 font-display">Uploaded Videos</h3>

                {videos.length === 0 ? (
                    <div className="text-center p-12">
                        <p className="text-text-muted text-sm">No videos uploaded yet. Click upload in the top navbar to start sharing content.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="border-b border-border-color text-text-secondary">
                                    <th className="pb-3 font-semibold font-display">Video</th>
                                    <th className="pb-3 font-semibold text-center font-display">Visibility</th>
                                    <th className="pb-3 font-semibold text-center font-display">Views</th>
                                    <th className="pb-3 font-semibold text-center font-display">Date</th>
                                    <th className="pb-3 font-semibold text-right font-display">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {videos.map((video) => (
                                    <tr key={video._id} className="border-b border-border-color/40 hover:bg-white/5 transition duration-200">
                                        
                                        {/* Video Info */}
                                        <td className="py-4 flex items-center gap-3 min-w-[280px]">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-24 aspect-video object-cover rounded-xl border border-border-color"
                                            />
                                            <div className="max-w-[200px] sm:max-w-[300px]">
                                                <p className="text-text-primary font-semibold truncate font-display" title={video.title}>
                                                    {video.title}
                                                </p>
                                                <p className="text-text-muted text-xs truncate mt-1">
                                                    {video.description}
                                                </p>
                                            </div>
                                        </td>

                                        {/* Visibility Switch */}
                                        <td className="py-4 text-center">
                                            <button
                                                onClick={() => handleTogglePublish(video._id)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-semibold select-none transition duration-300 cursor-pointer ${
                                                    video.isPublished
                                                        ? "bg-success-green/10 text-success-green border border-success-green/20"
                                                        : "bg-white/5 text-text-secondary border border-border-color"
                                                }`}
                                            >
                                                {video.isPublished ? "🟢 Public" : "⚪ Private"}
                                            </button>
                                        </td>

                                        {/* Views */}
                                        <td className="py-4 text-center text-text-primary font-medium font-display">
                                            {video.views}
                                        </td>

                                        {/* Date */}
                                        <td className="py-4 text-center text-text-secondary text-xs">
                                            {formatUploadTime(video.createdAt)}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button
                                                    onClick={() => {
                                                        setEditingVideo(video);
                                                        setEditTitle(video.title);
                                                        setEditDesc(video.description);
                                                        setEditThumbnail(null);
                                                        setEditError("");
                                                    }}
                                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-border-color text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer"
                                                    title="Edit video"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVideo(video._id)}
                                                    className="p-2 rounded-xl bg-danger-red/10 hover:bg-danger-red/20 border border-danger-red/20 text-danger-red hover:text-danger-red transition-all duration-300 cursor-pointer"
                                                    title="Delete video"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            {/* Inline Edit Video Modal */}
            {editingVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="w-full max-w-lg bg-elevated/95 border border-border-color rounded-3xl p-8 shadow-2xl space-y-5 glass-elevated animate-scale-in">
                        <div className="flex items-center justify-between border-b border-border-color pb-3">
                            <h3 className="text-text-primary font-bold text-lg font-display">Edit Video Details</h3>
                            <button
                                onClick={() => setEditingVideo(null)}
                                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-border-color text-text-secondary hover:text-text-primary transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {editError && (
                            <div className="p-3 bg-danger-red/10 border border-danger-red/20 text-danger-red rounded-2xl text-xs font-semibold">
                                ⚠️ {editError}
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
                            
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1 font-display">Title</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-primary-bg/40 border border-border-color rounded-xl text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300"
                                    disabled={editLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1 font-display">Description</label>
                                <textarea
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 bg-primary-bg/40 border border-border-color rounded-xl text-text-primary outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 resize-none"
                                    disabled={editLoading}
                                />
                            </div>

                            <div className="border border-border-color rounded-xl p-3 bg-primary-bg/25">
                                <label className="block text-xs font-semibold text-text-secondary mb-2 font-display">Replace Thumbnail (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditThumbnail(e.target.files?.[0])}
                                    className="w-full text-text-secondary text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white/5 file:text-text-primary transition file:cursor-pointer"
                                    disabled={editLoading}
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border-color pt-5 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingVideo(null)}
                                    className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-border-color text-text-primary rounded-xl font-semibold transition duration-300 cursor-pointer"
                                    disabled={editLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-accent hover:bg-accent-hover text-text-primary rounded-xl font-bold transition duration-300 disabled:opacity-55 cursor-pointer shadow-md shadow-accent/15"
                                    disabled={editLoading}
                                >
                                    {editLoading ? "Saving..." : "Save Changes"}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

export default Dashboard;
