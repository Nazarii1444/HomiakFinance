import React, { useState } from 'react';
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import '../styles/Login.scss';
import {Link} from "react-router-dom";
import type {LoginFormData} from "../types/types.ts";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      console.log('Login attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-container">
      <Card className="login-card">
        <Box className="login-header">
          <Typography variant="h4" component="h1" className="login-title">
            Sign In
          </Typography>
          <Typography variant="body2" className="login-subtitle">
            Enter your credentials to continue
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Login"
            variant="outlined"
            value={formData.login}
            onChange={handleInputChange('login')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            value={formData.password}
            onChange={handleInputChange('password')}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Box className="login-navigation">
            <Typography variant="body2" className="login-nav-text">
              Don't have an account?{' '}
              <Link to="/register" className="login-nav-link">
                Sign up
              </Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Login;