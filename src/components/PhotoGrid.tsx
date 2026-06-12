import React from 'react';
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

const PhotoItem: React.FC<{ 
  photo: Photo, 
  onClick?: (photo: Photo) => void, 
  isFeatured?: boolean,
  isSelectionMode?: boolean,
  isSelected?: boolean,
  onToggleSelection?: (id: string) => void
}> = ({ photo, onClick, isFeatured, isSelectionMode, isSelected, onToggleSelection }) => {
  const url = usePhotoUrl(photo);

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
      className={`relative aspect-square group overflow-hidden bg-surface-container cursor-pointer ${isFeatured ? 'col-span-2 row-span-2' : ''}`}
      onClick={handleClick}
    >
      <img 
        src={url} 
        alt={photo.alt} 
        className={`w-full h-full object-cover transition-transform duration-700 ${!isSelectionMode ? 'group-hover:scale-105' : ''} ${isSelected ? 'scale-90 opacity-80' : ''}`}
        loading="lazy"
      />
      
      {/* Favorite Indicator */}
      {!isSelectionMode && photo.isFavorite && (
        <div className="absolute top-2 right-2 p-1.5 rounded-full bg-black/20 backdrop-blur-md">
          <span className="material-symbols-outlined text-white text-lg material-symbols-fill">favorite</span>
        </div>
      )}

      {/* Selection Indicator */}
      {isSelectionMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-primary border-primary scale-110 shadow-lg' : 'bg-white/20 border-white'}`}>
            {isSelected && <span className="material-symbols-outlined text-white text-sm font-bold">check</span>}
          </div>
        </div>
      )}

      <div className={`absolute inset-0 bg-black/10 transition-opacity ${isSelectionMode ? 'hidden' : 'opacity-0 group-hover:opacity-100'}`} />
    </div>
  );
};

const PhotoGrid: React.FC<PhotoGridProps> = ({ 
  photos, 
  onPhotoClick, 
  featured, 
  isSelectionMode, 
  selectedIds = [], 
  onToggleSelection 
}) => {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-grid-gap">
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
};

export default PhotoGrid;
