import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        // Set authenticated user
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.loading = false;
            state.error = null;
        },

        // Logout user
        logoutUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },

        // Set loading state
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        // Set auth error
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    setUser,
    logoutUser,
    setLoading,
    setError,
} = authSlice.actions;

export default authSlice.reducer;