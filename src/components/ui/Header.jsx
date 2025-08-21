import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('fr');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({ name: 'Utilisateur', avatar: null });

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
    document.documentElement?.setAttribute('lang', savedLanguage);
    document.documentElement?.setAttribute('dir', savedLanguage === 'ar' ? 'rtl' : 'ltr');
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'fr' ? 'ar' : 'fr';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    document.documentElement?.setAttribute('lang', newLanguage);
    document.documentElement?.setAttribute('dir', newLanguage === 'ar' ? 'rtl' : 'ltr');
  };

  const handleLogoClick = () => {
    navigate('/dashboard-home');
  };

  const handleProfileClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/user-login');
  };

  const isAuthPage = location?.pathname === '/user-login' || location?.pathname === '/user-registration';

  const translations = {
    fr: {
      dashboard: 'Tableau de bord',
      journal: 'Journal',
      mood: 'Humeur',
      support: 'Support',
      profile: 'Profil',
      settings: 'Paramètres',
      help: 'Aide',
      logout: 'Déconnexion',
      language: 'عربية'
    },
    ar: {
      dashboard: 'لوحة التحكم',
      journal: 'المذكرات',
      mood: 'المزاج',
      support: 'الدعم',
      profile: 'الملف الشخصي',
      settings: 'الإعدادات',
      help: 'المساعدة',
      logout: 'تسجيل الخروج',
      language: 'Français'
    }
  };

  const t = translations?.[language];

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
            {t?.language}
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
            {t?.dashboard}
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
            {t?.journal}
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
            {t?.mood}
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
            {t?.support}
          </Button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="font-caption"
          >
            {t?.language}
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleProfileClick}
              className="w-8 h-8 rounded-full bg-secondary/10"
            >
              <Icon name="User" size={16} color="var(--color-secondary)" />
            </Button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-soft-lg z-dropdown animate-slide-down">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-body font-medium text-foreground">{user?.name}</p>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigate to profile when implemented
                    }}
                    iconName="User"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {t?.profile}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigate to settings when implemented
                    }}
                    iconName="Settings"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {t?.settings}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // Navigate to help when implemented
                    }}
                    iconName="HelpCircle"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start px-4 py-2 font-body"
                  >
                    {t?.help}
                  </Button>
                  
                  <div className="border-t border-border mt-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLogout}
                      iconName="LogOut"
                      iconPosition="left"
                      iconSize={16}
                      className="w-full justify-start px-4 py-2 font-body text-error hover:text-error"
                    >
                      {t?.logout}
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