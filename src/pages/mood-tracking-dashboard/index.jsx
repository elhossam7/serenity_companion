import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { moodService } from '../../services/moodService';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import EmergencyOverlay from '../../components/ui/EmergencyOverlay';
import MoodMetricsCard from './components/MoodMetricsCard';
import MoodTimelineChart from './components/MoodTimelineChart';
import QuickMoodEntry from './components/QuickMoodEntry';
import MoodDistributionChart from './components/MoodDistributionChart';
import AIInsightsPanel from './components/AIInsightsPanel';
import MoodStreakCard from './components/MoodStreakCard';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const MoodTrackingDashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [language, setLanguage] = useState('fr');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showQuickEntry, setShowQuickEntry] = useState(false);
  const [moodData, setMoodData] = useState(null);
  const [moodStats, setMoodStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || userProfile?.language || 'fr';
    setLanguage(savedLanguage);

    // Check authentication
    if (!user) {
      navigate('/user-login');
      return;
    }

    // Load mood data
    loadMoodData();
  }, [user, userProfile, navigate]);

  const loadMoodData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError('');

      // Load recent mood entries
      const entriesResult = await moodService?.getMoodEntries(user?.id, { limit: 30 });
      if (!entriesResult?.success) {
        setError(entriesResult?.error);
        return;
      }

      // Load mood statistics
      const statsResult = await moodService?.getMoodStats(user?.id, 30);
      if (!statsResult?.success) {
        setError(statsResult?.error);
        return;
      }

      setMoodData(entriesResult?.data || []);
      setMoodStats(statsResult?.data || {});

    } catch (err) {
      setError('Failed to load mood data');
      console.error('Mood data loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    fr: {
      title: 'Suivi de l\'Humeur',
      subtitle: 'Comprendre vos émotions',
      quickLog: 'Enregistrement Rapide',
      currentMood: 'Humeur Actuelle',
      weeklyAverage: 'Moyenne Hebdomadaire',
      longestStreak: 'Plus Longue Série',
      improvement: 'Amélioration',
      days: 'jours',
      excellent: 'Excellent',
      good: 'Bien',
      neutral: 'Neutre',
      low: 'Faible',
      veryLow: 'Très faible',
      exportData: 'Exporter',
      settings: 'Paramètres',
      help: 'Aide',
      loading: 'Chargement...',
      error: 'Erreur',
      noData: 'Aucune donnée disponible'
    },
    ar: {
      title: 'تتبع المزاج',
      subtitle: 'فهم مشاعرك',
      quickLog: 'تسجيل سريع',
      currentMood: 'المزاج الحالي',
      weeklyAverage: 'المتوسط الأسبوعي',
      longestStreak: 'أطول سلسلة',
      improvement: 'التحسن',
      days: 'أيام',
      excellent: 'ممتاز',
      good: 'جيد',
      neutral: 'محايد',
      low: 'منخفض',
      veryLow: 'منخفض جداً',
      exportData: 'تصدير',
      settings: 'الإعدادات',
      help: 'المساعدة',
      loading: 'جاري التحميل...',
      error: 'خطأ',
      noData: 'لا توجد بيانات متاحة'
    }
  };

  const t = translations?.[language];

  const getMoodDisplayValue = (entries) => {
    if (!entries || entries?.length === 0) return t?.noData;
    
    const latestMood = entries?.[0]?.mood_level;
    switch (latestMood) {
      case 'excellent': return t?.excellent;
      case 'good': return t?.good;
      case 'neutral': return t?.neutral;
      case 'low': return t?.low;
      case 'very_low': return t?.veryLow;
      default: return t?.noData;
    }
  };

  const handleMoodLogged = (newEntry) => {
    // Reload mood data after new entry
    loadMoodData();
    setShowQuickEntry(false);
  };

  const handleExportData = async () => {
    try {
      if (!moodData || moodData?.length === 0) return;

      const exportData = {
        user: userProfile?.display_name || userProfile?.full_name || 'User',
        dateRange: 'Last 30 days',
        entries: moodData,
        statistics: moodStats,
        exportDate: new Date()?.toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `mood-data-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement?.setAttribute('href', dataUri);
      linkElement?.setAttribute('download', exportFileDefaultName);
      linkElement?.click();
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t?.loading}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <Icon name="AlertCircle" size={48} color="var(--color-error)" className="mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">{t?.error}</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadMoodData} variant="outline">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/5 to-secondary/5 cultural-pattern">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
                  {t?.title}
                </h1>
                <p className="text-muted-foreground font-body">
                  {t?.subtitle}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  iconName="Download"
                  iconPosition="left"
                  iconSize={16}
                  className="hidden sm:flex"
                  disabled={!moodData || moodData?.length === 0}
                >
                  {t?.exportData}
                </Button>
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowQuickEntry(true)}
                  iconName="Plus"
                  iconPosition="left"
                  iconSize={16}
                >
                  {t?.quickLog}
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MoodMetricsCard
                title={t?.currentMood}
                value={getMoodDisplayValue(moodData)}
                subtitle="Aujourd'hui"
                icon="Smile"
                color="bg-success"
                trend={5}
              />
              <MoodMetricsCard
                title={t?.weeklyAverage}
                value={moodStats?.averageMood ? `${moodStats?.averageMood?.toFixed(1)}/5` : '--'}
                subtitle="Cette semaine"
                icon="TrendingUp"
                color="bg-primary"
                trend={12}
              />
              <MoodMetricsCard
                title={t?.longestStreak}
                value={`${moodStats?.longestStreak || 0} ${t?.days}`}
                subtitle="Record personnel"
                icon="Award"
                color="bg-secondary"
                trend={0}
              />
              <MoodMetricsCard
                title="Entrées"
                value={moodStats?.totalEntries || 0}
                subtitle="Ce mois"
                icon="ArrowUp"
                color="bg-accent"
                trend={moodStats?.totalEntries || 0}
              />
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Mood Timeline */}
              <MoodTimelineChart moodData={moodData} />
              
              {/* Mood Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MoodDistributionChart moodStats={moodStats} />
                <AIInsightsPanel userId={user?.id} />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Mood Streak */}
              <MoodStreakCard moodStats={moodStats} />
              
              {/* Quick Actions */}
              <div className="bg-card rounded-xl p-6 border border-border cultural-pattern">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  Actions Rapides
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/ai-powered-journaling')}
                    iconName="BookOpen"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start"
                  >
                    Écrire dans le journal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/ai-chat-support')}
                    iconName="MessageCircle"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start"
                  >
                    Parler à l'IA
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmergency(true)}
                    iconName="Heart"
                    iconPosition="left"
                    iconSize={16}
                    className="w-full justify-start text-error border-error/20 hover:bg-error/5"
                  >
                    Support d'urgence
                  </Button>
                </div>
              </div>

              {/* Recent Insights */}
              <div className="bg-card rounded-xl p-6 border border-border cultural-pattern">
                <h3 className="text-lg font-heading font-semibold text-foreground mb-4">
                  Aperçus Récents
                </h3>
                <div className="space-y-3">
                  {moodData && moodData?.length > 0 ? (
                    <>
                      <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Icon name="Calendar" size={16} color="var(--color-primary)" />
                        <div>
                          <p className="text-sm font-body text-foreground">
                            {moodStats?.totalEntries || 0} entrées ce mois
                          </p>
                          <p className="text-xs font-caption text-muted-foreground">
                            Continuez votre suivi quotidien
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                        <Icon name="Sun" size={16} color="var(--color-secondary)" />
                        <div>
                          <p className="text-sm font-body text-foreground">
                            Humeur moyenne: {moodStats?.averageMood?.toFixed(1) || '--'}/5
                          </p>
                          <p className="text-xs font-caption text-muted-foreground">
                            Bien-être général positif
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <Icon name="Calendar" size={32} color="var(--color-muted)" className="mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Commencez à enregistrer votre humeur pour voir vos aperçus
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Quick Mood Entry Modal */}
      {showQuickEntry && (
        <div className="fixed inset-0 z-modal bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="text-lg font-heading font-semibold text-foreground">
                {t?.quickLog}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowQuickEntry(false)}
              >
                <Icon name="X" size={20} />
              </Button>
            </div>
            <div className="p-4">
              <QuickMoodEntry onMoodLogged={handleMoodLogged} />
            </div>
          </div>
        </div>
      )}
      {/* Emergency Overlay */}
      <EmergencyOverlay
        isVisible={showEmergency}
        onClose={() => setShowEmergency(false)}
        triggerReason="user_requested"
      />
      <BottomNavigation />
    </div>
  );
};

export default MoodTrackingDashboard;