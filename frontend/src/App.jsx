import { useEffect } from "react";
import { useDispatch } from "react-redux";

import AppRoutes from "./routes/AppRoutes";

import {
    setUser,
    logoutUser,
    setLoading,
    setError,
} from "./store/authSlice";

import { getCurrentUser } from "./services/authService";

function App() {
    const dispatch = useDispatch();

    // Check authentication on app startup
    useEffect(() => {
        const fetchCurrentUser = async () => {
            dispatch(setLoading(true));
            
            try {
                const response = await getCurrentUser();

                // Store current user in Redux
                dispatch(setUser(response.data));

            } catch (error) {
                dispatch(logoutUser());

                dispatch(
                    setError(
                        error.message || "Failed to authenticate user"
                    )
                );
            } finally {
                dispatch(setLoading(false));
            }
        };

        fetchCurrentUser();
    }, [dispatch]);

    return <AppRoutes />;
}

export default App;