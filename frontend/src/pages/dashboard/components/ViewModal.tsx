// ViewModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import {
  Edit as EditIcon,
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
import dayjs, { Dayjs } from "dayjs";
import { TransactionKind } from "../types/transactionKind";
import EditForm from "./EditModal.tsx";

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

const ViewModal: React.FC<TransactionModalProps> = ({
  open,
  transaction,
  onClose,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [amount, setAmount] = useState<number>(0);
  const [kind, setKind] = useState<TransactionKind>(TransactionKind.EXPENSE);
  const [currency, setCurrency] = useState<string>("USD");

  useEffect(() => {
    if (transaction) {
      setName(transaction.name || "");
      setCategory(transaction.category_name || "");
      setDate(transaction.date ? dayjs(transaction.date) : dayjs());
      setAmount(Number(transaction.amount) || 0);
      setKind(transaction.kind);
      setCurrency(transaction.currency || "USD");
      setIsEditing(false);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSave = () => {
    const updatedData = {
      // name,
      category_name: category,
      date: date?.toISOString(),
      amount,
      currency,
      kind,
    };
    onSave(transaction.id_, updatedData);
    setIsEditing(false);
  };

  const categories =
    kind === TransactionKind.EXPENSE ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        <Box flex={1} display="flex" justifyContent="center" ml={3}>
          <Typography variant="h6" align="center">
            Transaction
          </Typography>
        </Box>
        {!isEditing && (
          <IconButton onClick={() => setIsEditing(true)}>
            <EditIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {!isEditing ? (
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Typography variant="h5" fontWeight="bold" align="center">
              {name}
            </Typography>
            <Box
              px={3}
              py={1}
              borderRadius={5}
              bgcolor="grey.200"
              display="inline-flex"
              alignItems="center"
              gap={1}
            >
              {categories.find((cat) => cat.name === category)?.icon ?? <OtherIcon />}
              <Typography fontSize="1.1rem">{category}</Typography>
            </Box>
            <Typography color="text.secondary">
              {dayjs(date).format("D MMMM YYYY")}
            </Typography>
            <Typography
              variant="h4"
              fontWeight="bold"
              align="center"
              sx={{ mt: 2, mb: 4 }}
            >
              {kind === TransactionKind.EXPENSE ? "-" : "+"}
              {Number(amount).toFixed(2)}{" "}
              {CURRENCIES.find((c) => c.code === currency)?.symbol}
            </Typography>
          </Box>
        ) : (
          <EditForm
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            date={date}
            setDate={setDate}
            amount={amount}
            setAmount={setAmount}
            kind={kind}
            setKind={setKind}
            currency={currency}
            setCurrency={setCurrency}
            categories={categories}
            CURRENCIES={CURRENCIES}
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        {isEditing && (
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ViewModal;
