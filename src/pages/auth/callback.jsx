import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const hash = url.hash || '';
    const search = url.search || '';
    const searchParams = new URLSearchParams(url.search);
    const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

    // If Supabase returned an error (e.g., otp_expired), route to login with a hint
    const error = searchParams.get('error') || hashParams.get('error');
    const errorCode = searchParams.get('error_code') || hashParams.get('error_code');
    if (error || errorCode) {
      const code = (errorCode || error || '').toLowerCase();
      const tag = code.includes('expired') ? 'expired' : 'invalid';
      navigate(`/user-login?reset=${tag}`, { replace: true });
      return;
    }

    // Check for recovery type in the URL hash
    const isRecovery = hash.includes('type=recovery') || searchParams.get('type') === 'recovery' || searchParams.get('flow') === 'recovery';
    if (isRecovery) {
      // This is a password recovery flow.
      try {
        // Set a flag so the reset page can show a confirmation banner.
        window.sessionStorage.setItem('isPasswordRecovery', '1');
      } catch (e) {
        console.error('Session storage is unavailable:', e);
      }
      // Redirect to the reset password page, preserving the tokens in the hash
      // so Supabase can use them to update the user.
      navigate(`/reset-password${hash}`, { replace: true });
    } else {
      // This is a standard login/signup confirmation.
      // Redirect to the main dashboard.
      navigate('/dashboard-home', { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Processing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
