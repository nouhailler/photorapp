import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Photo, Album, PhotoAdjustments } from '../types/types';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from '../assets/data/mockData';
import { getPhotoBlob, savePhotoBlob, deletePhotoBlob } from '../utils/db';

interface PhotoContextType {
  photos: Photo[];
  albums: Album[];
  toggleFavorite: (id: string) => void;
  updateAdjustments: (id: string, adjustments: PhotoAdjustments) => void;
  addPhotos: (newItems: { photo: Photo, blob?: Blob }[]) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  createAlbum: (title: string) => void;
  deleteAlbum: (id: string) => void;
  addPhotosToAlbum: (photoIds: string[], albumId: string) => void;
  getPhotoUrl: (photo: Photo) => Promise<string>;
}

const PhotoContext = createContext<PhotoContextType | undefined>(undefined);

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    const saved = localStorage.getItem('gallery_pro_photos');
    const initial = saved ? JSON.parse(saved) : INITIAL_PHOTOS;
    return initial.map((p: Photo) => ({ ...p, storage: p.storage || 'remote' }));
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    const saved = localStorage.getItem('gallery_pro_albums');
    return saved ? JSON.parse(saved) : INITIAL_ALBUMS;
  });

  const [localUrls, setLocalUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    localStorage.setItem('gallery_pro_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('gallery_pro_albums', JSON.stringify(albums));
  }, [albums]);

  const getPhotoUrl = useCallback(async (photo: Photo): Promise<string> => {
    if (photo.storage === 'remote') return photo.url;
    
    if (localUrls[photo.id]) return localUrls[photo.id];

    const blob = await getPhotoBlob(photo.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setLocalUrls(prev => ({ ...prev, [photo.id]: url }));
      return url;
    }
    return photo.url;
  }, [localUrls]);

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

  const addPhotos = async (newItems: { photo: Photo, blob?: Blob }[]) => {
    for (const item of newItems) {
      if (item.blob && item.photo.storage === 'local') {
        await savePhotoBlob({ id: item.photo.id, blob: item.blob });
      }
    }
    setPhotos(prev => [...newItems.map(i => i.photo), ...prev]);
  };

  const deletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (photo?.storage === 'local') {
      await deletePhotoBlob(id);
    }
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const createAlbum = (title: string) => {
    const newAlbum: Album = {
      id: Date.now().toString(),
      title,
      coverPhotoId: '',
      photoCount: 0,
      isShared: false,
      isPrivate: true,
      type: 'personal'
    };
    setAlbums(prev => [newAlbum, ...prev]);
  };

  const deleteAlbum = (id: string) => {
    setAlbums(prev => prev.filter(a => a.id !== id));
    // Also remove the album reference from all photos
    setPhotos(prev => prev.map(p => ({
      ...p,
      albumIds: p.albumIds.filter(aid => aid !== id)
    })));
  };

  const addPhotosToAlbum = (photoIds: string[], albumId: string) => {
    setPhotos(prev => prev.map(p => {
      if (photoIds.includes(p.id)) {
        const newAlbumIds = p.albumIds.includes(albumId) ? p.albumIds : [...p.albumIds, albumId];
        return { ...p, albumIds: newAlbumIds };
      }
      return p;
    }));

    setAlbums(prev => prev.map(a => {
      if (a.id === albumId) {
        // Correctly calculate new photo count by checking how many photos were actually added
        const addedPhotos = photos.filter(p => photoIds.includes(p.id) && !p.albumIds.includes(albumId));
        return {
          ...a,
          photoCount: a.photoCount + addedPhotos.length,
          coverPhotoId: a.coverPhotoId || photoIds[0]
        };
      }
      return a;
    }));
  };

  return (
    <PhotoContext.Provider value={{ 
      photos, 
      albums, 
      toggleFavorite, 
      updateAdjustments, 
      addPhotos, 
      deletePhoto, 
      createAlbum,
      deleteAlbum,
      addPhotosToAlbum,
      getPhotoUrl
    }}>
      {children}
    </PhotoContext.Provider>
  );
};

export const usePhotos = () => {
  const context = useContext(PhotoContext);
  if (!context) throw new Error('usePhotos must be used within a PhotoProvider');
  return context;
};
