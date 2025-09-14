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
import '../styles/Register.scss';
import {Link} from "react-router-dom";
import type {RegisterFormData} from "../types/types.ts";

const Register: React.FC = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    login: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof RegisterFormData) => (
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
      console.log('Register attempt:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Registration successful!');
    } catch (error) {
      console.error('Register error:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box className="register-container">
      <Card className="register-card">
        <Box className="register-header">
          <Typography variant="h4" component="h1" className="register-title">
            Sign Up
          </Typography>
          <Typography variant="body2" className="register-subtitle">
            Create your account to get started
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} className="register-form">
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
            className="register-button"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <Box className="register-navigation">
            <Typography variant="body2" className="register-nav-text">
              Already have an account?{' '}
              <Link to="/login" className="register-nav-link">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default Register;