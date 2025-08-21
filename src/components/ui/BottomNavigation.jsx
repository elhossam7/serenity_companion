import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [language, setLanguage] = useState('fr');
  const [moodReminder, setMoodReminder] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Check for mood reminder (example: if user hasn't logged mood today)
    const lastMoodLog = localStorage.getItem('lastMoodLog');
    const today = new Date()?.toDateString();
    if (lastMoodLog !== today) {
      setMoodReminder(true);
    }
  }, []);

  const isAuthPage = location?.pathname === '/user-login' || location?.pathname === '/user-registration';

  if (isAuthPage) {
    return null;
  }

  const translations = {
    fr: {
      dashboard: 'Accueil',
      journal: 'Journal',
      mood: 'Humeur',
      support: 'Support'
    },
    ar: {
      dashboard: 'الرئيسية',
      journal: 'المذكرات',
      mood: 'المزاج',
      support: 'الدعم'
    }
  };

  const t = translations?.[language];

  const navigationItems = [
    {
      path: '/dashboard-home',
      icon: 'LayoutDashboard',
      label: t?.dashboard,
      badge: false
    },
    {
      path: '/ai-powered-journaling',
      icon: 'BookOpen',
      label: t?.journal,
      badge: false
    },
    {
      path: '/mood-tracking-dashboard',
      icon: 'Smile',
      label: t?.mood,
      badge: moodReminder
    },
    {
      path: '/ai-chat-support',
      icon: 'MessageCircle',
      label: t?.support,
      badge: false
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    
    // Clear mood reminder when user visits mood tracking
    if (path === '/mood-tracking-dashboard' && moodReminder) {
      setMoodReminder(false);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-navigation bg-background/95 backdrop-blur-sm border-t border-border md:hidden">
      <div className="flex items-center justify-around h-16 px-4 safe-area-inset-bottom">
        {navigationItems?.map((item) => {
          const isActive = location?.pathname === item?.path;
          
          return (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`
                relative flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1
                transition-all duration-300 ease-gentle
                ${isActive 
                  ? 'text-primary' :'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <div className="relative">
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  color={isActive ? 'var(--color-primary)' : 'currentColor'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {item?.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full animate-pulse" />
                )}
              </div>
              <span className={`
                text-xs font-caption mt-1 truncate w-full text-center
                ${isActive ? 'font-medium' : 'font-normal'}
              `}>
                {item?.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;