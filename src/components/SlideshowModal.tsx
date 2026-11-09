import React, { useState, useEffect, useCallback } from 'react';
import type { Photo } from '../types/types';
import { usePhotoUrl } from '../hooks/usePhotoUrl';

interface SlideshowModalProps {
  photos: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

const SlideItem: React.FC<{ photo: Photo }> = ({ photo }) => {
  const url = usePhotoUrl(photo);

  const brightness = 100 + (photo.adjustments?.brightness || 0);
  const contrast = 100 + (photo.adjustments?.contrast || 0);
  const saturation = 100 + (photo.adjustments?.saturation || 0);
  const extraFilter = photo.adjustments?.filter || '';

  const photoStyle: React.CSSProperties = photo.adjustments
    ? {
        filter: `${extraFilter} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`.trim(),
        transform: `rotate(${photo.adjustments.rotation || 0}deg)`,
      }
    : {};

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4">
      <img
        src={url}
        alt={photo.alt}
        style={photoStyle}
        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl transition-all duration-700 animate-in fade-in"
      />
      <div className="mt-4 text-center text-white/90">
        <h4 className="text-headline-sm font-bold truncate max-w-lg">{photo.alt || 'Photo'}</h4>
        <p className="text-label-sm text-white/60">
          {photo.date} {photo.metadata?.location ? `· ${photo.metadata.location}` : ''}
        </p>
      </div>
    </div>
  );
};

export const SlideshowModal: React.FC<SlideshowModalProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [intervalMs, setIntervalMs] = useState(3500);
  const [isShuffle, setIsShuffle] = useState(false);

  if (initialIndex !== prevInitialIndex) {
    setPrevInitialIndex(initialIndex);
    setCurrentIndex(initialIndex);
  }

  const handleNext = useCallback(() => {
    if (photos.length === 0) return;
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * photos.length);
      setCurrentIndex(nextIdx);
    } else {
      setCurrentIndex((prev) => (prev + 1) % photos.length);
    }
  }, [photos.length, isShuffle]);

  const handlePrev = useCallback(() => {
    if (photos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Autoplay timer
  useEffect(() => {
    if (!isOpen || !isPlaying || photos.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isOpen, isPlaying, intervalMs, handleNext, photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  return (
    <div className="fixed inset-0 z-[120] bg-black flex flex-col justify-between animate-in fade-in duration-300 select-none">
      {/* Top Bar */}
      <header className="flex justify-between items-center px-6 py-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10">
        <div className="flex items-center gap-3 text-white">
          <span className="material-symbols-outlined text-primary text-[28px] material-symbols-fill">
            slideshow
          </span>
          <span className="text-label-md font-bold">
            Diaporama ({currentIndex + 1} / {photos.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed selector */}
          <select
            value={intervalMs}
            onChange={(e) => setIntervalMs(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 bg-white/10 text-white rounded-xl text-label-sm border border-white/20 outline-none"
          >
            <option value={2000} className="bg-neutral-900">2s par photo</option>
            <option value={3500} className="bg-neutral-900">3.5s par photo</option>
            <option value={5000} className="bg-neutral-900">5s par photo</option>
          </select>

          {/* Shuffle toggle */}
          <button
            onClick={() => setIsShuffle(!isShuffle)}
            className={`p-2 rounded-full transition-all ${
              isShuffle ? 'bg-primary text-on-primary' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            title="Lecture aléatoire"
          >
            <span className="material-symbols-outlined text-[20px]">shuffle</span>
          </button>

          {/* Close */}
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>
      </header>

      {/* Main Slide */}
      <main className="flex-grow flex items-center justify-center relative">
        <SlideItem photo={currentPhoto} />

        {/* Prev / Next Click Zones */}
        <button
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">chevron_left</span>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">chevron_right</span>
        </button>
      </main>

      {/* Bottom Controls */}
      <footer className="flex justify-center items-center gap-6 pb-6 pt-2 bg-gradient-to-t from-black/80 to-transparent z-10">
        <button
          onClick={handlePrev}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">skip_previous</span>
        </button>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl hover:brightness-110 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">
            {isPlaying ? 'pause' : 'play_arrow'}
          </span>
        </button>

        <button
          onClick={handleNext}
          className="p-2 text-white/80 hover:text-white rounded-full hover:bg-white/10 active:scale-95"
        >
          <span className="material-symbols-outlined text-3xl">skip_next</span>
        </button>
      </footer>
    </div>
  );
};
