import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Avoid potential loops by providing a stable state payload
    const fromPath = location?.pathname || '/';
    // If somehow mounted on public routes, don't re-navigate continuously
    if (fromPath === '/user-login' || fromPath === '/user-registration') {
      return <Navigate to="/user-login" replace />;
    }
    return (
      <Navigate
        to="/user-login"
        state={{ from: { pathname: fromPath } }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
