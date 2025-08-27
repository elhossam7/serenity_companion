import React, { useEffect, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Button from '../../components/ui/Button';
import { loadAnalytics } from '../../utils/analytics';
import { updateAuthPreferences } from '../../services/userProfileService';
import { useI18n } from '../../contexts/I18nContext';
import { useTranslation } from 'react-i18next';

const hasNotificationSupport = () => 'Notification' in window;

const SettingsPage = () => {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const [enabled, setEnabled] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem('language') || 'fr' } catch { return 'fr' }
  });
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('theme') || 'system' } catch { return 'system' }
  });
  const i18nCtx = useI18n();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('sc:reminders:enabled');
      setEnabled(saved === '1');
  const a = localStorage.getItem('sc:analytics:enabled');
  setAnalyticsOptIn(a === '1');
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
  // store preference in metadata
  updateAuthPreferences({ reminders_enabled: on }).catch(() => {})
  };

  const sendTest = () => {
    if (!hasNotificationSupport() || Notification.permission !== 'granted') return;
    new Notification('Serenity Companion', { body: 'Reminder test: take a mindful moment 💙' });
  };

  const toggleAnalytics = (on) => {
    setAnalyticsOptIn(on);
    try { localStorage.setItem('sc:analytics:enabled', on ? '1' : '0'); } catch (_) {}
    if (on) loadAnalytics();
    updateAuthPreferences({ analytics_opt_in: on }).catch(() => {})
  };

  const persistLang = async (lng) => {
    setLanguage(lng);
    try { localStorage.setItem('language', lng) } catch {}
    i18nCtx?.setLanguage?.(lng)
    await updateAuthPreferences({ language: lng }).catch(() => {})
  }

  const persistTheme = async (val) => {
    setTheme(val);
    try { localStorage.setItem('theme', val) } catch {}
    document.documentElement?.setAttribute('data-theme', val)
    await updateAuthPreferences({ theme: val }).catch(() => {})
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-16 md:pb-0 max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-heading font-semibold text-foreground mb-4">{t('settings.title')}</h1>
        <section className="bg-card border border-border rounded-xl p-4 space-y-3">
          <h2 className="text-lg font-semibold">{t('settings.reminders')}</h2>
          <p className="text-sm text-muted-foreground">Enable local notifications for gentle mood logging reminders.</p>
          <div className="flex items-center gap-2">
            <Button variant="primary" onClick={requestPermission} disabled={!hasNotificationSupport() || permission === 'granted'}>
              {permission === 'granted' ? t('settings.notificationsEnabled') : t('settings.enableNotifications')}
            </Button>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={enabled} onChange={e => toggleEnabled(e.target.checked)} disabled={permission !== 'granted'} />
              {t('settings.optInReminders')}
            </label>
            <Button variant="ghost" onClick={sendTest} disabled={permission !== 'granted'}>{t('settings.sendTest')}</Button>
          </div>
          <p className="text-xs text-muted-foreground">Privacy: Reminders are local to your device; no identifiers are sent to servers.</p>
        </section>

        <section className="bg-card border border-border rounded-xl p-4 space-y-3 mt-6">
          <h2 className="text-lg font-semibold">{t('settings.analytics')}</h2>
          <p className="text-sm text-muted-foreground">{t('settings.analyticsDesc')}</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={analyticsOptIn} onChange={e => toggleAnalytics(e.target.checked)} />
            {t('settings.analyticsOptIn')}
          </label>
          <p className="text-xs text-muted-foreground">We do not collect PII. You can opt out anytime.</p>
        </section>

        <section className="bg-card border border-border rounded-xl p-4 space-y-3 mt-6">
          <h2 className="text-lg font-semibold">{t('settings.display')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="language-select" className="block text-sm font-medium mb-1">{t('profile.language')}</label>
              <select id="language-select" className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={language} onChange={e => persistLang(e.target.value)}>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label htmlFor="theme-select" className="block text-sm font-medium mb-1">{t('profile.theme')}</label>
              <select id="theme-select" className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={theme} onChange={e => persistTheme(e.target.value)}>
                <option value="system">{t('settings.system')}</option>
                <option value="light">{t('settings.light')}</option>
                <option value="dark">{t('settings.dark')}</option>
              </select>
            </div>
          </div>
        </section>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;
