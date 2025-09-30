import type {TransactionKind} from "./transactionKind.ts";

export interface Transaction {
  id_: number;
  amount: number;
  kind: TransactionKind;
  category_name: string;
  currency: string;
  date: string;
  user_id: number;
}

export interface TransactionCreate {
  amount: number;
  kind: TransactionKind;
  category_name: string;
  currency: string;
  date?: string;
}

export interface TransactionUpdate {
  amount?: number;
  kind?: TransactionKind;
  category_name?: string;
  currency?: string;
  date?: string;
}

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface TransactionFilters {
  limit?: number;
  offset?: number;
  kind?: TransactionKind;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
}