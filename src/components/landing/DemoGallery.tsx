import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DEMO_PHOTOS, type DemoPhotoItem } from './landingMedia';
import { useLandingLang } from './LandingLangContext';

type DemoCategoryFilter = 'all' | 'Nature' | 'Littoral' | 'Ville' | 'Voyage' | 'favorites';

const FILTER_OPTIONS: { id: DemoCategoryFilter; fr: string; en: string }[] = [
  { id: 'all', fr: 'Toutes', en: 'All' },
  { id: 'Nature', fr: 'Nature', en: 'Nature' },
  { id: 'Littoral', fr: 'Littoral', en: 'Coast' },
  { id: 'Ville', fr: 'Ville', en: 'City' },
  { id: 'Voyage', fr: 'Voyage', en: 'Travel' },
  { id: 'favorites', fr: 'Favoris', en: 'Favorites' },
];

const COPY = {
  fr: {
    tag: '01. Mini-galerie interactive · Données de démonstration',
    heading: 'Explorez un aperçu de galerie et ses fiches EXIF locales',
    subtitle:
      "Cliquez sur une photographie d'exemple pour ouvrir la vue agrandie, inspecter ses métadonnées de prise de vue et naviguer d'un cliché à l'autre au clavier ou à la souris. Aucune écriture n'est effectuée dans votre navigateur.",
    filterAria: 'Filtrer les photographies de démonstration',
    enlargePrefix: 'Agrandir',
    favAria: 'Favori de démonstration',
    countSummary: (visible: number, total: number) =>
      `Jeu d'essai isolé : ${visible} cliché${visible > 1 ? 's' : ''} affiché${visible > 1 ? 's' : ''} sur ${total} exemples locaux intégrés.`,
    readOnlyBadge: 'Mode lecture seule · Zéro accès IndexedDB',
    dialogPrefix: 'Prévisualisation de démonstration :',
    exampleLabel: 'Exemple',
    closeAria: 'Fermer la prévisualisation',
    locationLabel: 'Lieu (exemple)',
    dateLabel: 'Date EXIF',
    cameraLabel: 'Boîtier',
    paramsLabel: 'Paramètres',
    dimLabel: 'Définition',
    gpsLabel: 'Géolocalisation',
    gpsYes: 'Coordonnées GPS présentes',
    gpsNo: 'Aucune coordonnée GPS',
    tagsLabel: 'Mots-clés associés',
    prev: 'Précédent',
    next: 'Suivant',
    kbHint: 'Clavier : flèches gauche/droite pour naviguer, Échap pour fermer.',
  },
  en: {
    tag: '01. Interactive Mini-Gallery · Sample Data',
    heading: 'Browse a sample gallery and inspect local EXIF metadata',
    subtitle:
      'Click any sample photograph to open the enlarged preview, check its camera metadata, and step through the set by mouse or keyboard. Zero data is written to your browser storage.',
    filterAria: 'Filter sample photographs',
    enlargePrefix: 'Enlarge',
    favAria: 'Sample favorite',
    countSummary: (visible: number, total: number) =>
      `Isolated sample set: showing ${visible} of ${total} bundled demo photos.`,
    readOnlyBadge: 'Read-only preview · Zero IndexedDB writes',
    dialogPrefix: 'Demo preview:',
    exampleLabel: 'Sample',
    closeAria: 'Close preview',
    locationLabel: 'Location (sample)',
    dateLabel: 'EXIF Date',
    cameraLabel: 'Camera',
    paramsLabel: 'Settings',
    dimLabel: 'Resolution',
    gpsLabel: 'Geolocation',
    gpsYes: 'GPS coordinates present',
    gpsNo: 'No GPS metadata',
    tagsLabel: 'Associated tags',
    prev: 'Previous',
    next: 'Next',
    kbHint: 'Keyboard: Left/Right arrows to navigate, Esc to close.',
  },
} as const;

export const DemoGallery: React.FC = () => {
  const { lang } = useLandingLang();
  const t = COPY[lang];
  const [activeFilter, setActiveFilter] = useState<DemoCategoryFilter>('all');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visiblePhotos: DemoPhotoItem[] = useMemo(
    () =>
      DEMO_PHOTOS.filter((photo) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'favorites') return photo.isFavorite;
        return photo.category === activeFilter;
      }),
    [activeFilter]
  );

  const photoCount = visiblePhotos.length;
  const activePhoto = selectedIndex !== null ? visiblePhotos[selectedIndex] ?? null : null;

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || photoCount === 0) return null;
      return (prev - 1 + photoCount) % photoCount;
    });
  }, [photoCount]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => {
      if (prev === null || photoCount === 0) return null;
      return (prev + 1) % photoCount;
    });
  }, [photoCount]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'ArrowLeft') {
        handlePrev();
      } else if (event.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, handleClose, handlePrev, handleNext]);

  const handleFilterChange = (filter: DemoCategoryFilter) => {
    setActiveFilter(filter);
    setSelectedIndex(null);
  };

  return (
    <div id="demo-galerie" className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="font-mono text-xs font-semibold text-[#1E35D0]">{t.tag}</span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D]">{t.heading}</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.filterAria}>
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = activeFilter === opt.id;
            const label = lang === 'en' ? opt.en : opt.fr;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleFilterChange(opt.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] ${
                  isSelected
                    ? 'bg-[#18191D] text-white border-[#18191D]'
                    : 'bg-[#FAF9F6] text-neutral-700 border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {visiblePhotos.map((photo, index) => {
          const title = lang === 'en' ? photo.titleEn : photo.title;
          const location = lang === 'en' ? photo.locationEn : photo.location;
          const alt = lang === 'en' ? photo.altEn : photo.alt;
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`${t.enlargePrefix} ${title} (${location})`}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
            >
              <img
                src={photo.src}
                alt={alt}
                width={640}
                height={480}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold truncate">{title}</p>
                  {photo.isFavorite && (
                    <span className="material-symbols-fill text-[14px] text-amber-300 shrink-0" aria-label={t.favAria}>
                      star
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/80 truncate">{location}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 pt-1 border-t border-neutral-200/80">
        <span>{t.countSummary(visiblePhotos.length, DEMO_PHOTOS.length)}</span>
        <span className="font-mono tabular-nums">{t.readOnlyBadge}</span>
      </div>

      {/* Lightbox dialog */}
      {activePhoto && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${t.dialogPrefix} ${lang === 'en' ? activePhoto.titleEn : activePhoto.title}`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleClose}
        >
          <div
            className="bg-[#FAF9F6] text-[#18191D] rounded-2xl border border-neutral-300 max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="lg:col-span-8 bg-[#14161D] flex items-center justify-center relative min-h-[240px] sm:min-h-[360px]">
              <img
                src={activePhoto.src}
                alt={lang === 'en' ? activePhoto.altEn : activePhoto.alt}
                className="w-full h-full max-h-[60vh] lg:max-h-[78vh] object-contain"
              />
            </div>

            <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between gap-5 overflow-y-auto bg-white">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#1E35D0] font-semibold tabular-nums">
                      {t.exampleLabel} {selectedIndex + 1} / {visiblePhotos.length}
                    </p>
                    <h4 className="font-serif text-xl font-semibold text-[#18191D] mt-1">
                      {lang === 'en' ? activePhoto.titleEn : activePhoto.title}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label={t.closeAria}
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      close
                    </span>
                  </button>
                </div>

                <dl className="space-y-2.5 text-xs border-t border-neutral-200 pt-4">
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.locationLabel}</dt>
                    <dd className="font-medium text-right">
                      {lang === 'en' ? activePhoto.locationEn : activePhoto.location}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.dateLabel}</dt>
                    <dd className="font-medium text-right tabular-nums">
                      {lang === 'en' ? activePhoto.dateLabelEn : activePhoto.dateLabel}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.cameraLabel}</dt>
                    <dd className="font-medium text-right">{activePhoto.camera}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.paramsLabel}</dt>
                    <dd className="font-mono text-right tabular-nums">{activePhoto.exif}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.dimLabel}</dt>
                    <dd className="font-mono text-right tabular-nums">{activePhoto.dimensions}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">{t.gpsLabel}</dt>
                    <dd className="font-medium text-right">{activePhoto.hasGps ? t.gpsYes : t.gpsNo}</dd>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/80">
                    <dt className="text-neutral-500 mb-1">{t.tagsLabel}</dt>
                    <dd className="font-mono text-[#1E35D0]">
                      {(lang === 'en' ? activePhoto.tagsEn : activePhoto.tags).join(' · ')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3 pt-3 border-t border-neutral-200">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg border border-neutral-300 text-[#18191D] hover:bg-neutral-100 min-h-[42px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
                  >
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      arrow_back
                    </span>
                    <span>{t.prev}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg bg-[#18191D] text-white hover:bg-neutral-800 min-h-[42px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
                  >
                    <span>{t.next}</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 text-center">{t.kbHint}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
