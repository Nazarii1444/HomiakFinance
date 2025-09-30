// services/authAPI.ts
import type { LoginRequest, RegisterRequest, LoginResponse, TokenPair, User } from '../types/types';

const API_BASE_URL = 'http://localhost:8000/api';

class AuthAPI {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add authorization header if access token exists
    if (this.accessToken) {
      defaultHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<TokenPair> {
    return this.request<TokenPair>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'GET',
    });
  }
}

export const authAPI = new AuthAPI();