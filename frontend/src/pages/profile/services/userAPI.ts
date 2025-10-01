import {store} from "../../../store";
import type {User, UserUpdateData} from "../types/types.ts";

const API_BASE_URL = 'http://localhost:8000/api';

class UserAPI {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;

        const defaultHeaders: HeadersInit = {
            'Content-Type': 'application/json',
        };

        const state = store.getState();
        const token = state.auth.accessToken;
        if (token) {
            defaultHeaders.Authorization = `Bearer ${token}`;
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

    async getCurrentUser(): Promise<User> {
        return this.request<User>('/users/me', {
            method: 'GET',
        });
    }

    async updateUser(data: UserUpdateData): Promise<User> {
        return this.request<User>('/users/me', {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }
}

export const userAPI = new UserAPI();