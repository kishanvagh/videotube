import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";

function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { isAuthenticated } = useSelector((state) => state.auth);
    const location = useLocation();

    const navItems = [
        { path: "/", label: "Home", icon: "🏠" },
        { path: "/history", label: "History", icon: "⏳", requireAuth: true },
        { path: "/liked-videos", label: "Liked Videos", icon: "❤️", requireAuth: true },
        { path: "/watch-later", label: "Watch Later", icon: "📌", requireAuth: true },
        { path: "/dashboard", label: "Dashboard", icon: "📊", requireAuth: true },
        { path: "/playlists", label: "Playlists", icon: "📂", requireAuth: true },
    ];

    const activeClass = "bg-accent text-text-primary shadow-lg shadow-accent/20 accent-glow-subtle";
    const inactiveClass = "text-text-secondary hover:bg-white/5 hover:text-text-primary";

    return (
        <div className="min-h-screen bg-primary-bg text-text-primary flex flex-col font-sans selection:bg-accent/30 selection:text-text-primary">
            {/* Top Navbar */}
            <Navbar />

            <div className="flex flex-1 relative overflow-hidden">
                
                {/* Collapsible Sidebar (hidden on mobile) */}
                <aside
                    className={`hidden md:flex flex-col border-r border-border-color bg-secondary-bg/50 backdrop-blur-md transition-all duration-300 ${
                        collapsed ? "w-20" : "w-64"
                    }`}
                >
                    {/* Toggle Button */}
                    <div className="p-4 flex justify-end">
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-white/5 border border-border-color text-text-secondary hover:text-text-primary transition-all duration-300"
                        >
                            {collapsed ? "➡️" : "⬅️"}
                        </button>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-3 space-y-1.5">
                        {navItems.map((item) => {
                            if (item.requireAuth && !isAuthenticated) return null;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all duration-300 ${
                                        isActive ? activeClass : inactiveClass
                                    } ${collapsed ? "justify-center" : ""}`}
                                    title={item.label}
                                >
                                    <span className="text-xl transition-transform duration-300 group-hover:scale-110">{item.icon}</span>
                                    {!collapsed && <span className="text-sm font-semibold">{item.label}</span>}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8 bg-primary-bg">
                    <div className="max-w-[1600px] mx-auto animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation (visible on mobile only) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-secondary-bg/85 backdrop-blur-xl border-t border-border-color flex justify-around py-3.5 px-2 shadow-2xl">
                {navItems.map((item) => {
                    if (item.requireAuth && !isAuthenticated) return null;
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex flex-col items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                                isActive ? "text-accent scale-105" : "text-text-secondary"
                            }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="scale-90 font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

export default MainLayout;
