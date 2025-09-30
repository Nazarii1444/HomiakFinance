import type {AuthFormData} from "../types/types.ts";

export const validateField = (field: keyof AuthFormData, value: string, isLoginMode: boolean = true) => {
  let error = '';

  if (!value.trim()) {
    error = 'This field is required';
  } else if (field === 'login') {
    // Always validate as email for login field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      error = 'Please enter a valid email address';
    }
  } else if (field === 'username' && !isLoginMode) {
    // Username validation only in register mode
    if (value.length < 3) {
      error = 'Username must be at least 3 characters';
    } else if (value.length > 20) {
      error = 'Username must be less than 20 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      error = 'Username can only contain letters, numbers, and underscores';
    }
  } else if (field === 'password') {
    if (value.length < 8) {
      error = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(value)) {
      error = 'Password must contain at least one uppercase letter';
    } else if (!/\d/.test(value)) {
      error = 'Password must contain at least one number';
    }
  }

  return error;
};