import React from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    LinearProgress,
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CheckCircle as CompletedIcon,
    HourglassEmpty as ActiveIcon,
    Save as FundIcon,
} from '@mui/icons-material';
import { formatCurrency } from "../utils/utils.ts";
import '../styles/Goals.scss';
import type {GoalListProps} from "../types.ts";

const GoalList: React.FC<GoalListProps> = ({ goals, onDelete, onFundOpen }) => {
    return (
        <List className="goals-list">
            {goals.length === 0 ? (
                <Typography className="no-goals-message">
                    You haven't set any goals yet. Start saving today! 🚀
                </Typography>
            ) : (
                goals.map((goal) => {
                    const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                    const isCompleted = progress >= 100;

                    return (
                        <Paper key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                            <ListItem disableGutters>
                                <Box className="goal-status-icon-wrapper">
                                    {isCompleted ? <CompletedIcon /> : <ActiveIcon />}
                                </Box>

                                <ListItemText
                                    primary={goal.name}
                                    secondary={`Target: $${formatCurrency(goal.targetAmount)}`}
                                    className="goal-details"
                                />

                                <Box className="goal-progress-info">
                                    <Typography variant="body2" className="current-amount">
                                        ${formatCurrency(goal.currentAmount)}
                                    </Typography>
                                    <LinearProgress
                                        variant="determinate"
                                        value={progress}
                                        className="progress-bar"
                                    />
                                    <Typography variant="caption" className="progress-percent">
                                        {progress.toFixed(1)}%
                                    </Typography>
                                </Box>

                                <Box className="goal-actions">
                                    <IconButton
                                        edge="end"
                                        aria-label="fund"
                                        onClick={() => onFundOpen(goal)}
                                        disabled={isCompleted}
                                        className="fund-button"
                                    >
                                        <FundIcon />
                                    </IconButton>
                                    <IconButton
                                        edge="end"
                                        aria-label="delete"
                                        onClick={() => onDelete(goal.id)}
                                        className="delete-button"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </ListItem>
                        </Paper>
                    );
                })
            )}
        </List>
    );
};

export default GoalList;