import React, { useEffect, useContext, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthContext, AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import OfflineIndicator from './components/common/OfflineIndicator';

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));
const OAuth2CallbackPage = lazy(() => import('./pages/OAuth2CallbackPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const DevicesPage = lazy(() => import('./pages/DevicesPage'));
const EnergyMonitoringPage = lazy(() => import('./pages/EnergyMonitoringPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const TechnicianDashboardPage = lazy(() => import('./pages/TechnicianDashboardPage'));

// Lazy load MainLayout too to isolate its render tree
const MainLayout = lazy(() => import('./components/layouts/MainLayout'));

function ProtectedRoute({ children, allowedRoles = [] }) {
  const auth = useContext(AuthContext);
  
  // If not authenticated, redirect to login
  if (!auth || !auth.isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Check if user's email is verified
  // If user exists but email is not verified, redirect to verification page
  if (auth.user && auth.user.emailVerified === false) {
    return <Navigate to="/verify-email" state={{ email: auth.user.email }} />;
  }
  
  // If roles are specified, check if user has required role
  if (allowedRoles.length > 0 && auth.user) {
    const userRole = auth.user.role || auth.user.roles?.[0] || 'USER';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/app/dashboard" />;
    }
  }
  
  return children;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const auth = useContext(AuthContext);

  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
  }, []);

  // Show loading while auth initializes
  if (!auth || auth.loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <HomePage />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <LoginPage />
            </Suspense>
          }
        />
        <Route
          path="/oauth2/callback"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <OAuth2CallbackPage />
            </Suspense>
          }
        />
        <Route
          path="/verify-email"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <VerifyEmailPage />
            </Suspense>
          }
        />

        {/* Protected routes */}
        <Route
          path="/app/*"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <ProtectedRoute>
                <MainLayout>
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/dashboard" element={<DashboardPage />} />
                      <Route path="/devices" element={<DevicesPage />} />
                      <Route path="/energy" element={<EnergyMonitoringPage />} />
                      <Route path="/alerts" element={<AlertsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/technician" element={<TechnicianDashboardPage />} />
                      <Route path="/" element={<Navigate to="/app/dashboard" />} />
                    </Routes>
                  </Suspense>
                </MainLayout>
              </ProtectedRoute>
            </Suspense>
          }
        />

        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" />} />
        <Route path="/devices" element={<Navigate to="/app/devices" />} />
        <Route path="/energy" element={<Navigate to="/app/energy" />} />
        <Route path="/alerts" element={<Navigate to="/app/alerts" />} />
        <Route path="/reports" element={<Navigate to="/app/reports" />} />
        <Route path="/settings" element={<Navigate to="/app/settings" />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
        <OfflineIndicator />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #333)',
              color: 'var(--toast-color, #fff)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
