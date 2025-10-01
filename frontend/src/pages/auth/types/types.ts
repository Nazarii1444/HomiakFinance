// types/types.ts

import type {User} from "../../profile/types/types.ts";

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

export interface AuthFormData {
    login: string;
    password: string;
    username?: string; // Optional for registration
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
}

export interface TokenPair {
    access_token: string;
    refresh_token: string;
}