import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import MainLayout from "../layouts/MainLayout";

// Components
import ProtectedRoute from "../components/ProtectedRoute";

// Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VideoDetails from "../pages/VideoDetails";
import Dashboard from "../pages/Dashboard";
import History from "../pages/History";
import Playlists from "../pages/Playlists";
import LikedVideos from "../pages/LikedVideos";
import WatchLater from "../pages/WatchLater";
import Channel from "../pages/Channel";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                {/* Main Layout */}
                <Route element={<MainLayout />}>

                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Video Watch Page */}
                    <Route
                        path="/video/:videoId"
                        element={<VideoDetails />}
                    />

                    {/* Creator/Channel Page */}
                    <Route
                        path="/c/:username"
                        element={<Channel />}
                    />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>

                        <Route
                            path="/dashboard"
                            element={<Dashboard />}
                        />

                        <Route
                            path="/history"
                            element={<History />}
                        />

                        <Route
                            path="/playlists"
                            element={<Playlists />}
                        />

                        <Route
                            path="/liked-videos"
                            element={<LikedVideos />}
                        />

                        <Route
                            path="/watch-later"
                            element={<WatchLater />}
                        />

                    </Route>

                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;