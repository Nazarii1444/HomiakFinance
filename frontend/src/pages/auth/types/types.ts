export interface RegisterFormData {
  login: string;
  password: string;
}

export interface LoginFormData {
  login: string;
  password: string;
}

export interface User {
  login: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  user: User;
  token: string;
}