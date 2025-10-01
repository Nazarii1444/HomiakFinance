import type { Goal, GoalCreate, GoalUpdate, GoalFilters } from '../types/types';
import { store } from "../../../store";

const API_BASE_URL = 'http://localhost:8000/api';

class GoalAPI {
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

      if (response.status === 204) {
        return undefined as T;
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  async getGoals(filters: GoalFilters = {}): Promise<Goal[]> {
    const params = new URLSearchParams();

    if (filters.q) params.append('q', filters.q);
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const endpoint = `/goals${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Goal[]>(endpoint, {
      method: 'GET',
    });
  }

  async getGoalById(id: number): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'GET',
    });
  }

  async createGoal(data: GoalCreate): Promise<Goal> {
    return this.request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGoal(id: number, data: GoalUpdate): Promise<Goal> {
    return this.request<Goal>(`/goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteGoal(id: number): Promise<void> {
    await this.request<void>(`/goals/${id}`, {
      method: 'DELETE',
    });
  }
}

export const goalAPI = new GoalAPI();