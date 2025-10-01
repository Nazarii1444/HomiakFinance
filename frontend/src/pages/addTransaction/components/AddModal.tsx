import React, { useState } from 'react';
import {
  Box,
  Modal,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Alert,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  type SelectChangeEvent,
} from '@mui/material';
import {
  DirectionsBus as TransportIcon,
  ShoppingCart as ShoppingIcon,
  Flight as TravelIcon,
  Face as BeautyIcon,
  School as EducationIcon,
  Mic as EntertainmentIcon,
  Home as UtilitiesIcon,
  Work as SalaryIcon,
  Star as FreelanceIcon,
  TrendingUp as InvestmentIcon,
  Redeem as GiftIcon,
  MoreHoriz as OtherIcon,
  Fastfood as DiningIcon,
  LocalHospital as HealthIcon,
  FitnessCenter as SportsIcon,
  Phone as PhoneIcon,
  Checkroom as ClothingIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { createTransaction, clearError } from '../../../store/slices/transactionSlice';
import CategoryTile from "./CategoryTile";
import type { CategoryItem } from "../types";
import '../styles/AddModal.scss';
import {TransactionKind} from "../../dashboard/types/transactionKind.ts";

const SUCCESS_GREEN = '#22c55e';
const DANGER_RED = '#ef4444';

// Currency configurations with symbols
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
  { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Zloty' },
  { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia' },
];

const EXPENSE_CATEGORIES: CategoryItem[] = [
  { name: 'food', icon: <DiningIcon /> },
  { name: 'shopping', icon: <ShoppingIcon /> },
  { name: 'transportation', icon: <TransportIcon /> },
  { name: 'travel', icon: <TravelIcon /> },
  { name: 'health', icon: <HealthIcon /> },
  { name: 'housing', icon: <UtilitiesIcon /> },
  { name: 'entertainment', icon: <EntertainmentIcon /> },
  { name: 'education', icon: <EducationIcon /> },
  { name: 'beauty', icon: <BeautyIcon /> },
  { name: 'sports', icon: <SportsIcon /> },
  { name: 'phone', icon: <PhoneIcon /> },
  { name: 'clothing', icon: <ClothingIcon /> },
];

const INCOME_CATEGORIES: CategoryItem[] = [
  { name: 'salary', icon: <SalaryIcon /> },
  { name: 'freelance', icon: <FreelanceIcon /> },
  { name: 'investment', icon: <InvestmentIcon /> },
  { name: 'gifts', icon: <GiftIcon /> },
  { name: 'other', icon: <OtherIcon /> },
];

interface AddModalProps {
  open: boolean;
  onClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.transactions);
  const {user} = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(user?.default_currency || "USD");
  const [amountError, setAmountError] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]); // YYYY-MM-DD

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    setCategory('');
    setAmountError(false);
    setCategoryError(false);
    dispatch(clearError());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    if (newAmount && parseFloat(newAmount) > 0) {
      setAmountError(false);
    }
  };

  const handleCurrencyChange = (e: SelectChangeEvent) => {
    setCurrency(e.target.value);
  };

  const handleCategorySelect = (categoryName: string) => {
    setCategory(categoryName);
    setCategoryError(false);
  };

  const getCurrentCurrency = () => {
    return CURRENCIES.find(curr => curr.code === currency) || CURRENCIES[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
  };

  const handleSubmit = async () => {
    let hasErrors = false;

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      setAmountError(true);
      hasErrors = true;
    }

    // Validate category
    if (!category) {
      setCategoryError(true);
      hasErrors = true;
    }

    if (hasErrors) {
      return;
    }

    try {
      const transactionData = {
        name: name,
        amount: parseFloat(amount),
        kind: type === 'expense' ? TransactionKind.EXPENSE : TransactionKind.INCOME,
        category_name: category,
        currency: currency,
        date: date,
      };

      await dispatch(createTransaction(transactionData)).unwrap();

      // Reset form and close modal on success
      setName('');
      setType('expense');
      setCategory('');
      setAmount('');
      setCurrency(user?.default_currency || "USD");
      setAmountError(false);
      setCategoryError(false);
      onClose();
    } catch (error) {
      // Error is handled by the Redux slice
      console.error('Failed to create transaction:', error);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setName('');
    setType('expense');
    setCategory('');
    setAmount('');
    setCurrency(user?.default_currency || "USD");
    setAmountError(false);
    setCategoryError(false);
    dispatch(clearError());
    onClose();
  };

  const getHighlightColor = () => (type === 'income' ? SUCCESS_GREEN : DANGER_RED);
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currentCurrencyObj = getCurrentCurrency();

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        className="modal-paper"
        sx={{
          width: { xs: '95%', sm: 500 },
          height: { xs: '90%', sm: 'auto' },
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          className="modal-header"
          sx={{
            borderBottom: `2px solid ${getHighlightColor()}`,
            pb: 2,
            mb: 3,
            textAlign: 'center',
          }}
        >
          Add Transaction
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Title Field */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Transaction Name"
            variant="outlined"
            value={name}
            onChange={handleNameChange}
            disabled={loading}
          />
        </Box>

        <Box className="type-toggles" sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Button
            fullWidth
            onClick={() => handleTypeChange('expense')}
            className="type-button"
            disabled={loading}
            sx={{
              backgroundColor: type === 'expense' ? DANGER_RED : 'transparent',
              color: type === 'expense' ? 'white' : '#475569',
              boxShadow: type === 'expense' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              '&:hover': {
                backgroundColor: type === 'expense' ? DANGER_RED : 'transparent',
                opacity: 0.9,
              },
            }}
          >
            Expense
          </Button>
          <Button
            fullWidth
            onClick={() => handleTypeChange('income')}
            className="type-button"
            disabled={loading}
            sx={{
              backgroundColor: type === 'income' ? SUCCESS_GREEN : 'transparent',
              color: type === 'income' ? 'white' : '#475569',
              boxShadow: type === 'income' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
              '&:hover': {
                backgroundColor: type === 'income' ? SUCCESS_GREEN : 'transparent',
                opacity: 0.9,
              },
            }}
          >
            Income
          </Button>
        </Box>

        <Typography
          variant="subtitle1"
          className="category-title"
          sx={{
            mb: 2,
            color: categoryError ? 'error.main' : 'inherit'
          }}
        >
          Select Category {categoryError && '*'}
        </Typography>

        {categoryError && (
          <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
            Please select a category
          </Typography>
        )}

        <Box
          className="category-grid"
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: 2,
            mb: 3
          }}
        >
          {currentCategories.map((cat) => (
            <CategoryTile
              key={cat.name}
              category={cat}
              isSelected={category === cat.name}
              onClick={() => handleCategorySelect(cat.name)}
              color={getHighlightColor()}
            />
          ))}
        </Box>

        {/* Amount and Currency Row */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          <TextField
            fullWidth
            label="Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={handleAmountChange}
            error={amountError}
            helperText={amountError ? 'Please enter a valid amount.' : ''}
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: getHighlightColor(), fontWeight: 'bold' }}>
                    {type === 'expense' ? `${currentCurrencyObj.symbol}-` : `${currentCurrencyObj.symbol}+`}
                  </Typography>
                </InputAdornment>
              ),
            }}
            sx={{ flex: 2 }}
          />

          <FormControl sx={{ flex: 1, minWidth: 100 }}>
            <InputLabel id="currency-select-label">Currency</InputLabel>
            <Select
              labelId="currency-select-label"
              id="currency-select"
              value={currency}
              label="Currency"
              onChange={handleCurrencyChange}
              disabled={loading}
            >
              {CURRENCIES.map((curr) => (
                <MenuItem key={curr.code} value={curr.code}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontWeight: 'bold', minWidth: '24px' }}>
                      {curr.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: '0.875rem' }}>
                      {curr.code}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Date Field */}
        <Box sx={{ mb: 4 }}>
          <TextField
            label="Transaction Date"
            type="date"
            fullWidth
            value={date}
            onChange={handleDateChange}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            className="add-button"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{
              backgroundColor: getHighlightColor(),
              '&:hover': {
                backgroundColor: getHighlightColor(),
                opacity: 0.9,
              },
            }}
          >
            {loading ? 'Adding...' : 'Add'}
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default AddModal;