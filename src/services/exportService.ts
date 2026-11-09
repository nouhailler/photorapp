import JSZip from 'jszip';
import type { Photo, Album } from '../types/types';
import { getPhotoBlob, savePhotoBlob, savePhotoMeta, saveAlbumMeta } from '../utils/db';

export interface BackupFileEntry {
  fileName: string;
  mimeType: string;
  sha256?: string;
  sizeBytes?: number;
  isLocal: boolean;
}

export interface BackupManifest {
  app: string;
  manifest_version: number;
  backupDate: string;
  photoCount: number;
  albumCount: number;
  localFilesExpected: number;
  localFilesArchived: number;
  remoteFilesCount: number;
  missingFilesCount: number;
  files: Record<string, BackupFileEntry>;
}

export interface BackupResult {
  success: boolean;
  totalPhotos: number;
  localSaved: number;
  missingLocal: number;
  remoteReferences: number;
  warnings: string[];
}

export interface RestoreResult {
  success: boolean;
  restoredPhotos: number;
  restoredAlbums: number;
  skippedPhotos: number;
  missingBlobs: string[];
  integrityErrors: string[];
  warnings: string[];
}

export interface ZipExportResult {
  total: number;
  exported: number;
  failed: { id: string; name: string; reason: string }[];
}

/**
 * Calculates SHA-256 hex string for a given Blob.
 */
async function computeBlobSha256(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Helper to determine file extension from mimeType or filename.
 */
function getExtension(mimeType?: string, fallback = 'jpg'): string {
  if (!mimeType) return fallback;
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('webp')) return 'webp';
  if (mimeType.includes('gif')) return 'gif';
  if (mimeType.includes('avif')) return 'avif';
  return 'jpg';
}

/**
 * Helper to trigger a browser file download.
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Render a photo with its adjustments on an offscreen canvas and return a JPEG Blob.
 */
export async function renderAdjustedPhotoBlob(
  photo: Photo,
  originalBlob?: Blob
): Promise<Blob> {
  const blob = originalBlob || (photo.storage === 'local' ? await getPhotoBlob(photo.id) : null);

  let imgUrl: string;
  let isRevokable = false;

  if (blob) {
    imgUrl = URL.createObjectURL(blob);
    isRevokable = true;
  } else {
    imgUrl = photo.url;
  }

  try {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load image for rendering'));
      img.src = imgUrl;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    const adjustments = photo.adjustments;
    const rotation = adjustments?.rotation || 0;
    const isRotated90or270 = rotation % 180 !== 0;

    const naturalWidth = img.naturalWidth || img.width;
    const naturalHeight = img.naturalHeight || img.height;

    // Handle Crop or Aspect Ratio
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = naturalWidth;
    let sourceHeight = naturalHeight;

    if (adjustments?.cropRect && adjustments.cropRect.width > 0 && adjustments.cropRect.height > 0) {
      sourceX = Math.max(0, Math.min(naturalWidth - 1, adjustments.cropRect.x));
      sourceY = Math.max(0, Math.min(naturalHeight - 1, adjustments.cropRect.y));
      sourceWidth = Math.min(naturalWidth - sourceX, adjustments.cropRect.width);
      sourceHeight = Math.min(naturalHeight - sourceY, adjustments.cropRect.height);
    } else if (adjustments?.aspectRatio && adjustments.aspectRatio !== 'original') {
      let targetRatio = 1;
      if (adjustments.aspectRatio === '4:3') targetRatio = 4 / 3;
      if (adjustments.aspectRatio === '16:9') targetRatio = 16 / 9;

      const currentRatio = naturalWidth / naturalHeight;
      if (currentRatio > targetRatio) {
        sourceWidth = naturalHeight * targetRatio;
        sourceX = (naturalWidth - sourceWidth) / 2;
      } else {
        sourceHeight = naturalWidth / targetRatio;
        sourceY = (naturalHeight - sourceHeight) / 2;
      }
    }

    // Set canvas dimensions
    canvas.width = Math.round(isRotated90or270 ? sourceHeight : sourceWidth);
    canvas.height = Math.round(isRotated90or270 ? sourceWidth : sourceHeight);

    // Apply rotation transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Filters: brightness, contrast, saturation, exposure, temperature, tint
    const brightness = 100 + (adjustments?.brightness || 0) + (adjustments?.exposure || 0);
    const contrast = 100 + (adjustments?.contrast || 0);
    const saturation = 100 + (adjustments?.saturation || 0);
    const extraFilter = adjustments?.filter || '';

    // Color temperature / tint approximation using hue-rotate and sepia
    let tempFilter = '';
    if (adjustments?.temperature && adjustments.temperature !== 0) {
      tempFilter = adjustments.temperature > 0
        ? `sepia(${Math.min(50, adjustments.temperature / 2)}%)`
        : `hue-rotate(${adjustments.temperature * 0.3}deg)`;
    }

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${extraFilter} ${tempFilter}`.trim();

    const drawW = sourceWidth;
    const drawH = sourceHeight;
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      -drawW / 2,
      -drawH / 2,
      drawW,
      drawH
    );
    ctx.restore();

    // Vignette overlay if configured
    if (adjustments?.vignette && adjustments.vignette > 0) {
      const radius = Math.max(canvas.width, canvas.height) / 2;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        radius * 0.4,
        canvas.width / 2,
        canvas.height / 2,
        radius
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${Math.min(0.9, adjustments.vignette / 100)})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))),
        'image/jpeg',
        0.92
      );
    });
  } finally {
    if (isRevokable) {
      URL.revokeObjectURL(imgUrl);
    }
  }
}

/**
 * Export a single photo to file.
 */
export async function exportSinglePhoto(
  photo: Photo,
  withAdjustments = true
): Promise<void> {
  const originalExt = getExtension(photo.metadata?.mimeType, 'jpg');
  const extension = withAdjustments && photo.adjustments ? 'jpg' : originalExt;
  const filename = `${photo.alt || 'photo'}.${extension}`;

  if (withAdjustments && photo.adjustments) {
    const renderedBlob = await renderAdjustedPhotoBlob(photo);
    triggerDownload(renderedBlob, filename);
    return;
  }

  if (photo.storage === 'local') {
    const blob = await getPhotoBlob(photo.id);
    if (blob) {
      triggerDownload(blob, filename);
      return;
    }
  }

  // Remote photo fallback
  const response = await fetch(photo.url);
  const blob = await response.blob();
  triggerDownload(blob, filename);
}

/**
 * Export a batch of photos as a ZIP archive with detailed failure tracking.
 */
export async function exportPhotosToZip(
  photos: Photo[],
  zipFilename = 'gallery-pro-export.zip',
  onProgress?: (percent: number, currentName: string) => void
): Promise<ZipExportResult> {
  const zip = new JSZip();
  const folder = zip.folder('photos') || zip;
  const total = photos.length;
  const failed: { id: string; name: string; reason: string }[] = [];
  let exported = 0;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    const isEdited = Boolean(photo.adjustments);
    const ext = isEdited ? 'jpg' : getExtension(photo.metadata?.mimeType, 'jpg');
    const safeName = (photo.alt || `photo_${photo.id}`).replace(/[/\\?%*:|"<>]/g, '_');
    const fileName = `${safeName}.${ext}`;

    onProgress?.(Math.round(((i + 1) / total) * 85), fileName);

    try {
      let blob: Blob | null = null;
      if (isEdited) {
        blob = await renderAdjustedPhotoBlob(photo);
      } else if (photo.storage === 'local') {
        blob = await getPhotoBlob(photo.id);
      } else {
        const res = await fetch(photo.url);
        blob = await res.blob();
      }

      if (blob) {
        folder.file(fileName, blob);
        exported++;
      } else {
        failed.push({ id: photo.id, name: fileName, reason: 'Fichier binaire introuvable' });
      }
    } catch (e) {
      const reason = e instanceof Error ? e.message : 'Erreur de traitement';
      failed.push({ id: photo.id, name: fileName, reason });
    }
  }

  if (exported > 0) {
    onProgress?.(90, 'Génération du fichier ZIP...');
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    triggerDownload(zipBlob, zipFilename);
  }

  onProgress?.(100, exported === total ? 'Export terminé !' : `Export terminé avec ${failed.length} avertissement(s).`);

  return { total, exported, failed };
}

/**
 * Export metadata as JSON.
 */
export function exportMetadataJson(photos: Photo[], albums: Album[]): void {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '2.0',
    app: 'Gallery Pro',
    photos,
    albums,
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  triggerDownload(blob, `gallery_pro_metadata_${new Date().toISOString().split('T')[0]}.json`);
}

/**
 * Full Library Backup (ZIP with manifest, photos + metadata.json).
 * Includes SHA-256 checksums and distinguishes local originals from remote links.
 */
export async function createFullLibraryBackup(
  photos: Photo[],
  albums: Album[],
  onProgress?: (percent: number, status: string) => void
): Promise<BackupResult> {
  const zip = new JSZip();
  const photosFolder = zip.folder('photos') || zip;
  const warnings: string[] = [];

  const manifest: BackupManifest = {
    app: 'Gallery Pro',
    manifest_version: 2,
    backupDate: new Date().toISOString(),
    photoCount: photos.length,
    albumCount: albums.length,
    localFilesExpected: 0,
    localFilesArchived: 0,
    remoteFilesCount: 0,
    missingFilesCount: 0,
    files: {},
  };

  const total = photos.length;
  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    onProgress?.(
      Math.round(((i + 1) / total) * 80),
      `Sauvegarde de ${photo.alt || photo.id}...`
    );

    const isLocal = photo.storage === 'local';
    const ext = getExtension(photo.metadata?.mimeType, 'jpg');
    const archiveFileName = `${photo.id}.${ext}`;

    if (isLocal) {
      manifest.localFilesExpected++;
      try {
        const blob = await getPhotoBlob(photo.id);
        if (blob) {
          const sha256 = await computeBlobSha256(blob);
          photosFolder.file(archiveFileName, blob);
          manifest.localFilesArchived++;
          manifest.files[photo.id] = {
            fileName: archiveFileName,
            mimeType: photo.metadata?.mimeType || blob.type || 'image/jpeg',
            sha256,
            sizeBytes: blob.size,
            isLocal: true,
          };
        } else {
          manifest.missingFilesCount++;
          warnings.push(`Blob manquant pour la photo locale ${photo.id} (${photo.alt})`);
          manifest.files[photo.id] = {
            fileName: archiveFileName,
            mimeType: photo.metadata?.mimeType || 'image/jpeg',
            isLocal: true,
          };
        }
      } catch (err) {
        manifest.missingFilesCount++;
        warnings.push(`Échec lecture blob ${photo.id}: ${err instanceof Error ? err.message : 'Erreur'}`);
      }
    } else {
      manifest.remoteFilesCount++;
      manifest.files[photo.id] = {
        fileName: photo.url,
        mimeType: photo.metadata?.mimeType || 'image/jpeg',
        isLocal: false,
      };
    }
  }

  // Save manifest and metadata
  zip.file('backup_manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('metadata.json', JSON.stringify({ photos, albums }, null, 2));

  onProgress?.(85, 'Compression de l\'archive de sauvegarde...');
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(content, `gallery_pro_backup_${dateStr}.gpro.zip`);
  onProgress?.(100, 'Sauvegarde téléchargée avec succès.');

  return {
    success: true,
    totalPhotos: photos.length,
    localSaved: manifest.localFilesArchived,
    missingLocal: manifest.missingFilesCount,
    remoteReferences: manifest.remoteFilesCount,
    warnings,
  };
}

/**
 * Restores a full backup from a ZIP archive with pre-validation and checksum verification.
 */
export async function restoreFullLibraryBackup(
  backupFile: File,
  onProgress?: (percent: number, status: string) => void
): Promise<RestoreResult> {
  onProgress?.(5, 'Lecture et vérification du format de l\'archive...');

  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(backupFile);
  } catch (e) {
    throw new Error(
      `Fichier ZIP corrompu ou illisible : ${e instanceof Error ? e.message : 'Erreur'}`,
      { cause: e }
    );
  }

  // 1. Verify metadata.json
  const metadataFile = zip.file('metadata.json');
  if (!metadataFile) {
    throw new Error('Fichier metadata.json manquant dans l\'archive. Restauration impossible.');
  }

  onProgress?.(15, 'Extraction des métadonnées...');
  let metadataStr: string;
  try {
    metadataStr = await metadataFile.async('string');
  } catch (e) {
    throw new Error('Impossible de lire metadata.json dans l\'archive', { cause: e });
  }

  let parsedMetadata: { photos?: Photo[]; albums?: Album[] };
  try {
    parsedMetadata = JSON.parse(metadataStr);
  } catch {
    throw new Error('Format JSON invalide dans metadata.json');
  }

  if (!parsedMetadata || !Array.isArray(parsedMetadata.photos)) {
    throw new Error('Structure de données invalide dans metadata.json (tableau de photos manquant)');
  }

  const photos = parsedMetadata.photos;
  const albums = Array.isArray(parsedMetadata.albums) ? parsedMetadata.albums : [];

  // 2. Read manifest if present
  const manifestFile = zip.file('backup_manifest.json');
  let manifest: BackupManifest | null = null;
  if (manifestFile) {
    try {
      const manifestStr = await manifestFile.async('string');
      manifest = JSON.parse(manifestStr) as BackupManifest;
    } catch (e) {
      console.warn('Manifeste illisible, continuation via metadata.json:', e);
    }
  }

  let restoredPhotos = 0;
  let skippedPhotos = 0;
  const missingBlobs: string[] = [];
  const integrityErrors: string[] = [];
  const warnings: string[] = [];
  const totalPhotos = photos.length;

  // 3. Process and restore photos
  for (let i = 0; i < totalPhotos; i++) {
    const photo = photos[i];
    if (!photo || !photo.id) {
      skippedPhotos++;
      continue;
    }

    onProgress?.(
      20 + Math.round(((i + 1) / totalPhotos) * 60),
      `Restauration de la photo ${i + 1}/${totalPhotos}...`
    );

    if (photo.storage === 'local') {
      const manifestEntry = manifest?.files?.[photo.id];
      const ext = getExtension(photo.metadata?.mimeType, 'jpg');

      // Check standard path photos/${id}.${ext} or legacy fallback photos/${id}.blob
      let blobZipFile = zip.file(`photos/${photo.id}.${ext}`);
      if (!blobZipFile && manifestEntry?.fileName) {
        blobZipFile = zip.file(`photos/${manifestEntry.fileName}`) || zip.file(manifestEntry.fileName);
      }
      if (!blobZipFile) {
        blobZipFile = zip.file(`photos/${photo.id}.blob`);
      }

      if (blobZipFile) {
        try {
          const blobData = await blobZipFile.async('blob');

          // Verify integrity checksum if present in manifest
          if (manifestEntry?.sha256) {
            const actualHash = await computeBlobSha256(blobData);
            if (actualHash !== manifestEntry.sha256) {
              integrityErrors.push(`Empreinte corrompue pour photo ${photo.id}`);
            }
          }

          await savePhotoBlob({ id: photo.id, blob: blobData });
        } catch (e) {
          missingBlobs.push(photo.id);
          warnings.push(
            `Erreur lors de l'extraction du blob ${photo.id}: ${e instanceof Error ? e.message : 'Erreur'}`
          );
        }
      } else {
        missingBlobs.push(photo.id);
        warnings.push(`Fichier photo manquant pour ${photo.id} (${photo.alt})`);
      }
    }

    await savePhotoMeta(photo);
    restoredPhotos++;
  }

  // 4. Restore albums
  onProgress?.(85, 'Restauration des albums...');
  for (const album of albums) {
    if (album && album.id) {
      await saveAlbumMeta(album);
    }
  }

  onProgress?.(100, 'Restauration terminée !');

  return {
    success: true,
    restoredPhotos,
    restoredAlbums: albums.length,
    skippedPhotos,
    missingBlobs,
    integrityErrors,
    warnings,
  };
}
