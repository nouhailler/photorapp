import React, { useState } from 'react';
import { HelpContext } from './helpContextDef';

const STORAGE_KEYS = {
  HELP_MODE: 'gallery_pro_help_mode_active',
  LEGAL_ACCEPTED: 'gallery_pro_legal_accepted',
};

export const HelpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mode débutant / infobulles actif par défaut pour guider les utilisateurs novices
  const [isHelpModeActive, setIsHelpModeActive] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HELP_MODE);
    return saved !== null ? saved === 'true' : true;
  });

  // Statut d'acceptation des mentions légales et non-responsabilité
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.LEGAL_ACCEPTED) === 'true';
  });

  // Modal des mentions légales affiché automatiquement au 1er lancement si non accepté
  const [showLegalModal, setShowLegalModal] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.LEGAL_ACCEPTED) !== 'true';
  });

  const toggleHelpMode = () => {
    setIsHelpModeActive((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEYS.HELP_MODE, next ? 'true' : 'false');
      return next;
    });
  };

  const setHelpMode = (active: boolean) => {
    setIsHelpModeActive(active);
    localStorage.setItem(STORAGE_KEYS.HELP_MODE, active ? 'true' : 'false');
  };

  const openLegalModal = () => setShowLegalModal(true);
  const closeLegalModal = () => {
    if (hasAcceptedLegal) {
      setShowLegalModal(false);
    }
  };

  const acceptLegalTerms = () => {
    localStorage.setItem(STORAGE_KEYS.LEGAL_ACCEPTED, 'true');
    setHasAcceptedLegal(true);
    setShowLegalModal(false);
  };

  return (
    <HelpContext.Provider
      value={{
        isHelpModeActive,
        toggleHelpMode,
        setHelpMode,
        showLegalModal,
        openLegalModal,
        closeLegalModal,
        hasAcceptedLegal,
        acceptLegalTerms,
      }}
    >
      {children}
    </HelpContext.Provider>
  );
};
