import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LegalFooter = () => {
  const location = useLocation();
  const isAuth = location?.pathname === '/user-login' || location?.pathname === '/user-registration';
  return (
    <footer className="hidden md:block border-t border-border bg-background/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-xs text-muted-foreground flex items-center justify-between">
        <span>© {new Date().getFullYear()} Serenity Companion</span>
        <nav className="flex items-center gap-4">
          <Link className="hover:text-foreground" to="/privacy">Privacy</Link>
          <Link className="hover:text-foreground" to="/terms">Terms</Link>
          <Link className="hover:text-foreground" to="/disclaimers">Disclaimers</Link>
        </nav>
      </div>
    </footer>
  );
};

export default LegalFooter;
