// components/AuthForm.tsx
import React, {useState} from 'react';
import {
    Box,
    Card,
    TextField,
    Button,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
} from '@mui/material';
import {
    Person as PersonIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    Email as EmailIcon,
} from '@mui/icons-material';
import {Link} from 'react-router-dom';
import type {AuthFormData} from '../types/types';
import {validateField} from '../utils/utils';
import '../styles/Login.scss';
import '../styles/Register.scss';

interface AuthFormProps {
    onSubmit: (formData: AuthFormData) => Promise<void>;
    isLogin?: boolean;
    loading?: boolean;
    error?: string | null;
}

const AuthForm: React.FC<AuthFormProps> = ({
                                               onSubmit,
                                               isLogin = true,
                                               loading = false,
                                               error
                                           }) => {
    const [formData, setFormData] = useState<AuthFormData>({
        login: '',
        password: '',
        username: isLogin ? undefined : '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({
        login: '',
        password: '',
        username: ''
    });

    const handleInputChange = (field: keyof AuthFormData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const value = event.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Validate field with isLoginMode parameter
        const fieldError = validateField(field, value, isLogin);
        setErrors(prev => ({...prev, [field]: fieldError}));
    };


    const handleTogglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validate all fields
        const loginError = validateField('login', formData.login, isLogin);
        const passwordError = validateField('password', formData.password, isLogin);
        let usernameError = '';

        if (!isLogin && formData.username !== undefined) {
            usernameError = validateField('username', formData.username, isLogin);
        }

        setErrors({
            login: loginError,
            password: passwordError,
            username: usernameError
        });

        const hasErrors = loginError || passwordError || (!isLogin && usernameError);
        const hasEmptyFields = !formData.login.trim() || !formData.password.trim() ||
            (!isLogin && !formData.username?.trim());

        if (!hasErrors && !hasEmptyFields) {
            try {
                await onSubmit(formData);
            } catch (error) {
                console.error(`${isLogin ? 'Login' : 'Register'} error:`, error);
            }
        }
    };

    const isFormValid = !errors.login && !errors.password &&
        (!isLogin ? !errors.username : true) &&
        formData.login.trim() && formData.password.trim() &&
        (isLogin || formData.username?.trim());

    return (
        <Box className={isLogin ? 'login-container' : 'register-container'}>
            <Card className={isLogin ? 'login-card' : 'register-card'}>
                <Box className={isLogin ? 'login-header' : 'register-header'}>
                    <Typography
                        variant="h4"
                        component="h1"
                        className={isLogin ? 'login-title' : 'register-title'}
                    >
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Typography>
                    <Typography
                        variant="body2"
                        className={isLogin ? 'login-subtitle' : 'register-subtitle'}
                    >
                        {isLogin ? 'Enter your credentials to continue' : 'Create your account to get started'}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{mb: 2}}>
                        {error}
                    </Alert>
                )}

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    className={isLogin ? 'login-form' : 'register-form'}
                >
                    <TextField
                        fullWidth
                        label="Email"
                        variant="outlined"
                        type="email"
                        value={formData.login}
                        onChange={handleInputChange('login')}
                        required
                        error={!!errors.login}
                        helperText={errors.login}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailIcon/>
                                </InputAdornment>
                            ),
                        }}
                    />

                    {!isLogin && (
                        <TextField
                            fullWidth
                            label="Username"
                            variant="outlined"
                            value={formData.username || ''}
                            onChange={handleInputChange('username')}
                            required
                            error={!!errors.username}
                            helperText={errors.username || 'Choose a unique username'}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PersonIcon/>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        variant="outlined"
                        value={formData.password}
                        onChange={handleInputChange('password')}
                        required
                        error={!!errors.password}
                        helperText={errors.password || 'Min 8 chars, 1 uppercase, 1 number'}
                        disabled={loading}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon/>
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                        disabled={loading}
                                    >
                                        {showPassword ? <VisibilityOff/> : <Visibility/>}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={loading || !isFormValid}
                        className={isLogin ? 'login-button' : 'register-button'}
                    >
                        {loading ? `${isLogin ? 'Signing In...' : 'Creating Account...'}` : isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>

                    <Box className={isLogin ? 'login-navigation' : 'register-navigation'}>
                        <Typography
                            variant="body2"
                            className={isLogin ? 'login-nav-text' : 'register-nav-text'}
                        >
                            {isLogin
                                ? "Don't have an account? "
                                : 'Already have an account? '}
                            <Link
                                to={isLogin ? '/register' : '/login'}
                                className={isLogin ? 'login-nav-link' : 'register-nav-link'}
                            >
                                {isLogin ? 'Sign up' : 'Sign in'}
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
};

export default AuthForm;