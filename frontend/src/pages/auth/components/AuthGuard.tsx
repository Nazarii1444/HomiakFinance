import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {useAppDispatch, useAppSelector} from "../../../store/hooks.ts";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (!location.pathname.includes('/login') && !location.pathname.includes('/register')) {
        navigate('/login', { replace: true });
      }
      return;
    }
  }, [isAuthenticated, accessToken, navigate, location.pathname, dispatch]);

  if (!isAuthenticated || !accessToken) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;