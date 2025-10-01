import React, {useState} from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Avatar,
    IconButton,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Chip,
    Paper,
    Grid,
    Stack,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    ExitToApp as LogoutIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    Close as CloseIcon,
    HelpOutline as HelpIcon,
    Language as LanguageIcon,
    AdminPanelSettings as AdminIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import {useAppDispatch, useAppSelector} from '../../../store/hooks';
import {logout, updateUserProfile} from '../../../store/slices/authSlice';

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

const CURRENCIES = Object.keys(CURRENCY_SYMBOLS);

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();
    const {user} = useAppSelector((state) => state.auth);

    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [isEditingCurrency, setIsEditingCurrency] = useState(false);
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [newCurrency, setNewCurrency] = useState(user?.default_currency || 'USD');
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleSaveUsername = async () => {
        if (newUsername.trim() && newUsername !== user?.username) {
            try {
                setUpdateError(null);
                await dispatch(updateUserProfile({username: newUsername.trim()})).unwrap();
                setUpdateSuccess('Username updated successfully!');
                setIsEditingUsername(false);
                setTimeout(() => setUpdateSuccess(null), 3000);
            } catch (error) {
                setUpdateError(error as string);
            }
        } else {
            setIsEditingUsername(false);
        }
    };

    const handleSaveCurrency = async () => {
        if (newCurrency && newCurrency !== user?.default_currency) {
            try {
                setUpdateError(null);
                await dispatch(updateUserProfile({default_currency: newCurrency})).unwrap();
                setUpdateSuccess('Currency updated successfully!');
                setIsEditingCurrency(false);
                setTimeout(() => setUpdateSuccess(null), 3000);
            } catch (error) {
                setUpdateError(error as string);
            }
        } else {
            setIsEditingCurrency(false);
        }
    };

    const getAvatarText = (username: string | undefined) => {
        return username ? username.charAt(0).toUpperCase() : '?';
    };

    const formatBalance = (amount: number, currency: string) => {
        const symbol = CURRENCY_SYMBOLS[currency] || currency;
        return `${symbol}${amount.toFixed(2)}`;
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            bgcolor: '#f8f9fa',
            pb: 10
        }}>
            <Container maxWidth="xl" sx={{pt: {xs: 3, md: 5}}}>
                {/* Success/Error Messages */}
                {updateSuccess && (
                    <Alert
                        severity="success"
                        sx={{mb: 3, borderRadius: 2}}
                        onClose={() => setUpdateSuccess(null)}
                    >
                        {updateSuccess}
                    </Alert>
                )}
                {updateError && (
                    <Alert
                        severity="error"
                        sx={{mb: 3, borderRadius: 2}}
                        onClose={() => setUpdateError(null)}
                    >
                        {updateError}
                    </Alert>
                )}

                {/* Header Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: {xs: 3, md: 4},
                        mb: 4,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white'
                    }}
                >
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 3
                    }}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 3}}>
                            <Avatar
                                sx={{
                                    width: {xs: 80, md: 100},
                                    height: {xs: 80, md: 100},
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    border: '4px solid rgba(255,255,255,0.3)',
                                    fontSize: {xs: '2rem', md: '2.5rem'},
                                    fontWeight: 'bold',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                {getAvatarText(user?.username)}
                            </Avatar>

                            <Box>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 0.5}}>
                                    <Typography variant="h4" fontWeight="bold">
                                        {user?.username}
                                    </Typography>
                                    {user?.role === 1 && (
                                        <Chip
                                            icon={<AdminIcon/>}
                                            label="Admin"
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                fontWeight: 'bold',
                                                backdropFilter: 'blur(10px)'
                                            }}
                                        />
                                    )}
                                </Box>
                                <Typography variant="body1" sx={{opacity: 0.9}}>
                                    {user?.email}
                                </Typography>
                                <Typography variant="caption" sx={{opacity: 0.7}}>
                                    User ID: #{user?.id_}
                                </Typography>
                            </Box>
                        </Box>

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<LogoutIcon/>}
                            onClick={handleLogout}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.2)',
                                backdropFilter: 'blur(10px)',
                                color: 'white',
                                px: 4,
                                py: 1.5,
                                fontWeight: 'bold',
                                textTransform: 'none',
                                border: '2px solid rgba(255,255,255,0.3)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.3)',
                                }
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    {/* Balance Card */}
                    <Grid size={{xs: 12, lg: 4}}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Box sx={{
                                position: 'absolute',
                                top: -20,
                                right: -20,
                                width: 150,
                                height: 150,
                                borderRadius: '50%',
                                bgcolor: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(20px)'
                            }}/>

                            <Box sx={{position: 'relative', zIndex: 1}}>
                                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 3}}>
                                    <Box sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backdropFilter: 'blur(10px)'
                                    }}>
                                        <TrendingIcon sx={{fontSize: 28}}/>
                                    </Box>
                                    <Typography variant="h6" fontWeight="600">
                                        Current Balance
                                    </Typography>
                                </Box>

                                <Typography
                                    variant="h2"
                                    fontWeight="bold"
                                    sx={{mb: 1}}
                                >
                                    {formatBalance(user?.capital || 0, user?.default_currency || 'USD')}
                                </Typography>

                                <Typography variant="body2" sx={{opacity: 0.9}}>
                                    Available to spend
                                </Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Account Settings */}
                    <Grid size={{xs: 12, lg: 8}}>
                        <Paper elevation={0} sx={{p: 4, borderRadius: 3, height: '100%'}}>
                            <Typography variant="h5" fontWeight="bold" sx={{mb: 4}}>
                                Account Settings
                            </Typography>

                            <Stack spacing={3}>
                                {/* Username Row */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: '#f8f9fa',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#e9ecef',
                                        transform: 'translateX(4px)'
                                    }
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flex: 1}}>
                                        <Box sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <PersonIcon/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="caption" color="text.secondary" fontWeight="600"
                                                        sx={{textTransform: 'uppercase', letterSpacing: 0.5}}>
                                                Username
                                            </Typography>
                                            {isEditingUsername ? (
                                                <Box sx={{display: 'flex', gap: 1, mt: 0.5}}>
                                                    <TextField
                                                        size="small"
                                                        value={newUsername}
                                                        onChange={(e) => setNewUsername(e.target.value)}
                                                        fullWidth
                                                        autoFocus
                                                        sx={{'& .MuiOutlinedInput-root': {borderRadius: 1.5}}}
                                                    />
                                                    <IconButton
                                                        onClick={handleSaveUsername}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': {bgcolor: 'primary.dark'}
                                                        }}
                                                    >
                                                        <SaveIcon fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setIsEditingUsername(false);
                                                            setNewUsername(user?.username || '');
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Typography variant="body1" fontWeight="600" sx={{mt: 0.5}}>
                                                    {user?.username || 'Not available'}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    {!isEditingUsername && (
                                        <IconButton
                                            onClick={() => setIsEditingUsername(true)}
                                            sx={{
                                                bgcolor: 'white',
                                                boxShadow: 1,
                                                '&:hover': {bgcolor: 'primary.main', color: 'white'}
                                            }}
                                        >
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    )}
                                </Box>

                                {/* Email Row */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: '#f8f9fa',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#e9ecef',
                                        transform: 'translateX(4px)'
                                    }
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                                        <Box sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <EmailIcon/>
                                        </Box>
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight="600"
                                                        sx={{textTransform: 'uppercase', letterSpacing: 0.5}}>
                                                Email Address
                                            </Typography>
                                            <Typography variant="body1" fontWeight="600" sx={{mt: 0.5}}>
                                                {user?.email || 'Not available'}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Currency Row */}
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2.5,
                                    borderRadius: 2,
                                    bgcolor: '#f8f9fa',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#e9ecef',
                                        transform: 'translateX(4px)'
                                    }
                                }}>
                                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2, flex: 1}}>
                                        <Box sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 2,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <LanguageIcon/>
                                        </Box>
                                        <Box sx={{flex: 1}}>
                                            <Typography variant="caption" color="text.secondary" fontWeight="600"
                                                        sx={{textTransform: 'uppercase', letterSpacing: 0.5}}>
                                                Default Currency
                                            </Typography>
                                            {isEditingCurrency ? (
                                                <Box sx={{display: 'flex', gap: 1, mt: 0.5}}>
                                                    <FormControl fullWidth size="small">
                                                        <Select
                                                            value={newCurrency}
                                                            onChange={(e) => setNewCurrency(e.target.value)}
                                                            sx={{borderRadius: 1.5}}
                                                        >
                                                            {CURRENCIES.map((currency) => (
                                                                <MenuItem key={currency} value={currency}>
                                                                    {CURRENCY_SYMBOLS[currency]} {currency}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>
                                                    <IconButton
                                                        onClick={handleSaveCurrency}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: 'primary.main',
                                                            color: 'white',
                                                            '&:hover': {bgcolor: 'primary.dark'}
                                                        }}
                                                    >
                                                        <SaveIcon fontSize="small"/>
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                            setIsEditingCurrency(false);
                                                            setNewCurrency(user?.default_currency || 'USD');
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small"/>
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <Typography variant="body1" fontWeight="600" sx={{mt: 0.5}}>
                                                    {CURRENCY_SYMBOLS[user?.default_currency || 'USD']} {user?.default_currency || 'USD'}
                                                </Typography>
                                            )}
                                        </Box>
                                    </Box>
                                    {!isEditingCurrency && (
                                        <IconButton
                                            onClick={() => setIsEditingCurrency(true)}
                                            sx={{
                                                bgcolor: 'white',
                                                boxShadow: 1,
                                                '&:hover': {bgcolor: 'primary.main', color: 'white'}
                                            }}
                                        >
                                            <EditIcon fontSize="small"/>
                                        </IconButton>
                                    )}
                                </Box>

                                {/* Support Button */}
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    size="large"
                                    startIcon={<HelpIcon/>}
                                    onClick={() => setIsSupportModalOpen(true)}
                                    sx={{
                                        p: 2.5,
                                        textTransform: 'none',
                                        fontWeight: '600',
                                        borderRadius: 2,
                                        borderWidth: 2,
                                        fontSize: '1rem',
                                        justifyContent: 'flex-start',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            borderWidth: 2,
                                            transform: 'translateX(4px)',
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            borderColor: 'primary.main'
                                        }
                                    }}
                                >
                                    Need help? Contact Support
                                </Button>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Support Modal */}
            <Dialog
                open={isSupportModalOpen}
                onClose={() => setIsSupportModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {borderRadius: 3}
                }}
            >
                <DialogTitle>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
                        <Box sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <HelpIcon/>
                        </Box>
                        <Typography variant="h6" fontWeight="bold">
                            Contact Support
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{mt: 1}}>
                        <Typography variant="body1" color="text.secondary">
                            Need help? Our support team is here to assist you!
                        </Typography>

                        <Paper sx={{p: 3, bgcolor: '#f8f9fa', borderRadius: 2}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Email Support
                            </Typography>
                            <Typography variant="h6" fontWeight="500">
                                homiakfinance@gmail.com
                            </Typography>
                        </Paper>

                        <Paper sx={{p: 3, bgcolor: '#f8f9fa', borderRadius: 2}}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Response Time
                            </Typography>
                            <Typography variant="body1" fontWeight="500">
                                Within 24 hours
                            </Typography>
                        </Paper>

                        <Alert severity="info" sx={{borderRadius: 2}}>
                            Please include your username <strong>({user?.username})</strong> when contacting support.
                        </Alert>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{p: 3, pt: 0}}>
                    <Button
                        onClick={() => setIsSupportModalOpen(false)}
                        variant="outlined"
                        sx={{borderRadius: 2}}
                    >
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        href={`mailto:homiakfinance@gmail.com?subject=Support Request - ${user?.username}`}
                        onClick={() => setIsSupportModalOpen(false)}
                        sx={{borderRadius: 2}}
                    >
                        Send Email
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Profile;