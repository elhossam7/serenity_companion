import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const LegalFooter = () => {
  const location = useLocation();
  const { t } = useTranslation();
  // Hide the footer on app's authenticated sections to avoid overlaying core UI
  const path = location?.pathname || '';
  const isProtectedPath = [
    '/ai-powered-journaling',
    '/mood-tracking-dashboard',
    '/dashboard-home',
    '/resources',
    '/profile',
    '/settings',
    '/ai-chat-support',
    '/', // home routes inside ProtectedRoute
  ].some((p) => (p === '/' ? path === '/' : path.startsWith(p)));

  if (isProtectedPath) return null;
  return (
    <footer className="hidden md:block border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <span>© {new Date().getFullYear()} {t('common.appName')}</span>
        <nav className="flex items-center gap-4">
          <Link className="hover:text-foreground" to="/privacy">{t('legal.privacy')}</Link>
          <Link className="hover:text-foreground" to="/terms">{t('legal.terms')}</Link>
          <Link className="hover:text-foreground" to="/disclaimers">{t('legal.disclaimers')}</Link>
        </nav>
      </div>
    </footer>
  );
};

export default LegalFooter;
