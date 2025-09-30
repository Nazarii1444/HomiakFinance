export const formatCurrency = (amount: number, signed: boolean = false) => {
    return `${signed && amount > 0 ? '+' : ''}${amount.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
    })}`;
};