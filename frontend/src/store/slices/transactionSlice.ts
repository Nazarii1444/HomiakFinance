// store/slices/transactionSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type {
  Transaction,
  TransactionCreate,
  TransactionFilters, TransactionState,
  TransactionUpdate
} from "../../pages/dashboard/types/types.ts";
import {transactionAPI} from "../../pages/dashboard/services/transactionAPI.ts";
import {TransactionKind} from "../../pages/dashboard/types/transactionKind.ts";


const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
  totalBalance: 0,
  totalIncome: 0,
  totalExpenses: 0,
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (filters: TransactionFilters = {}, { rejectWithValue }) => {
    try {
      const transactions = await transactionAPI.getTransactions(filters);
      return transactions;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch transactions'
      );
    }
  }
);

export const createTransaction = createAsyncThunk(
  'transactions/createTransaction',
  async (data: TransactionCreate, { rejectWithValue }) => {
    try {
      const transaction = await transactionAPI.createTransaction(data);
      return transaction;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to create transaction'
      );
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, data }: { id: number; data: TransactionUpdate }, { rejectWithValue }) => {
    try {
      const transaction = await transactionAPI.updateTransaction(id, data);
      return transaction;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to update transaction'
      );
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: number, { rejectWithValue }) => {
    try {
      await transactionAPI.deleteTransaction(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to delete transaction'
      );
    }
  }
);

// Helper function to calculate totals
const calculateTotals = (transactions: Transaction[]) => {
  let totalIncome = 0;
  let totalExpenses = 0;

  transactions.forEach(transaction => {
    if (transaction.kind === TransactionKind.INCOME) {
      totalIncome += Number(transaction.amount);
    } else if (transaction.kind === TransactionKind.EXPENSE) {
      totalExpenses += Math.abs(transaction.amount);
    }
  });

  const totalBalance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalBalance,
  };
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearTransactions: (state) => {
      state.transactions = [];
      state.totalBalance = 0;
      state.totalIncome = 0;
      state.totalExpenses = 0;
    },
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.transactions = action.payload;
      const totals = calculateTotals(action.payload);
      state.totalBalance = totals.totalBalance;
      state.totalIncome = totals.totalIncome;
      state.totalExpenses = totals.totalExpenses;
    },
  },
  extraReducers: (builder) => {
    // Fetch transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;

        // Calculate totals
        const totals = calculateTotals(action.payload);
        state.totalBalance = totals.totalBalance;
        state.totalIncome = totals.totalIncome;
        state.totalExpenses = totals.totalExpenses;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Create transaction
    builder
      .addCase(createTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions.unshift(action.payload); // Add to beginning
        state.error = null;

        // Recalculate totals
        const totals = calculateTotals(state.transactions);
        state.totalBalance = totals.totalBalance;
        state.totalIncome = totals.totalIncome;
        state.totalExpenses = totals.totalExpenses;
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Update transaction
    builder
      .addCase(updateTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.transactions.findIndex((t: { id_: any; }) => t.id_ === action.payload.id_);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        }
        state.error = null;

        // Recalculate totals
        const totals = calculateTotals(state.transactions);
        state.totalBalance = totals.totalBalance;
        state.totalIncome = totals.totalIncome;
        state.totalExpenses = totals.totalExpenses;
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

    // Delete transaction
    builder
      .addCase(deleteTransaction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = state.transactions.filter((t: { id_: number; }) => t.id_ !== action.payload);
        state.error = null;

        // Recalculate totals
        const totals = calculateTotals(state.transactions);
        state.totalBalance = totals.totalBalance;
        state.totalIncome = totals.totalIncome;
        state.totalExpenses = totals.totalExpenses;
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearTransactions, setTransactions } = transactionSlice.actions;
export default transactionSlice.reducer;