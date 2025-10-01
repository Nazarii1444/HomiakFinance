import React from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid
} from '@mui/material';
import type {AddGoalModalProps} from "../types/types.ts";

const AddGoalModal: React.FC<AddGoalModalProps> = ({
    isOpen,
    onClose,
    newGoalName,
    setNewGoalName,
    newGoalTarget,
    setNewGoalTarget,
    onAddGoal,
}) => {
    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Create a New Goal</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Goal Name"
                            type="text"
                            fullWidth
                            variant="outlined"
                            value={newGoalName}
                            onChange={(e) => setNewGoalName(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            margin="dense"
                            label="Target Amount ($)"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={newGoalTarget}
                            onChange={(e) => setNewGoalTarget(e.target.value)}
                            inputProps={{ min: "0.01", step: "0.01" }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={onAddGoal} color="primary" variant="contained">
                    Create Goal
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddGoalModal;