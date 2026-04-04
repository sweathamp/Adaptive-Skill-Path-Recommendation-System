import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';

import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SkillPaths from './pages/SkillPaths';
import Quiz from './pages/Quiz';
import Resources from './pages/Resources';
import AdminPanel from './pages/AdminPanel';
import Layout from './components/Layout';

const PrivateRoute = ({ children, adminRequired }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div><p style={{color:'var(--text2)'}}>Loading...</p></div>;
  if (!user) return <Navigate to="/login" />;
  if (adminRequired && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-page"><div className="spinner"></div></div>;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/skills" element={<SkillPaths />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/resources" element={<Resources />} />
          </Route>
          <Route path="/admin" element={<PrivateRoute adminRequired><Layout /></PrivateRoute>}>
            <Route index element={<AdminPanel />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
