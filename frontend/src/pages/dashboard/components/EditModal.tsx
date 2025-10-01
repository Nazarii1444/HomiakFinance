import React from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import { TransactionKind } from "../types/transactionKind";

interface EditTransactionFormProps {
  name: string;
  setName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  date: Dayjs | null;
  setDate: (val: Dayjs) => void;
  amount: number;
  setAmount: (val: number) => void;
  kind: TransactionKind;
  setKind: (val: TransactionKind) => void;
  currency: string;
  setCurrency: (val: string) => void;
  categories: { name: string; icon: JSX.Element }[];
  CURRENCIES: { code: string; symbol: string; name: string }[];
}

const EditForm: React.FC<EditTransactionFormProps> = ({
  name,
  setName,
  category,
  setCategory,
  date,
  setDate,
  amount,
  setAmount,
  currency,
  setCurrency,
  categories,
  CURRENCIES,
}) => {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
      />

      {/* Категорія */}
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <MenuItem key={cat.name} value={cat.name}>
              <Box display="flex" alignItems="center" gap={1}>
                {cat.icon}
                <Typography>{cat.name}</Typography>
              </Box>
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
        InputLabelProps={{ shrink: true }}
        fullWidth
      />

      {/* Сума */}
      <TextField
        label="Amount"
        type="number"
        value={amount.toFixed(2)}
        onChange={(e) => setAmount(Number(e.target.value))}
        fullWidth
      />

      {/* Валюта */}
      <FormControl fullWidth>
        <InputLabel>Currency</InputLabel>
        <Select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <MenuItem key={c.code} value={c.code}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography>{c.symbol}</Typography>
                <Typography>{c.name}</Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default EditForm;
