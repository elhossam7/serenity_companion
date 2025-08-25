import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useLocation, useNavigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from './components/ProtectedRoute';
import UserLogin from './pages/user-login';
import MoodTrackingDashboard from './pages/mood-tracking-dashboard';
import UserRegistration from './pages/user-registration';
import AiPoweredJournaling from './pages/ai-powered-journaling';
import ResetPasswordPage from './pages/reset-password';
import AuthCallback from './pages/auth/callback';
import DashboardHome from './pages/dashboard-home';

const Routes = () => {
  const RecoveryRedirect = () => {
    const location = useLocation()
    const navigate = useNavigate()
    React.useEffect(() => {
      try {
        const url = new URL(window.location.href)
        const hashHasRecovery = url.hash?.includes('type=recovery')
        const searchHasRecovery = url.searchParams?.get('type') === 'recovery'
        if ((hashHasRecovery || searchHasRecovery) && location.pathname !== '/reset-password') {
          try { window.sessionStorage?.setItem('isPasswordRecovery', '1') } catch (_) {}
          navigate('/reset-password' + (url.search || '') + (url.hash || ''), { replace: true })
        }
      } catch (_) {}
    }, [location, navigate])
    return null
  }
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <RecoveryRedirect />
      <ScrollToTop />
      <RouterRoutes>
    {/* Public routes */}
        <Route path="/user-login" element={<UserLogin />} />
  <Route path="/user-registration" element={<UserRegistration />} />
  <Route path="/reset-password" element={<ResetPasswordPage />} />
  <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/" element={<AiPoweredJournaling />} />
          <Route path="/ai-powered-journaling" element={<AiPoweredJournaling />} />
          <Route path="/mood-tracking-dashboard" element={<MoodTrackingDashboard />} />
          <Route path="/dashboard-home" element={<DashboardHome />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
