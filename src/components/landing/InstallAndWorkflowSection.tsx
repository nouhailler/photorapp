import React from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useLandingLang } from './LandingLangContext';

const SUMMARY_ROWS = {
  fr: [
    { need: 'Organiser ses photos', feature: 'Albums manuels et intelligents' },
    { need: 'Retrouver un cliché', feature: 'Recherche avancée et naturelle par règles lexicales' },
    { need: 'Repérer les doublons', feature: 'SHA-256 (exact) et dHash (similitude)' },
    { need: 'Analyser ses photos', feature: 'Traitement local heuristique (scènes, netteté, exposition)' },
    { need: 'Retoucher ses images', feature: 'Éditeur non destructif (originaux intacts)' },
    { need: 'Revoir ses souvenirs', feature: 'Carrousel rétrospectif sur dates et lieux réels' },
    { need: 'Préserver ses données', feature: 'Sauvegarde .gpro.zip, SHA-256 et simulation de restauration' },
    { need: 'Utiliser sans compte', feature: 'Oui — aucun compte ni authentification requise' },
    { need: 'Installer l’application', feature: 'PWA installable sur desktop et mobile compatible' },
  ],
  en: [
    { need: 'Organize photos', feature: 'Manual albums & dynamic smart albums' },
    { need: 'Find a specific shot', feature: 'Multi-criteria & lexical rule-based search' },
    { need: 'Spot duplicates', feature: 'SHA-256 (exact match) & dHash (visual similarity)' },
    { need: 'Analyze photo quality', feature: 'Local heuristic processing (scene tags, sharpness, exposure)' },
    { need: 'Edit non-destructively', feature: 'JSON adjustment layer keeping original blobs intact' },
    { need: 'Revisit memories', feature: 'Retrospective carousel grounded in real EXIF dates & locations' },
    { need: 'Preserve your archive', feature: '.gpro.zip full backup, SHA-256 checksums & restore dry-run' },
    { need: 'Use without an account', feature: 'Yes — zero sign-up or authentication required' },
    { need: 'Install locally', feature: 'Installable PWA on supported desktop and mobile browsers' },
  ],
} as const;

const COPY = {
  fr: {
    pwaEyebrow: 'Application Web Progressive (PWA)',
    pwaTitle: 'Une application qui vous appartient, sur ordinateur comme sur mobile.',
    pwaBody:
      "Ajoutez Gallery Pro à votre écran d'accueil sans passer par un magasin d'applications. Une fois l'application mise en cache par le Service Worker après la première visite, la consultation de votre photothèque locale, la recherche et la retouche restent disponibles hors ligne.",
    pwaNote:
      'Limites connues : les tuiles cartographiques OpenStreetMap et certaines ressources externes non encore mises en cache (polices web) nécessitent une connexion Internet.',
    cardTitle: "Installation directe sur l'appareil",
    cardDesc:
      "Navigateurs Chromium (Chrome, Edge, Brave) sur desktop/Android ou ajout manuel sur iOS Safari (Partager → Sur l'écran d'accueil).",
    installed: 'Application déjà installée sur cet appareil',
    installBtn: 'Installer Gallery Pro',
    iosHint: (
      <>
        Sur iPhone / iPad (Safari) : touchez <strong>Partager</strong> puis{' '}
        <strong>Sur l&apos;écran d&apos;accueil</strong>.
      </>
    ),
    settingsCta: "Options d'installation dans Paramètres",
    summaryEyebrow: 'Synthèse produit',
    summaryHeading: 'Ce que propose concrètement Gallery Pro',
    colNeed: 'Besoin',
    colFeature: 'Réponse Gallery Pro (v2.5.0)',
  },
  en: {
    pwaEyebrow: 'Progressive Web App (PWA)',
    pwaTitle: 'An application you own, across desktop and mobile.',
    pwaBody:
      'Add Gallery Pro to your home screen or desktop without any app store. Once cached by the Service Worker after your first visit, browsing your local library, searching, and non-destructive editing stay available offline.',
    pwaNote:
      'Known limitations: OpenStreetMap map tiles and uncached external assets (web fonts) require an internet connection.',
    cardTitle: 'Direct installation on your device',
    cardDesc:
      'Supported in Chromium browsers (Chrome, Edge, Brave) on desktop/Android or via Safari on iOS (Share → Add to Home Screen).',
    installed: 'Application already installed on this device',
    installBtn: 'Install Gallery Pro',
    iosHint: (
      <>
        On iPhone / iPad (Safari): tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.
      </>
    ),
    settingsCta: 'Installation options in Settings',
    summaryEyebrow: 'Product Overview',
    summaryHeading: 'What Gallery Pro actually delivers',
    colNeed: 'Need',
    colFeature: 'Gallery Pro Implementation (v2.5.0)',
  },
} as const;

export const InstallAndWorkflowSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const rows = SUMMARY_ROWS[lang];
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="bg-[#FAF9F6] divide-y divide-neutral-200/80 border-b border-neutral-200/80">
      <section aria-labelledby="pwa-heading" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              {t.pwaEyebrow}
            </p>
            <h2
              id="pwa-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              {t.pwaTitle}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">{t.pwaBody}</p>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">{t.pwaNote}</p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <div className="space-y-1">
              <div className="font-landing text-base font-bold text-[#18191D]">{t.cardTitle}</div>
              <p className="text-xs text-neutral-600 leading-relaxed">{t.cardDesc}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isInstalled ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F6A4B]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    check_circle
                  </span>
                  <span>{t.installed}</span>
                </span>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1E35D0] hover:bg-[#1629A8] rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    install_desktop
                  </span>
                  <span>{t.installBtn}</span>
                </button>
              ) : isIOS ? (
                <p className="text-xs font-medium text-neutral-700 bg-[#F2F1EC] rounded-lg p-3">{t.iosHint}</p>
              ) : (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#18191D] bg-[#F2F1EC] hover:bg-neutral-200/80 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span>{t.settingsCta}</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="summary-heading" className="bg-[#FAF9F6] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              {t.summaryEyebrow}
            </p>
            <h2 id="summary-heading" className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D]">
              {t.summaryHeading}
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  <th scope="col" className="py-3.5 px-5 sm:px-6">
                    {t.colNeed}
                  </th>
                  <th scope="col" className="py-3.5 px-5 sm:px-6">
                    {t.colFeature}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 text-sm">
                {rows.map((row) => (
                  <tr key={row.need} className="hover:bg-[#FAF9F6] transition-colors">
                    <th scope="row" className="py-3.5 px-5 sm:px-6 font-semibold text-[#18191D]">
                      {row.need}
                    </th>
                    <td className="py-3.5 px-5 sm:px-6 text-neutral-700">{row.feature}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
