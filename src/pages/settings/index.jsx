import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Button from '../../components/ui/Button';

const hasNotificationSupport = () => 'Notification' in window;

const SettingsPage = () => {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sc:reminders:enabled');
      setEnabled(saved === '1');
    } catch (_) {}
  }, []);

  const requestPermission = async () => {
    if (!hasNotificationSupport()) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const toggleEnabled = (on) => {
    setEnabled(on);
    try { localStorage.setItem('sc:reminders:enabled', on ? '1' : '0'); } catch (_) {}
  };

  const sendTest = () => {
    if (!hasNotificationSupport() || Notification.permission !== 'granted') return;
    new Notification('Serenity Companion', { body: 'Reminder test: take a mindful moment 💙' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-16 md:pb-0 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">Settings</h1>
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">Reminders</h2>
          <p className="text-sm text-muted-foreground">Enable local notifications for gentle mood logging reminders.</p>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={requestPermission} disabled={!hasNotificationSupport() || permission === 'granted'}>
              {permission === 'granted' ? 'Notifications Enabled' : 'Enable Notifications'}
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={e => toggleEnabled(e.target.checked)} disabled={permission !== 'granted'} />
              Opt-in to periodic reminders
            </label>
            <Button variant="ghost" onClick={sendTest} disabled={permission !== 'granted'}>Send test</Button>
          </div>
          <p className="text-xs text-muted-foreground">Privacy: Reminders are local to your device; no identifiers are sent to servers.</p>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;
