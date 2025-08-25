import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If arriving from a recovery link, force navigation to the reset page.
  // Be strict to avoid false positives after normal login.
  try {
    const url = new URL(window.location.href);
    const hash = url.hash || '';
    const hasRecoveryToken = /type=recovery/.test(hash) && /(access_token|code|token_hash)=/.test(hash);
    const qsTypeRecovery = url.searchParams.get('type') === 'recovery';
    const flag = window.sessionStorage.getItem('isPasswordRecovery') === '1';
    const flagIsRelevant = flag && (location.pathname === '/auth/callback' || location.pathname === '/reset-password');
    const isRecovery = hasRecoveryToken || qsTypeRecovery || flagIsRelevant;
    if (isRecovery && location.pathname !== '/reset-password') {
      return <Navigate to={`/reset-password${url.search || ''}${url.hash || ''}`} replace />;
    }
  } catch (_) {}

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
