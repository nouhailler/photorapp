import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Si l'application est déjà lancée en mode PWA autonome (installée sur mobile ou desktop)
  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-label-xs font-semibold">
        <span className="material-symbols-outlined text-[16px] material-symbols-fill">check_circle</span>
        <span>App installée</span>
      </div>
    );
  }

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Fallback desktop / navigateur standard
      alert(
        "Pour installer Gallery Pro sur votre appareil, cliquez sur l'icône d'installation dans la barre d'adresse de votre navigateur (Chrome/Edge/Brave) ou ajoutez la page à votre écran d'accueil."
      );
    }
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-label-sm font-semibold active:scale-95 transition-all shadow-xs ${className}`}
          title="Installer l'application sur votre écran d'accueil"
        >
          <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
          <span className="hidden sm:inline">Installer l'app</span>
        </button>
      ) : variant === 'banner' ? (
        <div className={`p-4 bg-primary-container/20 rounded-2xl border border-primary/30 flex items-center justify-between gap-4 ${className}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[22px]">install_mobile</span>
            </div>
            <div>
              <p className="text-label-md font-bold text-on-surface">Installer Gallery Pro</p>
              <p className="text-[11px] text-on-surface-variant">Accédez directement à vos photos depuis votre écran d'accueil, même sans connexion.</p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl font-bold text-label-sm shadow-md active:scale-95 shrink-0"
          >
            Installer
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3.5 bg-primary/10 hover:bg-primary/15 rounded-2xl border border-primary/30 text-primary font-bold text-label-sm active:scale-98 transition-all ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px]">download_for_offline</span>
            <span>Installer l'application</span>
          </div>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      )}

      {/* Guide d'installation iOS Safari */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">apple</span>
                <h3 className="text-headline-sm font-bold text-on-surface">Installation sur iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/40"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-body-sm text-on-surface-variant">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p>Dans <strong>Safari</strong>, touchez le bouton <strong>Partager</strong> <span className="material-symbols-outlined text-[16px] inline align-middle">ios_share</span> au bas de l'écran.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p>Faites défiler le menu et sélectionnez <strong>Sur l'écran d'accueil</strong> <span className="material-symbols-outlined text-[16px] inline align-middle">add_box</span>.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-[12px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p>Touchez <strong>Ajouter</strong> en haut à droite. L'icône Gallery Pro sera alors disponible sur votre écran d'accueil comme une application native !</p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-primary text-on-primary rounded-xl font-bold text-label-md active:scale-95 shadow-md"
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
};
