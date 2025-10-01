// pages/dashboard/components/ViewModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from "@mui/material";
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
  FitnessCenter as SportsIcon
} from '@mui/icons-material';
import dayjs, { Dayjs } from "dayjs";
import { TransactionKind } from "../types/transactionKind";

// Тип категорії
interface CategoryItem {
  name: string;
  icon: JSX.Element;
}

interface TransactionModalProps {
  open: boolean;
  transaction: any | null;
  onClose: () => void;
  onSave: (id: number, updatedData: any) => void;
}

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
  { name: 'phone', icon: <OtherIcon /> },
  { name: 'clothing', icon: <OtherIcon /> },
];

const INCOME_CATEGORIES: CategoryItem[] = [
  { name: 'salary', icon: <SalaryIcon /> },
  { name: 'freelance', icon: <FreelanceIcon /> },
  { name: 'investment', icon: <InvestmentIcon /> },
  { name: 'gifts', icon: <GiftIcon /> },
  { name: 'other', icon: <OtherIcon /> },
];

const ViewModal: React.FC<TransactionModalProps> = ({
  open,
  transaction,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [amount, setAmount] = useState<number>(0);
  const [kind, setKind] = useState<TransactionKind>(TransactionKind.EXPENSE);
  const [currency, setCurrency] = useState<string>("UAH");

  useEffect(() => {
    if (transaction) {
      setName(transaction.name || "");
      setCategory(transaction.category_name || "");
      setDate(transaction.date ? dayjs(transaction.date) : dayjs());
      setAmount(transaction.amount || 0);
      setKind(transaction.kind);
      setCurrency(transaction.currency || "UAH");
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = () => {
    const updatedData = {
      // name,
      category,
      date: date?.toISOString(),
      amount,
      currency,
      kind
    };
    onSave(transaction.id_, updatedData);
    onClose();
  };

  const categories =
    kind === TransactionKind.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <TextField
          label="Name of transaction"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          variant="outlined"
        />
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Категорія */}
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              label="Category"
            >
              {categories.map((cat) => (
                <MenuItem key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Дата */}
          <TextField
            label="Date"
            type="date"
            value={dayjs(date).format("YYYY-MM-DD")}
            onChange={(e) => setDate(dayjs(e.target.value))}
            fullWidth
            InputLabelProps={{
              shrink: true, // щоб лейбл не перекривав значення
            }}
          />


          {/* Сума */}
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            fullWidth
          />

          {/* Валюта */}
          <FormControl fullWidth>
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              label="Currency"
            >
              {CURRENCIES.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.symbol} {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewModal;
