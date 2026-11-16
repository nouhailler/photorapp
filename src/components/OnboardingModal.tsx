import React, { useState } from 'react';
import { useHelp } from '../context/useHelp';
import { useLanguage } from '../context/useLanguage';

export const OnboardingModal: React.FC = () => {
  const { showLegalModal, closeLegalModal, hasAcceptedLegal, acceptLegalTerms } = useHelp();
  const { lang } = useLanguage();
  const isEn = lang === 'en';
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
              <h3 className="text-headline-sm font-bold text-on-surface">
                {isEn ? 'Welcome to Gallery Pro' : 'Bienvenue sur Gallery Pro'}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {isEn ? 'Welcome Guide & Mandatory Legal Notice' : "Guide d'accueil & Mentions légales obligatoires"}
              </p>
            </div>
          </div>
          {hasAcceptedLegal && (
            <button
              onClick={closeLegalModal}
              className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-variant/40"
              title={isEn ? 'Close' : 'Fermer'}
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
              title={isEn ? `Step ${step}` : `Étape ${step}`}
            />
          ))}
        </div>

        {/* Body content based on step */}
        <div className="overflow-y-auto flex-grow space-y-4 pr-1">
          {currentStep === 1 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-primary-container/20 rounded-2xl border border-primary/20 space-y-2">
                <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-wider">
                  {isEn ? '100% Offline & Local' : '100% Hors-ligne & Local'}
                </span>
                <h4 className="text-label-lg font-bold text-on-surface">
                  {isEn ? 'A modern, self-sovereign photo library' : 'Une photothèque moderne et souveraine'}
                </h4>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {isEn
                    ? 'Gallery Pro is designed to store, organize, and edit your photos directly inside your browser. No remote servers, no mandatory account, and zero ads.'
                    : 'Gallery Pro est conçue pour stocker, organiser et retoucher vos clichés directement dans votre navigateur. Aucun serveur distant, aucun compte obligatoire, et aucune publicité.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-label-xs">
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">auto_awesome</span>
                  <p className="font-bold text-on-surface">{isEn ? 'Smart Tools' : 'Outils Intelligents'}</p>
                  <p className="text-on-surface-variant">
                    {isEn
                      ? 'Blur detection, strict SHA-256 duplicates, and smart albums.'
                      : 'Détection de flou, doublons stricts SHA-256 et albums automatiques.'}
                  </p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
                  <span className="material-symbols-outlined text-primary text-[20px] mb-1">download_for_offline</span>
                  <p className="font-bold text-on-surface">{isEn ? 'Install the App' : "Installez l'App"}</p>
                  <p className="text-on-surface-variant">
                    {isEn
                      ? 'Add Gallery Pro to your home screen just like a native app.'
                      : "Ajoutez Gallery Pro sur votre écran d'accueil comme une application native."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-surface-container-low rounded-2xl border border-outline-variant/30 space-y-2">
                <h4 className="text-label-lg font-bold text-on-surface">
                  {isEn ? 'Guide for New Users' : 'Guide pour les utilisateurs novices'}
                </h4>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  {isEn ? (
                    <>
                      To help you every step of the way, <strong>interactive help tooltips <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px]">?</span></strong> sit next to key fields, buttons, and filters.
                    </>
                  ) : (
                    <>
                      Pour vous accompagner à chaque étape, des <strong>infobulles d'aide interactives <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/20 text-primary font-bold text-[10px]">?</span></strong> sont disposées à côté de chaque champ, bouton et filtre.
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-2 text-label-sm text-on-surface-variant">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">menu</span>
                  <span>
                    <strong>{isEn ? 'Hamburger Menu:' : 'Menu Hamburger :'}</strong>{' '}
                    {isEn ? 'Access every section organized by category.' : 'Accédez à toutes les sections classées par catégories.'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">archive</span>
                  <span>
                    <strong>{isEn ? 'Regular Backups:' : 'Sauvegardes régulières :'}</strong>{' '}
                    {isEn ? 'Export full ZIP archives from the Backup tab.' : "Exportez vos archives ZIP depuis l'onglet Sauvegarde."}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-[18px]">tune</span>
                  <span>
                    <strong>{isEn ? 'Auto-Adjust:' : 'Auto-Ajustement :'}</strong>{' '}
                    {isEn ? 'Enhance your photos in one click inside the editor.' : "Sublimez vos images en un clic dans l'éditeur."}
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-3 animate-in fade-in">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-label-md">
                  <span className="material-symbols-outlined text-[20px]">gavel</span>
                  <span>
                    {isEn ? 'Legal Notice & Liability Disclaimer' : 'Mentions Légales & Décharge de Responsabilité'}
                  </span>
                </div>
                <div className="text-[11px] leading-relaxed text-on-surface-variant space-y-2 max-h-44 overflow-y-auto pr-1">
                  {isEn ? (
                    <>
                      <p>
                        <strong>1. Responsibility for user-provided data:</strong> The author, developer, and publisher of Gallery Pro expressly disclaim all liability regarding data, images, files, metadata, or content imported, processed, displayed, or stored in the application by the user.
                      </p>
                      <p>
                        <strong>2. Local storage & no warranty:</strong> Data is stored strictly locally in your browser&apos;s IndexedDB on your device. The author cannot be held responsible for accidental data loss, corruption, file alteration, or deletion caused by clearing browser data or hardware failure.
                      </p>
                      <p>
                        <strong>3. User backup obligation:</strong> You are solely responsible for regularly backing up your original photographs using the ZIP export and full library backup features provided.
                      </p>
                      <p>
                        <strong>4. Intellectual property:</strong> You warrant that you hold all necessary rights to any content you import into the application.
                      </p>
                    </>
                  ) : (
                    <>
                      <p>
                        <strong>1. Responsabilité des données fournies :</strong> L&apos;auteur, développeur et éditeur de l&apos;application Gallery Pro décline expressément toute responsabilité concernant les données, images, fichiers, métadonnées ou contenus importés, traités, affichés ou stockés dans l&apos;application par l&apos;utilisateur.
                      </p>
                      <p>
                        <strong>2. Stockage local et absence de garantie :</strong> Les données sont hébergées exclusivement en local dans la base IndexedDB du navigateur de votre appareil. L&apos;auteur ne saurait en aucun cas être tenu responsable d&apos;une perte fortuite, d&apos;une corruption de données, d&apos;une altération de fichier ou d&apos;un effacement consécutif au vidage du cache du navigateur ou à une panne matérielle.
                      </p>
                      <p>
                        <strong>3. Obligation de sauvegarde de l&apos;utilisateur :</strong> L&apos;utilisateur est seul et unique responsable de la sauvegarde régulière et préalable de ses photographies originales en utilisant les fonctions d&apos;export ZIP et de sauvegarde intégrale prévues dans l&apos;application.
                      </p>
                      <p>
                        <strong>4. Propriété intellectuelle :</strong> L&apos;utilisateur garantit détenir l&apos;ensemble des droits nécessaires sur les contenus qu&apos;il importe dans l&apos;application.
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Mandatory Checkbox */}
              <label className="flex items-start gap-3 p-3 bg-surface-container-low rounded-2xl border border-outline-variant/30 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-5 h-5 accent-primary rounded mt-0.5 cursor-pointer"
                />
                <span className="text-[12px] font-semibold text-on-surface leading-tight">
                  {isEn
                    ? 'I have read, understood, and expressly accept the legal notice and data liability disclaimer.'
                    : "J'ai lu, compris et j'accepte expressément les mentions légales et la décharge de responsabilité concernant les données."}
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
              {isEn ? 'Previous' : 'Précédent'}
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep((prev) => prev + 1)}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md active:scale-95 shadow-md flex items-center gap-1"
            >
              <span>{isEn ? 'Next' : 'Suivant'}</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!agreed}
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-label-md active:scale-95 shadow-md disabled:opacity-40 transition-all"
            >
              {isEn ? 'Start using Gallery Pro' : "Commencer à utiliser l'application"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
