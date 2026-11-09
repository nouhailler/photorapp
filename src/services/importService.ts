import ExifReader from 'exifreader';
import type { Photo, PhotoMetadata, PhotoExif } from '../types/types';
import { savePhotoBlob, savePhotoMeta } from '../utils/db';

export interface ImportProgress {
  current: number;
  total: number;
  fileName: string;
  phase: 'reading' | 'exif' | 'hashing' | 'saving' | 'complete';
}

export interface ImportResult {
  importedPhotos: Photo[];
  skippedDuplicates: number;
  failedFiles: { name: string; reason: string }[];
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/tiff',
  'image/bmp',
]);

/**
 * Calculates SHA-256 hash of a file for exact duplicate detection.
 */
export async function calculateFileHash(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Loads an image from a blob to determine intrinsic dimensions.
 */
function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      URL.revokeObjectURL(url);
      resolve({ width, height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
}

interface TagItem {
  description?: string;
  value?: unknown;
}

/**
 * Extracts EXIF metadata and GPS coordinates from a file buffer using ExifReader.
 */
export async function extractExifData(
  file: File
): Promise<{
  exif?: PhotoExif;
  latitude?: number;
  longitude?: number;
  shootDate?: string;
  device?: string;
}> {
  try {
    const buffer = await file.arrayBuffer();
    const tags = ExifReader.load(buffer, { expanded: true });
    const tagsRecord = tags as unknown as Record<string, Record<string, TagItem | undefined> | undefined>;

    let latitude: number | undefined;
    let longitude: number | undefined;

    // Real GPS extraction
    if (tags.gps && typeof tags.gps.Latitude === 'number' && typeof tags.gps.Longitude === 'number') {
      latitude = tags.gps.Latitude;
      longitude = tags.gps.Longitude;
    }

    const exifTags = (tagsRecord.exif || {}) as Record<string, TagItem | undefined>;
    const imageTags = (tagsRecord.image || {}) as Record<string, TagItem | undefined>;

    const make = (imageTags.Make?.description || '').trim();
    const model = (imageTags.Model?.description || '').trim();
    let device = '';
    if (make && model) {
      device = model.toLowerCase().startsWith(make.toLowerCase()) ? model : `${make} ${model}`;
    } else if (model) {
      device = model;
    } else if (make) {
      device = make;
    }

    // Extraction of shooting date from EXIF
    let shootDate: string | undefined;
    const rawDate = exifTags.DateTimeOriginal?.description || exifTags.CreateDate?.description || imageTags.DateTime?.description;
    if (rawDate && typeof rawDate === 'string') {
      // EXIF format is typically "YYYY:MM:DD HH:MM:SS"
      const match = rawDate.match(/^(\d{4})[:-](\d{2})[:-](\d{2})/);
      if (match) {
        shootDate = `${match[1]}-${match[2]}-${match[3]}`;
      }
    }

    const shutterSpeed = exifTags.ExposureTime?.description || exifTags.ShutterSpeedValue?.description;
    const aperture = exifTags.FNumber?.description || exifTags.ApertureValue?.description;
    const iso = exifTags.ISOSpeedRatings?.description || exifTags.PhotographicSensitivity?.description;
    const focalLength = exifTags.FocalLength?.description;

    const exif: PhotoExif = {};
    if (shutterSpeed) exif.shutterSpeed = shutterSpeed;
    if (aperture) exif.aperture = aperture;
    if (iso) exif.iso = iso;
    if (focalLength) exif.focalLength = focalLength;
    if (make) exif.cameraMake = make;
    if (model) exif.cameraModel = model;

    return {
      exif: Object.keys(exif).length > 0 ? exif : undefined,
      latitude,
      longitude,
      shootDate,
      device: device || undefined,
    };
  } catch {
    // Non-fatal if EXIF parsing fails (e.g., standard PNG or stripped JPEG)
    return {};
  }
}

/**
 * Centralized import processor.
 */
export async function processPhotosImport(
  files: FileList | File[],
  existingPhotos: Photo[],
  onProgress?: (progress: ImportProgress) => void,
  options: { skipDuplicates?: boolean } = { skipDuplicates: true }
): Promise<ImportResult> {
  const fileArray = Array.from(files);
  const total = fileArray.length;
  const importedPhotos: Photo[] = [];
  const failedFiles: { name: string; reason: string }[] = [];
  let skippedDuplicates = 0;

  // Build a set of existing hashes for O(1) duplicate checks
  const existingHashes = new Set(
    existingPhotos
      .map((p) => p.metadata?.hash)
      .filter((h): h is string => Boolean(h))
  );

  for (let i = 0; i < total; i++) {
    const file = fileArray[i];

    onProgress?.({
      current: i + 1,
      total,
      fileName: file.name,
      phase: 'reading',
    });

    // 1. MIME Validation
    if (!SUPPORTED_MIME_TYPES.has(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
      failedFiles.push({
        name: file.name,
        reason: `Format non supporté (${file.type || 'type inconnu'})`,
      });
      continue;
    }

    try {
      // 2. Hash calculation for duplicate prevention
      onProgress?.({
        current: i + 1,
        total,
        fileName: file.name,
        phase: 'hashing',
      });
      const hash = await calculateFileHash(file);

      if (options.skipDuplicates && existingHashes.has(hash)) {
        skippedDuplicates++;
        continue;
      }
      existingHashes.add(hash);

      // 3. EXIF and Dimensions Extraction
      onProgress?.({
        current: i + 1,
        total,
        fileName: file.name,
        phase: 'exif',
      });
      const [exifData, dimensions] = await Promise.all([
        extractExifData(file),
        getImageDimensions(file),
      ]);

      // Calculate Megapixels resolution label
      let resolutionLabel = 'Inconnue';
      if (dimensions.width > 0 && dimensions.height > 0) {
        const mp = ((dimensions.width * dimensions.height) / 1000000).toFixed(1);
        resolutionLabel = `${dimensions.width} × ${dimensions.height} (${mp} MP)`;
      }

      // Determine date (EXIF shoot date > file last modified > today)
      let photoDate = exifData.shootDate;
      if (!photoDate && file.lastModified) {
        try {
          photoDate = new Date(file.lastModified).toISOString().split('T')[0];
        } catch {
          photoDate = new Date().toISOString().split('T')[0];
        }
      }
      if (!photoDate) {
        photoDate = new Date().toISOString().split('T')[0];
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const metadata: PhotoMetadata = {
        device: exifData.device || 'Fichier importé',
        resolution: resolutionLabel,
        width: dimensions.width,
        height: dimensions.height,
        date: photoDate,
        latitude: exifData.latitude,
        longitude: exifData.longitude,
        fileSize: file.size,
        mimeType: file.type,
        hash,
        exif: exifData.exif,
      };

      const photo: Photo = {
        id,
        url: '', // Object URL resolved reactively via usePhotoUrl
        alt: file.name.replace(/\.[^/.]+$/, ''),
        date: photoDate,
        isFavorite: false,
        albumIds: [],
        tags: [],
        storage: 'local', // CRITICAL: Always local for user imported files!
        metadata,
        createdAt: new Date().toISOString(),
      };

      // 4. Save to IndexedDB (both blob and metadata)
      onProgress?.({
        current: i + 1,
        total,
        fileName: file.name,
        phase: 'saving',
      });
      await savePhotoBlob({ id, blob: file });
      await savePhotoMeta(photo);

      importedPhotos.push(photo);
    } catch (err) {
      console.error(`[ImportService] Failed to import ${file.name}:`, err);
      failedFiles.push({
        name: file.name,
        reason: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    }
  }

  onProgress?.({
    current: total,
    total,
    fileName: '',
    phase: 'complete',
  });

  return {
    importedPhotos,
    skippedDuplicates,
    failedFiles,
  };
}
