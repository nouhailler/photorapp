import React from 'react';
import { Link } from 'react-router-dom';
import { GITHUB_REPO_URL } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

const COPY = {
  fr: {
    eyebrow: 'Gallery Pro — Your Visual Legacy',
    heading: 'Vos souvenirs. Votre photothèque. Votre liberté.',
    body: "Découvrez une nouvelle manière d'organiser et de préserver vos photographies, sans confier votre photothèque à un cloud imposé.",
    primaryCta: 'Ouvrir Gallery Pro',
    secondaryCta: 'Voir le projet sur GitHub',
  },
  en: {
    eyebrow: 'Gallery Pro — Your Visual Legacy',
    heading: 'Your memories. Your library. Your independence.',
    body: 'Experience a calmer way to organize, edit, and safeguard your photographs without surrendering your archive to a forced cloud.',
    primaryCta: 'Open Gallery Pro',
    secondaryCta: 'View project on GitHub',
  },
} as const;

export const FinalCTASection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <section
      aria-labelledby="final-cta-heading"
      className="bg-[#14161D] text-white py-20 sm:py-28 border-b border-white/10"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#BCC2FF] font-semibold">{t.eyebrow}</p>

        <h2
          id="final-cta-heading"
          className="font-serif text-3xl sm:text-5xl font-semibold text-white leading-tight [text-wrap:balance]"
        >
          {t.heading}
        </h2>

        <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-2xl mx-auto">{t.body}</p>

        <div className="pt-3 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-[#18191D] bg-white hover:bg-neutral-100 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14161D] focus-visible:ring-white"
          >
            <span>{t.primaryCta}</span>
            <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
              arrow_forward
            </span>
          </Link>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#14161D] focus-visible:ring-white"
          >
            {t.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
};
