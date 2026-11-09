import JSZip from 'jszip';
import type { Photo, Album } from '../types/types';
import { getPhotoBlob, savePhotoBlob, savePhotoMeta, saveAlbumMeta } from '../utils/db';

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

    if (adjustments?.cropRect) {
      sourceX = adjustments.cropRect.x;
      sourceY = adjustments.cropRect.y;
      sourceWidth = adjustments.cropRect.width;
      sourceHeight = adjustments.cropRect.height;
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
    canvas.width = isRotated90or270 ? sourceHeight : sourceWidth;
    canvas.height = isRotated90or270 ? sourceWidth : sourceHeight;

    // Apply rotation transform
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Apply CSS-like filter string directly to canvas context if supported
    const brightness = 100 + (adjustments?.brightness || 0);
    const contrast = 100 + (adjustments?.contrast || 0);
    const saturation = 100 + (adjustments?.saturation || 0);
    const extraFilter = adjustments?.filter || '';

    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) ${extraFilter}`.trim();

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
  const extension = photo.metadata?.mimeType === 'image/png' ? 'png' : 'jpg';
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
 * Export a batch of photos as a ZIP archive.
 */
export async function exportPhotosToZip(
  photos: Photo[],
  zipFilename = 'gallery-pro-export.zip',
  onProgress?: (percent: number, currentName: string) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('photos') || zip;
  const total = photos.length;

  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    const name = `${photo.alt || `photo_${photo.id}`}.jpg`;
    onProgress?.(Math.round(((i + 1) / total) * 90), name);

    try {
      let blob: Blob | null = null;
      if (photo.adjustments) {
        blob = await renderAdjustedPhotoBlob(photo);
      } else if (photo.storage === 'local') {
        blob = await getPhotoBlob(photo.id);
      } else {
        const res = await fetch(photo.url);
        blob = await res.blob();
      }

      if (blob) {
        folder.file(name, blob);
      }
    } catch (e) {
      console.warn(`[ExportService] Error packaging photo ${photo.id}:`, e);
    }
  }

  onProgress?.(95, 'Génération du fichier ZIP...');
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  triggerDownload(zipBlob, zipFilename);
  onProgress?.(100, 'Terminé !');
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
 * Full Library Backup (ZIP with photos + metadata.json).
 */
export async function createFullLibraryBackup(
  photos: Photo[],
  albums: Album[],
  onProgress?: (percent: number, status: string) => void
): Promise<void> {
  const zip = new JSZip();
  const photosFolder = zip.folder('photos') || zip;

  const manifest = {
    app: 'Gallery Pro',
    version: '2.0',
    backupDate: new Date().toISOString(),
    photoCount: photos.length,
    albumCount: albums.length,
  };

  zip.file('backup_manifest.json', JSON.stringify(manifest, null, 2));
  zip.file('metadata.json', JSON.stringify({ photos, albums }, null, 2));

  const total = photos.length;
  for (let i = 0; i < total; i++) {
    const photo = photos[i];
    onProgress?.(
      Math.round(((i + 1) / total) * 85),
      `Sauvegarde de ${photo.alt || photo.id}...`
    );

    if (photo.storage === 'local') {
      const blob = await getPhotoBlob(photo.id);
      if (blob) {
        photosFolder.file(`${photo.id}.blob`, blob);
      }
    }
  }

  onProgress?.(90, 'Compression de l\'archive de sauvegarde...');
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const dateStr = new Date().toISOString().split('T')[0];
  triggerDownload(content, `gallery_pro_backup_${dateStr}.gpro.zip`);
  onProgress?.(100, 'Sauvegarde téléchargée avec succès.');
}

/**
 * Restores a full backup from a ZIP archive.
 */
export async function restoreFullLibraryBackup(
  backupFile: File,
  onProgress?: (percent: number, status: string) => void
): Promise<{ restoredPhotos: number; restoredAlbums: number }> {
  onProgress?.(10, 'Lecture de l\'archive...');
  const zip = await JSZip.loadAsync(backupFile);

  const metadataFile = zip.file('metadata.json');
  if (!metadataFile) {
    throw new Error('Fichier metadata.json manquant dans l\'archive');
  }

  onProgress?.(25, 'Extraction des métadonnées...');
  const metadataStr = await metadataFile.async('string');
  const { photos, albums } = JSON.parse(metadataStr) as { photos: Photo[]; albums: Album[] };

  let restoredPhotos = 0;
  const totalPhotos = photos.length;

  for (let i = 0; i < totalPhotos; i++) {
    const photo = photos[i];
    onProgress?.(
      25 + Math.round(((i + 1) / totalPhotos) * 60),
      `Restauration de la photo ${i + 1}/${totalPhotos}...`
    );

    // Extract blob if local
    if (photo.storage === 'local') {
      const blobFile = zip.file(`photos/${photo.id}.blob`);
      if (blobFile) {
        const blobData = await blobFile.async('blob');
        await savePhotoBlob({ id: photo.id, blob: blobData });
      }
    }
    await savePhotoMeta(photo);
    restoredPhotos++;
  }

  onProgress?.(90, 'Restauration des albums...');
  for (const album of albums) {
    await saveAlbumMeta(album);
  }

  onProgress?.(100, 'Restauration terminée avec succès !');
  return {
    restoredPhotos,
    restoredAlbums: albums.length,
  };
}
