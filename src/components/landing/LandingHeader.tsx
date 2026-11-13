import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GITHUB_REPO_URL } from './landingMedia';

const NAV_LINKS = [
  { label: 'Fonctionnalités', href: '#fonctionnalites' },
  { label: 'Intelligence', href: '#intelligence' },
  { label: 'Confidentialité', href: '#confidentialite' },
  { label: 'Sauvegarde', href: '#sauvegarde' },
  { label: 'FAQ', href: '#faq' },
];

export const LandingHeader: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1 : Marque seule sur une ligne */}
        <a
          href="#top"
          className="flex items-center gap-2.5 text-[#18191D] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] rounded-lg py-1"
        >
          <img
            src="/icon.svg"
            alt=""
            width={28}
            height={28}
            className="w-7 h-7 rounded-lg shrink-0"
          />
          <span className="font-landing text-lg font-bold tracking-tight">Gallery Pro</span>
        </a>

        {/* Zone 2 : Liens de navigation concis */}
        <nav
          aria-label="Navigation principale"
          className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-600"
        >
          {NAV_LINKS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-[#18191D] transition-colors whitespace-nowrap shrink-0 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] rounded px-1 py-0.5"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3 : Actions desktop + bouton menu mobile */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-[#18191D] px-3 py-2 rounded-lg hover:bg-neutral-200/50 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
          >
            <span>Découvrir sur GitHub</span>
          </a>

          <Link
            to="/gallery"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#1E35D0] hover:bg-[#1629A8] rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
          >
            Ouvrir Gallery Pro
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-expanded={mobileOpen}
            aria-controls="landing-mobile-menu"
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-neutral-300 text-[#18191D] hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
          >
            <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
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
          <nav aria-label="Menu mobile" className="flex flex-col space-y-1">
            {NAV_LINKS.map((item) => (
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
              Découvrir sur GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
