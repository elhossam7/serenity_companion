import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      common: {
        appName: 'Serenity Companion',
        languageName: 'العربية',
      },
    },
  },
  ar: {
    translation: {
      common: {
        appName: 'مرافق الصفاء',
        languageName: 'Français',
      },
    },
  },
  en: {
    translation: {
      common: {
        appName: 'Serenity Companion',
        languageName: 'english',
      },
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
