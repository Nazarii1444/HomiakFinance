// pages/dashboard/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Pagination,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';
import {
  DirectionsBus as TransportIcon,
  ShoppingCart as ShoppingIcon,
  Flight as TravelIcon,
  Face as BeautyIcon,
  School as EducationIcon,
  Mic as EntertainmentIcon,
  Phone as PhoneIcon,
  Restaurant as FoodIcon,
  Work as WorkIcon,
  Home as HomeIcon,
  LocalHospital as HealthIcon,
  DirectionsCar as CarIcon,
  SportsEsports as SportsIcon,
  Group as SocialIcon,
  Checkroom as ClothingIcon,
  Celebration as CelebrationIcon,
  AttachMoney as MoneyIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchTransactions, clearError, updateTransaction, deleteTransaction } from '../../../store/slices/transactionSlice';
import '../styles/Dashboard.scss';
import {TransactionKind} from "../types/transactionKind.ts";
import ViewModal from './ViewModal.tsx';
import type {TransactionUpdate} from "../types/types.ts";

const categoryIcons: { [key: string]: React.ReactElement } = {
  shopping: <ShoppingIcon />,
  food: <FoodIcon />,
  phone: <PhoneIcon />,
  entertainment: <EntertainmentIcon />,
  education: <EducationIcon />,
  beauty: <BeautyIcon />,
  sports: <SportsIcon />,
  social: <SocialIcon />,
  transportation: <TransportIcon />,
  clothing: <ClothingIcon />,
  car: <CarIcon />,
  electronics: <MoneyIcon />,
  travel: <TravelIcon />,
  health: <HealthIcon />,
  housing: <HomeIcon />,
  home: <HomeIcon />,
  salary: <WorkIcon />,
  freelance: <WorkIcon />,
  work: <WorkIcon />,
  income: <WorkIcon />,
  gifts: <CelebrationIcon />,
  default: <MoneyIcon />
};

interface DeleteConfirmationState {
  open: boolean;
  transactionId: number | null;
  transactionName: string;
}

// Currency symbol mapping
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'JPY': '¥',
  'GBP': '£',
  'AUD': 'A$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'PLN': 'zł',
  'UAH': '₴',
};

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const {
    transactions,
    loading,
    error,
    totalBalance,
    totalIncome,
    totalExpenses
  } = useAppSelector((state) => state.transactions);

  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmationState>({
    open: false,
    transactionId: null,
    transactionName: ''
  });
  const itemsPerPage = 5;

  useEffect(() => {
    dispatch(fetchTransactions({ limit: 100 })); // Fetch more transactions for better overview
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const getIcon = (categoryName: string) => {
    const category = categoryName.toLowerCase();
    return categoryIcons[category] || categoryIcons.default;
  };

  const getCurrencySymbol = (currency: string | null | undefined): string => {
    if (!currency) return '$'; // Default to USD symbol
    return CURRENCY_SYMBOLS[currency.toUpperCase()] || currency;
  };

  const formatAmount = (amount: number, kind: TransactionKind, currency?: string | null) => {
    const formattedAmount = Math.abs(amount).toFixed(2);
    const symbol = getCurrencySymbol(currency);
    const prefix = kind === TransactionKind.INCOME ? '+' : '-';

    // For currencies that typically go after the amount (like PLN, SEK, NOK)
    if (currency && ['PLN', 'SEK', 'NOK'].includes(currency.toUpperCase())) {
      return `${prefix}${formattedAmount} ${symbol}`;
    }

    // For most currencies, symbol goes before
    return `${prefix}${symbol}${formattedAmount}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteClick = (transactionId: number, categoryName: string) => {
    setDeleteConfirmation({
      open: true,
      transactionId,
      transactionName: categoryName
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.transactionId) {
      try {
        await dispatch(deleteTransaction(deleteConfirmation.transactionId)).unwrap();

        // Reset page to first if current page becomes empty after deletion
        const remainingTransactions = transactions.length - 1;
        const maxPages = Math.ceil(remainingTransactions / itemsPerPage);
        if (currentPage > maxPages && maxPages > 0) {
          setCurrentPage(maxPages);
        }
      } catch (error) {
        console.error('Failed to delete transaction:', error);
      }
    }

    setDeleteConfirmation({
      open: false,
      transactionId: null,
      transactionName: ''
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      open: false,
      transactionId: null,
      transactionName: ''
    });
  };

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleSaveTransaction = async (id: number, data: TransactionUpdate) => {
    try {
      // Викликаємо thunk
      const updatedTransaction = await dispatch(
        updateTransaction({ id, data })
      ).unwrap();

      console.log('Transaction updated successfully:', updatedTransaction);

    } catch (err) {
      console.error('Failed to update transaction:', err);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, endIndex);

  const handlePageChange = (_event: any, page: React.SetStateAction<number>) => {
    setCurrentPage(page);
  };

  if (loading && transactions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box className="dashboard-container">
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} className="balance-card">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography className="balance-title">Total Balance</Typography>
            <Typography className="balance-brand">Homiak Finance</Typography>
          </Box>
          <Typography className="balance-amount">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Typography>
          <Box className="balance-summary">
            <Box className="summary-item">
              <Typography className="summary-label">Income</Typography>
              <Typography className="summary-value income">
                +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
            <Box className="divider" />
            <Box className="summary-item">
              <Typography className="summary-label">Expenses</Typography>
              <Typography className="summary-value expense">
                -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Box className="transactions-section">
          <Box display="flex" justifyContent="space-between" alignItems="center" className="transactions-header">
            <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#1e293b' }}>
              Recent Transactions
            </Typography>
            {loading && (
              <CircularProgress size={20} />
            )}
          </Box>

          {transactions.length === 0 && !loading ? (
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="200px"
              flexDirection="column"
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No transactions found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start by adding your first transaction
              </Typography>
            </Box>
          ) : (
            <List sx={{ padding: 0 }}>
              {paginatedTransactions.map((transaction) => (
                <ListItem
                  key={transaction.id_}
                  className="transaction-item"
                  onClick={() => handleTransactionClick(transaction)}
                  sx={{
                    '&:hover .delete-button': {
                      opacity: 1
                    }
                  }}
                >
                  <ListItemIcon>
                    <Box className={`icon-wrapper ${transaction.kind}`}>
                      {getIcon(transaction.category_name)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={transaction.category_name}
                    secondary={formatDate(transaction.date)}
                  />
                  <Typography className={`amount-text ${transaction.kind}`}>
                    {formatAmount(transaction.amount, transaction.kind, transaction.currency)}
                  </Typography>
                  <IconButton
                    className="delete-button"
                    onClick={() => handleDeleteClick(transaction.id_, transaction.category_name)}
                    size="small"
                    sx={{
                      ml: 1,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      color: '#ef4444',
                      '&:hover': {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      }
                    }}
                    aria-label={`Delete ${transaction.category_name} transaction`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {totalPages > 1 && (
          <Box className="dashboard-pagination">
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Transaction
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the "{deleteConfirmation.transactionName}" transaction?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ViewModal
        open={isModalOpen}
        transaction={selectedTransaction}
        onClose={handleModalClose}
        onSave={handleSaveTransaction}
      />

    </>
  );
};

export default Dashboard;