import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MockCredentialsDisplay = () => {
  const [language, setLanguage] = useState('fr');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Comptes de démonstration',
      subtitle: 'Utilisez ces identifiants pour tester l\'application',
      showCredentials: 'Afficher les identifiants',
      hideCredentials: 'Masquer les identifiants',
      copyEmail: 'Copier l\'email',
      copyPassword: 'Copier le mot de passe',
      copied: 'Copié !',
      user1: 'Utilisateur Standard',
      user2: 'Utilisateur Mobile',
      user3: 'Utilisateur Premium'
    },
    ar: {
      title: 'حسابات تجريبية',
      subtitle: 'استخدم هذه البيانات لتجربة التطبيق',
      showCredentials: 'إظهار البيانات',
      hideCredentials: 'إخفاء البيانات',
      copyEmail: 'نسخ البريد الإلكتروني',
      copyPassword: 'نسخ كلمة المرور',
      copied: 'تم النسخ!',
      user1: 'مستخدم عادي',
      user2: 'مستخدم الهاتف',
      user3: 'مستخدم مميز'
    }
  };

  const t = translations?.[language];

  const mockCredentials = [
    {
      id: 1,
      name: t?.user1,
      email: 'user@serenity.ma',
      password: 'serenity123',
      icon: 'User'
    },
    {
      id: 2,
      name: t?.user2,
      email: '+212 661 234 567',
      password: 'wellness456',
      icon: 'Smartphone'
    },
    {
      id: 3,
      name: t?.user3,
      email: 'ahmed@gmail.com',
      password: 'mental789',
      icon: 'Crown'
    }
  ];

  const copyToClipboard = async (text, type) => {
    try {
      await navigator.clipboard?.writeText(text);
  // TODO: Replace with a toast notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <div className="text-center mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          iconName={isVisible ? 'EyeOff' : 'Eye'}
          iconPosition="left"
          iconSize={16}
          className="text-xs"
        >
          {isVisible ? t?.hideCredentials : t?.showCredentials}
        </Button>
      </div>
      {isVisible && (
        <div className="space-y-4 p-4 bg-muted/30 border border-border rounded-lg">
          <div className="text-center mb-4">
            <h4 className="text-sm font-heading font-medium text-foreground mb-1">
              {t?.title}
            </h4>
            <p className="text-xs font-caption text-muted-foreground">
              {t?.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {mockCredentials?.map((cred) => (
              <div
                key={cred?.id}
                className="p-3 bg-card border border-border rounded-lg space-y-2"
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Icon name={cred?.icon} size={16} color="var(--color-primary)" />
                  <span className="text-xs font-body font-medium text-foreground">
                    {cred?.name}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground flex-1 mr-2">
                      {cred?.email}
                    </span>
                    <button
                      onClick={() => copyToClipboard(cred?.email, 'Email')}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icon name="Copy" size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-muted-foreground flex-1 mr-2">
                      {cred?.password}
                    </span>
                    <button
                      onClick={() => copyToClipboard(cred?.password, 'Password')}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      <Icon name="Copy" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-2">
            <p className="text-xs font-caption text-muted-foreground">
              <Icon name="Info" size={12} className="inline mr-1" />
              Ces identifiants sont uniquement pour la démonstration
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MockCredentialsDisplay;