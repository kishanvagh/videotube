/**
 * Format views count
 * Example:
 * 1200 => 1.2K
 */
export const formatViews = (views) => {
    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`;
    }

    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`;
    }

    return views;
};

/**
 * Format duration
 * Example:
 * 12.67 => 00:12
 */
export const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${String(mins).padStart(2, "0")}:${String(
        secs
    ).padStart(2, "0")}`;
};

/**
 * Format relative upload time
 */
export const formatUploadTime = (dateString) => {
    const now = new Date();
    const uploadDate = new Date(dateString);

    const seconds = Math.floor(
        (now - uploadDate) / 1000
    );

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} year${years > 1 ? "s" : ""} ago`;
    }

    if (months > 0) {
        return `${months} month${months > 1 ? "s" : ""} ago`;
    }

    if (days > 0) {
        return `${days} day${days > 1 ? "s" : ""} ago`;
    }

    if (hours > 0) {
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    }

    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    }

    return "Just now";
};