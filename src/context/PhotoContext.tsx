import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Photo, Album, PhotoAdjustments } from '../types/types';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from '../assets/data/mockData';

interface PhotoContextType {
  photos: Photo[];
  albums: Album[];
  toggleFavorite: (id: string) => void;
  updateAdjustments: (id: string, adjustments: PhotoAdjustments) => void;
  addPhotos: (newPhotos: Photo[]) => void;
  deletePhoto: (id: string) => void;
  createAlbum: (title: string) => void;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('gallery_pro_photos');
    return saved ? JSON.parse(saved) : INITIAL_PHOTOS;
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    const saved = localStorage.getItem('gallery_pro_albums');
    return saved ? JSON.parse(saved) : INITIAL_ALBUMS;
  });

  useEffect(() => {
    localStorage.setItem('gallery_pro_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('gallery_pro_albums', JSON.stringify(albums));
  }, [albums]);

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

  const addPhotos = (newPhotos: Photo[]) => {
    setPhotos(prev => [...newPhotos, ...prev]);
  };

  const deletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const createAlbum = (title: string) => {
    const newAlbum: Album = {
      id: Date.now().toString(),
      title,
      coverPhotoId: photos[0]?.id || '',
      photoCount: 0,
      isShared: false,
      isPrivate: true,
      type: 'personal'
    };
    setAlbums(prev => [newAlbum, ...prev]);
  };

  return (
    <PhotoContext.Provider value={{ photos, albums, toggleFavorite, updateAdjustments, addPhotos, deletePhoto, createAlbum }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) throw new Error('usePhotos must be used within a PhotoProvider');
  return context;
};
