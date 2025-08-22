import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from './components/ProtectedRoute';
import UserLogin from './pages/user-login';
import MoodTrackingDashboard from './pages/mood-tracking-dashboard';
import UserRegistration from './pages/user-registration';
import AiPoweredJournaling from './pages/ai-powered-journaling';
import DashboardHome from './pages/dashboard-home';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public routes */}
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/user-registration" element={<UserRegistration />} />

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
