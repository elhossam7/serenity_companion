import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      common: {
        appName: 'Serenity Companion',
        languageName: 'العربية',
      },
      profile: {
        title: 'Profil',
        basicInfo: 'Informations de base',
        displayName: 'Nom affiché',
        fullName: 'Nom complet',
        phone: 'Téléphone',
        dob: 'Date de naissance',
        timezone: 'Fuseau horaire',
        avatarUrl: 'URL de l’avatar',
        uploadAvatar: 'Télécharger un avatar (optionnel)',
        emergencyContacts: 'Contacts d’urgence',
        name: 'Nom',
        relation: 'Relation',
        addContact: 'Ajouter un contact',
        preferences: 'Préférences',
        language: 'Langue',
        theme: 'Thème',
        defaultPrivacy: 'Confidentialité par défaut du journal',
        save: 'Enregistrer le profil',
        complete: 'complété'
      },
      settings: {
        title: 'Paramètres',
        reminders: 'Rappels',
        enableNotifications: 'Activer les notifications',
        notificationsEnabled: 'Notifications activées',
        optInReminders: 'S’inscrire aux rappels périodiques',
        sendTest: 'Envoyer un test',
        analytics: 'Analytique',
        analyticsDesc: 'Analytique anonyme respectueuse de la vie privée.',
        analyticsOptIn: 'S’inscrire à l’analytique anonyme',
        display: 'Affichage',
        system: 'Système',
        light: 'Clair',
        dark: 'Sombre'
      },
      legal: {
        privacy: 'Confidentialité',
        terms: 'Conditions',
        disclaimers: 'Avertissements'
      }
    },
  },
  ar: {
    translation: {
      common: {
        appName: 'مرافق الصفاء',
        languageName: 'Français',
      },
      profile: {
        title: 'الملف الشخصي',
        basicInfo: 'المعلومات الأساسية',
        displayName: 'اسم العرض',
        fullName: 'الاسم الكامل',
        phone: 'الهاتف',
        dob: 'تاريخ الميلاد',
        timezone: 'المنطقة الزمنية',
        avatarUrl: 'رابط الصورة الرمزية',
        uploadAvatar: 'تحميل صورة رمزية (اختياري)',
        emergencyContacts: 'جهات اتصال الطوارئ',
        name: 'الاسم',
        relation: 'العلاقة',
        addContact: 'إضافة جهة اتصال',
        preferences: 'التفضيلات',
        language: 'اللغة',
        theme: 'السِمة',
        defaultPrivacy: 'خصوصية اليوميات الافتراضية',
        save: 'حفظ الملف الشخصي',
        complete: 'مكتمل'
      },
      settings: {
        title: 'الإعدادات',
        reminders: 'التذكيرات',
        enableNotifications: 'تفعيل الإشعارات',
        notificationsEnabled: 'تم تفعيل الإشعارات',
        optInReminders: 'الاشتراك في التذكيرات الدورية',
        sendTest: 'إرسال تجربة',
        analytics: 'التحليلات',
        analyticsDesc: 'تحليلات مجهولة تحترم الخصوصية.',
        analyticsOptIn: 'الاشتراك في التحليلات المجهولة',
        display: 'العرض',
        system: 'النظام',
        light: 'فاتح',
        dark: 'داكن'
      },
      legal: {
        privacy: 'سياسة الخصوصية',
        terms: 'الشروط',
        disclaimers: 'إخلاء المسؤولية'
      }
    },
  },
  en: {
    translation: {
      common: {
        appName: 'Serenity Companion',
        languageName: 'english',
      },
      profile: {
        title: 'Profile',
        basicInfo: 'Basic info',
        displayName: 'Display name',
        fullName: 'Full name',
        phone: 'Phone',
        dob: 'Date of birth',
        timezone: 'Timezone',
        avatarUrl: 'Avatar URL',
        uploadAvatar: 'Upload avatar (optional)',
        emergencyContacts: 'Emergency contacts',
        name: 'Name',
        relation: 'Relation',
        addContact: 'Add contact',
        preferences: 'Preferences',
        language: 'Language',
        theme: 'Theme',
        defaultPrivacy: 'Default journal privacy',
        save: 'Save profile',
        complete: 'complete'
      },
      settings: {
        title: 'Settings',
        reminders: 'Reminders',
        enableNotifications: 'Enable Notifications',
        notificationsEnabled: 'Notifications Enabled',
        optInReminders: 'Opt-in to periodic reminders',
        sendTest: 'Send test',
        analytics: 'Analytics',
        analyticsDesc: 'Privacy-friendly, anonymous usage analytics.',
        analyticsOptIn: 'Opt-in to anonymous analytics',
        display: 'Display',
        system: 'System',
        light: 'Light',
        dark: 'Dark'
      },
      legal: {
        privacy: 'Privacy',
        terms: 'Terms',
        disclaimers: 'Disclaimers'
      }
    },
  },
};

const saved = typeof window !== 'undefined' ? localStorage.getItem('language') : null;
const fallbackLng = saved || 'fr';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: fallbackLng,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
