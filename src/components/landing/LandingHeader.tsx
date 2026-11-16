import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GITHUB_REPO_URL } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

const NAV_LINKS_BY_LANG = {
  fr: [
    { label: 'Fonctionnalités', href: '#fonctionnalites' },
    { label: 'Démo', href: '#demo' },
    { label: 'Parcours', href: '#parcours' },
    { label: 'Confidentialité', href: '#confidentialite' },
    { label: 'Sauvegarde', href: '#sauvegarde' },
    { label: 'FAQ', href: '#faq' },
  ],
  en: [
    { label: 'Features', href: '#fonctionnalites' },
    { label: 'Demo', href: '#demo' },
    { label: 'Workflow', href: '#parcours' },
    { label: 'Privacy', href: '#confidentialite' },
    { label: 'Backup', href: '#sauvegarde' },
    { label: 'FAQ', href: '#faq' },
  ],
} as const;

export const LandingHeader: React.FC = () => {
  const { lang, switchLang } = useLandingLang();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks = NAV_LINKS_BY_LANG[lang];

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isScrolled
          ? 'bg-[#FAF9F6]/92 backdrop-blur-md border-b border-neutral-200/80'
          : 'bg-[#FAF9F6]/80 backdrop-blur-sm border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1 : Marque seule sur une ligne */}
        <a
          href="#top"
          className="flex items-center gap-1.5 sm:gap-2.5 text-[#18191D] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] rounded-lg py-1"
        >
          <img src="/icon.svg" alt="" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg shrink-0" />
          <span className="font-landing text-[15px] sm:text-lg font-bold tracking-tight">Gallery Pro</span>
        </a>

        {/* Zone 2 : Liens de navigation concis */}
        <nav
          aria-label={lang === 'en' ? 'Primary navigation' : 'Navigation principale'}
          className="hidden lg:flex items-center gap-3.5 xl:gap-6 text-[13px] xl:text-sm font-medium text-neutral-600"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#18191D] transition-colors whitespace-nowrap shrink-0 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] rounded px-1 py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3 : Sélecteur FR/EN + actions desktop + bouton menu mobile */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:gap-2.5 shrink-0">
          {/* Sélecteur de langue FR / EN */}
          <div
            role="group"
            aria-label={lang === 'en' ? 'Choose language' : 'Choisir la langue'}
            className="inline-flex items-center rounded-lg border border-neutral-300 bg-white p-0.5 text-[11px] font-mono font-semibold shrink-0"
          >
            <button
              type="button"
              onClick={() => switchLang('fr')}
              aria-pressed={lang === 'fr'}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'fr' ? 'bg-[#18191D] text-white' : 'text-neutral-600 hover:text-[#18191D]'
              }`}
            >
              FR
            </button>
            <button
              type="button"
              onClick={() => switchLang('en')}
              aria-pressed={lang === 'en'}
              className={`px-1.5 sm:px-2 py-1 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                lang === 'en' ? 'bg-[#18191D] text-white' : 'text-neutral-600 hover:text-[#18191D]'
              }`}
            >
              EN
            </button>
          </div>

          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-[#18191D] px-2.5 xl:px-3 py-2 rounded-lg hover:bg-neutral-200/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
          >
            <span className="xl:hidden">GitHub</span>
            <span className="hidden xl:inline">{lang === 'en' ? 'View on GitHub' : 'Découvrir sur GitHub'}</span>
          </a>

          <Link
            to="/gallery"
            className="inline-flex items-center justify-center px-2.5 sm:px-4 py-2 text-[11px] sm:text-sm font-semibold text-white bg-[#1E35D0] hover:bg-[#1629A8] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[38px] sm:min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
          >
            {lang === 'en' ? 'Open Gallery Pro' : 'Ouvrir Gallery Pro'}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            aria-label={
              lang === 'en'
                ? mobileOpen
                  ? 'Close menu'
                  : 'Open menu'
                : mobileOpen
                  ? 'Fermer le menu'
                  : 'Ouvrir le menu'
            }
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-lg border border-neutral-300 text-[#18191D] hover:bg-neutral-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px]" aria-hidden="true">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Menu mobile compact */}
      {mobileOpen && (
        <div
          id="landing-mobile-menu"
          className="lg:hidden border-t border-neutral-200 bg-[#FAF9F6] px-4 py-4 space-y-2 shadow-lg"
        >
          <nav aria-label={lang === 'en' ? 'Mobile menu' : 'Menu mobile'} className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 text-base font-medium text-neutral-800 hover:bg-neutral-200/60 rounded-lg transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="pt-2 border-t border-neutral-200 flex flex-col gap-2">
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-200/60 rounded-lg transition-colors"
            >
              {lang === 'en' ? 'View on GitHub' : 'Découvrir sur GitHub'}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
