import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { Photo } from '../types/types';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
  featured?: boolean;
  isSelectionMode?: boolean;
  selectedIds?: string[];
  onToggleSelection?: (id: string) => void;
}

export const PhotoItem: React.FC<{
  photo: Photo;
  onClick?: (photo: Photo) => void;
  isFeatured?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: (id: string) => void;
}> = React.memo(({ photo, onClick, isFeatured, isSelectionMode, isSelected, onToggleSelection }) => {
  // CRITICAL: Request lightweight thumbnail (250px) instead of 20MB master raw image!
  const url = usePhotoUrl(photo, true);

  const handleClick = (e: React.MouseEvent) => {
    if (isSelectionMode && onToggleSelection) {
      e.stopPropagation();
      onToggleSelection(photo.id);
    } else {
      onClick?.(photo);
    }
  };

  return (
    <div
      className={`relative aspect-square group overflow-hidden bg-surface-container cursor-pointer select-none rounded-sm ${
        isFeatured ? 'col-span-2 row-span-2' : ''
      }`}
      onClick={handleClick}
    >
      <img
        src={url}
        alt={photo.alt}
        className={`w-full h-full object-cover transition-transform duration-500 will-change-transform ${
          !isSelectionMode ? 'group-hover:scale-105' : ''
        } ${isSelected ? 'scale-90 opacity-80' : ''}`}
        loading="lazy"
        decoding="async"
      />

      {/* Favorite Indicator */}
      {!isSelectionMode && photo.isFavorite && (
        <div className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/40 backdrop-blur-md">
          <span className="material-symbols-outlined text-white text-[15px] material-symbols-fill">
            favorite
          </span>
        </div>
      )}

      {/* Quality Warning badge if blurry or underexposed */}
      {photo.metadata?.analysis?.isBlurry && !isSelectionMode && (
        <div
          title="Photo potentiellement floue"
          className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-amber-500/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-0.5"
        >
          <span className="material-symbols-outlined text-[11px]">blur_on</span>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelectionMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              isSelected
                ? 'bg-primary border-primary scale-110 shadow-lg'
                : 'bg-white/20 border-white'
            }`}
          >
            {isSelected && (
              <span className="material-symbols-outlined text-white text-sm font-bold">check</span>
            )}
          </div>
        </div>
      )}

      <div
        className={`absolute inset-0 bg-black/10 transition-opacity ${
          isSelectionMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'
        }`}
      />
    </div>
  );
});

PhotoItem.displayName = 'PhotoItem';

const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
  featured,
  isSelectionMode,
  selectedIds = [],
  onToggleSelection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(3);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerOffsetTop, setContainerOffsetTop] = useState(0);

  // Measure responsive column count and container width
  const updateLayout = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = containerRef.current.clientWidth;
    setContainerWidth(width);
    setContainerOffsetTop(window.scrollY + rect.top);
    if (width >= 1024) {
      setCols(8);
    } else if (width >= 768) {
      setCols(6);
    } else {
      setCols(3);
    }
  }, []);

  useEffect(() => {
    updateLayout();
    const handleResize = () => updateLayout();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateLayout]);

  // Window scroll listener for virtualized row calculation
  useEffect(() => {
    if (photos.length <= 48) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollTop(window.scrollY);
          if (containerRef.current) {
            setContainerOffsetTop(window.scrollY + containerRef.current.getBoundingClientRect().top);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [photos.length]);

  // Group photos into rows
  const rows = useMemo(() => {
    const r: Photo[][] = [];
    for (let i = 0; i < photos.length; i += cols) {
      r.push(photos.slice(i, i + cols));
    }
    return r;
  }, [photos, cols]);

  // Estimated row height based on width divided by cols + 2px gutter
  const rowHeight = useMemo(() => {
    if (containerWidth <= 0 || cols <= 0) return 150;
    return Math.floor(containerWidth / cols) + 2;
  }, [containerWidth, cols]);

  // Small libraries: render directly without virtual overhead
  if (photos.length <= 48 || featured) {
    return (
      <div
        ref={containerRef}
        className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-grid-gap"
      >
        {photos.map((photo, index) => (
          <PhotoItem
            key={photo.id}
            photo={photo}
            onClick={onPhotoClick}
            isFeatured={featured && index === 0}
            isSelectionMode={isSelectionMode}
            isSelected={selectedIds.includes(photo.id)}
            onToggleSelection={onToggleSelection}
          />
        ))}
      </div>
    );
  }

  // Large library virtualization (tested up to 20,000 photos)
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 900;
  const relativeScrollTop = Math.max(0, scrollTop - containerOffsetTop);

  const OVERSCAN = 3;
  const startRow = Math.max(0, Math.floor(relativeScrollTop / rowHeight) - OVERSCAN);
  const endRow = Math.min(
    rows.length,
    Math.ceil((relativeScrollTop + viewportHeight) / rowHeight) + OVERSCAN
  );

  const topPadding = startRow * rowHeight;
  const bottomPadding = Math.max(0, (rows.length - endRow) * rowHeight);
  const visibleRows = rows.slice(startRow, endRow);

  return (
    <div ref={containerRef} className="w-full">
      {topPadding > 0 && <div style={{ height: `${topPadding}px` }} aria-hidden="true" />}
      <div className="space-y-[2px]">
        {visibleRows.map((row, rowIndex) => (
          <div
            key={startRow + rowIndex}
            className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-grid-gap"
          >
            {row.map((photo) => (
              <PhotoItem
                key={photo.id}
                photo={photo}
                onClick={onPhotoClick}
                isSelectionMode={isSelectionMode}
                isSelected={selectedIds.includes(photo.id)}
                onToggleSelection={onToggleSelection}
              />
            ))}
          </div>
        ))}
      </div>
      {bottomPadding > 0 && <div style={{ height: `${bottomPadding}px` }} aria-hidden="true" />}
    </div>
  );
};

export default PhotoGrid;
