import { useContext } from 'react';
import { LanguageContext } from './languageContextDef';

export const useLanguage = () => useContext(LanguageContext);
