import React from 'react';
import { Link } from 'react-router-dom';
import { useLandingLang } from './LandingLangContext';

const COPY = {
  fr: {
    eyebrow: 'YOUR PHOTOS. YOUR MEMORIES. YOUR CONTROL.',
    title: 'Toutes vos photos. Une seule photothèque. Sous votre contrôle.',
    subtitle:
      'Organisez, retrouvez, retouchez et préservez vos photographies directement dans votre navigateur. Sans compte obligatoire. Sans cloud imposé. Vos originaux restent chez vous.',
    primaryCta: 'Découvrir Gallery Pro',
    secondaryCta: 'Voir les démonstrations',
    pillars: [
      { title: 'Local-First', detail: 'Stockage privé dans votre navigateur via IndexedDB v3.' },
      { title: 'Sans inscription', detail: 'Accès immédiat, sans compte ni abonnement imposé.' },
      { title: 'PWA & hors ligne', detail: 'Installable et consultable hors ligne (hors tuiles carte/polices).' },
    ],
    galleryAlt:
      "Interface réelle de Gallery Pro sur /gallery montrant la grille chronologique des photographies, la barre de recherche et les filtres rapides",
    editorAlt: "Aperçu de l'éditeur photo non destructif intégré à Gallery Pro",
    caption: 'Votre photothèque, organisée et accessible depuis votre navigateur.',
    openUi: "Ouvrir l'interface →",
    statusChip: 'v2.5.0 · Local',
  },
  en: {
    eyebrow: 'YOUR PHOTOS. YOUR MEMORIES. YOUR CONTROL.',
    title: 'All your photos. One personal library. Under your control.',
    subtitle:
      'Organize, search, edit, and preserve your photography directly inside your browser. No mandatory account. No forced cloud upload. Your original files stay with you.',
    primaryCta: 'Launch Gallery Pro',
    secondaryCta: 'Explore interactive demos',
    pillars: [
      { title: 'Local-First', detail: 'Private in-browser storage powered by IndexedDB v3.' },
      { title: 'No account required', detail: 'Instant access with no sign-up or recurring subscription.' },
      { title: 'PWA & offline-ready', detail: 'Installable and usable offline (excluding map tiles & web fonts).' },
    ],
    galleryAlt:
      'Live screenshot of Gallery Pro at /gallery displaying the chronological photo grid, search bar, and quick filters',
    editorAlt: 'Preview of the built-in non-destructive photo editor in Gallery Pro',
    caption: 'Your photo library, organized and accessible right from your browser.',
    openUi: 'Open the workspace →',
    statusChip: 'v2.5.0 · Local',
  },
} as const;

export const HeroSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <section className="relative overflow-hidden bg-[#FAF9F6] pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left column: value proposition */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#1E35D0] font-semibold">
              {t.eyebrow}
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-semibold text-[#18191D] leading-[1.08] tracking-tight [text-wrap:balance]">
              {t.title}
            </h1>

            <p className="font-landing text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
              {t.subtitle}
            </p>

            {/* Dual CTA */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#1E35D0] hover:bg-[#1629A8] rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
              >
                <span>{t.primaryCta}</span>
                <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>

              <a
                href="#demo"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm sm:text-base font-semibold text-[#18191D] bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
              >
                {t.secondaryCta}
              </a>
            </div>

            {/* Three trust anchors */}
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200/90 text-sm">
              {t.pillars.map((item) => (
                <div key={item.title}>
                  <dt className="font-semibold text-[#18191D]">{item.title}</dt>
                  <dd className="text-neutral-600 text-xs mt-0.5 leading-snug">{item.detail}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Right column: real product showcase */}
          <div className="lg:col-span-7">
            <figure className="relative bg-[#14161D] rounded-2xl p-2.5 sm:p-3.5 shadow-xl border border-neutral-800/90">
              <div className="flex items-center justify-between gap-3 px-2 pb-2.5 text-[11px] font-mono text-neutral-400">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                </div>
                <span className="truncate text-neutral-300">photorapp.swinux.ch/gallery</span>
                <span className="hidden sm:inline text-neutral-400 tabular-nums">{t.statusChip}</span>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-white">
                <img
                  src="/screenshots/gallery-grid.png"
                  alt={t.galleryAlt}
                  width={1366}
                  height={860}
                  className="w-full h-auto block"
                />

                <div className="hidden sm:block absolute bottom-3 right-3 w-[40%] max-w-[260px] rounded-xl overflow-hidden border border-neutral-700 bg-[#0F172A] shadow-2xl">
                  <img
                    src="/screenshots/photo-editor.png"
                    alt={t.editorAlt}
                    width={1366}
                    height={860}
                    className="w-full h-auto block"
                  />
                </div>
              </div>

              <figcaption className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-neutral-300">
                <span className="font-medium text-white">{t.caption}</span>
                <Link
                  to="/gallery"
                  className="text-[#93C5FD] hover:underline font-medium whitespace-nowrap shrink-0"
                >
                  {t.openUi}
                </Link>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
