import { useState, useRef } from "react";
import { publishAVideo } from "../services/videoService";

function UploadModal({ onClose, onUploadSuccess }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [transcript, setTranscript] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);

    const [videoPreview, setVideoPreview] = useState("");
    const [thumbnailPreview, setThumbnailPreview] = useState("");

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    // Handle File Drop/Select
    const handleVideoSelect = (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("video/")) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            setError("");
        } else {
            setError("Please upload a valid video file.");
        }
    };

    const handleThumbnailSelect = (e) => {
        const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
        if (file && file.type.startsWith("image/")) {
            setThumbnail(file);
            setThumbnailPreview(URL.createObjectURL(file));
            setError("");
        } else {
            setError("Please upload a valid image thumbnail.");
        }
    };

    // Form Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !videoFile || !thumbnail) {
            setError("All fields including video and thumbnail are required.");
            return;
        }

        setLoading(true);
        setError("");
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("transcript", transcript);
            formData.append("videoFile", videoFile);
            formData.append("thumbnail", thumbnail);

            await publishAVideo(formData, (progressEvent) => {
                const percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                setProgress(percentCompleted);
            });

            setSuccess("Video uploaded and published successfully!");
            setTimeout(() => {
                if (onUploadSuccess) onUploadSuccess();
                onClose();
            }, 1500);

        } catch (err) {
            setError(err.message || "Failed to publish video. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-3xl bg-elevated/95 border border-border-color rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[90vh] glass-elevated">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-border-color text-text-secondary hover:text-text-primary transition-all duration-300 cursor-pointer"
                >
                    ✕
                </button>

                {/* Heading */}
                <div className="mb-6">
                    <h2 className="text-2xl font-black text-text-primary bg-clip-text bg-gradient-to-r from-text-primary to-text-secondary font-display">
                        Publish new creation
                    </h2>
                    <p className="text-text-muted text-sm mt-1">
                        Share your premium and aesthetic creations with the community.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-2xl bg-danger-red/10 border border-danger-red/20 text-danger-red text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 rounded-2xl bg-success-green/10 border border-success-green/20 text-success-green text-sm">
                        ✨ {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Media Dropzones */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Video Dropzone */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleVideoSelect(e);
                            }}
                            onClick={() => videoInputRef.current?.click()}
                            className="group relative h-48 flex flex-col items-center justify-center border-2 border-dashed border-border-color hover:border-accent/50 rounded-2xl bg-primary-bg/30 hover:bg-white/5 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            <input
                                type="file"
                                ref={videoInputRef}
                                accept="video/*"
                                className="hidden"
                                onChange={handleVideoSelect}
                            />
                            {videoPreview ? (
                                <video
                                    src={videoPreview}
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <span className="text-4xl block mb-2 transition-transform group-hover:scale-110">🎥</span>
                                    <p className="text-text-primary text-sm font-semibold font-display">Select Video File</p>
                                    <p className="text-text-muted text-xs mt-1">Drag and drop, or click to browse</p>
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Dropzone */}
                        <div
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                handleThumbnailSelect(e);
                            }}
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="group relative h-48 flex flex-col items-center justify-center border-2 border-dashed border-border-color hover:border-accent/50 rounded-2xl bg-primary-bg/30 hover:bg-white/5 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            <input
                                type="file"
                                ref={thumbnailInputRef}
                                accept="image/*"
                                className="hidden"
                                onChange={handleThumbnailSelect}
                            />
                            {thumbnailPreview ? (
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                            ) : (
                                <div className="text-center p-4">
                                    <span className="text-4xl block mb-2 transition-transform group-hover:scale-110">🖼️</span>
                                    <p className="text-text-primary text-sm font-semibold font-display">Select Cover Image</p>
                                    <p className="text-text-muted text-xs mt-1">Drag and drop, or click to browse</p>
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Title & Description Input */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2 font-display">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter video title..."
                                className="w-full px-5 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2 font-display">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what your video is about..."
                                rows={3}
                                className="w-full px-5 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-primary mb-2 font-display flex items-center gap-2">
                                <span>Video Transcript</span>
                                <span className="text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                                    Qdrant Vector DB
                                </span>
                            </label>
                            <textarea
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                                placeholder="Optional: Paste video transcript or subtitles here to enable AI Chatbot Q&A..."
                                rows={3}
                                className="w-full px-5 py-3 rounded-2xl bg-primary-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-300 text-sm"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {loading && (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-text-secondary">
                                <span>Uploading file...</span>
                                <span className="font-semibold text-text-primary">{progress}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent to-accent-hover transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 border-t border-border-color pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-2xl text-text-primary border border-border-color hover:bg-white/5 font-semibold transition duration-300 text-sm cursor-pointer"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-2xl bg-accent hover:bg-accent-hover text-text-primary font-bold shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? "Publishing..." : "Publish Video"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default UploadModal;
