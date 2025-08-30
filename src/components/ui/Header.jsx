import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useI18n } from '../../contexts/I18nContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user: authUser, userProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const { setLanguage } = useI18n();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Utilisateur', avatar: null, email: '', hasProfileName: false });

  useEffect(() => {
    // ensure html attrs align when Header mounts (I18nProvider handles ongoing updates)
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement?.setAttribute('lang', i18n.language);
    document.documentElement?.setAttribute('dir', dir);
  }, [i18n.language]);

  // Reflect authenticated user name/avatar in the header menu
  useEffect(() => {
    const meta = authUser?.user_metadata || {};
    const profileName = userProfile?.display_name || userProfile?.full_name || meta.display_name || meta.full_name || '';
    const displayName =
      profileName ||
      authUser?.email?.split('@')[0] ||
      (i18n.language === 'ar' ? 'المستخدم' : i18n.language === 'en' ? 'User' : 'Utilisateur');
    const avatar = userProfile?.avatar_url || meta.avatar_url || null;
    const email = authUser?.email || '';
    const hasProfileName = Boolean(profileName);
    setUser({ name: displayName, avatar, email, hasProfileName });
  }, [authUser, userProfile, i18n.language]);

  const toggleLanguage = () => {
    const next = i18n.language === 'fr' ? 'ar' : i18n.language === 'ar' ? 'en' : 'fr';
    setLanguage(next);
  };

  const handleLogoClick = () => {
    navigate('/dashboard-home');
  };

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/user-login');
  };

  const isAuthPage = location?.pathname === '/user-login' || location?.pathname === '/user-registration';

  const labels = {
    fr: {
      dashboard: 'Tableau de bord',
      journal: 'Journal',
      mood: 'Humeur',
      support: 'Support',
      profile: 'Profil',
      settings: 'Paramètres',
      help: 'Aide',
      privacy: 'Confidentialité',
      terms: 'Conditions',
      disclaimers: 'Avertissements',
      logout: 'Déconnexion',
      language: 'العربية'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      journal: 'المذكرات',
      mood: 'المزاج',
      support: 'الدعم',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      help: 'المساعدة',
      privacy: 'الخصوصية',
      terms: 'الشروط',
      disclaimers: 'إخلاء المسؤولية',
      logout: 'تسجيل الخروج',
      language: 'Français'
    },
    en: {
      dashboard: 'Dashboard',
      journal: 'Journal',
      mood: 'Mood',
      support: 'Support',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help',
      privacy: 'Privacy',
      terms: 'Terms',
      disclaimers: 'Disclaimers',
      logout: 'Logout',
      language: i18n.language === 'ar' ? 'Français' : 'العربية'
    }
  }[i18n.language] || {};

  if (isAuthPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-header bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div 
              onClick={handleLogoClick}
              className="flex items-center space-x-3 cursor-pointer gentle-hover"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Heart" size={20} color="white" />
              </div>
              <span className="text-xl font-heading font-semibold text-foreground">
                Serenity Companion
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-caption"
          >
            {labels.language}
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-header bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
  <div className="flex items-center">
          <div 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 cursor-pointer gentle-hover"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center breathe">
              <Icon name="Heart" size={20} color="white" />
            </div>
            <span className="text-xl font-heading font-semibold text-foreground">
              Serenity Companion
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Button
            variant={location?.pathname === '/dashboard-home' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/dashboard-home')}
            iconName="LayoutDashboard"
            iconPosition="left"
            iconSize={16}
            className="font-body"
          >
            {labels.dashboard}
          </Button>
          
          <Button
            variant={location?.pathname === '/ai-powered-journaling' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/ai-powered-journaling')}
            iconName="BookOpen"
            iconPosition="left"
            iconSize={16}
            className="font-body"
          >
            {labels.journal}
          </Button>
          
          <Button
            variant={location?.pathname === '/mood-tracking-dashboard' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/mood-tracking-dashboard')}
            iconName="Smile"
            iconPosition="left"
            iconSize={16}
            className="font-body"
          >
            {labels.mood}
          </Button>
          
          <Button
            variant={location?.pathname === '/ai-chat-support' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => navigate('/ai-chat-support')}
            iconName="MessageCircle"
            iconPosition="left"
            iconSize={16}
            className="font-body"
          >
            {labels.support}
          </Button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-caption"
          >
            {labels.language}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileClick}
              className="w-8 h-8 rounded-full bg-secondary/10"
            >
              {user?.avatar ? (
                // Simple avatar circle
                <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <Icon name="User" size={16} color="var(--color-secondary)" />
              )}
            </Button>

            {isMenuOpen && (
              <div className={`absolute ${i18n.language === 'ar' ? 'left-0' : 'right-0'} mt-2 w-56 bg-popover border border-border rounded-lg shadow-soft-lg z-dropdown animate-slide-down`}> 
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                      ) : (
                        <Icon name="User" size={16} color="var(--color-secondary)" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-body font-medium text-foreground truncate">{user?.name}</p>
                      {!user?.hasProfileName && user?.email ? (
                        <p className="text-[11px] text-muted-foreground truncate" dir="ltr">{user.email}</p>
                      ) : null}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/profile');
                    }}
                    iconName="User"
                    iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {labels.profile}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/settings');
                    }}
                    iconName="Settings"
                    iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {labels.settings}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigate to help when implemented
                    }}
                    iconName="HelpCircle"
                    iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {labels.help}
                  </Button>
                  
                  <div className="border-t border-border mt-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsMenuOpen(false); navigate('/privacy'); }}
                      iconName="Shield"
                      iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                      iconSize={16}
                      className="w-full justify-start px-4 py-2 font-body"
                    >
                      {labels.privacy}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsMenuOpen(false); navigate('/terms'); }}
                      iconName="FileText"
                      iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                      iconSize={16}
                      className="w-full justify-start px-4 py-2 font-body"
                    >
                      {labels.terms}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setIsMenuOpen(false); navigate('/disclaimers'); }}
                      iconName="AlertTriangle"
                      iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                      iconSize={16}
                      className="w-full justify-start px-4 py-2 font-body"
                    >
                      {labels.disclaimers}
                    </Button>
                  </div>

                  <div className="border-t border-border mt-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      iconName="LogOut"
                      iconPosition={i18n.language === 'ar' ? 'right' : 'left'}
                      iconSize={16}
                      className="w-full justify-start px-4 py-2 font-body text-error hover:text-error"
                    >
                      {labels.logout}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;