// pages/Register.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

import type { AuthFormData } from '../types/types';
import {useAppDispatch, useAppSelector} from "../../../store/hooks.ts";
import {clearError, registerUser} from "../../../store/slices/authSlice.ts";

const Register: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (formData: AuthFormData) => {
    if (!formData.username) {
      console.error('Username is required for registration');
      return;
    }

    const registerData = {
      email: formData.login,
      username: formData.username,
      password: formData.password,
    };

    try {
      await dispatch(registerUser(registerData)).unwrap();
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <AuthForm
      onSubmit={handleSubmit}
      isLogin={false}
      loading={loading}
      error={error}
    />
  );
};

export default Register;