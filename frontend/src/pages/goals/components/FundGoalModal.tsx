import React from 'react';
import {
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@mui/material';
import { formatCurrency } from "../utils/utils.ts";
import type {FundGoalModalProps} from "../types.ts";

const FundGoalModal: React.FC<FundGoalModalProps> = ({
    isOpen,
    onClose,
    goalToFund,
    fundAmount,
    setFundAmount,
    onFundGoal,
}) => {
    if (!goalToFund) return null;

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Fund {goalToFund.name}</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle1" sx={{mb: 1}}>
                    Current: ${formatCurrency(goalToFund.currentAmount)} / Target: ${formatCurrency(goalToFund.targetAmount)}
                </Typography>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Amount to Add ($)"
                    type="number"
                    fullWidth
                    variant="outlined"
                    value={fundAmount}
                    onChange={(e) => setFundAmount(e.target.value)}
                    inputProps={{ min: "0.01", step: "0.01" }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    Cancel
                </Button>
                <Button onClick={onFundGoal} color="primary" variant="contained">
                    Add Funds
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FundGoalModal;