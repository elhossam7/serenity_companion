import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = () => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Votre sécurité, notre priorité',
      healthcare: 'Certifié Santé Maroc',
      privacy: 'Données Privées & Sécurisées',
      encryption: 'Chiffrement de bout en bout',
      compliance: 'Conforme RGPD',
      users: 'Plus de 10 000 utilisateurs au Maroc',
      testimonial: `"Cette application m'a aidé à gérer mon stress quotidien avec des conseils adaptés à notre culture marocaine."`,
      testimonialAuthor: 'Fatima, Casablanca'
    },
    ar: {
      title: 'أمانك أولويتنا',
      healthcare: 'معتمد من وزارة الصحة المغربية',
      privacy: 'بيانات خاصة وآمنة',
      encryption: 'تشفير من طرف إلى طرف',
      compliance: 'متوافق مع RGPD',
      users: 'أكثر من ١٠٠٠٠ مستخدم في المغرب',
      testimonial: `"هذا التطبيق ساعدني في إدارة التوتر اليومي بنصائح مناسبة لثقافتنا المغربية."`,
      testimonialAuthor: 'فاطمة، الدار البيضاء'
    }
  };

  const t = translations?.[language];

  const trustFeatures = [
    {
      icon: 'Shield',
      text: t?.healthcare,
      color: 'var(--color-success)'
    },
    {
      icon: 'Lock',
      text: t?.privacy,
      color: 'var(--color-primary)'
    },
    {
      icon: 'Key',
      text: t?.encryption,
      color: 'var(--color-secondary)'
    },
    {
      icon: 'CheckCircle',
      text: t?.compliance,
      color: 'var(--color-accent)'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Trust Header */}
      <div className="text-center">
        <h3 className="text-lg font-heading font-medium text-foreground mb-4">
          {t?.title}
        </h3>
      </div>
      {/* Trust Features */}
      <div className="grid grid-cols-2 gap-4">
        {trustFeatures?.map((feature, index) => (
          <div
            key={index}
            className="flex flex-col items-center p-4 bg-card border border-border rounded-lg gentle-hover"
          >
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
              <Icon name={feature?.icon} size={20} color={feature?.color} />
            </div>
            <p className="text-xs font-caption text-center text-muted-foreground leading-relaxed">
              {feature?.text}
            </p>
          </div>
        ))}
      </div>
      {/* User Count */}
      <div className="text-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Icon name="Users" size={20} color="var(--color-primary)" />
          <span className="text-sm font-body font-medium text-primary">
            {t?.users}
          </span>
        </div>
      </div>
      {/* Testimonial */}
      <div className="p-4 bg-card border border-border rounded-lg cultural-pattern">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Icon name="Quote" size={16} color="var(--color-secondary)" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-body text-muted-foreground italic mb-2 leading-relaxed">
              {t?.testimonial}
            </p>
            <p className="text-xs font-caption text-foreground font-medium">
              — {t?.testimonialAuthor}
            </p>
          </div>
        </div>
      </div>
      {/* Islamic Pattern Decoration */}
      <div className="flex justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-primary/20 via-secondary/40 to-accent/20 rounded-full"></div>
      </div>
    </div>
  );
};

export default TrustSignals;