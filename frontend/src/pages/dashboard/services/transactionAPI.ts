import type { Transaction, TransactionCreate, TransactionUpdate, TransactionFilters } from '../types/types.ts';
import {store} from "../../../store";

const API_BASE_URL = 'http://localhost:8000/api';

class TransactionAPI {
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

  async getTransactions(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();

    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.offset) params.append('offset', filters.offset.toString());

    const endpoint = `/transactions${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Transaction[]>(endpoint, {
      method: 'GET',
    });
  }

  async getTransactionById(id: number): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'GET',
    });
  }

  async createTransaction(data: TransactionCreate): Promise<Transaction> {
    return this.request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTransaction(id: number, data: TransactionUpdate): Promise<Transaction> {
    return this.request<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteTransaction(id: number): Promise<{ new_capital: number; id_: number }> {
  return this.request<{ new_capital: number; id_: number }>(`/transactions/${id}`, {
    method: 'DELETE',
  });
}
}

export const transactionAPI = new TransactionAPI();