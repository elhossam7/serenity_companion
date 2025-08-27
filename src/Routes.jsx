import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, useLocation, useNavigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import ProtectedRoute from './components/ProtectedRoute';
import LegalFooter from 'components/ui/LegalFooter';

// Route-level code splitting
const NotFound = lazy(() => import('pages/NotFound'));
const UserLogin = lazy(() => import('./pages/user-login'));
const MoodTrackingDashboard = lazy(() => import('./pages/mood-tracking-dashboard'));
const UserRegistration = lazy(() => import('./pages/user-registration'));
const AiPoweredJournaling = lazy(() => import('./pages/ai-powered-journaling'));
const ResetPasswordPage = lazy(() => import('./pages/reset-password'));
const AuthCallback = lazy(() => import('./pages/auth/callback'));
const DashboardHome = lazy(() => import('./pages/dashboard-home'));
const ProfilePage = lazy(() => import('./pages/profile'));
const SettingsPage = lazy(() => import('./pages/settings'));
const PolicyPrivacy = lazy(() => import('pages/legal/PolicyPrivacy'));
const TermsOfService = lazy(() => import('pages/legal/TermsOfService'));
const Disclaimers = lazy(() => import('pages/legal/Disclaimers'));

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
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>}>
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
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
    </RouterRoutes>
    </Suspense>
  <LegalFooter />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
