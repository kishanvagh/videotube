import { useState } from "react";

function LikeButton({
    initialLikedState = false,
    initialLikesCount = 0,
    onToggle,
}) {
    const [liked, setLiked] = useState(initialLikedState);
    const [likesCount, setLikesCount] = useState(initialLikesCount);
    const [loading, setLoading] = useState(false);

    const handleLike = async () => {
        if (loading) return;

        try {
            setLoading(true);

            // Optimistic update
            const newLikedState = !liked;
            setLiked(newLikedState);
            setLikesCount((prev) =>
                newLikedState ? prev + 1 : prev - 1
            );

            if (onToggle) {
                await onToggle();
            }

        } catch (error) {
            console.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl transition-all duration-300 font-semibold border backdrop-blur-md hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
                liked
                    ? "bg-accent/15 text-accent border-accent/30 shadow-lg shadow-accent/10"
                    : "bg-card-bg/40 text-text-secondary border-border-color hover:bg-card-bg/80 hover:text-text-primary hover:border-border-color/60"
            }`}
        >
            <span
                className={`text-base transition-transform duration-300 ${
                    liked ? "scale-115 animate-scale-in" : "scale-100"
                }`}
            >
                {liked ? "💜" : "🤍"}
            </span>

            <span className="text-sm font-semibold tracking-wide">
                {likesCount}
            </span>
        </button>
    );
}

export default LikeButton;