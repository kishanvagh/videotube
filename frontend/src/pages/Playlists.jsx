import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
    getUserPlaylists,
    createPlaylist,
    deletePlaylist,
    removeVideoFromPlaylist,
} from "../services/playlistService";
import { formatViews } from "../utils/videoHelpers";
import Loader from "../components/Loader";

function Playlists() {
    const { user } = useSelector((state) => state.auth);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create Modal/Form State
    const [showCreate, setShowCreate] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [createError, setCreateError] = useState("");
    const [createLoading, setCreateLoading] = useState(false);

    // Selected Playlist view State (expand videos)
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);

    const loadPlaylists = async () => {
        if (!user?._id) return;
        try {
            setLoading(true);
            setError("");
            const response = await getUserPlaylists(user._id);
            setPlaylists(response.data || []);
        } catch (err) {
            setError(err.message || "Failed to load playlists.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlaylists();
    }, [user?._id]);

    // Handle Create Playlist
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) {
            setCreateError("Name and description are required.");
            return;
        }

        setCreateLoading(true);
        setCreateError("");

        try {
            const response = await createPlaylist({ name, description });
            setPlaylists((prev) => [response.data, ...prev]);
            setShowCreate(false);
            setName("");
            setDescription("");
        } catch (err) {
            setCreateError(err.message || "Failed to create playlist.");
        } finally {
            setCreateLoading(false);
        }
    };

    // Handle Delete Playlist
    const handleDelete = async (playlistId) => {
        if (!window.confirm("Are you sure you want to delete this playlist?")) return;

        try {
            await deletePlaylist(playlistId);
            setPlaylists((prev) => prev.filter((p) => p._id !== playlistId));
            if (selectedPlaylist?._id === playlistId) {
                setSelectedPlaylist(null);
            }
        } catch (err) {
            alert(err.message || "Failed to delete playlist.");
        }
    };

    // Remove video from playlist
    const handleRemoveVideo = async (videoId, playlistId) => {
        if (!window.confirm("Remove this video from the playlist?")) return;

        try {
            await removeVideoFromPlaylist(videoId, playlistId);
            
            // Update selected playlist UI
            setSelectedPlaylist((prev) => ({
                ...prev,
                videos: prev.videos.filter((v) => v._id !== videoId),
            }));

            // Update list state
            setPlaylists((prev) =>
                prev.map((p) =>
                    p._id === playlistId
                        ? { ...p, videos: p.videos.filter((v) => v._id !== videoId) }
                        : p
                )
            );
        } catch (err) {
            alert(err.message || "Failed to remove video.");
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-8 pb-12 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary">
                        My Playlists
                    </h1>
                    <p className="text-text-secondary text-sm mt-1">
                        Organize and manage your favorite videos into custom lists.
                    </p>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="px-6 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-text-primary font-semibold text-sm transition-all duration-300 shadow-lg shadow-accent/15 hover:shadow-accent/25 self-start sm:self-auto"
                >
                    ＋ New Playlist
                </button>
            </div>

            {error && (
                <div className="p-4 bg-danger-red/10 border border-danger-red/20 rounded-2xl text-danger-red text-sm">
                    {error}
                </div>
            )}

            {/* Playlists Grid */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {playlists.length === 0 ? (
                    <div className="md:col-span-3 text-center p-12 bg-card-bg/20 border border-border-color rounded-3xl backdrop-blur-md">
                        <p className="text-text-secondary font-medium">No playlists found. Create one to begin organizing your videos.</p>
                    </div>
                ) : (
                    playlists.map((playlist) => (
                        <div
                            key={playlist._id}
                            className="p-6 bg-card-bg/40 border border-border-color rounded-3xl hover:bg-card-bg/70 hover:shadow-lg transition-all duration-300 group relative backdrop-blur-md flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-4">
                                    <span className="text-4xl block group-hover:scale-105 duration-300 select-none">📂</span>
                                    <button
                                        onClick={() => handleDelete(playlist._id)}
                                        className="p-2.5 rounded-xl bg-danger-red/10 hover:bg-danger-red/20 border border-danger-red/10 text-danger-red transition duration-300 text-xs"
                                        title="Delete playlist"
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <h3 className="text-text-primary font-display font-bold text-lg mt-4 truncate">{playlist.name}</h3>
                                <p className="text-text-secondary text-xs mt-1 line-clamp-2">{playlist.description}</p>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-between">
                                <span className="px-3 py-1.5 rounded-full bg-white/5 border border-border-color text-[10px] text-text-secondary uppercase font-bold tracking-widest">
                                    {playlist.videos?.length || 0} Videos
                                </span>
                                <button
                                    onClick={() => setSelectedPlaylist(playlist)}
                                    className="text-accent hover:text-accent-hover text-xs font-semibold hover:underline transition duration-300"
                                >
                                    View Playlist ➔
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Playlist Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-bg/85 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-md bg-elevated/95 border border-border-color rounded-3xl p-6 shadow-2xl space-y-5 animate-scale-in backdrop-blur-xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-text-primary font-display font-bold text-lg">Create New Playlist</h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/5 text-text-secondary hover:text-text-primary transition duration-300"
                            >
                                ✕
                            </button>
                        </div>

                        {createError && (
                            <div className="p-3 bg-danger-red/10 border border-danger-red/20 text-danger-red rounded-xl text-xs">
                                {createError}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-4 text-sm">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Playlist Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter name (e.g. My Favorites)"
                                    className="w-full px-4 py-3 bg-secondary-bg/60 border border-border-color rounded-xl text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition duration-300"
                                    disabled={createLoading}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Brief description of the playlist content..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-secondary-bg/60 border border-border-color rounded-xl text-text-primary outline-none focus:border-accent focus:ring-1 focus:ring-accent transition duration-300 resize-none"
                                    disabled={createLoading}
                                />
                            </div>

                            <div className="flex justify-end gap-3 border-t border-border-color pt-4 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="px-4 py-2 bg-card-bg/40 hover:bg-card-bg/60 border border-border-color text-text-secondary hover:text-text-primary rounded-xl font-medium transition duration-300"
                                    disabled={createLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-accent hover:bg-accent-hover text-text-primary rounded-xl font-semibold transition duration-300 disabled:opacity-55"
                                    disabled={createLoading}
                                >
                                    {createLoading ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Playlist Video Drawer Detail Modal */}
            {selectedPlaylist && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-primary-bg/75 backdrop-blur-xs animate-fade-in">
                    <div className="w-full max-w-lg h-full bg-secondary-bg/95 border-l border-border-color p-6 shadow-2xl flex flex-col space-y-6 animate-slide-up backdrop-blur-2xl">
                        
                        <div className="flex items-center justify-between border-b border-border-color pb-4">
                            <div>
                                <h3 className="text-text-primary font-display font-bold text-xl">{selectedPlaylist.name}</h3>
                                <p className="text-text-secondary text-xs mt-1">{selectedPlaylist.description}</p>
                            </div>
                            <button
                                onClick={() => setSelectedPlaylist(null)}
                                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-text-secondary hover:text-text-primary transition duration-300"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Video List */}
                        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
                            {(!selectedPlaylist.videos || selectedPlaylist.videos.length === 0) ? (
                                <div className="text-center py-12 text-text-secondary font-medium">
                                    No videos in this playlist yet. Add videos to this playlist from the watch details page!
                                </div>
                            ) : (
                                selectedPlaylist.videos.map((video) => (
                                    <div
                                        key={video._id}
                                        className="p-3 bg-card-bg/40 border border-border-color rounded-2xl flex gap-4 hover:bg-card-bg/85 backdrop-blur-md transition-all duration-300 relative group"
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-24 aspect-video object-cover rounded-xl border border-border-color shrink-0 shadow-md group-hover:scale-[1.02] duration-300"
                                        />
                                        <div className="flex-1 min-w-0 pr-6 flex flex-col justify-center">
                                            <p className="text-text-primary font-bold text-sm truncate">{video.title}</p>
                                            <p className="text-text-secondary text-xs truncate mt-1">
                                                {formatViews(video.views)} views
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveVideo(video._id, selectedPlaylist._id)}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-danger-red/10 hover:bg-danger-red/20 text-danger-red flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition duration-300"
                                            title="Remove from playlist"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}

export default Playlists;
