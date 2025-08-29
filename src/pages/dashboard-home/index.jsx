import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import EmergencyOverlay from '../../components/ui/EmergencyOverlay';
import WelcomeSection from './components/WelcomeSection';
import WellnessSnapshot from './components/WellnessSnapshot';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import PersonalizedRecommendations from './components/PersonalizedRecommendations';

const DashboardHome = () => {
  const { i18n } = useTranslation();
  const language = i18n.language;
  const [showEmergencyOverlay, setShowEmergencyOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const t = setTimeout(() => setIsLoading(false), 600);

    // Mock emergency detection (for demo purposes)
    const checkEmergencyTriggers = () => {
      const lastMoodCheck = localStorage.getItem('lastMoodCheck');
      const today = new Date()?.toDateString();
      
      // Simulate emergency trigger based on mood patterns
      if (Math.random() < 0.1) { // 10% chance for demo
        setShowEmergencyOverlay(true);
      }
    };

    // Check for emergency triggers every 30 seconds (in real app, this would be more sophisticated)
    const emergencyInterval = setInterval(checkEmergencyTriggers, 30000);

    return () => {
      clearTimeout(t);
      clearInterval(emergencyInterval);
    }
  }, []);

  const handleEmergencyClose = () => {
    setShowEmergencyOverlay(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 breathe">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-sm font-body text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Chargement...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 page-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-8">
              <WelcomeSection />
              <WellnessSnapshot />
              <QuickActions />
              <RecentActivity />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24">
                <PersonalizedRecommendations />
                
                {/* Additional Sidebar Content */}
                <div className="bg-card rounded-xl p-4 border border-border">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-body font-medium text-foreground mb-2">
                      {language === 'ar' ? 'بياناتك آمنة' : 'Vos données sont sécurisées'}
                    </h3>
                    <p className="text-xs font-caption text-muted-foreground">
                      {language === 'ar' ?'جميع المعلومات محمية بتشفير من الدرجة العسكرية' :'Toutes les informations sont protégées par un chiffrement de مستوى عسكري'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
      
      {/* Emergency Overlay */}
      <EmergencyOverlay 
        isVisible={showEmergencyOverlay}
        onClose={handleEmergencyClose}
        triggerReason="mood_pattern_concern"
      />
    </div>
  );
};

export default DashboardHome;