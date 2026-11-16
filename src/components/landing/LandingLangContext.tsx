import { createContext, useContext } from 'react';

export type LandingLang = 'fr' | 'en';

export interface LandingLangContextValue {
  lang: LandingLang;
  switchLang: (nextLang: LandingLang) => void;
}

export const LandingLangContext = createContext<LandingLangContextValue>({
  lang: 'fr',
  switchLang: () => {},
});

export function useLandingLang(): LandingLangContextValue {
  return useContext(LandingLangContext);
}
