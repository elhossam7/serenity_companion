import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useTranslation } from 'react-i18next';

const EmergencyOverlay = ({ isVisible, onClose, triggerReason = 'crisis_detected' }) => {
  const { i18n } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  const handleEmergencyCall = () => {
    // Morocco emergency mental health services
    window.open('tel:141', '_self'); // Morocco emergency number
  };

  const handleCrisisChat = () => {
    // Redirect to professional crisis chat service
    window.open('https://www.befrienders.org', '_blank');
  };

  const handleBreathingExercise = () => {
    // Start guided breathing exercise
    onClose();
    // Navigate to breathing exercise component
  };

  if (!isVisible && !isClosing) return null;

  const translations = {
    fr: {
      title: 'Support Immédiat Disponible',
      subtitle: 'Vous n\'êtes pas seul(e). De l\'aide est disponible maintenant.',
      description: 'Nous avons détecté que vous pourriez avoir besoin de soutien. Voici des ressources immédiates pour vous aider.',
      emergencyCall: 'Appel d\'Urgence',
      emergencyCallDesc: 'Parler à un professionnel maintenant',
      crisisChat: 'Chat de Crise',
      crisisChatDesc: 'Support écrit confidentiel',
      breathing: 'Exercice de Respiration',
      breathingDesc: 'Technique de calme guidée',
      safeReturn: 'Retour Sécurisé',
      safeReturnDesc: 'Revenir à l\'application',
      helpline: 'Ligne d\'aide: 141',
      reminder: 'Rappel: Vos données restent privées et sécurisées'
    },
    ar: {
      title: 'الدعم الفوري متاح',
      subtitle: 'لست وحدك. المساعدة متاحة الآن.',
      description: 'لقد اكتشفنا أنك قد تحتاج إلى الدعم. إليك الموارد الفورية لمساعدتك.',
      emergencyCall: 'مكالمة طوارئ',
      emergencyCallDesc: 'تحدث مع محترف الآن',
      crisisChat: 'دردشة الأزمات',
      crisisChatDesc: 'دعم كتابي سري',
      breathing: 'تمرين التنفس',
      breathingDesc: 'تقنية الهدوء الموجهة',
      safeReturn: 'العودة الآمنة',
      safeReturnDesc: 'العودة إلى التطبيق',
      helpline: 'خط المساعدة: 141',
      reminder: 'تذكير: بياناتك تبقى خاصة وآمنة'
    }
  };

  const t = translations?.[i18n.language] || translations.fr;

  return (
    <div className={`
      fixed inset-0 z-emergency bg-black/50 backdrop-blur-sm
      flex items-center justify-center p-4
      transition-all duration-300 ease-gentle
      ${isClosing ? 'opacity-0' : 'opacity-100'}
    `}>
      <div className={`
        bg-background rounded-2xl shadow-soft-xl max-w-md w-full max-h-[90vh] overflow-y-auto
        cultural-pattern
        transition-all duration-300 ease-gentle
        ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <Icon name="Heart" size={24} color="var(--color-error)" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
          
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-2">
            {t?.title}
          </h2>
          <p className="text-lg font-body text-secondary mb-3">
            {t?.subtitle}
          </p>
          <p className="text-sm font-body text-muted-foreground">
            {t?.description}
          </p>
        </div>

        {/* Emergency Actions */}
        <div className="p-6 space-y-4">
          {/* Emergency Call */}
          <Button
            variant="destructive"
            size="lg"
            onClick={handleEmergencyCall}
            iconName="Phone"
            iconPosition="left"
            iconSize={20}
            className="w-full justify-start text-left h-auto py-4"
          >
            <div className="flex flex-col items-start">
              <span className="font-body font-medium text-base">
                {t?.emergencyCall}
              </span>
              <span className="font-caption text-sm opacity-90">
                {t?.emergencyCallDesc}
              </span>
            </div>
          </Button>

          {/* Crisis Chat */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleCrisisChat}
            iconName="MessageSquare"
            iconPosition="left"
            iconSize={20}
            className="w-full justify-start text-left h-auto py-4 border-primary text-primary hover:bg-primary/5"
          >
            <div className="flex flex-col items-start">
              <span className="font-body font-medium text-base">
                {t?.crisisChat}
              </span>
              <span className="font-caption text-sm opacity-75">
                {t?.crisisChatDesc}
              </span>
            </div>
          </Button>

          {/* Breathing Exercise */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handleBreathingExercise}
            iconName="Wind"
            iconPosition="left"
            iconSize={20}
            className="w-full justify-start text-left h-auto py-4"
          >
            <div className="flex flex-col items-start">
              <span className="font-body font-medium text-base">
                {t?.breathing}
              </span>
              <span className="font-caption text-sm opacity-90">
                {t?.breathingDesc}
              </span>
            </div>
          </Button>

          {/* Safe Return */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleClose}
            iconName="ArrowLeft"
            iconPosition="left"
            iconSize={20}
            className="w-full justify-start text-left h-auto py-4"
          >
            <div className="flex flex-col items-start">
              <span className="font-body font-medium text-base">
                {t?.safeReturn}
              </span>
              <span className="font-caption text-sm opacity-75">
                {t?.safeReturnDesc}
              </span>
            </div>
          </Button>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t border-border">
          <div className="text-center space-y-2">
            <p className="text-sm font-body font-medium text-foreground">
              {t?.helpline}
            </p>
            <p className="text-xs font-caption text-muted-foreground">
              {t?.reminder}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyOverlay;