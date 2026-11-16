import { createContext } from 'react';

export type AppLang = 'fr' | 'en';

export interface LanguageContextType {
  lang: AppLang;
  isEn: boolean;
  setLang: (lang: AppLang) => void;
  toggleLang: () => void;
}

export const APP_LANG_STORAGE_KEY = 'gallery_pro_lang';

export const LanguageContext = createContext<LanguageContextType>({
  lang: 'fr',
  isEn: false,
  setLang: () => {},
  toggleLang: () => {},
});
