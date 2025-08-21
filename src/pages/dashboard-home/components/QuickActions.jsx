import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';


const QuickActions = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('fr');
  const [aiStatus, setAiStatus] = useState('online');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Mock AI status
    setAiStatus('online');
  }, []);

  const translations = {
    fr: {
      quickActions: 'Actions Rapides',
      startJournaling: 'Commencer à Écrire',
      journalingDesc: 'Assistant IA prêt à vous aider',
      logMood: 'Noter Humeur',
      moodDesc: 'Comment vous sentez-vous maintenant ?',
      chatSupport: 'Chat Support IA',
      supportDesc: 'Disponible 24/7',
      aiOnline: 'IA en ligne',
      aiOffline: 'IA hors ligne',
      lastEntry: 'Dernière entrée: Il y a 2 heures',
      moodToday: 'Humeur du jour: Non notée',
      supportAvailable: 'Support disponible maintenant'
    },
    ar: {
      quickActions: 'الإجراءات السريعة',
      startJournaling: 'بدء الكتابة',
      journalingDesc: 'مساعد الذكي الاصطناعي جاهز لمساعدتك',
      logMood: 'تسجيل المزاج',
      moodDesc: 'كيف تشعر الآن؟',
      chatSupport: 'دعم الدردشة بالذكي الاصطناعي',
      supportDesc: 'متاح 24/7',
      aiOnline: 'الذكي الاصطناعي متصل',
      aiOffline: 'الذكي الاصطناعي غير متصل',
      lastEntry: 'آخر إدخال: منذ ساعتين',
      moodToday: 'مزاج اليوم: غير مسجل',
      supportAvailable: 'الدعم متاح الآن'
    }
  };

  const t = translations?.[language];

  const quickActionItems = [
    {
      title: t?.startJournaling,
      description: t?.journalingDesc,
      icon: 'PenTool',
      color: 'primary',
      bgColor: 'bg-primary/10',
      route: '/ai-powered-journaling',
      status: t?.lastEntry,
      statusColor: 'text-muted-foreground'
    },
    {
      title: t?.logMood,
      description: t?.moodDesc,
      icon: 'Smile',
      color: 'secondary',
      bgColor: 'bg-secondary/10',
      route: '/mood-tracking-dashboard',
      status: t?.moodToday,
      statusColor: 'text-warning'
    },
    {
      title: t?.chatSupport,
      description: t?.supportDesc,
      icon: 'MessageCircle',
      color: 'accent',
      bgColor: 'bg-accent/10',
      route: '/ai-chat-support',
      status: t?.supportAvailable,
      statusColor: 'text-success'
    }
  ];

  const handleActionClick = (route) => {
    navigate(route);
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-heading font-semibold text-foreground mb-4">
        {t?.quickActions}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActionItems?.map((item, index) => (
          <div
            key={index}
            className="bg-card rounded-xl p-4 border border-border gentle-hover cursor-pointer transition-all duration-300"
            onClick={() => handleActionClick(item?.route)}
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className={`w-12 h-12 ${item?.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon 
                  name={item?.icon} 
                  size={20} 
                  color={`var(--color-${item?.color})`} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-body font-medium text-foreground mb-1">
                  {item?.title}
                </h3>
                <p className="text-sm font-caption text-muted-foreground">
                  {item?.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-caption ${item?.statusColor}`}>
                {item?.status}
              </span>
              <Icon 
                name="ArrowRight" 
                size={16} 
                color="var(--color-muted-foreground)" 
              />
            </div>

            {/* AI Status Indicator for Chat Support */}
            {item?.route === '/ai-chat-support' && (
              <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-border/50">
                <div className={`w-2 h-2 rounded-full ${aiStatus === 'online' ? 'bg-success' : 'bg-error'} animate-pulse`}></div>
                <span className="text-xs font-caption text-muted-foreground">
                  {aiStatus === 'online' ? t?.aiOnline : t?.aiOffline}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;