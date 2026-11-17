import React from 'react';
import { Link } from 'react-router-dom';
import { DemoGallery } from './DemoGallery';
import { DemoSearch } from './DemoSearch';
import { DemoPhotoEditor } from './DemoPhotoEditor';
import { useLandingLang } from './LandingLangContext';
import { YOUTUBE_EMBED_URL, YOUTUBE_TUTORIAL_URL } from './landingMedia';

const COPY = {
  fr: {
    eyebrow: 'Découvrez Gallery Pro en action',
    heading: 'Voyez ce que votre photothèque peut devenir.',
    subtitle:
      "Testez ci-dessous trois expériences représentatives directement sur la page : consultation d'une galerie d'exemple, décomposition réelle d'une requête naturelle et comparaison non destructive avant/après.",
    cta: 'Ouvrir ma propre photothèque',
    videoEyebrow: 'Visite guidée vidéo · YouTube',
    videoTitle: 'Tutoriel complet : maîtriser Gallery Pro en vidéo',
    videoDesc:
      'Parcourez la galerie, la retouche non destructive, les albums intelligents, la recherche sémantique, l’IA locale et les sauvegardes ZIP SHA-256.',
    videoPrivacyNote: 'Lecteur intégré sans suivi publicitaire (youtube-nocookie.com).',
    videoCta: 'Ouvrir sur YouTube',
    iframeTitle: 'Tutoriel vidéo complet de Gallery Pro sur YouTube',
  },
  en: {
    eyebrow: 'See Gallery Pro in Action',
    heading: 'See what your photo library can become.',
    subtitle:
      'Try three representative experiences right on this page: browsing a sample gallery with EXIF metadata, testing the real local search query parser, and sliding through a non-destructive before/after adjustment preview.',
    cta: 'Open my own library',
    videoEyebrow: 'Video Walkthrough · YouTube',
    videoTitle: 'Full Video Tutorial: Master Gallery Pro',
    videoDesc:
      'Step through the gallery timeline, non-destructive editor, smart albums, natural-language search, local AI analysis, and SHA-256 ZIP backups.',
    videoPrivacyNote: 'Privacy-enhanced embed without ad-tracking cookies (youtube-nocookie.com).',
    videoCta: 'Watch on YouTube',
    iframeTitle: 'Gallery Pro full video tutorial on YouTube',
  },
} as const;

export const InteractiveDemoSection: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              {t.eyebrow}
            </p>
            <h2
              id="demo-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              {t.heading}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">{t.subtitle}</p>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#18191D] hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] self-start lg:self-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18191D]"
          >
            <span>{t.cta}</span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 lg:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.14em] text-[#1E35D0] font-semibold">
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  smart_display
                </span>
                <span>{t.videoEyebrow}</span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-semibold text-[#18191D] leading-snug">
                {t.videoTitle}
              </h3>

              <p className="text-sm text-neutral-600 leading-relaxed">{t.videoDesc}</p>

              <p className="text-xs text-neutral-500 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#1E35D0]" aria-hidden="true">
                  verified_user
                </span>
                <span>{t.videoPrivacyNote}</span>
              </p>

              <div className="pt-1">
                <a
                  href={YOUTUBE_TUTORIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#1E35D0] bg-[#1E35D0]/8 hover:bg-[#1E35D0]/14 border border-[#1E35D0]/20 rounded-xl transition-colors whitespace-nowrap min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    play_circle
                  </span>
                  <span>{t.videoCta}</span>
                  <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                    open_in_new
                  </span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-neutral-950 border border-neutral-200/80 shadow-sm">
                <iframe
                  className="absolute inset-0 w-full h-full border-0"
                  src={YOUTUBE_EMBED_URL}
                  title={t.iframeTitle}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <DemoGallery />
          <DemoSearch />
          <DemoPhotoEditor />
        </div>
      </div>
    </section>
  );
};
