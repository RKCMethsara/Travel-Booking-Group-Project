import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const admin = authService.isAdmin();
      
      setIsAuthenticated(authenticated);
      setIsAdmin(admin);
      setLoading(false);
    };

    checkAuth();

    // Subscribe to auth state changes
    const unsubscribe = authService.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        🔐 Checking authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    // Logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  // Authenticated (and admin if required)
  return children;
};

export default ProtectedRoute;
