import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { ChatPage } from './pages/Chat';
import { FocusPage } from './pages/Focus';
import { TasksPage } from './pages/Tasks';
import { CheckInsPage } from './pages/CheckIns';
import { SettingsPage } from './pages/Settings';
import { CounselorDashboard } from './pages/Counselor';
import { CounselorStudentsPage } from './pages/CounselorStudents';
import { Layout } from './components/Layout';

const ProtectedRoute: React.FC<{ children: React.ReactNode; counselorOnly?: boolean }> = ({
  children,
  counselorOnly = false,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ti-primary-600 mx-auto mb-4" />
          <p className="text-ti-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (counselorOnly && user.role !== 'counselor' && user.role !== 'admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/app/dashboard" replace />} />

      {/* Protected student routes */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="focus" element={<FocusPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="checkins" element={<CheckInsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Protected counselor routes */}
      <Route
        path="/counselor"
        element={
          <ProtectedRoute counselorOnly>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CounselorDashboard />} />
        <Route path="students" element={<CounselorStudentsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--ti-surface)',
                color: 'var(--ti-text-primary)',
                border: '1px solid var(--ti-border)',
              },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
