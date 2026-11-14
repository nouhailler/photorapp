import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DEMO_PHOTOS, type DemoPhotoItem } from './landingMedia';

type DemoCategoryFilter = 'Toutes' | 'Nature' | 'Littoral' | 'Ville' | 'Voyage' | 'Favoris';

const FILTER_OPTIONS: DemoCategoryFilter[] = ['Toutes', 'Nature', 'Littoral', 'Ville', 'Voyage', 'Favoris'];

export const DemoGallery: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<DemoCategoryFilter>('Toutes');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const visiblePhotos: DemoPhotoItem[] = useMemo(
    () =>
      DEMO_PHOTOS.filter((photo) => {
        if (activeFilter === 'Toutes') return true;
        if (activeFilter === 'Favoris') return photo.isFavorite;
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
      {/* En-tête du module A */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div className="space-y-2 max-w-2xl">
          <span className="font-mono text-xs font-semibold text-[#1E35D0]">
            01. Mini-galerie interactive · Données de démonstration
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18191D]">
            Explorez un aperçu de galerie et ses fiches EXIF locales
          </h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            Cliquez sur une photographie d&apos;exemple pour ouvrir la vue agrandie, inspecter ses métadonnées de prise
            de vue et naviguer d&apos;un cliché à l&apos;autre au clavier ou à la souris. Aucune écriture n&apos;est
            effectuée dans votre navigateur.
          </p>
        </div>

        {/* Filtres simples sans dépendance IndexedDB */}
        <div
          className="flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filtrer les photographies de démonstration"
        >
          {FILTER_OPTIONS.map((filter) => {
            const isSelected = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleFilterChange(filter)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 min-h-[38px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0] ${
                  isSelected
                    ? 'bg-[#18191D] text-white border-[#18191D]'
                    : 'bg-[#FAF9F6] text-neutral-700 border-neutral-300 hover:border-neutral-400'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grille des 8 photographies de démonstration */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {visiblePhotos.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            aria-label={`Agrandir ${photo.title} (${photo.location})`}
            className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-900 border border-neutral-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#1E35D0]"
          >
            <img
              src={photo.src}
              alt={photo.alt}
              width={640}
              height={480}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent text-white">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold truncate">{photo.title}</p>
                {photo.isFavorite && (
                  <span
                    className="material-symbols-fill text-[14px] text-amber-300 shrink-0"
                    aria-label="Favori de démonstration"
                  >
                    star
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/80 truncate">{photo.location}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Note transparente de démonstration */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500 pt-1 border-t border-neutral-200/80">
        <span>
          Jeu d&apos;essai isolé : {visiblePhotos.length} cliché{visiblePhotos.length > 1 ? 's' : ''} affiché
          {visiblePhotos.length > 1 ? 's' : ''} sur 8 exemples locaux intégrés.
        </span>
        <span className="font-mono tabular-nums">Mode lecture seule · Zéro accès IndexedDB</span>
      </div>

      {/* Visionneuse / Lightbox de démonstration */}
      {activePhoto && selectedIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Prévisualisation de démonstration : ${activePhoto.title}`}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleClose}
        >
          <div
            className="bg-[#FAF9F6] text-[#18191D] rounded-2xl border border-neutral-300 max-w-4xl w-full overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image agrandie */}
            <div className="lg:col-span-8 bg-[#14161D] flex items-center justify-center relative min-h-[240px] sm:min-h-[360px]">
              <img
                src={activePhoto.src}
                alt={activePhoto.alt}
                className="w-full h-full max-h-[60vh] lg:max-h-[78vh] object-contain"
              />
            </div>

            {/* Métadonnées et navigation */}
            <div className="lg:col-span-4 p-5 sm:p-6 flex flex-col justify-between gap-5 overflow-y-auto bg-white">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#1E35D0] font-semibold tabular-nums">
                      Exemple {selectedIndex + 1} / {visiblePhotos.length}
                    </p>
                    <h4 className="font-serif text-xl font-semibold text-[#18191D] mt-1">{activePhoto.title}</h4>
                  </div>

                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label="Fermer la prévisualisation"
                    className="w-10 h-10 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
                  >
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                      close
                    </span>
                  </button>
                </div>

                <dl className="space-y-2.5 text-xs border-t border-neutral-200 pt-4">
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Lieu (exemple)</dt>
                    <dd className="font-medium text-right">{activePhoto.location}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Date EXIF</dt>
                    <dd className="font-medium text-right tabular-nums">{activePhoto.dateLabel}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Boîtier</dt>
                    <dd className="font-medium text-right">{activePhoto.camera}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Paramètres</dt>
                    <dd className="font-mono text-right tabular-nums">{activePhoto.exif}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Définition</dt>
                    <dd className="font-mono text-right tabular-nums">{activePhoto.dimensions}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-neutral-500">Géolocalisation</dt>
                    <dd className="font-medium text-right">
                      {activePhoto.hasGps ? 'Coordonnées GPS présentes' : 'Aucune coordonnée GPS'}
                    </dd>
                  </div>
                  <div className="pt-2 border-t border-neutral-200/80">
                    <dt className="text-neutral-500 mb-1">Mots-clés associés</dt>
                    <dd className="font-mono text-[#1E35D0]">{activePhoto.tags.join(' · ')}</dd>
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
                    <span>Précédent</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-lg bg-[#18191D] text-white hover:bg-neutral-800 min-h-[42px] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E35D0]"
                  >
                    <span>Suivant</span>
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                      arrow_forward
                    </span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 text-center">
                  Clavier : flèches gauche/droite pour naviguer, Échap pour fermer.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
