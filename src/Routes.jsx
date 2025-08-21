import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
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
        {/* Define your route here */}
        <Route path="/" element={<AiPoweredJournaling />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/mood-tracking-dashboard" element={<MoodTrackingDashboard />} />
        <Route path="/user-registration" element={<UserRegistration />} />
        <Route path="/ai-powered-journaling" element={<AiPoweredJournaling />} />
        <Route path="/dashboard-home" element={<DashboardHome />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
