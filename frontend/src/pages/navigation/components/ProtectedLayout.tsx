// pages/navigation/components/ProtectedLayout.tsx
import React from 'react';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import AuthGuard from "../../auth/components/AuthGuard.tsx";

const ProtectedLayout: React.FC = () => {
  return (
    <AuthGuard>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          <Outlet />
        </Box>
        <Navigation />
      </Box>
    </AuthGuard>
  );
};

export default ProtectedLayout;