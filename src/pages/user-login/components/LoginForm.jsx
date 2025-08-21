import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const LoginForm = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('fr');
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Bon retour',
      subtitle: 'Connectez-vous pour continuer votre parcours de bien-être',
      emailOrPhone: 'Email ou Téléphone',
      emailPlaceholder: 'votre@email.com ou +212 6XX XXX XXX',
      password: 'Mot de passe',
      passwordPlaceholder: 'Entrez votre mot de passe',
      rememberMe: 'Se souvenir de moi',
      rememberDesc: 'Vos données restent sécurisées sur cet appareil',
      signIn: 'Se connecter',
      forgotPassword: 'Mot de passe oublié ?',
      newUser: 'Nouveau utilisateur ?',
      register: 'Créer un compte',
      invalidCredentials: 'Email/téléphone ou mot de passe incorrect. Veuillez réessayer.',
      requiredField: 'Ce champ est requis',
      invalidEmail: 'Format email invalide',
      invalidPhone: 'Format téléphone invalide (ex: +212 6XX XXX XXX)',
      passwordTooShort: 'Le mot de passe doit contenir au moins 6 caractères'
    },
    ar: {
      title: 'مرحباً بعودتك',
      subtitle: 'سجل الدخول لمتابعة رحلة العافية الخاصة بك',
      emailOrPhone: 'البريد الإلكتروني أو الهاتف',
      emailPlaceholder: 'your@email.com أو +212 6XX XXX XXX',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أدخل كلمة المرور',
      rememberMe: 'تذكرني',
      rememberDesc: 'بياناتك آمنة على هذا الجهاز',
      signIn: 'تسجيل الدخول',
      forgotPassword: 'نسيت كلمة المرور؟',
      newUser: 'مستخدم جديد؟',
      register: 'إنشاء حساب',
      invalidCredentials: 'البريد الإلكتروني/الهاتف أو كلمة المرور غير صحيحة. يرجى المحاولة مرة أخرى.',
      requiredField: 'هذا الحقل مطلوب',
      invalidEmail: 'تنسيق البريد الإلكتروني غير صالح',
      invalidPhone: 'تنسيق الهاتف غير صالح (مثال: +212 6XX XXX XXX)',
      passwordTooShort: 'يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل'
    }
  };

  const t = translations?.[language];

  // Mock credentials for testing
  const mockCredentials = [
    { emailOrPhone: 'user@serenity.ma', password: 'serenity123' },
    { emailOrPhone: '+212 661 234 567', password: 'wellness456' },
    { emailOrPhone: 'ahmed@gmail.com', password: 'mental789' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.emailOrPhone?.trim()) {
      newErrors.emailOrPhone = t?.requiredField;
    } else {
      const isEmail = formData?.emailOrPhone?.includes('@');
      const isPhone = formData?.emailOrPhone?.startsWith('+212');
      
      if (isEmail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex?.test(formData?.emailOrPhone)) {
          newErrors.emailOrPhone = t?.invalidEmail;
        }
      } else if (isPhone) {
        const phoneRegex = /^\+212\s?[5-7]\d{8}$/;
        if (!phoneRegex?.test(formData?.emailOrPhone?.replace(/\s/g, ''))) {
          newErrors.emailOrPhone = t?.invalidPhone;
        }
      } else {
        newErrors.emailOrPhone = t?.invalidEmail;
      }
    }

    if (!formData?.password) {
      newErrors.password = t?.requiredField;
    } else if (formData?.password?.length < 6) {
      newErrors.password = t?.passwordTooShort;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const isValidCredentials = mockCredentials?.some(
        cred => cred?.emailOrPhone === formData?.emailOrPhone && cred?.password === formData?.password
      );

      if (isValidCredentials) {
        // Store auth token and user data
        localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Utilisateur',
          email: formData?.emailOrPhone?.includes('@') ? formData?.emailOrPhone : 'user@serenity.ma',
          phone: formData?.emailOrPhone?.startsWith('+212') ? formData?.emailOrPhone : null,
          language: language,
          joinedDate: new Date()?.toISOString()
        }));

        if (formData?.rememberMe) {
          localStorage.setItem('rememberLogin', 'true');
        }

        navigate('/dashboard-home');
      } else {
        setErrors({ general: t?.invalidCredentials });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    // Navigate to forgot password flow (not implemented in this scope)
    console.log('Navigate to forgot password');
  };

  const handleRegister = () => {
    navigate('/user-registration');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-semibold text-foreground mb-3">
          {t?.title}
        </h1>
        <p className="text-base font-body text-muted-foreground">
          {t?.subtitle}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors?.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="AlertCircle" size={20} color="var(--color-error)" />
              <p className="text-sm font-body text-error">
                {errors?.general}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Input
            label={t?.emailOrPhone}
            type="text"
            placeholder={t?.emailPlaceholder}
            value={formData?.emailOrPhone}
            onChange={(e) => handleInputChange('emailOrPhone', e?.target?.value)}
            error={errors?.emailOrPhone}
            required
            className="w-full"
          />

          <div className="relative">
            <Input
              label={t?.password}
              type={showPassword ? 'text' : 'password'}
              placeholder={t?.passwordPlaceholder}
              value={formData?.password}
              onChange={(e) => handleInputChange('password', e?.target?.value)}
              error={errors?.password}
              required
              className="w-full pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            checked={formData?.rememberMe}
            onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
            className="mt-1"
          />
          <div className="flex-1">
            <label className="text-sm font-body text-foreground cursor-pointer">
              {t?.rememberMe}
            </label>
            <p className="text-xs font-caption text-muted-foreground mt-1">
              {t?.rememberDesc}
            </p>
          </div>
        </div>

        <Button
          type="submit"
          variant="default"
          size="lg"
          loading={isLoading}
          disabled={isLoading}
          className="w-full"
        >
          {t?.signIn}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm font-body text-primary hover:text-primary/80 transition-colors"
          >
            {t?.forgotPassword}
          </button>
        </div>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-sm font-body text-muted-foreground">
            {t?.newUser}{' '}
            <button
              type="button"
              onClick={handleRegister}
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {t?.register}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;