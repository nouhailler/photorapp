import React, { useState, useCallback, useEffect } from 'react';
import {
  LanguageContext,
  APP_LANG_STORAGE_KEY,
  type AppLang,
} from './languageContextDef';

function readInitialLang(): AppLang {
  if (typeof window === 'undefined') return 'fr';
  try {
    const pathname = window.location?.pathname || '';
    if (pathname === '/en' || window.location?.search?.includes('lang=en')) {
      return 'en';
    }
    const saved = window.localStorage?.getItem(APP_LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'fr') {
      return saved;
    }
  } catch {
    // Ignore storage access errors
  }
  return 'fr';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<AppLang>(readInitialLang);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((nextLang: AppLang) => {
    setLangState((prev) => (prev === nextLang ? prev : nextLang));
    try {
      window.localStorage?.setItem(APP_LANG_STORAGE_KEY, nextLang);
    } catch {
      // Ignore storage access errors
    }
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((prev) => {
      const next: AppLang = prev === 'fr' ? 'en' : 'fr';
      try {
        window.localStorage?.setItem(APP_LANG_STORAGE_KEY, next);
      } catch {
        // Ignore storage access errors
      }
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, isEn: lang === 'en', setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
