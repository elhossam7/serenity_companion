import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AIInsightsPanel = () => {
  const [language, setLanguage] = useState('fr');
  const [currentInsight, setCurrentInsight] = useState(0);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Analyses IA',
      subtitle: 'Découvertes personnalisées',
      viewAll: 'Voir tout',
      pattern: 'Modèle détecté',
      recommendation: 'Recommandation',
      cultural: 'Conseil culturel',
      next: 'Suivant',
      previous: 'Précédent'
    },
    ar: {
      title: 'تحليلات الذكاء الاصطناعي',
      subtitle: 'اكتشافات شخصية',
      viewAll: 'عرض الكل',
      pattern: 'نمط مكتشف',
      recommendation: 'توصية',
      cultural: 'نصيحة ثقافية',
      next: 'التالي',
      previous: 'السابق'
    }
  };

  const t = translations?.[language];

  const insights = [
    {
      type: 'pattern',
      icon: 'TrendingUp',
      color: 'bg-primary',
      title: language === 'fr' 
        ? "Amélioration le vendredi" :"تحسن يوم الجمعة",
      description: language === 'fr' ? "Votre humeur s'améliore systématiquement les vendredis. Cela pourrait être lié à la perspective du week-end et aux préparatifs pour la prière du vendredi." :"مزاجك يتحسن بانتظام أيام الجمعة. قد يكون هذا مرتبطاً بتوقع عطلة نهاية الأسبوع والاستعداد لصلاة الجمعة.",
      confidence: 85
    },
    {
      type: 'recommendation',
      icon: 'Lightbulb',
      color: 'bg-secondary',
      title: language === 'fr' 
        ? "Routine matinale suggérée" :"روتين صباحي مقترح",
      description: language === 'fr'
        ? "Vos données montrent une corrélation entre l'écriture matinale et une meilleure humeur. Essayez d'intégrer 10 minutes de journaling après la prière du Fajr." :"بياناتك تظهر ارتباطاً بين الكتابة الصباحية والمزاج الأفضل. حاول دمج 10 دقائق من كتابة المذكرات بعد صلاة الفجر.",
      confidence: 78
    },
    {
      type: 'cultural',
      icon: 'Sun',
      color: 'bg-accent',
      title: language === 'fr' 
        ? "Influence spirituelle positive" :"تأثير روحاني إيجابي",
      description: language === 'fr'
        ? "Les jours où vous mentionnez des pratiques spirituelles dans votre journal, votre humeur est 23% plus positive. La spiritualité semble être un pilier important de votre bien-être." :"الأيام التي تذكر فيها الممارسات الروحانية في مذكراتك، مزاجك أكثر إيجابية بنسبة 23%. الروحانية تبدو ركيزة مهمة لرفاهيتك.",
      confidence: 92
    },
    {
      type: 'pattern',
      icon: 'Users',
      color: 'bg-warning',
      title: language === 'fr' 
        ? "Impact social significatif" 
        : "تأثير اجتماعي مهم",
      description: language === 'fr'
        ? "Vos interactions familiales ont un impact majeur sur votre humeur. Les jours de rassemblements familiaux montrent une amélioration de 31% de votre bien-être émotionnel." :"تفاعلاتك العائلية لها تأثير كبير على مزاجك. أيام التجمعات العائلية تظهر تحسناً بنسبة 31% في رفاهيتك العاطفية.",
      confidence: 89
    }
  ];

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights?.length);
  };

  const previousInsight = () => {
    setCurrentInsight((prev) => (prev - 1 + insights?.length) % insights?.length);
  };

  const currentData = insights?.[currentInsight];

  const getTypeLabel = (type) => {
    switch (type) {
      case 'pattern': return t?.pattern;
      case 'recommendation': return t?.recommendation;
      case 'cultural': return t?.cultural;
      default: return type;
    }
  };

  return (
    <div className="bg-card rounded-xl p-6 border border-border cultural-pattern">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            {t?.title}
          </h3>
          <p className="text-sm font-caption text-muted-foreground">
            {t?.subtitle}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          iconName="ExternalLink"
          iconPosition="right"
          iconSize={16}
          className="text-xs"
        >
          {t?.viewAll}
        </Button>
      </div>
      {/* Current Insight */}
      <div className="relative">
        <div className="flex items-start space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentData?.color}`}>
            <Icon name={currentData?.icon} size={20} color="white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-xs font-caption px-2 py-1 bg-muted rounded-full text-muted-foreground">
                {getTypeLabel(currentData?.type)}
              </span>
              <span className="text-xs font-caption text-success">
                {currentData?.confidence}% de confiance
              </span>
            </div>
            <h4 className="text-base font-body font-semibold text-foreground mb-2">
              {currentData?.title}
            </h4>
            <p className="text-sm font-body text-muted-foreground leading-relaxed">
              {currentData?.description}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {insights?.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentInsight(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentInsight ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousInsight}
              className="w-8 h-8"
            >
              <Icon name="ChevronLeft" size={16} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextInsight}
              className="w-8 h-8"
            >
              <Icon name="ChevronRight" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPanel;