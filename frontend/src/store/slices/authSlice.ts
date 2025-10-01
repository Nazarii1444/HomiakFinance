// store/slices/authSlice.ts
import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import type {AuthState, LoginRequest, RegisterRequest} from '../../pages/auth/types/types.ts';
import {authAPI} from '../../pages/auth/services/authAPI.ts';
import {userAPI} from "../../pages/profile/services/userAPI.ts";
import type {UserUpdateData} from "../../pages/profile/types/types.ts";

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    accessToken: null,
    refreshToken: null,
};

// Async thunk for login
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, {rejectWithValue}) => {
        try {
            const response = await authAPI.login(credentials);

            // Set token in API service for subsequent requests
            authAPI.setAccessToken(response.access_token);

            // Get user profile with the new token
            const user = await userAPI.getCurrentUser();

            return {
                user,
                access_token: response.access_token,
                refresh_token: response.refresh_token,
            };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Login failed'
            );
        }
    }
);

// Async thunk for registration
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: RegisterRequest, {rejectWithValue}) => {
        try {
            const response = await authAPI.register(userData);

            // Set token in API service for subsequent requests
            authAPI.setAccessToken(response.access_token);

            // Get user profile with the new token
            const user = await userAPI.getCurrentUser();

            return {
                user,
                access_token: response.access_token,
                refresh_token: response.refresh_token,
            };
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Registration failed'
            );
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateProfile',
    async (data: UserUpdateData, {rejectWithValue}) => {
        try {
            const updatedUser = await userAPI.updateUser(data);
            return updatedUser;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update profile'
            );
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
            state.accessToken = null;
            state.refreshToken = null;
            // Clear token from API service
            authAPI.setAccessToken(null);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login cases
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
                state.accessToken = null;
                state.refreshToken = null;
            })

            // Register cases
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.isAuthenticated = true;
                state.error = null;
                state.accessToken = action.payload.access_token;
                state.refreshToken = action.payload.refresh_token;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.user = null;
                state.isAuthenticated = false;
                state.error = action.payload as string;
                state.accessToken = null;
                state.refreshToken = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const {logout, clearError} = authSlice.actions;
export default authSlice.reducer;