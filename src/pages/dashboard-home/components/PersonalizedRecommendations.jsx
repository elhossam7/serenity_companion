import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { moodService } from '../../../services/moodService';
import { wellnessService } from '../../../services/wellnessService';

const PersonalizedRecommendations = () => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const language = i18n.language;
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        if (!user?.id) return;
        // Pull recent mood stats
        const { data: moodStats } = await moodService.getMoodStats(user.id, 14);
        // Get active goals to bias recs
        const goalsRes = await wellnessService.getWellnessGoals(user.id, { activeOnly: true });
        // Get featured resources (limit)
        const { data: resources } = await wellnessService.getWellnessResources({ featuredOnly: true, limit: 10 });

        const signal = deriveUserSignal(moodStats, goalsRes?.data || []);
        const recs = rankRecommendations(resources || [], signal, language).slice(0, 3);
        if (!mounted) return;
        setRecommendations(recs);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [user?.id, i18n.language]);

  const translations = {
    en: {
      recommendations: 'Personalized Recommendations',
      basedOnMood: 'Based on your recent mood analysis',
      tryNow: 'Try now',
      culturallyAdapted: 'Culturally adapted',
      premium: 'Premium',
      unlockMore: 'Unlock more recommendations',
      upgradeNow: 'Upgrade now'
    },
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
    if (!recommendation?.id) return;
    const guidedTypes = ['breathing', 'movement', 'mindfulness'];
    const isGuided = guidedTypes.includes((recommendation?.type || '').toLowerCase());
    const qs = isGuided ? '?start=guided' : '';
    navigate(`/resources/${recommendation.id}${qs}`);
  };

  const deriveUserSignal = (moodStats, goals) => {
    const avgMood = moodStats?.averageMood || 0; // 1..5 scale per service
    const stress = moodStats?.data?.averageStress || moodStats?.averageStress || 0;
    const activeGoals = (goals || []).length;
    return { avgMood, stress, activeGoals };
  };

  const rankRecommendations = (resources, signal, lang) => {
    const score = (r) => {
      let s = 0;
      // Prefer short duration when stress high
      if ((signal.stress || 0) >= 6) {
        s += r.duration_minutes && r.duration_minutes <= 10 ? 3 : 0;
      }
      // If mood is low, prioritize calming categories
      if ((signal.avgMood || 3) <= 3) {
        if (/breath|respir|تنفس|calm|هدوء/i.test(r.title + ' ' + r.category)) s += 4;
      }
      // If user has active goals, lean into relevant categories
      if ((signal.activeGoals || 0) > 0) {
        if (/gratitude|امتنان|reflection|تأمل/i.test(r.title + ' ' + r.category)) s += 2;
      }
      // Base popularity/rating
      s += (r.rating || 0) / 2;
      return s;
    };
    const mapped = (resources || []).map(r => ({
      id: r.id,
      type: r.category || 'general',
      title: r.title,
      description: selectLocalized(r, lang),
      duration: r.duration_minutes ? `${r.duration_minutes} min` : '—',
      icon: categoryToIcon(r.category),
      color: categoryToColor(r.category),
      category: r.category || (lang === 'ar' ? 'عام' : 'Général'),
      culturalNote: lang === 'ar' ? 'متوافق ثقافياً' : 'Adapté culturellement',
      _score: score(r)
    }));
    return mapped.sort((a, b) => b._score - a._score);
  };

  const selectLocalized = (r, lang) => {
    if (lang === 'ar') return r.description_ar || r.description || r.description_fr || '';
    if (lang === 'en') return r.description_en || r.description || r.description_fr || r.description_ar || '';
    return r.description_fr || r.description || r.description_en || '';
  };

  const categoryToIcon = (c) => {
    switch ((c || '').toLowerCase()) {
      case 'breathing': return 'Wind';
      case 'gratitude': return 'Heart';
      case 'movement': return 'Activity';
      case 'mindfulness': return 'Eye';
      default: return 'Sparkles';
    }
  };

  const categoryToColor = (c) => {
    switch ((c || '').toLowerCase()) {
      case 'breathing': return 'primary';
      case 'gratitude': return 'secondary';
      case 'movement': return 'accent';
      case 'mindfulness': return 'success';
      default: return 'primary';
    }
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
    {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Chargement...') : t?.unlockMore}
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