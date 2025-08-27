import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const RecentActivity = () => {
  const [language, setLanguage] = useState('fr');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Mock recent activities
    const mockActivities = [
      {
        id: 1,
        type: 'journal',
        title: language === 'ar' ? 'تأملات الصباح' : 'Réflexions matinales',
        preview: language === 'ar' ?'بدأت يومي بشعور من الامتنان والهدوء. الطقس جميل اليوم...' : "J'ai commencé ma journée avec un sentiment de gratitude et de calme. Le temps est magnifique aujourd'hui...",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        mood: 8,
        icon: 'BookOpen',
        color: 'primary'
      },
      {
        id: 2,
        type: 'mood',
        title: language === 'ar' ? 'تسجيل المزاج' : 'Enregistrement humeur',
  preview: language === 'ar' ? 'مزاج جيد - شعور بالطاقة والتفاؤل' : "Bonne humeur - sentiment d'énergie et d'optimisme",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        mood: 7,
        icon: 'Smile',
        color: 'secondary'
      },
      {
        id: 3,
        type: 'chat',
        title: language === 'ar' ? 'جلسة دعم' : 'Session de support',
  preview: language === 'ar' ?'تحدثت مع المساعد الذكي حول تقنيات إدارة التوتر...' : "J'ai parlé avec l'assistant IA des techniques de gestion du stress...",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        mood: 6,
        icon: 'MessageCircle',
        color: 'accent'
      }
    ];

    setActivities(mockActivities);
  }, [language]);

  const translations = {
    fr: {
      recentActivity: 'Activité Récente',
      viewAll: 'Voir tout',
      hoursAgo: 'il y a {hours}h',
      dayAgo: 'il y a 1 jour',
      daysAgo: 'il y a {days} jours',
      justNow: 'À l\'instant',
      noActivity: 'Aucune activité récente',
      startJourney: 'Commencez votre parcours de bien-être'
    },
    ar: {
      recentActivity: 'النشاط الأخير',
      viewAll: 'عرض الكل',
      hoursAgo: 'منذ {hours} ساعات',
      dayAgo: 'منذ يوم واحد',
      daysAgo: 'منذ {days} أيام',
      justNow: 'الآن',
      noActivity: 'لا يوجد نشاط حديث',
      startJourney: 'ابدأ رحلة الصحة النفسية'
    }
  };

  const t = translations?.[language];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return t?.justNow;
    if (hours < 24) return t?.hoursAgo?.replace('{hours}', hours);
    if (days === 1) return t?.dayAgo;
    return t?.daysAgo?.replace('{days}', days);
  };

  const getMoodColor = (mood) => {
    if (mood >= 8) return 'text-success';
    if (mood >= 6) return 'text-secondary';
    if (mood >= 4) return 'text-warning';
    return 'text-error';
  };

  const getMoodEmoji = (mood) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-foreground">
          {t?.recentActivity}
        </h2>
        <button className="text-sm font-body text-primary hover:text-primary/80 transition-colors">
          {t?.viewAll}
        </button>
      </div>
      {activities?.length === 0 ? (
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Activity" size={24} color="var(--color-muted-foreground)" />
          </div>
          <p className="text-sm font-body text-muted-foreground mb-2">
            {t?.noActivity}
          </p>
          <p className="text-xs font-caption text-muted-foreground">
            {t?.startJourney}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities?.map((activity) => (
            <div
              key={activity?.id}
              className="bg-card rounded-xl p-4 border border-border gentle-hover cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 bg-${activity?.color}/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon 
                    name={activity?.icon} 
                    size={16} 
                    color={`var(--color-${activity?.color})`} 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-body font-medium text-foreground truncate">
                      {activity?.title}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {activity?.mood && (
                        <span className="text-sm">
                          {getMoodEmoji(activity?.mood)}
                        </span>
                      )}
                      <span className="text-xs font-caption text-muted-foreground">
                        {formatTimestamp(activity?.timestamp)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm font-body text-muted-foreground line-clamp-2 leading-relaxed">
                    {activity?.preview}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;