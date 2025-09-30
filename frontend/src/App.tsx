// App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import Login from './pages/auth/components/Login';
import Register from './pages/auth/components/Registration';
import ProtectedLayout from './pages/navigation/components/ProtectedLayout';
import Dashboard from './pages/dashboard/components/Dashboard';
import Goals from './pages/goals/components/Goals';
import { CircularProgress, Box } from '@mui/material';
import PublicRoute from "./pages/auth/components/PublicRoute.tsx";
import Profile from "./pages/profile/components/Profile.tsx";

const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<Loading />} persistor={persistor}>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/charts" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/profile" element={<Profile />} />
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;