import React, { useEffect } from 'react';
import Header from '../../components/ui/Header';
import BottomNavigation from '../../components/ui/BottomNavigation';
import RegistrationForm from './components/RegistrationForm';
import PrivacyAssurance from './components/PrivacyAssurance';
import CulturalPatternBackground from './components/CulturalPatternBackground';

const UserRegistration = () => {
  useEffect(() => {
    document.title = 'Inscription - Serenity Companion';
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16 pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Registration Form */}
              <div className="order-2 lg:order-1">
                <CulturalPatternBackground className="bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-soft-lg">
                  <RegistrationForm />
                </CulturalPatternBackground>
              </div>

              {/* Privacy Assurance */}
              <div className="order-1 lg:order-2 space-y-6">
                <PrivacyAssurance />
                
                {/* Additional Trust Signals */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-success"
                      >
                        <path
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
                      Rejoignez 10,000+ Utilisateurs
                    </h3>
                    <p className="text-sm font-body text-muted-foreground">
                      Des milliers de Marocains font déjà confiance à Serenity Companion pour leur bien-être mental.
                    </p>
                  </div>
                </div>

                {/* Cultural Sensitivity Badge */}
                <div className="bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20 rounded-xl p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="text-secondary"
                      >
                        <path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-body font-medium text-foreground">
                        Respectueux de la Culture Islamique
                      </h4>
                      <p className="text-xs font-caption text-muted-foreground">
                        Conçu avec sensibilité pour les valeurs marocaines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default UserRegistration;