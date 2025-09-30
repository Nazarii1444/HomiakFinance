import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { Article as TransactionsIcon, PieChart as ChartsIcon, AddCircle as AddIcon, Assessment as ReportsIcon, Person as ProfileIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import AddModal from '../../addTransaction/components/AddModal.tsx';

const PRIMARY_BLUE = '#2563eb';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const pathToIndex: Record<string, number> = {
    '/dashboard': 0,
    '/charts': 1,
    '/goals': 3,
    '/profile': 4,
  };

  const indexToPath: Record<number, string> = {
    0: '/dashboard',
    1: '/charts',
    3: '/goals',
    4: '/profile',
  };

  const value = pathToIndex[location.pathname] ?? 0;

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleNavigation = (_event: React.ChangeEvent<unknown>, newValue: number) => {
    if (newValue === 2) {
      handleAddClick();
      return;
    }
    const path = indexToPath[newValue];
    if (path) {
      navigate(path);
    }
  };

  const AddButtonIcon = (
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: '50%',
        backgroundColor: PRIMARY_BLUE,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: `0 2px 8px rgba(37, 99, 235, 0.3)`,
        transition: 'all 0.2s',
        '&:active': {
          transform: 'scale(0.95)',
          boxShadow: `0 1px 4px rgba(37, 99, 235, 0.5)`,
        },
      }}
    >
      <AddIcon sx={{ fontSize: 28 }} />
    </Box>
  );


  return (
    <>
      <BottomNavigation
        value={value}
        onChange={handleNavigation}
        showLabels
        sx={{
          position: 'fixed',
          bottom: 0,
          width: '100%',
          boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.08)',
          backgroundColor: '#fff',
          height: 60,
          zIndex: 1000,
        }}
      >
        <BottomNavigationAction
          label="Transactions"
          icon={<TransactionsIcon />}
          value={0}
          sx={{
            '&.Mui-selected': { color: PRIMARY_BLUE },
            '.MuiBottomNavigationAction-label': { fontSize: '0.7rem', marginTop: '2px' },
          }}
        />

        <BottomNavigationAction
          label="Charts"
          icon={<ChartsIcon />}
          value={1}
          sx={{
            '&.Mui-selected': { color: PRIMARY_BLUE },
            '.MuiBottomNavigationAction-label': { fontSize: '0.7rem', marginTop: '2px' },
          }}
        />

        <BottomNavigationAction
          label="Add"
          icon={AddButtonIcon}
          value={2}
          sx={{
            minWidth: '56px',
            '&.Mui-selected': { backgroundColor: 'transparent', color: 'initial' },
            '.MuiBottomNavigationAction-label': { fontSize: '0.7rem', marginTop: '2px' },
          }}
        />

        <BottomNavigationAction
          label="Goals"
          icon={<ReportsIcon />}
          value={3}
          sx={{
            '&.Mui-selected': { color: PRIMARY_BLUE },
            '.MuiBottomNavigationAction-label': { fontSize: '0.7rem', marginTop: '2px' },
          }}
        />

        <BottomNavigationAction
          label="Profile"
          icon={<ProfileIcon />}
          value={4}
          sx={{
            '&.Mui-selected': { color: PRIMARY_BLUE },
            '.MuiBottomNavigationAction-label': { fontSize: '0.7rem', marginTop: '2px' },
          }}
        />
      </BottomNavigation>
      <AddModal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
};

export default Navigation;
