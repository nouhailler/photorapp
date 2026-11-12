import { createContext } from 'react';

export interface HelpContextType {
  isHelpModeActive: boolean;
  toggleHelpMode: () => void;
  setHelpMode: (active: boolean) => void;
  showLegalModal: boolean;
  openLegalModal: () => void;
  closeLegalModal: () => void;
  hasAcceptedLegal: boolean;
  acceptLegalTerms: () => void;
}

export const defaultHelpContext: HelpContextType = {
  isHelpModeActive: true,
  toggleHelpMode: () => {},
  setHelpMode: () => {},
  showLegalModal: false,
  openLegalModal: () => {},
  closeLegalModal: () => {},
  hasAcceptedLegal: true,
  acceptLegalTerms: () => {},
};

export const HelpContext = createContext<HelpContextType | undefined>(undefined);
