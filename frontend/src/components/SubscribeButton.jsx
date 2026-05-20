import { useState } from "react";

function SubscribeButton({
  initialSubscribedState = false,
  initialSubscribersCount = 0,
  onToggle,
}) {
  const [subscribed, setSubscribed] = useState(initialSubscribedState);
  const [subscribersCount, setSubscribersCount] = useState(initialSubscribersCount);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (loading) return;

    try {
      setLoading(true);

      // Optimistic update
      const newState = !subscribed;
      setSubscribed(newState);
      setSubscribersCount((prev) => (newState ? prev + 1 : prev - 1));

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
      onClick={handleSubscribe}
      className={`px-6 py-2.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] cursor-pointer ${
        subscribed
          ? "bg-transparent border border-border-color text-text-secondary hover:text-text-primary hover:bg-white/5"
          : "bg-text-primary text-primary-bg hover:bg-text-primary/90 shadow-lg shadow-white/5"
      }`}
    >
      {subscribed
        ? `✓ Subscribed • ${subscribersCount}`
        : `Subscribe • ${subscribersCount}`}
    </button>
  );
}

export default SubscribeButton;
