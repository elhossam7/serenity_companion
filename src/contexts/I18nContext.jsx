import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const DirContext = createContext({ dir: 'ltr', setLanguage: () => {} });

export const I18nProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', i18n.language);
      document.documentElement.setAttribute('dir', dir);
    }
    try { localStorage.setItem('language', i18n.language); } catch {}
  }, [i18n.language, dir]);

  const setLanguage = (lng) => i18n.changeLanguage(lng);

  return (
    <DirContext.Provider value={{ dir, setLanguage }}>
      {children}
    </DirContext.Provider>
  );
};

export const useI18n = () => useContext(DirContext);
