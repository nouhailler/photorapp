import React, { useState } from 'react';
import { useHelp } from '../context/useHelp';

export const OnboardingModal: React.FC = () => {
  const { showLegalModal, closeLegalModal, hasAcceptedLegal, acceptLegalTerms } = useHelp();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [agreed, setAgreed] = useState<boolean>(hasAcceptedLegal);

  if (!showLegalModal) return null;

  const handleFinish = () => {
    if (agreed) {
      acceptLegalTerms();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface border border-outline-variant/30 rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[24px]">photo_library</span>
            </div>
            <div>
              <h3 className="text-headline-sm font-bold text-on-surface">Bienvenue sur Gallery Pro</h3>
              <p className="text-[11px] text-on-surface-variant font-medium">Guide d'accueil & Mentions légales obligatoires</p>
            </div>
          </div>
          {hasAcceptedLegal && (
            <button
              onClick={closeLegalModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/40"
              title="Fermer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        {/* Content Tabs / Steps */}
        <div className="my-4 flex items-center justify-center gap-2">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => setCurrentStep(step)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentStep === step ? 'w-8 bg-primary' : 'w-2 bg-outline-variant/40'
              }`}
              title={`Étape ${step}`}
            />
          ))}
        </div>

        {/* Body content based on step */}
        <div className="overflow-y-auto flex-grow space-y-4 pr-1">
          {currentStep === 1 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary/20 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
                  100% Hors-ligne & Local
                </span>
                <h4 className="text-label-lg font-bold text-on-surface">Une photothèque moderne et souveraine</h4>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Gallery Pro est conçue pour stocker, organiser et retoucher vos clichés directement dans votre navigateur.
                  Aucun serveur distant, aucun compte obligatoire, et aucune publicité.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-label-xs">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">auto_awesome</span>
                  <p className="font-bold text-on-surface">Outils Intelligents</p>
                  <p className="text-on-surface-variant">Détection de flou, doublons stricts SHA-256 et albums automatiques.</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">download_for_offline</span>
                  <p className="font-bold text-on-surface">Installez l'App</p>
                  <p className="text-on-surface-variant">Ajoutez Gallery Pro sur votre écran d'accueil comme une application native.</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="text-label-lg font-bold text-on-surface">Guide pour les utilisateurs novices</h4>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Pour vous accompagner à chaque étape, des <strong>infobulles d'aide interactives <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px]">?</span></strong> sont disposées à côté de chaque champ, bouton et filtre.
                </p>
              </div>

              <div className="space-y-2 text-label-sm text-on-surface-variant">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">menu</span>
                  <span><strong>Menu Hamburger :</strong> Accédez à toutes les sections classées par catégories.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">archive</span>
                  <span><strong>Sauvegardes régulières :</strong> Exportez vos archives ZIP depuis l'onglet Sauvegarde.</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                  <span><strong>Auto-Ajustement :</strong> Sublimez vos images en un clic dans l'éditeur.</span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-label-md">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                  <span>Mentions Légales & Décharge de Responsabilité</span>
                </div>
                <div className="text-[11px] leading-relaxed text-on-surface-variant space-y-2 max-h-44 overflow-y-auto pr-1">
                  <p>
                    <strong>1. Responsabilité des données fournies :</strong> L'auteur, développeur et éditeur de l'application Gallery Pro décline expressément toute responsabilité concernant les données, images, fichiers, métadonnées ou contenus importés, traités, affichés ou stockés dans l'application par l'utilisateur.
                  </p>
                  <p>
                    <strong>2. Stockage local et absence de garantie :</strong> Les données sont hébergées exclusivement en local dans la base IndexedDB du navigateur de votre appareil. L'auteur ne saurait en aucun cas être tenu responsable d'une perte fortuite, d'une corruption de données, d'une altération de fichier ou d'un effacement consécutif au vidage du cache du navigateur ou à une panne matérielle.
                  </p>
                  <p>
                    <strong>3. Obligation de sauvegarde de l'utilisateur :</strong> L'utilisateur est seul et unique responsable de la sauvegarde régulière et préalable de ses photographies originales en utilisant les fonctions d'export ZIP et de sauvegarde intégrale prévues dans l'application.
                  </p>
                  <p>
                    <strong>4. Propriété intellectuelle :</strong> L'utilisateur garantit détenir l'ensemble des droits nécessaires sur les contenus qu'il importe dans l'application.
                  </p>
                </div>
              </div>

              {/* Checkbox obligatoire */}
              <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded mt-0.5 cursor-pointer"
                />
                <span className="text-[12px] font-semibold text-on-surface leading-tight">
                  J'ai lu, compris et j'accepte expressément les mentions légales et la décharge de responsabilité concernant les données.
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex justify-between items-center pt-3 border-t border-outline-variant/20">
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="px-4 py-2 rounded-xl text-label-sm font-semibold text-on-surface-variant hover:bg-surface-variant/30"
            >
              Précédent
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md active:scale-95 shadow-md flex items-center gap-1"
            >
              <span>Suivant</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!agreed}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md active:scale-95 shadow-md disabled:opacity-40 transition-all"
            >
              Commencer à utiliser l'application
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
