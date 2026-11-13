import React from 'react';
import { Link } from 'react-router-dom';
import { EDITORIAL_PHOTOS } from './landingMedia';

export const HeroSection: React.FC = () => {
  return (
    <section
      className="relative overflow-hidden bg-[#FAF9F6] pt-10 pb-16 sm:pt-14 sm:pb-24 border-b border-neutral-200/80"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Colonne gauche : proposition de valeur */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-[#1E35D0] font-semibold">
              YOUR PHOTOS. YOUR MEMORIES. YOUR CONTROL.
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-[#18191D] leading-[1.08] tracking-tight [text-wrap:balance]">
              Toutes vos photos. Une seule photothèque. Sous votre contrôle.
            </h1>

            <p className="font-landing text-base sm:text-lg text-neutral-600 leading-relaxed max-w-xl">
              Organisez, retrouvez, retouchez et préservez vos photographies dans une application intelligente qui
              respecte votre vie privée. Sans compte obligatoire. Sans cloud imposé. Vos photos restent chez vous.
            </p>

            {/* Double CTA */}
            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link
                to="/gallery"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm sm:text-base font-semibold text-white bg-[#1E35D0] hover:bg-[#1629A8] rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
              >
                <span>Découvrir Gallery Pro</span>
                <span className="material-symbols-outlined text-[19px]" aria-hidden="true">
                  arrow_forward
                </span>
              </Link>

              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center px-5 py-3.5 text-sm sm:text-base font-semibold text-[#18191D] bg-white border border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50 rounded-xl transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
              >
                Explorer les fonctionnalités
              </a>
            </div>

            {/* Trois éléments de réassurance sobrement structurés */}
            <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-neutral-200/90 text-sm">
              <div>
                <dt className="font-semibold text-[#18191D]">Local-First</dt>
                <dd className="text-neutral-600 text-xs mt-0.5 leading-snug">
                  Stockage dans votre navigateur via IndexedDB v3.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#18191D]">Sans inscription</dt>
                <dd className="text-neutral-600 text-xs mt-0.5 leading-snug">
                  Accès immédiat, sans compte ni abonnement imposé.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#18191D]">PWA &amp; hors ligne</dt>
                <dd className="text-neutral-600 text-xs mt-0.5 leading-snug">
                  Installable et utilisable hors ligne (hors tuiles carte/polices).
                </dd>
              </div>
            </dl>
          </div>

          {/* Colonne droite : composition photographique éditoriale */}
          <div className="lg:col-span-6">
            <div className="relative bg-[#14161D] rounded-2xl p-3 sm:p-4 shadow-xl border border-neutral-800/80">
              <div className="grid grid-cols-12 gap-3">
                {/* Grande photographie principale */}
                <figure className="col-span-12 sm:col-span-8 relative overflow-hidden rounded-xl aspect-[4/3] bg-neutral-900 group">
                  <img
                    src={EDITORIAL_PHOTOS.alpineLake.src}
                    alt={EDITORIAL_PHOTOS.alpineLake.alt}
                    width={800}
                    height={600}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/45 to-transparent text-white">
                    <p className="text-sm font-medium">{EDITORIAL_PHOTOS.alpineLake.title}</p>
                    <p className="text-[11px] font-mono text-white/80 tabular-nums mt-0.5">
                      {EDITORIAL_PHOTOS.alpineLake.exifSample}
                    </p>
                  </figcaption>
                </figure>

                {/* Colonne latérale de vignettes */}
                <div className="col-span-12 sm:col-span-4 grid grid-cols-2 sm:grid-cols-1 gap-3">
                  <figure className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-auto sm:h-full bg-neutral-900 group">
                    <img
                      src={EDITORIAL_PHOTOS.coastalSunset.src}
                      alt={EDITORIAL_PHOTOS.coastalSunset.alt}
                      width={400}
                      height={300}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-medium">
                      {EDITORIAL_PHOTOS.coastalSunset.sceneLabel}
                    </figcaption>
                  </figure>

                  <figure className="relative overflow-hidden rounded-xl aspect-[4/3] sm:aspect-auto sm:h-full bg-neutral-900 group">
                    <img
                      src={EDITORIAL_PHOTOS.cityArch.src}
                      alt={EDITORIAL_PHOTOS.cityArch.alt}
                      width={400}
                      height={533}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-medium">
                      {EDITORIAL_PHOTOS.cityArch.sceneLabel}
                    </figcaption>
                  </figure>
                </div>
              </div>

              {/* Barre de métadonnées illustrative (texte sobre sans pilules) */}
              <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-300 px-1">
                <div className="flex items-center gap-2 font-mono tabular-nums">
                  <span>IndexedDB · GalleryProDB v3</span>
                  <span aria-hidden="true" className="text-neutral-500">/</span>
                  <span>Originaux + Miniatures WebP</span>
                </div>
                <span className="text-[#6EFBBD] font-medium">
                  Composition illustrative · Visuels d'exemple
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
