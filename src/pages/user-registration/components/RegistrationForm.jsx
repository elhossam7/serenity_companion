import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';


const RegistrationForm = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState('fr');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    primaryLanguage: 'fr',
    location: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'fr';
    setLanguage(savedLanguage);
  }, []);

  const translations = {
    fr: {
      title: 'Créer un Compte',
      subtitle: 'Rejoignez Serenity Companion pour votre bien-être mental',
      personalInfo: 'Informations Personnelles',
      fullName: 'Nom Complet',
      fullNamePlaceholder: 'Entrez votre nom complet',
      email: 'Adresse Email',
      emailPlaceholder: 'votre@email.com',
      phone: 'Numéro de Téléphone',
      phonePlaceholder: '+212 6XX XXX XXX',
      accountSecurity: 'Sécurité du Compte',
      password: 'Mot de Passe',
      passwordPlaceholder: 'Créez un mot de passe sécurisé',
      confirmPassword: 'Confirmer le Mot de Passe',
      confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
      passwordStrength: 'Force du mot de passe',
      weak: 'Faible',
      medium: 'Moyen',
      strong: 'Fort',
      culturalPreferences: 'Préférences Culturelles',
      primaryLanguage: 'Langue Principale',
      location: 'Localisation',
      termsAgreement: 'J\'accepte les Conditions d\'Utilisation',
      privacyAgreement: 'J\'accepte la Politique de Confidentialité',
      createAccount: 'Créer un Compte',
      alreadyHaveAccount: 'Vous avez déjà un compte ?',
      signIn: 'Se Connecter',
      orContinueWith: 'Ou continuer avec',
      google: 'Google',
      facebook: 'Facebook'
    },
    ar: {
      title: 'إنشاء حساب',
      subtitle: 'انضم إلى Serenity Companion لصحتك النفسية',
      personalInfo: 'المعلومات الشخصية',
      fullName: 'الاسم الكامل',
      fullNamePlaceholder: 'أدخل اسمك الكامل',
      email: 'عنوان البريد الإلكتروني',
      emailPlaceholder: 'your@email.com',
      phone: 'رقم الهاتف',
      phonePlaceholder: '+212 6XX XXX XXX',
      accountSecurity: 'أمان الحساب',
      password: 'كلمة المرور',
      passwordPlaceholder: 'أنشئ كلمة مرور آمنة',
      confirmPassword: 'تأكيد كلمة المرور',
      confirmPasswordPlaceholder: 'أكد كلمة المرور',
      passwordStrength: 'قوة كلمة المرور',
      weak: 'ضعيف',
      medium: 'متوسط',
      strong: 'قوي',
      culturalPreferences: 'التفضيلات الثقافية',
      primaryLanguage: 'اللغة الأساسية',
      location: 'الموقع',
      termsAgreement: 'أوافق على شروط الاستخدام',
      privacyAgreement: 'أوافق على سياسة الخصوصية',
      createAccount: 'إنشاء حساب',
      alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
      signIn: 'تسجيل الدخول',
      orContinueWith: 'أو المتابعة مع',
      google: 'جوجل',
      facebook: 'فيسبوك'
    }
  };

  const t = translations?.[language];

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'العربية (Darija)' }
  ];

  const locationOptions = [
    { value: 'casablanca', label: language === 'fr' ? 'Casablanca' : 'الدار البيضاء' },
    { value: 'rabat', label: language === 'fr' ? 'Rabat' : 'الرباط' },
    { value: 'marrakech', label: language === 'fr' ? 'Marrakech' : 'مراكش' },
    { value: 'fes', label: language === 'fr' ? 'Fès' : 'فاس' },
    { value: 'tangier', label: language === 'fr' ? 'Tanger' : 'طنجة' },
    { value: 'agadir', label: language === 'fr' ? 'Agadir' : 'أكادير' },
    { value: 'diaspora', label: language === 'fr' ? 'Diaspora Marocaine' : 'الشتات المغربي' }
  ];

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength += 1;
    if (/[A-Z]/?.test(password)) strength += 1;
    if (/[a-z]/?.test(password)) strength += 1;
    if (/[0-9]/?.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/?.test(password)) strength += 1;
    return Math.min(strength, 3);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Clear errors when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = language === 'fr' ? 'Le nom est requis' : 'الاسم مطلوب';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = language === 'fr' ? 'L\'email est requis' : 'البريد الإلكتروني مطلوب';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = language === 'fr' ? 'Email invalide' : 'بريد إلكتروني غير صالح';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = language === 'fr' ? 'Le téléphone est requis' : 'رقم الهاتف مطلوب';
    }

    if (!formData?.password) {
      newErrors.password = language === 'fr' ? 'Le mot de passe est requis' : 'كلمة المرور مطلوبة';
    } else if (formData?.password?.length < 8) {
      newErrors.password = language === 'fr' ? 'Minimum 8 caractères' : 'الحد الأدنى 8 أحرف';
    }

    if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = language === 'fr' ? 'Les mots de passe ne correspondent pas' : 'كلمات المرور غير متطابقة';
    }

    if (!formData?.location) {
      newErrors.location = language === 'fr' ? 'La localisation est requise' : 'الموقع مطلوب';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = language === 'fr' ? 'Vous devez accepter les conditions' : 'يجب قبول الشروط';
    }

    if (!formData?.agreeToPrivacy) {
      newErrors.agreeToPrivacy = language === 'fr' ? 'Vous devez accepter la politique de confidentialité' : 'يجب قبول سياسة الخصوصية';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Mock registration process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful registration
      localStorage.setItem('authToken', 'mock-auth-token-12345');
      localStorage.setItem('user', JSON.stringify({
        id: 'user-123',
        name: formData?.fullName,
        email: formData?.email,
        language: formData?.primaryLanguage,
        location: formData?.location
      }));
      
      navigate('/dashboard-home');
    } catch (error) {
      setErrors({ submit: language === 'fr' ? 'Erreur lors de l\'inscription' : 'خطأ في التسجيل' });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Mock social login
    console.log(`Social login with ${provider}`);
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 1: return 'bg-error';
      case 2: return 'bg-warning';
      case 3: return 'bg-success';
      default: return 'bg-muted';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 1: return t?.weak;
      case 2: return t?.medium;
      case 3: return t?.strong;
      default: return '';
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-heading font-semibold text-foreground mb-2">
          {t?.title}
        </h1>
        <p className="text-muted-foreground font-body">
          {t?.subtitle}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-medium text-foreground border-b border-border pb-2">
            {t?.personalInfo}
          </h2>
          
          <Input
            label={t?.fullName}
            type="text"
            placeholder={t?.fullNamePlaceholder}
            value={formData?.fullName}
            onChange={(e) => handleInputChange('fullName', e?.target?.value)}
            error={errors?.fullName}
            required
          />

          <Input
            label={t?.email}
            type="email"
            placeholder={t?.emailPlaceholder}
            value={formData?.email}
            onChange={(e) => handleInputChange('email', e?.target?.value)}
            error={errors?.email}
            required
          />

          <Input
            label={t?.phone}
            type="tel"
            placeholder={t?.phonePlaceholder}
            value={formData?.phone}
            onChange={(e) => handleInputChange('phone', e?.target?.value)}
            error={errors?.phone}
            required
          />
        </div>

        {/* Account Security Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-medium text-foreground border-b border-border pb-2">
            {t?.accountSecurity}
          </h2>
          
          <div className="space-y-2">
            <Input
              label={t?.password}
              type="password"
              placeholder={t?.passwordPlaceholder}
              value={formData?.password}
              onChange={(e) => handleInputChange('password', e?.target?.value)}
              error={errors?.password}
              required
            />
            
            {formData?.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-caption">
                    {t?.passwordStrength}
                  </span>
                  <span className={`font-caption font-medium ${
                    passwordStrength === 1 ? 'text-error' :
                    passwordStrength === 2 ? 'text-warning' :
                    passwordStrength === 3 ? 'text-success' : 'text-muted-foreground'
                  }`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <Input
            label={t?.confirmPassword}
            type="password"
            placeholder={t?.confirmPasswordPlaceholder}
            value={formData?.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
            error={errors?.confirmPassword}
            required
          />
        </div>

        {/* Cultural Preferences Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-heading font-medium text-foreground border-b border-border pb-2">
            {t?.culturalPreferences}
          </h2>
          
          <Select
            label={t?.primaryLanguage}
            options={languageOptions}
            value={formData?.primaryLanguage}
            onChange={(value) => handleInputChange('primaryLanguage', value)}
            required
          />

          <Select
            label={t?.location}
            options={locationOptions}
            value={formData?.location}
            onChange={(value) => handleInputChange('location', value)}
            error={errors?.location}
            required
          />
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-3">
          <Checkbox
            label={t?.termsAgreement}
            checked={formData?.agreeToTerms}
            onChange={(e) => handleInputChange('agreeToTerms', e?.target?.checked)}
            error={errors?.agreeToTerms}
            required
          />

          <Checkbox
            label={t?.privacyAgreement}
            checked={formData?.agreeToPrivacy}
            onChange={(e) => handleInputChange('agreeToPrivacy', e?.target?.checked)}
            error={errors?.agreeToPrivacy}
            required
          />
        </div>

        {errors?.submit && (
          <div className="text-error text-sm font-caption text-center">
            {errors?.submit}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          loading={loading}
          disabled={loading}
          className="w-full"
        >
          {t?.createAccount}
        </Button>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-muted-foreground font-body text-sm">
            {t?.alreadyHaveAccount}{' '}
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={() => navigate('/user-login')}
            className="p-0 h-auto font-body text-sm"
          >
            {t?.signIn}
          </Button>
        </div>

        {/* Social Login Options */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-background text-muted-foreground font-caption">
                {t?.orContinueWith}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('google')}
              iconName="Chrome"
              iconPosition="left"
              iconSize={16}
              className="w-full"
            >
              {t?.google}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialLogin('facebook')}
              iconName="Facebook"
              iconPosition="left"
              iconSize={16}
              className="w-full"
            >
              {t?.facebook}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;