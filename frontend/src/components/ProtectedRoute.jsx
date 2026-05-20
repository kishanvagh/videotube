import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import Loader from "./Loader";

function ProtectedRoute() {
    const { isAuthenticated, loading } = useSelector(
        (state) => state.auth
    );

    // Show loader while checking authentication
    if (loading) {
        return <Loader />;
    }

    // Redirect unauthenticated users
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Allow authenticated users
    return <Outlet />;
}

export default ProtectedRoute;