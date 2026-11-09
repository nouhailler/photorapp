export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  exposure?: number;
  temperature?: number;
  tint?: number;
  highlights?: number;
  shadows?: number;
  vignette?: number;
  rotation?: number;
  aspectRatio?: 'original' | '1:1' | '4:3' | '16:9';
  filter?: string;
  cropRect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface PhotoExif {
  shutterSpeed?: string;
  aperture?: string;
  iso?: string;
  focalLength?: string;
  exposureTime?: string;
  fNumber?: string;
  cameraMake?: string;
  cameraModel?: string;
  lensModel?: string;
  flash?: string;
  whiteBalance?: string;
  orientation?: number;
}

export interface PhotoAnalysis {
  qualityScore?: number; // 0-100
  laplacianVariance?: number; // Blur metric
  isBlurry?: boolean;
  meanLuminance?: number; // 0-255
  isUnderexposed?: boolean;
  isOverexposed?: boolean;
  dHash?: string; // Perceptual hash for similarity
  dominantColors?: string[];
  detectedFacesCount?: number;
}

export interface PhotoMetadata {
  device: string;
  resolution: string;
  width?: number;
  height?: number;
  date: string; // ISO or formatted date
  location?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  fileSize?: number; // In bytes
  mimeType?: string;
  hash?: string; // SHA-256
  exif?: PhotoExif;
  analysis?: PhotoAnalysis;
}

export interface Photo {
  id: string;
  url: string;
  alt: string;
  date: string; // YYYY-MM-DD
  isFavorite: boolean;
  metadata?: PhotoMetadata;
  adjustments?: PhotoAdjustments;
  albumIds: string[];
  tags: string[];
  storage?: 'local' | 'remote';
  personIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SmartAlbumCriteria {
  isFavorite?: boolean;
  year?: number;
  month?: number;
  tag?: string;
  location?: string;
  hasGps?: boolean;
  isBlurry?: boolean;
  cameraModel?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface Album {
  id: string;
  title: string;
  description?: string;
  coverPhotoId: string;
  photoCount: number;
  isShared: boolean;
  isPrivate: boolean;
  collaborators?: string[];
  type?: 'personal' | 'shared' | 'ai';
  isSmart?: boolean;
  smartCriteria?: SmartAlbumCriteria;
  createdAt?: string;
  updatedAt?: string;
}

export interface PersonGroup {
  id: string;
  name: string;
  coverPhotoId?: string;
  photoIds: string[];
  createdAt: string;
}

export interface StorageDiagnostic {
  totalPhotos: number;
  localPhotosCount: number;
  remotePhotosCount: number;
  totalAlbums: number;
  totalSizeEstimatedBytes: number;
  orphanedBlobsCount: number;
  missingBlobsCount: number;
  indexedDbSupported: boolean;
}

