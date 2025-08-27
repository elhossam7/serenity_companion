import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeSection = () => {
  const [language, setLanguage] = useState('fr');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setUserName(user?.name || '');
    }

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime?.getHours();
    
    if (language === 'ar') {
      if (hour < 12) return 'صباح الخير';
      if (hour < 17) return 'مساء الخير';
      return 'مساء الخير';
    } else {
      if (hour < 12) return 'Bonjour';
      if (hour < 17) return 'Bon après-midi';
      return 'Bonsoir';
    }
  };

  const translations = {
    fr: {
      welcomeBack: 'Bon retour',
  todayIs: "Aujourd'hui c'est",
  howAreYou: "Comment vous sentez-vous aujourd'hui ?",
      startYourDay: 'Commencez votre journée avec intention'
    },
    ar: {
      welcomeBack: 'مرحباً بعودتك',
      todayIs: 'اليوم هو',
      howAreYou: 'كيف تشعر اليوم؟',
      startYourDay: 'ابدأ يومك بقصد'
    }
  };

  const t = translations?.[language];

  const formatDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return currentTime?.toLocaleDateString(language === 'ar' ? 'ar-MA' : 'fr-MA', options);
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-2xl p-6 mb-6 cultural-pattern">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center breathe">
            <Icon name="Heart" size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-semibold text-foreground">
              {getGreeting()}{userName && `, ${userName}`}
            </h1>
            <p className="text-sm font-body text-muted-foreground">
              {t?.welcomeBack}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-caption text-muted-foreground uppercase tracking-wide">
            {t?.todayIs}
          </p>
          <p className="text-sm font-body font-medium text-foreground">
            {formatDate()}
          </p>
        </div>
      </div>
      <div className="bg-background/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
        <p className="text-lg font-body text-foreground mb-2">
          {t?.howAreYou}
        </p>
        <p className="text-sm font-caption text-muted-foreground">
          {t?.startYourDay}
        </p>
      </div>
    </div>
  );
};

export default WelcomeSection;