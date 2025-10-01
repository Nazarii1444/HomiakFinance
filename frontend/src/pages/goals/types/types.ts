export interface Goal {
    id_: number;
    name: string;
    summ: number;      // target amount
    saved: number;     // current amount
}

export interface GoalCreate {
    name: string;
    summ: number;
    saved?: number;
}

export interface GoalUpdate {
    name?: string;
    summ?: number;
    saved?: number;
}

export interface GoalFilters {
    q?: string;
    limit?: number;
    offset?: number;
}

export interface GoalState {
    goals: Goal[];
    loading: boolean;
    error: string | null;
    totalSaved: number;
    totalTarget: number;
}

export interface GoalListProps {
    goals: Array<{
        id: number;
        name: string;
        targetAmount: number;
        currentAmount: number;
        dateAdded?: string;
    }>;
    onDelete: (id: number) => void | Promise<void>;
    onFundOpen: (goal: any) => void;
}

export interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    newGoalName: string;
    setNewGoalName: (name: string) => void;
    newGoalTarget: string;
    setNewGoalTarget: (target: string) => void;
    onAddGoal: () => void | Promise<void>;
}

export interface FundGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToFund: Goal | null;
    fundAmount: string;
    setFundAmount: (amount: string) => void;
    onFundGoal: () => void | Promise<void>;
}