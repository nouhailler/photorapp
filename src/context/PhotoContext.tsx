import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Photo, Album, PhotoAdjustments } from '../types/types';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from '../assets/data/mockData';

interface PhotoContextType {
  photos: Photo[];
  albums: Album[];
  toggleFavorite: (id: string) => void;
  updateAdjustments: (id: string, adjustments: PhotoAdjustments) => void;
  addPhoto: (photo: Photo) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('gallery_pro_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  const [albums] = useState<Album[]>(INITIAL_ALBUMS);

  useEffect(() => {
    localStorage.setItem('gallery_pro_photos', JSON.stringify(photos));
  }, [photos]);

  const toggleFavorite = (id: string) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, isFavorite: !p.isFavorite } : p
    ));
  };

  const updateAdjustments = (id: string, adjustments: PhotoAdjustments) => {
    setPhotos(prev => prev.map(p => 
      p.id === id ? { ...p, adjustments } : p
    ));
  };

  const addPhoto = (photo: Photo) => {
    setPhotos(prev => [photo, ...prev]);
  };

  return (
    <PhotoContext.Provider value={{ photos, albums, toggleFavorite, updateAdjustments, addPhoto }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) throw new Error('usePhotos must be used within a PhotoProvider');
  return context;
};
