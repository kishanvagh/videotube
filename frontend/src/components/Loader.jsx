function Loader() {
    return (
        <div className="flex items-center justify-center p-12">
            <div className="flex flex-col items-center gap-4 animate-pulse-subtle">

                {/* Spinner */}
                <div className="w-10 h-10 border-3 border-accent/20 border-t-accent rounded-full animate-spin accent-glow"></div>

                {/* Text */}
                <p className="text-text-muted text-xs font-semibold tracking-widest uppercase font-display">
                    Synchronizing
                </p>
            </div>
        </div>
    );
}

export default Loader;