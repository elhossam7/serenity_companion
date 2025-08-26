import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import Routes from './Routes';
import './styles/index.css';
import { I18nProvider } from './contexts/I18nContext';
import ConsentGate from './components/ConsentGate';

function App() {
  React.useEffect(() => {
    // Lightweight local reminder mechanism; no server push.
    let intervalId;
    try {
      intervalId = setInterval(() => {
        const enabled = localStorage.getItem('sc:reminders:enabled') === '1';
        if (!enabled) return;
        if (typeof Notification === 'undefined') return;
        if (Notification.permission !== 'granted') return;
        // Low frequency gentle nudge roughly every ~4 hours (randomized)
        const now = Date.now();
        const last = parseInt(localStorage.getItem('sc:reminders:last') || '0', 10);
        const fourHours = 4 * 60 * 60 * 1000;
        const jitter = Math.floor(Math.random() * 30 * 60 * 1000); // up to 30m jitter
        if (now - last > (fourHours + jitter)) {
          new Notification('Serenity Companion', { body: 'How are you feeling? Log a quick mood check-in.' });
          localStorage.setItem('sc:reminders:last', String(now));
        }
      }, 60 * 1000); // check every minute
    } catch (_) {}
    return () => { if (intervalId) clearInterval(intervalId); };
  }, []);
  return (
    <I18nProvider>
      <AuthProvider>
  <ConsentGate />
  <Routes />
      </AuthProvider>
    </I18nProvider>
  );
}

export default App;