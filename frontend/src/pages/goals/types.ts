export interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    dateAdded: string;
}

export interface GoalListProps {
    goals: Goal[];
    onDelete: (id: number) => void;
    onFundOpen: (goal: Goal) => void;
}

export interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    newGoalName: string;
    setNewGoalName: (name: string) => void;
    newGoalTarget: string;
    setNewGoalTarget: (target: string) => void;
    onAddGoal: () => void;
}

export interface FundGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    goalToFund: Goal | null;
    fundAmount: string;
    setFundAmount: (amount: string) => void;
    onFundGoal: () => void;
}
