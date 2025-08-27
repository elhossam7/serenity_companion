import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const WellnessSnapshot = () => {
  const [language, setLanguage] = useState('fr');
  const [moodData, setMoodData] = useState([]);
  const [journalStreak, setJournalStreak] = useState(0);
  const [dailyAffirmation, setDailyAffirmation] = useState('');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Mock mood data for the last 7 days
    const mockMoodData = [
      { day: 'Lun', mood: 7, date: '15/08' },
      { day: 'Mar', mood: 6, date: '16/08' },
      { day: 'Mer', mood: 8, date: '17/08' },
      { day: 'Jeu', mood: 5, date: '18/08' },
      { day: 'Ven', mood: 7, date: '19/08' },
      { day: 'Sam', mood: 9, date: '20/08' },
      { day: 'Dim', mood: 8, date: '21/08' }
    ];
    setMoodData(mockMoodData);

    // Mock journal streak
    setJournalStreak(12);

    // Mock daily affirmation
    const affirmations = {
      fr: [
  "Vous avez la force intérieure pour surmonter tous les défis d'aujourd'hui.",
        "Chaque respiration vous apporte paix et sérénité.",
        "Votre bien-être mental est une priorité précieuse.",
        "Vous méritez compassion et bienveillance, surtout de votre part."
      ],
      ar: [
        "لديك القوة الداخلية للتغلب على جميع تحديات اليوم.",
        "كل نفس يجلب لك السلام والهدوء.",
        "صحتك النفسية أولوية ثمينة.",
        "تستحق الرحمة واللطف، خاصة من نفسك."
      ]
    };

    const todayAffirmation = affirmations?.[savedLanguage]?.[Math.floor(Math.random() * affirmations?.[savedLanguage]?.length)];
    setDailyAffirmation(todayAffirmation);
  }, []);

  const translations = {
    fr: {
      wellnessSnapshot: 'Aperçu du Bien-être',
      moodTrend: 'Tendance Humeur (7j)',
      journalStreak: 'Série Journal',
      days: 'jours',
      dailyAffirmation: 'Affirmation du Jour',
      excellent: 'Excellent',
      good: 'Bien',
      average: 'Moyen',
      low: 'Faible'
    },
    ar: {
      wellnessSnapshot: 'لمحة عن الصحة النفسية',
      moodTrend: 'اتجاه المزاج (7 أيام)',
      journalStreak: 'سلسلة المذكرات',
      days: 'أيام',
      dailyAffirmation: 'تأكيد اليوم',
      excellent: 'ممتاز',
      good: 'جيد',
      average: 'متوسط',
      low: 'منخفض'
    }
  };

  const t = translations?.[language];

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'var(--color-success)';
    if (mood >= 6) return 'var(--color-secondary)';
    if (mood >= 4) return 'var(--color-warning)';
    return 'var(--color-error)';
  };

  const getCurrentMoodLevel = () => {
    const currentMood = moodData?.[moodData?.length - 1]?.mood || 0;
    if (currentMood >= 8) return t?.excellent;
    if (currentMood >= 6) return t?.good;
    if (currentMood >= 4) return t?.average;
    return t?.low;
  };

  return (
    <div className="space-y-4 mb-6">
      <h2 className="text-lg font-heading font-semibold text-foreground mb-4">
        {t?.wellnessSnapshot}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Mood Trend Chart */}
        <div className="md:col-span-2 bg-card rounded-xl p-4 border border-border gentle-hover">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-body font-medium text-foreground">
              {t?.moodTrend}
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-xs font-caption text-muted-foreground">
                {getCurrentMoodLevel()}
              </span>
            </div>
          </div>
          
          <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={moodData}>
                <XAxis 
                  dataKey="day" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }}
                />
                <YAxis hide domain={[0, 10]} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Journal Streak */}
        <div className="bg-card rounded-xl p-4 border border-border gentle-hover">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Icon name="BookOpen" size={16} color="var(--color-secondary)" />
            </div>
            <div>
              <h3 className="text-sm font-body font-medium text-foreground">
                {t?.journalStreak}
              </h3>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-heading font-bold text-secondary mb-1">
              {journalStreak}
            </div>
            <div className="text-xs font-caption text-muted-foreground">
              {t?.days}
            </div>
          </div>
        </div>
      </div>
      {/* Daily Affirmation */}
      <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-xl p-4 border border-border/50">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center mt-1">
            <Icon name="Sparkles" size={16} color="var(--color-accent)" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-body font-medium text-foreground mb-2">
              {t?.dailyAffirmation}
            </h3>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              {dailyAffirmation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WellnessSnapshot;