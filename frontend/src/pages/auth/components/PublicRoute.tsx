// components/PublicRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import {useAppSelector} from "../../../store/hooks.ts";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { isAuthenticated, accessToken } = useAppSelector((state) => state.auth);

  // If authenticated, redirect to dashboard
  if (isAuthenticated && accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;