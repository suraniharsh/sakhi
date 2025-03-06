import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CyclePage } from './pages/CyclePage';
import { SymptomTrackingPage } from './pages/SymptomTrackingPage';
import { RemindersPage } from './pages/RemindersPage';
import { PregnancyPage } from './pages/PregnancyPage';
import { HealthInsightsPage } from './pages/HealthInsightsPage';
import { Sidebar } from './components/navigation/Sidebar';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { PredictionsPage } from './pages/PredictionsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SafetyResourcesPage } from './pages/SafetyResourcesPage';
import { useAuth } from './hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import { logEnvironmentVariables } from './utils/envTest';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSpinner size={40} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {children}
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  useEffect(() => {
    // Log environment variables when the app starts
    logEnvironmentVariables();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycle"
            element={
              <ProtectedRoute>
                <CyclePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptoms"
            element={
              <ProtectedRoute>
                <SymptomTrackingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <RemindersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pregnancy"
            element={
              <ProtectedRoute>
                <PregnancyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <HealthInsightsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/predictions"
            element={
              <ProtectedRoute>
                <PredictionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Safety Resources Routes */}
          <Route
            path="/safety"
            element={
              <ProtectedRoute>
                <SafetyResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safety/contacts"
            element={
              <ProtectedRoute>
                <SafetyResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safety/alert"
            element={
              <ProtectedRoute>
                <SafetyResourcesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/safety/report"
            element={
              <ProtectedRoute>
                <SafetyResourcesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route - redirect to auth if not logged in */}
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};
