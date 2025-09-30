import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import '../styles/Goals.scss';

import type { Goal } from "../types.ts";
import GoalList from './GoalList';
import AddGoalModal from './AddGoalModal';
import FundGoalModal from './FundGoalModal';

const Goals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');

    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [goalToFund, setGoalToFund] = useState<Goal | null>(null);
    const [fundAmount, setFundAmount] = useState('');

    const handleAddGoal = () => {
        const target = parseFloat(newGoalTarget);
        if (newGoalName && target > 0) {
            const newGoal: Goal = {
                id: Date.now(),
                name: newGoalName,
                targetAmount: target,
                currentAmount: 0,
                dateAdded: new Date().toISOString().slice(0, 10),
            };
            setGoals([...goals, newGoal]);
            setIsAddModalOpen(false);
            setNewGoalName('');
            setNewGoalTarget('');
        }
    };

    const handleDeleteGoal = (id: number) => {
        setGoals(goals.filter(goal => goal.id !== id));
    };

    const handleOpenFundModal = (goal: Goal) => {
        setGoalToFund(goal);
        setIsFundModalOpen(true);
        setFundAmount('');
    };

    const handleFundGoal = () => {
        const amount = parseFloat(fundAmount);
        if (goalToFund && amount > 0) {
            setGoals(goals.map(goal =>
                goal.id === goalToFund.id
                    ? {
                        ...goal,
                        currentAmount: Math.min(goal.targetAmount, goal.currentAmount + amount)
                      }
                    : goal
            ));
            setIsFundModalOpen(false);
            setGoalToFund(null);
        }
    };

    return (
        <Box className="goals-container">
            <Box className="goals-header">
                <Typography variant="h4" component="h1" className="goals-title">
                    Saving Goals
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddModalOpen(true)}
                    className="add-goal-button"
                >
                    Add New Goal
                </Button>
            </Box>

            <GoalList
                goals={goals}
                onDelete={handleDeleteGoal}
                onFundOpen={handleOpenFundModal}
            />

            <AddGoalModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                newGoalName={newGoalName}
                setNewGoalName={setNewGoalName}
                newGoalTarget={newGoalTarget}
                setNewGoalTarget={setNewGoalTarget}
                onAddGoal={handleAddGoal}
            />

            <FundGoalModal
                isOpen={isFundModalOpen}
                onClose={() => setIsFundModalOpen(false)}
                goalToFund={goalToFund}
                fundAmount={fundAmount}
                setFundAmount={setFundAmount}
                onFundGoal={handleFundGoal}
            />
        </Box>
    );
};

export default Goals;