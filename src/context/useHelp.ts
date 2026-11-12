import { useContext } from 'react';
import { HelpContext, defaultHelpContext } from './helpContextDef';
import type { HelpContextType } from './helpContextDef';

export const useHelp = (): HelpContextType => {
  const context = useContext(HelpContext);
  if (!context) {
    return defaultHelpContext;
  }
  return context;
};

export type { HelpContextType };
