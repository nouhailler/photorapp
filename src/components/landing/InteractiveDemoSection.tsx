import React from 'react';
import { Link } from 'react-router-dom';
import { DemoGallery } from './DemoGallery';
import { DemoSearch } from './DemoSearch';
import { DemoPhotoEditor } from './DemoPhotoEditor';

export const InteractiveDemoSection: React.FC = () => {
  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="bg-[#F2F1EC] py-16 sm:py-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* En-tête éditorial de la démonstration */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.16em] text-[#1E35D0] font-semibold">
              Découvrez Gallery Pro en action
            </p>
            <h2
              id="demo-heading"
              className="font-serif text-3xl sm:text-4xl lg:text-[2.65rem] font-semibold text-[#18191D] leading-tight [text-wrap:balance]"
            >
              Voyez ce que votre photothèque peut devenir.
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 leading-relaxed max-w-2xl">
              Testez ci-dessous trois expériences représentatives directement sur la page : consultation d&apos;une
              galerie d&apos;exemple, décomposition réelle d&apos;une requête naturelle et comparaison non destructive
              avant/après.
            </p>
          </div>

          <Link
            to="/gallery"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#18191D] hover:bg-neutral-800 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] self-start lg:self-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#18191D]"
          >
            <span>Ouvrir ma propre photothèque</span>
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Trois démonstrations interactives isolées */}
        <div className="space-y-8">
          <DemoGallery />
          <DemoSearch />
          <DemoPhotoEditor />
        </div>
      </div>
    </section>
  );
};
