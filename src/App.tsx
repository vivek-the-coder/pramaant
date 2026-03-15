import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import DeviceGuard from './components/DeviceGuard';
import DashboardPage from './pages/DashboardPage';
import BindingLogsPage from './components/BindingLogs/BindingLogsTable';
import CitizenSearchPage from './pages/CitizenSearchPage';
import HelpDeskPage from './pages/HelpDeskPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';
import OfficerLayout from './components/Layout/OfficerLayout';
import OfficerDashboardPage from './pages/OfficerDashboardPage';
import QrLogsPage from './pages/OfficerDashboard/QrLogsPage';
import EscalationCenterPage from './pages/OfficerDashboard/EscalationCenterPage';
import MyDecisionsPage from './pages/OfficerDashboard/MyDecisionsPage';
import PerformanceDashboardPage from './pages/OfficerDashboard/PerformanceDashboardPage';
import OfficerHelpDeskPage from './pages/OfficerDashboard/OfficerHelpDeskPage';
import OfficerSettingsPage from './pages/OfficerDashboard/OfficerSettingsPage';
import AdminLayout from './components/Layout/AdminLayout';
import StateAnalyticsPage from './pages/AdminDashboard/StateAnalyticsPage';

// Placeholder Components for new Officer routes
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white rounded-xl shadow-sm border border-slate-200">
    <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-4">
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-slate-800 mb-2">{title}</h2>
    <p className="text-slate-500 max-w-md">This module is currently under development. It will provide dedicated functionality for {title.toLowerCase()}.</p>
  </div>
);


const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FE] font-sans selection:bg-primary selection:text-white">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <Header />
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to their correct dashboard
    if (user.role === 'officer') return <Navigate to="/officer/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
    <DeviceGuard>
      <Router>
        <Routes>
          {/* Default Route: Redirect to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route path="/*" element={
            <ProtectedRoute allowedRoles={['clerk']}>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/logs" element={<BindingLogsPage />} />
                <Route path="/search" element={<CitizenSearchPage />} />
                <Route path="/help" element={<HelpDeskPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Layout>
            </ProtectedRoute>
          } />

          {/* Officer Routes */}
          <Route path="/officer/*" element={
            <ProtectedRoute allowedRoles={['officer']}>
            <OfficerLayout>
              <Routes>
                <Route path="/dashboard" element={<OfficerDashboardPage />} />
                <Route path="/decisions" element={<MyDecisionsPage />} />
                <Route path="/escalations" element={<EscalationCenterPage />} />
                <Route path="/qr-logs" element={<QrLogsPage />} />
                <Route path="/performance" element={<PerformanceDashboardPage />} />
                <Route path="/help" element={<OfficerHelpDeskPage />} />
                <Route path="/settings" element={<OfficerSettingsPage />} />
                <Route path="*" element={<Navigate to="/officer/dashboard" replace />} />
              </Routes>
            </OfficerLayout>
            </ProtectedRoute>
          } />
          {/* Admin Routes */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/analytics" element={<StateAnalyticsPage />} />

                {/* Placeholders for other admin pages */}
                <Route path="/departments" element={<PlaceholderPage title="Department View" />} />
                <Route path="/officers" element={<PlaceholderPage title="Officer Performance Tracking" />} />
                <Route path="/alerts" element={<PlaceholderPage title="System Alerts & Logs" />} />
                <Route path="/reports" element={<PlaceholderPage title="SLA & Export Reports" />} />
                <Route path="/settings" element={<PlaceholderPage title="Global Configuration" />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/admin/analytics" replace />} />
              </Routes>
            </AdminLayout>
          } />
        </Routes>
      </Router>
    </DeviceGuard>
    </AuthProvider>
  );
};

export default App;
