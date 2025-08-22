import React, { useState, useEffect } from 'react';


const MoodStreakCard = ({ moodStats = {} }) => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      currentStreak: 'Série Actuelle',
      days: 'jours',
      consecutiveDays: 'jours consécutifs',
      longestStreak: 'Meilleure série',
      keepGoing: 'Continuez comme ça !',
      positiveStreak: 'de humeur positive'
    },
    ar: {
      currentStreak: 'السلسلة الحالية',
      days: 'أيام',
      consecutiveDays: 'أيام متتالية',
      longestStreak: 'أفضل سلسلة',
      keepGoing: 'استمر هكذا!',
      positiveStreak: 'من المزاج الإيجابي'
    }
  };

  const t = translations?.[language];

  const streakData = {
    current: 7,
    longest: 12,
    isPositive: true
  };

  const getStreakEmoji = (days) => {
    if (days >= 14) return '🔥';
    if (days >= 7) return '⭐';
    if (days >= 3) return '✨';
    return '🌱';
  };

  const getEncouragementMessage = (days) => {
    if (language === 'fr') {
      if (days >= 14) return 'Incroyable ! Vous êtes en feu !';
      if (days >= 7) return 'Excellente série ! Continuez !';
      if (days >= 3) return 'Bon début ! Gardez le rythme !';
      return 'Chaque jour compte !';
    } else {
      if (days >= 14) return 'رائع! أنت مشتعل!';
      if (days >= 7) return 'سلسلة ممتازة! استمر!';
      if (days >= 3) return 'بداية جيدة! حافظ على الإيقاع!';
      return 'كل يوم مهم!';
    }
  };

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl p-6 border border-border cultural-pattern">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">{getStreakEmoji(streakData?.current)}</span>
          </div>
          <div>
            <h3 className="text-lg font-heading font-semibold text-foreground">
              {t?.currentStreak}
            </h3>
            <p className="text-sm font-caption text-muted-foreground">
              {t?.positiveStreak}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-heading font-bold text-primary">
            {streakData?.current}
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            {t?.days}
          </div>
        </div>
      </div>
      {/* Progress Visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-body text-muted-foreground">
            Progression vers 14 {t?.days}
          </span>
          <span className="text-sm font-body font-medium text-primary">
            {Math.round((streakData?.current / 14) * 100)}%
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min((streakData?.current / 14) * 100, 100)}%` }}
          />
        </div>
      </div>
      {/* Encouragement Message */}
      <div className="bg-card/50 rounded-lg p-3 mb-4">
        <p className="text-sm font-body text-center text-foreground">
          {getEncouragementMessage(streakData?.current)}
        </p>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-xl font-heading font-bold text-secondary mb-1">
            {streakData?.longest}
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            {t?.longestStreak}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xl font-heading font-bold text-accent mb-1">
            23
          </div>
          <div className="text-xs font-caption text-muted-foreground">
            Total ce mois
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodStreakCard;