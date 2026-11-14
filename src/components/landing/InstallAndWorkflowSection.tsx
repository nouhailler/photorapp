import React from 'react';
import { Link } from 'react-router-dom';
import { usePWAInstall } from '../../hooks/usePWAInstall';

const SUMMARY_ROWS = [
  { need: 'Organiser ses photos', feature: 'Albums manuels et intelligents' },
  { need: 'Retrouver un cliché', feature: 'Recherche avancée et naturelle par règles lexicales' },
  { need: 'Repérer les doublons', feature: 'SHA-256 (exact) et dHash (similitude)' },
  { need: 'Analyser ses photos', feature: 'Traitement local heuristique (scènes, netteté, exposition)' },
  { need: 'Retoucher ses images', feature: 'Éditeur non destructif (originaux intacts)' },
  { need: 'Revoir ses souvenirs', feature: 'Carrousel rétrospectif sur dates et lieux réels' },
  { need: 'Préserver ses données', feature: 'Sauvegarde .gpro.zip, SHA-256 et simulation de restauration' },
  { need: 'Utiliser sans compte', feature: 'Oui — aucun compte ni authentification requise' },
  { need: 'Installer l’application', feature: 'PWA installable sur desktop et mobile compatible' },
];

export const InstallAndWorkflowSection: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    }
  };

  return (
    <div className="bg-[#FAF9F6] divide-y divide-neutral-200/80 border-b border-neutral-200/80">
      {/* SECTION PWA — Une application qui vous appartient */}
      <section aria-labelledby="pwa-heading" className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-4">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              Application Web Progressive (PWA)
            </p>
            <h2
              id="pwa-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              Une application qui vous appartient, sur ordinateur comme sur mobile.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
              Ajoutez Gallery Pro à votre écran d&apos;accueil sans passer par un magasin d&apos;applications. Une fois
              l&apos;application mise en cache par le Service Worker après la première visite, la consultation de votre
              photothèque locale, la recherche et la retouche restent disponibles hors ligne.
            </p>
            <p className="text-xs text-neutral-500 leading-relaxed max-w-2xl">
              Limites connues : les tuiles cartographiques OpenStreetMap et certaines ressources externes non encore
              mises en cache (polices web) nécessitent une connexion Internet.
            </p>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-6 space-y-4">
            <div className="space-y-1">
              <div className="font-landing text-base font-bold text-[#18191D]">
                Installation directe sur l&apos;appareil
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Navigateurs Chromium (Chrome, Edge, Brave) sur desktop/Android ou ajout manuel sur iOS Safari
                (Partager → Sur l&apos;écran d&apos;accueil).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isInstalled ? (
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F6A4B]">
                  <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                    check_circle
                  </span>
                  <span>Application déjà installée sur cet appareil</span>
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
                  <span>Installer Gallery Pro</span>
                </button>
              ) : isIOS ? (
                <p className="text-xs font-medium text-neutral-700 bg-[#F2F1EC] rounded-lg p-3">
                  Sur iPhone / iPad (Safari) : touchez <strong>Partager</strong> puis{' '}
                  <strong>Sur l&apos;écran d&apos;accueil</strong>.
                </p>
              ) : (
                <Link
                  to="/settings"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#18191D] bg-[#F2F1EC] hover:bg-neutral-200/80 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px]"
                >
                  <span>Options d&apos;installation dans Paramètres</span>
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    arrow_forward
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tableau de synthèse des bénéfices */}
      <section aria-labelledby="summary-heading" className="bg-[#FAF9F6] py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              Synthèse produit
            </p>
            <h2
              id="summary-heading"
              className="font-serif text-3xl sm:text-4xl font-semibold text-[#18191D]"
            >
              Ce que propose concrètement Gallery Pro
            </h2>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-[#FAF9F6] text-xs font-semibold uppercase tracking-wider text-neutral-600">
                  <th scope="col" className="py-3.5 px-5 sm:px-6">
                    Besoin
                  </th>
                  <th scope="col" className="py-3.5 px-5 sm:px-6">
                    Réponse Gallery Pro (v2.5.0)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200/80 text-sm">
                {SUMMARY_ROWS.map((row) => (
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
