import React from 'react';
import type { Photo } from '../types/types';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo) => void;
}

const PhotoGrid: React.FC<PhotoGridProps> = ({ photos, onPhotoClick }) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-grid-gap">
      {photos.map((photo) => (
        <div 
          key={photo.id} 
          className="relative aspect-square group overflow-hidden bg-surface-container cursor-pointer"
          onClick={() => onPhotoClick?.(photo)}
        >
          <img 
            src={photo.url} 
            alt={photo.alt} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          {photo.isFavorite && (
            <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 backdrop-blur-md">
              <span className="material-symbols-outlined text-white text-lg material-symbols-fill">favorite</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
