import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PersonalizedRecommendations = () => {
  const [language, setLanguage] = useState('fr');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Mock personalized recommendations based on mood analysis
    const mockRecommendations = [
      {
        id: 1,
        type: 'breathing',
        title: language === 'ar' ? 'تمرين التنفس العميق' : 'Exercice de respiration profonde',
        description: language === 'ar' ?'تقنية تنفس مهدئة لمدة 5 دقائق لتقليل التوتر' :'Technique de respiration apaisante de 5 minutes pour réduire le stress',
        duration: '5 min',
        icon: 'Wind',
        color: 'primary',
        category: language === 'ar' ? 'تهدئة' : 'Apaisement',
        culturalNote: language === 'ar' ?'مستوحى من تقاليد التأمل الإسلامية' :'Inspiré des traditions de méditation islamiques'
      },
      {
        id: 2,
        type: 'gratitude',
        title: language === 'ar' ? 'يوميات الامتنان' : 'Journal de gratitude',
        description: language === 'ar' ?'اكتب ثلاثة أشياء تشعر بالامتنان لها اليوم' :'Écrivez trois choses pour lesquelles vous êtes reconnaissant aujourd\'hui',
        duration: '10 min',
        icon: 'Heart',
        color: 'secondary',
        category: language === 'ar' ? 'امتنان' : 'Gratitude',
        culturalNote: language === 'ar' ?'الحمد والشكر في التقاليد الإسلامية' :'Hamd et gratitude dans les traditions islamiques'
      },
      {
        id: 3,
        type: 'movement',
        title: language === 'ar' ? 'حركة لطيفة' : 'Mouvement doux',
        description: language === 'ar' ?'تمارين إطالة بسيطة لتحسين المزاج والطاقة' :'Étirements simples pour améliorer l\'humeur et l\'énergie',
        duration: '15 min',
        icon: 'Activity',
        color: 'accent',
        category: language === 'ar' ? 'حركة' : 'Mouvement',
        culturalNote: language === 'ar' ?'متوافق مع قيم الصحة الإسلامية' :'Compatible avec les valeurs de santé islamiques'
      }
    ];

    setRecommendations(mockRecommendations);
  }, [language]);

  const translations = {
    fr: {
      recommendations: 'Recommandations Personnalisées',
      basedOnMood: 'Basé sur votre analyse d\'humeur récente',
      tryNow: 'Essayer maintenant',
      culturallyAdapted: 'Adapté culturellement',
      premium: 'Premium',
      unlockMore: 'Débloquer plus de recommandations',
      upgradeNow: 'Mettre à niveau'
    },
    ar: {
      recommendations: 'التوصيات الشخصية',
      basedOnMood: 'بناءً على تحليل مزاجك الأخير',
      tryNow: 'جرب الآن',
      culturallyAdapted: 'متكيف ثقافياً',
      premium: 'مميز',
      unlockMore: 'فتح المزيد من التوصيات',
      upgradeNow: 'ترقية الآن'
    }
  };

  const t = translations?.[language];

  const handleRecommendationClick = (recommendation) => {
    // Handle recommendation action based on type
    console.log('Starting recommendation:', recommendation?.type);
  };

  return (
    <div className="mb-6">
      <div className="mb-4">
        <h2 className="text-lg font-heading font-semibold text-foreground mb-1">
          {t?.recommendations}
        </h2>
        <p className="text-sm font-caption text-muted-foreground">
          {t?.basedOnMood}
        </p>
      </div>
      <div className="space-y-4">
        {recommendations?.map((recommendation, index) => (
          <div
            key={recommendation?.id}
            className="bg-card rounded-xl p-4 border border-border gentle-hover"
          >
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-${recommendation?.color}/10 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon 
                  name={recommendation?.icon} 
                  size={20} 
                  color={`var(--color-${recommendation?.color})`} 
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-base font-body font-medium text-foreground mb-1">
                      {recommendation?.title}
                    </h3>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`text-xs font-caption px-2 py-1 rounded-full bg-${recommendation?.color}/10 text-${recommendation?.color}`}>
                        {recommendation?.category}
                      </span>
                      <span className="text-xs font-caption text-muted-foreground">
                        {recommendation?.duration}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm font-body text-muted-foreground mb-3 leading-relaxed">
                  {recommendation?.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon name="Star" size={12} color="var(--color-accent)" />
                    <span className="text-xs font-caption text-muted-foreground">
                      {recommendation?.culturalNote}
                    </span>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRecommendationClick(recommendation)}
                    iconName="Play"
                    iconPosition="left"
                    iconSize={14}
                    className="text-xs"
                  >
                    {t?.tryNow}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Premium Upgrade Prompt */}
        <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Crown" size={18} color="var(--color-primary)" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-body font-medium text-foreground mb-1">
                {t?.unlockMore}
              </h3>
              <p className="text-xs font-caption text-muted-foreground">
                {t?.premium}
              </p>
            </div>
            <Button
              variant="default"
              size="sm"
              iconName="ArrowRight"
              iconPosition="right"
              iconSize={14}
              className="text-xs"
            >
              {t?.upgradeNow}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedRecommendations;