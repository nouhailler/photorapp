export interface Photo {
  id: string;
  url: string;
  alt: string;
  date: string;
  isFavorite: boolean;
  metadata?: PhotoMetadata;
  adjustments?: PhotoAdjustments;
  albumIds: string[];
  tags: string[];
}

export interface PhotoMetadata {
  device: string;
  resolution: string;
  date: string;
  location?: string;
  exif?: {
    shutterSpeed: string;
    aperture: string;
    iso: string;
    focalLength: string;
  };
}

export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  filter?: string;
}

export interface Album {
  id: string;
  title: string;
  coverPhotoId: string;
  photoCount: number;
  isShared: boolean;
  isPrivate: boolean;
  collaborators?: string[];
  type?: 'personal' | 'shared' | 'ai';
}
