import {useEffect, useState} from 'react';
import {Box, Typography, Button, CircularProgress, Alert} from '@mui/material';
import {Add as AddIcon} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {fetchGoals, createGoal, updateGoal, deleteGoal} from '../../../store/slices/goalSlice';
import type {Goal, GoalCreate, GoalUpdate} from "../types/types";
import GoalList from './GoalList';
import AddGoalModal from './AddGoalModal';
import FundGoalModal from './FundGoalModal';
import '../styles/Goals.scss';

const Goals = () => {
    const dispatch = useAppDispatch();
    const {goals, loading, error} = useAppSelector((state) => state.goals);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newGoalName, setNewGoalName] = useState('');
    const [newGoalTarget, setNewGoalTarget] = useState('');

    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [goalToFund, setGoalToFund] = useState<Goal | null>(null);
    const [fundAmount, setFundAmount] = useState('');

    // Fetch goals on component mount
    useEffect(() => {
        dispatch(fetchGoals());
    }, [dispatch]);

    const handleAddGoal = async () => {
        const target = parseFloat(newGoalTarget);
        if (newGoalName && target > 0) {
            const newGoalData: GoalCreate = {
                name: newGoalName,
                summ: target,
                saved: 0,
            };

            await dispatch(createGoal(newGoalData));
            setIsAddModalOpen(false);
            setNewGoalName('');
            setNewGoalTarget('');
        }
    };

    const handleDeleteGoal = async (id: number) => {
        await dispatch(deleteGoal(id));
    };

    const handleOpenFundModal = (goal: Goal) => {
        setGoalToFund(goal);
        setIsFundModalOpen(true);
        setFundAmount('');
    };

    const handleFundGoal = async () => {
        const amount = parseFloat(fundAmount);
        if (goalToFund && amount > 0) {
            const newSaved = Math.min(goalToFund.summ, goalToFund.saved + amount);

            const updateData: GoalUpdate = {
                saved: newSaved,
            };

            await dispatch(updateGoal({
                id: goalToFund.id_,
                data: updateData
            }));

            setIsFundModalOpen(false);
            setGoalToFund(null);
        }
    };

    // Transform goals to match the component's expected format
    const transformedGoals = goals.map(goal => ({
        id: goal.id_,
        name: goal.name,
        targetAmount: goal.summ,
        currentAmount: goal.saved,
        dateAdded: new Date().toISOString().slice(0, 10), // You might want to add this field to backend
    }));

    return (
        <Box className="goals-container">
            <Box className="goals-header">
                <Typography variant="h4" component="h1" className="goals-title">
                    Saving Goals
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => setIsAddModalOpen(true)}
                    className="add-goal-button"
                    disabled={loading}
                >
                    Add New Goal
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{mb: 2}}>
                    {error}
                </Alert>
            )}

            {loading && goals.length === 0 ? (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress/>
                </Box>
            ) : (
                <GoalList
                    goals={transformedGoals}
                    onDelete={handleDeleteGoal}
                    onFundOpen={(goal) => {
                        const originalGoal = goals.find(g => g.id_ === goal.id);
                        if (originalGoal) handleOpenFundModal(originalGoal);
                    }}
                />
            )}

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
                goalToFund={goalToFund ? goalToFund : null}
                fundAmount={fundAmount}
                setFundAmount={setFundAmount}
                onFundGoal={handleFundGoal}
            />
        </Box>
    );
};

export default Goals;