import React, { useMemo } from 'react';
import type { Photo, PhotoSouvenir } from '../types/types';
import { generateSouvenirs } from '../services/souvenirService';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface SouvenirsCarouselProps {
  photos: Photo[];
  onSelectSouvenir: (souvenir: PhotoSouvenir) => void;
}

const SouvenirCard: React.FC<{
  souvenir: PhotoSouvenir;
  onClick: () => void;
}> = ({ souvenir, onClick }) => {
  const coverUrl = usePhotoUrl(souvenir.coverPhoto, true);

  return (
    <div
      onClick={onClick}
      className="group relative flex-shrink-0 w-64 h-80 rounded-3xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 active:scale-95 bg-surface-container"
    >
      <img
        src={coverUrl}
        alt={souvenir.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Top Badge */}
      <div className="absolute top-3 left-3">
        <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          {souvenir.periodLabel}
        </span>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
        <h4 className="text-title-md font-bold leading-tight group-hover:text-primary-container transition-colors">
          {souvenir.title}
        </h4>
        <p className="text-[12px] text-white/80 line-clamp-2">
          {souvenir.subtitle}
        </p>
        <div className="pt-2 flex items-center gap-2 text-[11px] font-semibold text-white/90">
          <span className="material-symbols-outlined text-[15px]">photo_library</span>
          <span>{souvenir.photos.length} photos</span>
        </div>
      </div>
    </div>
  );
};

export const SouvenirsCarousel: React.FC<SouvenirsCarouselProps> = ({ photos, onSelectSouvenir }) => {
  const souvenirs = useMemo(() => generateSouvenirs(photos), [photos]);

  if (souvenirs.length === 0) return null;

  return (
    <section className="space-y-3 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[24px]">history_edu</span>
          <h3 className="text-headline-sm font-bold text-on-surface">Vos Souvenirs</h3>
        </div>
        <span className="text-label-xs font-semibold text-on-surface-variant">
          Calculés localement selon vos dates réelles
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 hide-scrollbar scroll-smooth">
        {souvenirs.map((souvenir) => (
          <SouvenirCard
            key={souvenir.id}
            souvenir={souvenir}
            onClick={() => onSelectSouvenir(souvenir)}
          />
        ))}
      </div>
    </section>
  );
};
