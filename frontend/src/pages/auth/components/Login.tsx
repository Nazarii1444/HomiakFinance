// pages/Login.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import type { AuthFormData } from '../types/types';
import {useAppDispatch, useAppSelector} from "../../../store/hooks.ts";
import {clearError, loginUser} from "../../../store/slices/authSlice.ts";

const Login: React.FC = () => {
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
    const loginData = {
      email: formData.login,
      password: formData.password,
    };

    try {
      await dispatch(loginUser(loginData)).unwrap();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthForm
      onSubmit={handleSubmit}
      isLogin={true}
      loading={loading}
      error={error}
    />
  );
};

export default Login;