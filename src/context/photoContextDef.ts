import { createContext } from 'react';
import type { Photo, Album, PhotoAdjustments, SmartAlbumCriteria } from '../types/types';
import type { MigrationReport } from '../utils/db';

export interface PhotoContextType {
  photos: Photo[];
  albums: Album[];
  isLoading: boolean;
  migrationReport?: MigrationReport | null;
  toggleFavorite: (id: string) => void;
  updateAdjustments: (id: string, adjustments: PhotoAdjustments) => void;
  resetAdjustments: (id: string) => void;
  addPhotos: (newItems: { photo: Photo; blob?: Blob }[]) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  deletePhotos: (ids: string[]) => Promise<void>;
  createAlbum: (title: string, description?: string, isSmart?: boolean, smartCriteria?: SmartAlbumCriteria) => Album;
  updateAlbum: (album: Album) => void;
  deleteAlbum: (id: string) => void;
  addPhotosToAlbum: (photoIds: string[], albumId: string) => void;
  removePhotoFromAlbum: (photoId: string, albumId: string) => void;
  setAlbumCover: (albumId: string, photoId: string) => void;
  getPhotoUrl: (photo: Photo) => Promise<string>;
  analyzePhoto: (photoId: string) => Promise<void>;
  analyzeAllPhotos: (onProgress?: (current: number, total: number) => void) => Promise<void>;
}

export const PhotoContext = createContext<PhotoContextType | undefined>(undefined);
