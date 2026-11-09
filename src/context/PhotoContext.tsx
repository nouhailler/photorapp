import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Photo, Album, PhotoAdjustments, SmartAlbumCriteria } from '../types/types';
import { INITIAL_PHOTOS, INITIAL_ALBUMS } from '../assets/data/mockData';
import {
  getPhotoBlob,
  savePhotoBlob,
  savePhotoMeta,
  saveAlbumMeta,
  deleteAlbumMeta,
  deletePhotoAtomic,
  deletePhotosAtomic,
  migrateFromLocalStorage,
} from '../utils/db';
import type { MigrationReport } from '../utils/db';
import { analyzeImageQuality } from '../services/qualityService';
import { PhotoContext } from './photoContextDef';

export const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>(() => {
    try {
      const saved = localStorage.getItem('gallery_pro_photos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading photos from localStorage cache:', e);
    }
    return INITIAL_PHOTOS.map((p) => ({ ...p, storage: p.storage || 'remote' }));
  });

  const [albums, setAlbums] = useState<Album[]>(() => {
    try {
      const saved = localStorage.getItem('gallery_pro_albums');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading albums from localStorage cache:', e);
    }
    return INITIAL_ALBUMS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [migrationReport, setMigrationReport] = useState<MigrationReport | null>(null);
  const localUrlsRef = useRef<Record<string, string>>({});

  // Initialize and migrate IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    const currentUrls = localUrlsRef.current;
    const initDb = async () => {
      try {
        const result = await migrateFromLocalStorage(INITIAL_PHOTOS, INITIAL_ALBUMS);
        if (isMounted) {
          setPhotos(result.photos);
          setAlbums(result.albums);
          setMigrationReport(result.report);
        }
      } catch (e) {
        console.warn('IndexedDB migration error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    initDb();
    return () => {
      isMounted = false;
      const urlsToRevoke = Object.values(currentUrls);
      urlsToRevoke.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // Ignore
        }
      });
    };
  }, []);

  // Sync to localStorage as a lightweight secondary mirror (IndexedDB is source of truth)
  useEffect(() => {
    try {
      localStorage.setItem('gallery_pro_photos', JSON.stringify(photos));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for photos cache:', e);
    }
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem('gallery_pro_albums', JSON.stringify(albums));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for albums cache:', e);
    }
  }, [albums]);

  const getPhotoUrl = useCallback(async (photo: Photo): Promise<string> => {
    if (photo.storage === 'remote' || !photo.storage) {
      return photo.url;
    }

    if (localUrlsRef.current[photo.id]) {
      return localUrlsRef.current[photo.id];
    }

    const blob = await getPhotoBlob(photo.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      localUrlsRef.current[photo.id] = url;
      return url;
    }

    return photo.url;
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, isFavorite: !p.isFavorite, updatedAt: new Date().toISOString() };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  }, []);

  const updateAdjustments = useCallback((id: string, adjustments: PhotoAdjustments) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, adjustments, updatedAt: new Date().toISOString() };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  }, []);

  const resetAdjustments = useCallback((id: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated: Photo = {
            ...p,
            adjustments: {
              brightness: 0,
              contrast: 0,
              saturation: 0,
              exposure: 0,
              temperature: 0,
              tint: 0,
              highlights: 0,
              shadows: 0,
              vignette: 0,
              rotation: 0,
              aspectRatio: 'original' as const,
              filter: '',
            },
            updatedAt: new Date().toISOString(),
          };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  }, []);

  const addPhotos = useCallback(async (newItems: { photo: Photo; blob?: Blob }[]) => {
    for (const item of newItems) {
      if (item.blob && item.photo.storage === 'local') {
        await savePhotoBlob({ id: item.photo.id, blob: item.blob });
      }
      await savePhotoMeta(item.photo);
    }
    setPhotos((prev) => [...newItems.map((i) => i.photo), ...prev]);
  }, []);

  const deletePhoto = useCallback(
    async (id: string) => {
      const photoToDelete = photos.find((p) => p.id === id);
      const isLocal = photoToDelete?.storage === 'local';

      // 1. Calculate updated albums if cover photo was deleted
      const updatedAlbums: Album[] = [];
      const newAlbumsState = albums.map((album) => {
        if (album.coverPhotoId === id) {
          // Find replacement cover from remaining photos in this album
          const remainingInAlbum = photos.filter(
            (p) => p.id !== id && p.albumIds.includes(album.id)
          );
          const updatedAlbum: Album = {
            ...album,
            coverPhotoId: remainingInAlbum[0]?.id || '',
            updatedAt: new Date().toISOString(),
          };
          updatedAlbums.push(updatedAlbum);
          return updatedAlbum;
        }
        return album;
      });

      // 2. Perform safe atomic deletion (metadata + album covers in 1 transaction, then blob)
      await deletePhotoAtomic(id, updatedAlbums, isLocal);

      // 3. Clean up URL cache
      if (localUrlsRef.current[id]) {
        try {
          URL.revokeObjectURL(localUrlsRef.current[id]);
        } catch {
          // Ignore
        }
        delete localUrlsRef.current[id];
      }

      // 4. Update memory state
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      setAlbums(newAlbumsState);
    },
    [photos, albums]
  );

  const deletePhotos = useCallback(
    async (ids: string[]) => {
      const idsSet = new Set(ids);
      const localIds = photos
        .filter((p) => idsSet.has(p.id) && p.storage === 'local')
        .map((p) => p.id);

      // 1. Calculate updated albums if any cover was deleted
      const updatedAlbums: Album[] = [];
      const newAlbumsState = albums.map((album) => {
        if (idsSet.has(album.coverPhotoId)) {
          const remainingInAlbum = photos.filter(
            (p) => !idsSet.has(p.id) && p.albumIds.includes(album.id)
          );
          const updatedAlbum: Album = {
            ...album,
            coverPhotoId: remainingInAlbum[0]?.id || '',
            updatedAt: new Date().toISOString(),
          };
          updatedAlbums.push(updatedAlbum);
          return updatedAlbum;
        }
        return album;
      });

      // 2. Perform safe atomic bulk deletion
      await deletePhotosAtomic(ids, updatedAlbums, localIds);

      // 3. Clean up URL cache
      for (const id of ids) {
        if (localUrlsRef.current[id]) {
          try {
            URL.revokeObjectURL(localUrlsRef.current[id]);
          } catch {
            // Ignore
          }
          delete localUrlsRef.current[id];
        }
      }

      // 4. Update memory state
      setPhotos((prev) => prev.filter((p) => !idsSet.has(p.id)));
      setAlbums(newAlbumsState);
    },
    [photos, albums]
  );

  const createAlbum = useCallback(
    (title: string, description?: string, isSmart?: boolean, smartCriteria?: SmartAlbumCriteria): Album => {
      const newAlbum: Album = {
        id: `album-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title,
        description,
        coverPhotoId: '',
        photoCount: 0,
        isShared: false,
        isPrivate: true,
        type: 'personal',
        isSmart: Boolean(isSmart),
        smartCriteria,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setAlbums((prev) => [newAlbum, ...prev]);
      saveAlbumMeta(newAlbum).catch(console.error);
      return newAlbum;
    },
    []
  );

  const updateAlbum = useCallback((album: Album) => {
    const updated = { ...album, updatedAt: new Date().toISOString() };
    setAlbums((prev) => prev.map((a) => (a.id === album.id ? updated : a)));
    saveAlbumMeta(updated).catch(console.error);
  }, []);

  const deleteAlbum = useCallback((id: string) => {
    setAlbums((prev) => prev.filter((a) => a.id !== id));
    deleteAlbumMeta(id).catch(console.error);

    // Remove the album reference from all photos
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.albumIds.includes(id)) {
          const updated = {
            ...p,
            albumIds: p.albumIds.filter((aid) => aid !== id),
            updatedAt: new Date().toISOString(),
          };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );
  }, []);

  const addPhotosToAlbum = useCallback((photoIds: string[], albumId: string) => {
    const idsSet = new Set(photoIds);
    setPhotos((prev) =>
      prev.map((p) => {
        if (idsSet.has(p.id) && !p.albumIds.includes(albumId)) {
          const updated = { ...p, albumIds: [...p.albumIds, albumId] };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );

    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === albumId) {
          const cover = a.coverPhotoId || photoIds[0] || '';
          const updated: Album = {
            ...a,
            coverPhotoId: cover,
            updatedAt: new Date().toISOString(),
          };
          saveAlbumMeta(updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );
  }, []);

  const removePhotoFromAlbum = useCallback((photoId: string, albumId: string) => {
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId && p.albumIds.includes(albumId)) {
          const updated = {
            ...p,
            albumIds: p.albumIds.filter((id) => id !== albumId),
            updatedAt: new Date().toISOString(),
          };
          savePhotoMeta(updated).catch(console.error);
          return updated;
        }
        return p;
      })
    );

    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === albumId && a.coverPhotoId === photoId) {
          const remainingPhotos = photos.filter(
            (p) => p.id !== photoId && p.albumIds.includes(albumId)
          );
          const updated: Album = {
            ...a,
            coverPhotoId: remainingPhotos[0]?.id || '',
            updatedAt: new Date().toISOString(),
          };
          saveAlbumMeta(updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );
  }, [photos]);

  const setAlbumCover = useCallback((albumId: string, photoId: string) => {
    setAlbums((prev) =>
      prev.map((a) => {
        if (a.id === albumId) {
          const updated: Album = {
            ...a,
            coverPhotoId: photoId,
            updatedAt: new Date().toISOString(),
          };
          saveAlbumMeta(updated).catch(console.error);
          return updated;
        }
        return a;
      })
    );
  }, []);

  const analyzePhoto = useCallback(
    async (photoId: string) => {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo) return;

      try {
        let blob: Blob | null = null;
        if (photo.storage === 'local') {
          blob = await getPhotoBlob(photo.id);
        } else {
          const res = await fetch(photo.url);
          blob = await res.blob();
        }

        if (blob) {
          const analysis = await analyzeImageQuality(blob);
          setPhotos((prev) =>
            prev.map((p) => {
              if (p.id === photoId) {
                const currentMeta = p.metadata || {
                  device: 'Unknown',
                  resolution: 'Unknown',
                  date: p.date,
                };
                const updated: Photo = {
                  ...p,
                  metadata: {
                    ...currentMeta,
                    analysis,
                  },
                  updatedAt: new Date().toISOString(),
                };
                savePhotoMeta(updated).catch(console.error);
                return updated;
              }
              return p;
            })
          );
        }
      } catch (err) {
        console.warn(`Analysis failed for photo ${photoId}:`, err);
      }
    },
    [photos]
  );

  const analyzeAllPhotos = useCallback(
    async (onProgress?: (current: number, total: number) => void) => {
      const unanalyzed = photos.filter((p) => !p.metadata?.analysis);
      const total = unanalyzed.length;

      for (let i = 0; i < total; i++) {
        const photo = unanalyzed[i];
        onProgress?.(i + 1, total);
        await analyzePhoto(photo.id);
      }
    },
    [photos, analyzePhoto]
  );

  return (
    <PhotoContext.Provider
      value={{
        photos,
        albums,
        isLoading,
        migrationReport,
        toggleFavorite,
        updateAdjustments,
        resetAdjustments,
        addPhotos,
        deletePhoto,
        deletePhotos,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        addPhotosToAlbum,
        removePhotoFromAlbum,
        setAlbumCover,
        getPhotoUrl,
        analyzePhoto,
        analyzeAllPhotos,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
