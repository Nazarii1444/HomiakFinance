import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../../store/hooks.ts";
import {logout} from "../../../store/slices/authSlice.ts";

interface AuthGuardProps {
  children: React.ReactNode;
}

// Fixed token expiry check
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds and floor it

    console.log('Token expiry check:', {
      currentTime,
      exp: payload.exp,
      difference: payload.exp - currentTime,
      isExpired: payload.exp < currentTime
    });

    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true; // If we can't parse the token, consider it expired
  }
};

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is authenticated and has a valid token
    if (!isAuthenticated || !accessToken) {
      if (!location.pathname.includes('/login') && !location.pathname.includes('/register')) {
        navigate('/login', { replace: true });
      }
      return;
    }

    // Check if token is expired
    if (isTokenExpired(accessToken)) {
      console.log('Token expired, logging out...');
      dispatch(logout());
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, accessToken, navigate, location.pathname, dispatch]);

  // If not authenticated or token is expired, don't render children
  if (!isAuthenticated || !accessToken || isTokenExpired(accessToken)) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;