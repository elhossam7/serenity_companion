import React, { useEffect, useMemo, useState } from 'react';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { updateAuthPreferences } from '../../services/userProfileService';
import { useI18n } from '../../contexts/I18nContext';
import { supabase } from '../../lib/supabase';
import { useTranslation } from 'react-i18next';

const emptyContact = () => ({ name: '', phone: '', relation: '' });

const ProfilePage = () => {
  const { user, userProfile, updateProfile } = useAuth();
  const { setLanguage } = useI18n?.() || { setLanguage: () => {} };
  const { t, i18n } = useTranslation();
  const [displayName, setDisplayName] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [contacts, setContacts] = useState([emptyContact()]);
  const [language, setLangLocal] = useState('fr');
  const [theme, setTheme] = useState('system');
  const [defaultPrivacy, setDefaultPrivacy] = useState('private');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userProfile) return;
    setDisplayName(userProfile.display_name || '');
    setFullName(userProfile.full_name || '');
    setPhone(userProfile.phone_number || '');
    // avatar/larger prefs may live in auth metadata
    try {
      const meta = (user || {}).user_metadata || {}
      setAvatarUrl(meta.avatar_url || '')
      const ec = Array.isArray(meta.emergency_contacts) ? meta.emergency_contacts : [];
      setContacts(ec.length ? ec : [emptyContact()]);
      setLangLocal(meta.language || userProfile.language || (localStorage.getItem('language') || 'fr'))
      setTheme(meta.theme || (localStorage.getItem('theme') || 'system'))
      setDefaultPrivacy(meta.default_journal_privacy || (localStorage.getItem('default_journal_privacy') || 'private'))
      setDateOfBirth(userProfile.date_of_birth || '')
      setTimezone(userProfile.timezone || 'UTC')
    } catch (_) {
      // fallback to profile columns if provided in seed data
      setAvatarUrl(userProfile.avatar_url || '')
      try {
        const ec = Array.isArray(userProfile.emergency_contacts) ? userProfile.emergency_contacts : [];
        setContacts(ec.length ? ec : [emptyContact()]);
      } catch (_) {}
  setLangLocal(userProfile.language || (localStorage.getItem('language') || 'fr'))
      setTheme(userProfile.theme || (localStorage.getItem('theme') || 'system'))
      setDefaultPrivacy(userProfile.default_journal_privacy || (localStorage.getItem('default_journal_privacy') || 'private'))
  setDateOfBirth(userProfile.date_of_birth || '')
  setTimezone(userProfile.timezone || 'UTC')
    }
  }, [userProfile]);

  const completion = useMemo(() => {
    if (userProfile?.profile_completion_percentage != null) {
      return Number(userProfile.profile_completion_percentage) || 0;
    }
    let score = 0;
    const fields = [displayName, fullName, phone, avatarUrl];
    fields.forEach((f) => { if (f && String(f).trim().length > 1) score += 1; });
    const hasContact = (contacts || []).some(c => c.name && c.phone);
    if (hasContact) score += 1;
    // 5 buckets → percentage
    return Math.round((score / 5) * 100);
  }, [displayName, fullName, phone, avatarUrl, contacts, userProfile?.profile_completion_percentage]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setAvatarFile(f || null);
  };

  const uploadAvatarIfPossible = async () => {
    if (!avatarFile || !user?.id) return null;
    try {
      if (!supabase?.storage?.from) return null;
      const filePath = `${user.id}/${Date.now()}-${avatarFile.name}`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(filePath, avatarFile, { upsert: true });
      if (upErr) return null;
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data?.publicUrl || null;
    } catch (_) {
      return null;
    }
  };

  const save = async () => {
    setSaving(true);
    setMessage('');
    setError('');
    try {
      let finalAvatar = avatarUrl;
      if (avatarFile) {
        const url = await uploadAvatarIfPossible();
        if (url) finalAvatar = url;
      }

  // persist preferences locally for immediate effect
      try {
        localStorage.setItem('language', language);
        localStorage.setItem('theme', theme);
        localStorage.setItem('default_journal_privacy', defaultPrivacy);
      } catch (_) {}
      setLanguage?.(language);
      document.documentElement?.setAttribute('data-theme', theme);

      // Update DB profile (allowed columns only)
      const primary = (contacts || []).find(c => c.name && c.phone) || {}
      const payloadDb = {
        display_name: displayName,
        full_name: fullName,
        phone_number: phone,
        date_of_birth: dateOfBirth || null,
        timezone,
        language,
        emergency_contact_name: primary.name || null,
        emergency_contact_phone: primary.phone || null,
      };
      const res = await updateProfile(payloadDb);
      if (!res?.success) {
        setError(res?.error || 'Failed to save profile');
        return;
      }

      // Save preferences and extras in auth metadata
      await updateAuthPreferences({
        avatar_url: finalAvatar,
        emergency_contacts: contacts,
        theme,
        default_journal_privacy: defaultPrivacy,
        language,
        profile_completion_client: completion,
      });
      setMessage('Profile saved');
    } finally {
      setSaving(false);
    }
  };

  const updateContact = (idx, key, val) => {
    setContacts(prev => prev.map((c, i) => i === idx ? { ...c, [key]: val } : c));
  };
  const addContact = () => setContacts(prev => [...prev, emptyContact()]);
  const removeContact = (idx) => setContacts(prev => prev.filter((_, i) => i !== idx));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 max-w-3xl mx-auto px-4">
        <div className={`flex items-center justify-between mb-4 ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-2xl font-heading font-semibold text-foreground">{t('profile.title')}</h1>
          <div className={`flex items-center gap-2 text-sm text-muted-foreground ${i18n.language === 'ar' ? 'flex-row-reverse' : ''}`}>
            <Icon name="UserCheck" size={16} /> {completion}% {t('profile.complete')}
          </div>
        </div>

        {message && (
          <div className="mb-3 p-3 rounded-md bg-success/10 border border-success/20 text-success text-sm">{message}</div>
        )}
        {error && (
          <div className="mb-3 p-3 rounded-md bg-error/10 border border-error/20 text-error text-sm">{error}</div>
        )}

        <section className="bg-card border border-border rounded-xl p-4 space-y-4">
          <h2 className="text-lg font-semibold">{t('profile.basicInfo')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('profile.displayName')} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            <Input label={t('profile.fullName')} value={fullName} onChange={(e) => setFullName(e.target.value)} />
            <Input label={t('profile.phone')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 ..." />
            <Input type="date" label={t('profile.dob')} value={dateOfBirth || ''} onChange={(e) => setDateOfBirth(e.target.value)} />
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.timezone')}</label>
              <select className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                <option value="UTC">UTC</option>
                <option value="Africa/Casablanca">Africa/Casablanca</option>
                <option value="Europe/Paris">Europe/Paris</option>
              </select>
            </div>
            <Input label={t('profile.avatarUrl')} value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">{t('profile.uploadAvatar')}</label>
            <input type="file" accept="image/*" onChange={onFileChange} className="block mt-1 text-sm" />
            <p className="text-xs text-muted-foreground mt-1">Uploads use Supabase Storage bucket "avatars" if available.</p>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-4 space-y-4 mt-6">
          <h2 className="text-lg font-semibold">{t('profile.emergencyContacts')}</h2>
          <div className="space-y-3">
            {contacts.map((c, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <Input label={t('profile.name')} value={c.name} onChange={(e) => updateContact(idx, 'name', e.target.value)} />
                <Input label={t('profile.phone')} value={c.phone} onChange={(e) => updateContact(idx, 'phone', e.target.value)} />
                <div className="flex gap-2">
                  <Input label={t('profile.relation')} value={c.relation} onChange={(e) => updateContact(idx, 'relation', e.target.value)} />
                  <Button variant="ghost" size="icon" onClick={() => removeContact(idx)}><Icon name="Trash2" size={16} /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" onClick={addContact} iconName="Plus" iconPosition="left" iconSize={16}>{t('profile.addContact')}</Button>
          </div>
        </section>

        <section className="bg-card border border-border rounded-xl p-4 space-y-4 mt-6">
          <h2 className="text-lg font-semibold">{t('profile.preferences')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.language')}</label>
              <select className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={language} onChange={(e) => setLangLocal(e.target.value)}>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.theme')}</label>
              <select className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={theme} onChange={(e) => setTheme(e.target.value)}>
                <option value="system">{t('settings.system')}</option>
                <option value="light">{t('settings.light')}</option>
                <option value="dark">{t('settings.dark')}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('profile.defaultPrivacy')}</label>
              <select className="w-full h-10 px-3 py-2 border border-input rounded-md bg-background text-sm" value={defaultPrivacy} onChange={(e) => setDefaultPrivacy(e.target.value)}>
                <option value="private">Private</option>
                <option value="friends">Friends</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <Button variant="default" onClick={save} loading={saving} disabled={saving} iconName="Save" iconPosition="left" iconSize={16}>
            {t('profile.save')}
          </Button>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default ProfilePage;
