// types/types.ts
export interface User {
  id: string;
  email: string;
  username: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
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