import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import LoginForm from './components/LoginForm';
import TrustSignals from './components/TrustSignals';
import MockCredentialsDisplay from './components/MockCredentialsDisplay';
import Icon from '../../components/AppIcon';

const UserLogin = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);

    // Check if user is already logged in
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      navigate('/dashboard-home');
    }
  }, [navigate]);

  const translations = {
    fr: {
      welcomeBack: 'Bienvenue dans votre espace de sérénité',
      tagline: 'Un accompagnement mental adapté à la culture marocaine'
    },
    ar: {
      welcomeBack: 'مرحباً بك في مساحة الهدوء الخاصة بك',
      tagline: 'مرافقة نفسية متكيفة مع الثقافة المغربية'
    }
  };

  const t = translations?.[language];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Desktop Layout */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-12 lg:items-start">
              {/* Left Panel - Welcome & Trust Signals */}
              <div className="space-y-8">
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center breathe">
                      <Icon name="Heart" size={32} color="white" />
                    </div>
                  </div>
                  
                  <h1 className="text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
                    {t?.welcomeBack}
                  </h1>
                  
                  <p className="text-lg font-body text-muted-foreground mb-8">
                    {t?.tagline}
                  </p>
                </div>

                <TrustSignals />
                <MockCredentialsDisplay />
              </div>

              {/* Right Panel - Login Form */}
              <div className="lg:pl-8">
                <div className="bg-card border border-border rounded-2xl p-8 shadow-soft-lg cultural-pattern">
                  <LoginForm />
                </div>
              </div>
            </div>

            {/* Mobile Layout */}
            <div className="lg:hidden space-y-8">
              {/* Mobile Header */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center breathe">
                    <Icon name="Heart" size={24} color="white" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-heading font-bold text-foreground mb-3 leading-tight">
                  {t?.welcomeBack}
                </h1>
                
                <p className="text-base font-body text-muted-foreground mb-6">
                  {t?.tagline}
                </p>
              </div>

              {/* Mobile Login Form */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-soft-lg cultural-pattern">
                <LoginForm />
              </div>

              {/* Mobile Trust Signals */}
              <TrustSignals />
              
              {/* Mobile Mock Credentials */}
              <MockCredentialsDisplay />
            </div>
          </div>
        </div>

        {/* Islamic Geometric Pattern Background */}
        <div className="fixed inset-0 pointer-events-none opacity-5 z-0">
          <div className="w-full h-full cultural-pattern"></div>
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default UserLogin;