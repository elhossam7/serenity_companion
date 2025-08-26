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
import SettingsPage from './pages/settings';
import PolicyPrivacy from 'pages/legal/PolicyPrivacy';
import TermsOfService from 'pages/legal/TermsOfService';
import Disclaimers from 'pages/legal/Disclaimers';
import LegalFooter from 'components/ui/LegalFooter';

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
  <Route path="/privacy" element={<PolicyPrivacy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/disclaimers" element={<Disclaimers />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/" element={<AiPoweredJournaling />} />
          <Route path="/ai-powered-journaling" element={<AiPoweredJournaling />} />
          <Route path="/mood-tracking-dashboard" element={<MoodTrackingDashboard />} />
          <Route path="/dashboard-home" element={<DashboardHome />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
  <LegalFooter />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
