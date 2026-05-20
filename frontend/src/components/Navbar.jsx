import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser as logoutUserAPI } from "../services/authService";
import { logoutUser } from "../store/authSlice";
import UploadModal from "./UploadModal";

function Navbar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    
    const [searchQuery, setSearchQuery] = useState(searchParams.get("query") || "");
    const [showDropdown, setShowDropdown] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    
    const dropdownRef = useRef(null);

    // Sync search input with URL query param
    useEffect(() => {
        setSearchQuery(searchParams.get("query") || "");
    }, [searchParams]);

    // Handle Dropdown close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle Search Submit
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?query=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate("/");
        }
    };

    // Handle Logout
    const handleLogout = async () => {
        try {
            await logoutUserAPI();
            dispatch(logoutUser());
            setShowDropdown(false);
            navigate("/login");
        } catch (error) {
            console.error("Logout failed:", error.message);
        }
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-primary-bg/80 backdrop-blur-xl border-b border-border-color px-6 py-4 flex items-center justify-between gap-4">
                
                {/* Logo */}
                <Link to="/" className="text-2xl font-black text-text-primary tracking-tighter flex items-center gap-2 shrink-0 select-none font-display">
                    <span className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-accent to-accent-hover flex items-center justify-center text-sm text-text-primary shadow-lg shadow-accent/25 accent-glow-subtle transition-transform duration-300 hover:scale-105">▶</span>
                    <span>Video<span className="text-accent">Tube</span></span>
                </Link>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex items-center relative group">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search videos, creators..."
                        className="w-full px-5 py-3 rounded-full bg-card-bg/40 border border-border-color text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition-all duration-300 group-hover:border-border-color/60 focus:bg-card-bg/70"
                    />
                    <button
                        type="submit"
                        className="absolute right-1.5 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-300 border border-border-color text-sm text-text-secondary hover:text-text-primary"
                    >
                        🔍
                    </button>
                </form>

                {/* Right Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    
                    {!isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="px-5 py-2.5 rounded-2xl text-text-primary font-medium hover:bg-white/5 border border-border-color transition-all duration-300 text-sm"
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="px-5 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-text-primary font-bold transition-all duration-300 text-sm shadow-lg shadow-accent/15 hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Signup
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            
                            {/* Upload Button */}
                            <button
                                onClick={() => setShowUpload(true)}
                                className="hidden md:flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-border-color text-text-primary font-semibold transition-all duration-300 text-sm hover:scale-[1.02] active:scale-[0.98]"
                            >
                                📤 <span className="hidden lg:inline">Upload</span>
                            </button>

                            {/* User Avatar Menu */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="w-10 h-10 rounded-2xl overflow-hidden border border-border-color hover:border-accent hover:scale-105 transition-all duration-300 cursor-pointer"
                                >
                                    <img
                                        src={user?.avatar || "https://via.placeholder.com/40"}
                                        alt={user?.username}
                                        className="w-full h-full object-cover"
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-60 bg-elevated/95 backdrop-blur-xl border border-border-color rounded-2xl p-2.5 shadow-2xl animate-scale-in text-sm z-50">
                                        <div className="px-3 py-2 border-b border-border-color mb-2">
                                            <p className="text-text-primary font-bold truncate font-display">{user?.fullName}</p>
                                            <p className="text-text-secondary text-xs truncate">@{user?.username}</p>
                                        </div>

                                        <Link
                                            to={`/c/${user?.username}`}
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all duration-200"
                                        >
                                            👤 Channel Profile
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            onClick={() => setShowDropdown(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all duration-200"
                                        >
                                            📊 Creator Dashboard
                                        </Link>

                                        <button
                                            onClick={() => {
                                                setShowDropdown(false);
                                                setShowUpload(true);
                                            }}
                                            className="md:hidden flex w-full items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 text-text-secondary hover:text-text-primary transition-all duration-200"
                                        >
                                            📤 Upload Video
                                        </button>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-danger-red/10 text-danger-red hover:text-danger-red transition-all duration-200 text-left mt-2 border-t border-border-color pt-3 font-semibold"
                                        >
                                            🚪 Logout
                                        </button>
                                    </div>
                                )}

                            </div>

                        </div>
                    )}
                    
                </div>

            </nav>

            {/* Global Upload Modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onUploadSuccess={() => {
                        // Refresh home feed if currently on home page
                        if (window.location.pathname === "/") {
                            window.location.reload();
                        }
                    }}
                />
            )}
        </>
    );
}

export default Navbar;