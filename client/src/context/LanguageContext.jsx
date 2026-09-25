import React, { createContext, useContext, useState, useEffect } from 'react';
import { languages, translations } from '../translations/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('sarkari_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('sarkari_lang', currentLang);
  }, [currentLang]);

  const t = (key) => {
    const langDict = translations[currentLang] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage: setCurrentLang, languages, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
