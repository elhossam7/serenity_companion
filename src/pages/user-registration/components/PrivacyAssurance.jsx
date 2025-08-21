import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const PrivacyAssurance = () => {
  const [language, setLanguage] = useState('fr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Votre Confidentialité est Notre Priorité',
      dataProtection: 'Protection des Données',
      dataProtectionDesc: 'Vos informations personnelles sont chiffrées et stockées de manière sécurisée selon les normes internationales.',
      culturalSensitivity: 'Sensibilité Culturelle',
      culturalSensitivityDesc: 'Notre plateforme respecte les valeurs islamiques et la culture marocaine dans tous les aspects.',
      healthcareCompliance: 'Conformité Médicale',
      healthcareComplianceDesc: 'Certifié par les autorités sanitaires marocaines pour la confidentialité des données de santé mentale.',
      localSupport: 'Support Local',
      localSupportDesc: 'Équipe de support basée au Maroc, comprenant les nuances culturelles et linguistiques.'
    },
    ar: {
      title: 'خصوصيتك هي أولويتنا',
      dataProtection: 'حماية البيانات',
      dataProtectionDesc: 'معلوماتك الشخصية مشفرة ومحفوظة بأمان وفقاً للمعايير الدولية.',
      culturalSensitivity: 'الحساسية الثقافية',
      culturalSensitivityDesc: 'منصتنا تحترم القيم الإسلامية والثقافة المغربية في جميع الجوانب.',
      healthcareCompliance: 'الامتثال الطبي',
      healthcareComplianceDesc: 'معتمد من السلطات الصحية المغربية لسرية بيانات الصحة النفسية.',
      localSupport: 'الدعم المحلي',
      localSupportDesc: 'فريق دعم مقره في المغرب، يفهم الفروق الثقافية واللغوية.'
    }
  };

  const t = translations?.[language];

  const assuranceItems = [
    {
      icon: 'Shield',
      title: t?.dataProtection,
      description: t?.dataProtectionDesc,
      color: 'text-primary'
    },
    {
      icon: 'Heart',
      title: t?.culturalSensitivity,
      description: t?.culturalSensitivityDesc,
      color: 'text-secondary'
    },
    {
      icon: 'Award',
      title: t?.healthcareCompliance,
      description: t?.healthcareComplianceDesc,
      color: 'text-accent'
    },
    {
      icon: 'Users',
      title: t?.localSupport,
      description: t?.localSupportDesc,
      color: 'text-success'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 cultural-pattern">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Lock" size={24} color="var(--color-primary)" />
        </div>
        <h3 className="text-lg font-heading font-semibold text-foreground">
          {t?.title}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assuranceItems?.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors duration-200">
            <div className={`w-8 h-8 rounded-lg bg-background flex items-center justify-center flex-shrink-0 ${item?.color}`}>
              <Icon name={item?.icon} size={16} color="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-body font-medium text-foreground mb-1">
                {item?.title}
              </h4>
              <p className="text-xs font-caption text-muted-foreground leading-relaxed">
                {item?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-center space-x-4 text-xs font-caption text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={12} color="var(--color-success)" />
            <span>ISO 27001</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={12} color="var(--color-success)" />
            <span>GDPR</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="CheckCircle" size={12} color="var(--color-success)" />
            <span>{language === 'fr' ? 'Certifié MA' : 'معتمد المغرب'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyAssurance;