import {createSlice, createAsyncThunk, type PayloadAction} from '@reduxjs/toolkit';
import type {Goal, GoalCreate, GoalUpdate, GoalFilters, GoalState} from "../../pages/goals/types/types";
import {goalAPI} from "../../pages/goals/services/goalAPI.ts";

const initialState: GoalState = {
    goals: [],
    loading: false,
    error: null,
    totalSaved: 0,
    totalTarget: 0,
};

// Async thunks
export const fetchGoals = createAsyncThunk(
    'goals/fetchGoals',
    async (filters: GoalFilters | void = {}, {rejectWithValue}) => {
        const finalFilters = filters || {};
        try {
            const goals = await goalAPI.getGoals(finalFilters);
            return goals;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to fetch goals'
            );
        }
    }
);

export const createGoal = createAsyncThunk(
    'goals/createGoal',
    async (data: GoalCreate, {rejectWithValue}) => {
        try {
            const goal = await goalAPI.createGoal(data);
            return goal;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to create goal'
            );
        }
    }
);

export const updateGoal = createAsyncThunk(
    'goals/updateGoal',
    async ({id, data}: { id: number; data: GoalUpdate }, {rejectWithValue}) => {
        try {
            const goal = await goalAPI.updateGoal(id, data);
            return goal;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to update goal'
            );
        }
    }
);

export const deleteGoal = createAsyncThunk(
    'goals/deleteGoal',
    async (id: number, {rejectWithValue}) => {
        try {
            await goalAPI.deleteGoal(id);
            return id;
        } catch (error) {
            return rejectWithValue(
                error instanceof Error ? error.message : 'Failed to delete goal'
            );
        }
    }
);

// Helper function to calculate totals
const calculateTotals = (goals: Goal[]) => {
    let totalSaved = 0;
    let totalTarget = 0;

    goals.forEach(goal => {
        totalSaved += Number(goal.saved);
        totalTarget += Number(goal.summ);
    });

    return {
        totalSaved,
        totalTarget,
    };
};

const goalSlice = createSlice({
    name: 'goals',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearGoals: (state) => {
            state.goals = [];
            state.totalSaved = 0;
            state.totalTarget = 0;
        },
        setGoals: (state, action: PayloadAction<Goal[]>) => {
            state.goals = action.payload;
            const totals = calculateTotals(action.payload);
            state.totalSaved = totals.totalSaved;
            state.totalTarget = totals.totalTarget;
        },
    },
    extraReducers: (builder) => {
        // Fetch goals
        builder
            .addCase(fetchGoals.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchGoals.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = action.payload;
                state.error = null;

                const totals = calculateTotals(action.payload);
                state.totalSaved = totals.totalSaved;
                state.totalTarget = totals.totalTarget;
            })
            .addCase(fetchGoals.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Create goal
        builder
            .addCase(createGoal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createGoal.fulfilled, (state, action) => {
                state.loading = false;
                state.goals.unshift(action.payload);
                state.error = null;

                const totals = calculateTotals(state.goals);
                state.totalSaved = totals.totalSaved;
                state.totalTarget = totals.totalTarget;
            })
            .addCase(createGoal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Update goal
        builder
            .addCase(updateGoal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateGoal.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.goals.findIndex((g: { id_: number; }) => g.id_ === action.payload.id_);
                if (index !== -1) {
                    state.goals[index] = action.payload;
                }
                state.error = null;

                const totals = calculateTotals(state.goals);
                state.totalSaved = totals.totalSaved;
                state.totalTarget = totals.totalTarget;
            })
            .addCase(updateGoal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

        // Delete goal
        builder
            .addCase(deleteGoal.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteGoal.fulfilled, (state, action) => {
                state.loading = false;
                state.goals = state.goals.filter((g: { id_: number; }) => g.id_ !== action.payload);
                state.error = null;

                const totals = calculateTotals(state.goals);
                state.totalSaved = totals.totalSaved;
                state.totalTarget = totals.totalTarget;
            })
            .addCase(deleteGoal.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {clearError, clearGoals, setGoals} = goalSlice.actions;
export default goalSlice.reducer;