// pages/profile/components/Profile.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Divider,
  Stack,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { logout } from '../../../store/slices/authSlice';

const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  // Generate avatar from username first letter
  const getAvatarText = (username: string | undefined) => {
    return username ? username.charAt(0).toUpperCase() : '?';
  };

  // Generate a consistent color based on username
  const getAvatarColor = (username: string | undefined) => {
    if (!username) return '#9e9e9e';

    const colors = [
      '#f44336', '#e91e63', '#9c27b0', '#673ab7',
      '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4',
      '#009688', '#4caf50', '#8bc34a', '#cddc39',
      '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: 'calc(100vh - 100px)',
      p: 2
    }}>
      <Card sx={{
        maxWidth: 400,
        width: '100%',
        boxShadow: 3,
        borderRadius: 2
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Profile Header */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                mb: 2,
                bgcolor: getAvatarColor(user?.username),
                fontSize: '2rem',
                fontWeight: 'bold'
              }}
            >
              {getAvatarText(user?.username)}
            </Avatar>

            <Typography variant="h5" component="h1" fontWeight="bold" textAlign="center">
              Profile
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Manage your account information
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {/* User Information */}
          <Stack spacing={2.5}>
            {/* Username */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}>
                <PersonIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user?.username || 'Not available'}
                </Typography>
              </Box>
            </Box>

            {/* Email */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}>
                <EmailIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {user?.email || 'Not available'}
                </Typography>
              </Box>
            </Box>

            {/* User ID */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 1,
                bgcolor: 'action.hover'
              }}>
                <BadgeIcon color="primary" />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  User ID
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="medium"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}
                >
                  {user?.id || 'Not available'}
                </Typography>
              </Box>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          {/* Logout Button */}
          <Button
            variant="contained"
            color="error"
            fullWidth
            size="large"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem'
            }}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;