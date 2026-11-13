import { getPhotoBlob, getThumbnailBlob, saveThumbnailBlob } from '../utils/db';
import type { Photo } from '../types/types';

/**
 * Generates an optimized, low-memory thumbnail Blob from an image Blob or File.
 * Target max dimension is 360px, compressed to WebP (or JPEG fallback).
 * A typical 15MB 4K image becomes a 15-25KB thumbnail, saving 99% RAM in gallery scrolling.
 */
export async function generateThumbnailBlob(
  sourceBlob: Blob,
  maxDimension = 360,
  quality = 0.8
): Promise<Blob> {
  // Use modern createImageBitmap if available for high performance off main thread rendering
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(sourceBlob);
      const width = bitmap.width;
      const height = bitmap.height;

      let targetWidth = width;
      let targetHeight = height;

      if (width > height && width > maxDimension) {
        targetWidth = maxDimension;
        targetHeight = Math.max(1, Math.round((height / width) * maxDimension));
      } else if (height > maxDimension) {
        targetHeight = maxDimension;
        targetWidth = Math.max(1, Math.round((width / height) * maxDimension));
      }

      // If OffscreenCanvas is supported:
      if (typeof OffscreenCanvas !== 'undefined') {
        const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
          bitmap.close();
          const thumb = await offscreen.convertToBlob({ type: 'image/webp', quality });
          return thumb;
        }
      }

      // Fallback to standard canvas element
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
        bitmap.close();
        return new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error('Failed to convert canvas to thumbnail blob'));
            },
            'image/webp',
            quality
          );
        });
      }
      bitmap.close();
    } catch (e) {
      console.warn('[ThumbnailService] createImageBitmap failed, falling back to Image loader:', e);
    }
  }

  // Standard Image element fallback
  return new Promise<Blob>((resolve, reject) => {
    const url = URL.createObjectURL(sourceBlob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      let targetWidth = width;
      let targetHeight = height;

      if (width > height && width > maxDimension) {
        targetWidth = maxDimension;
        targetHeight = Math.max(1, Math.round((height / width) * maxDimension));
      } else if (height > maxDimension) {
        targetHeight = maxDimension;
        targetWidth = Math.max(1, Math.round((width / height) * maxDimension));
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas 2D context not available for thumbnail'));
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Last-ditch JPEG fallback
            canvas.toBlob((jpegBlob) => {
              if (jpegBlob) resolve(jpegBlob);
              else reject(new Error('Could not generate thumbnail'));
            }, 'image/jpeg', quality);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for thumbnail'));
    };

    img.src = url;
  });
}

/**
 * Retrieves the thumbnail blob for a photo from IndexedDB.
 * If not yet generated, generates it from the master blob, stores it, and returns it.
 */
export async function getOrCreateThumbnailBlob(photo: Photo): Promise<Blob | null> {
  if (photo.storage !== 'local') return null;

  // 1. Try to fetch existing thumbnail from IndexedDB
  try {
    const cached = await getThumbnailBlob(photo.id);
    if (cached) return cached;
  } catch (err) {
    console.warn('[ThumbnailService] Error reading thumbnail store:', err);
  }

  // 2. Fetch master original blob and generate thumbnail
  try {
    const masterBlob = await getPhotoBlob(photo.id);
    if (!masterBlob) return null;

    const thumbBlob = await generateThumbnailBlob(masterBlob);
    await saveThumbnailBlob({ id: photo.id, blob: thumbBlob });
    return thumbBlob;
  } catch (err) {
    console.warn(`[ThumbnailService] Error creating thumbnail for ${photo.id}:`, err);
    return null;
  }
}

/**
 * Regenerates all missing thumbnails for local photos in batch.
 */
export async function regenerateAllMissingThumbnails(
  photos: Photo[],
  onProgress?: (progress: { current: number; total: number; generated: number }) => void
): Promise<{ generated: number; failed: number; total: number }> {
  const localPhotos = photos.filter((p) => p.storage === 'local');
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < localPhotos.length; i++) {
    const p = localPhotos[i];
    try {
      const existing = await getThumbnailBlob(p.id);
      if (!existing) {
        const master = await getPhotoBlob(p.id);
        if (master) {
          const thumb = await generateThumbnailBlob(master);
          await saveThumbnailBlob({ id: p.id, blob: thumb });
          generated++;
        } else {
          failed++;
        }
      }
    } catch {
      failed++;
    }

    if (onProgress) {
      onProgress({ current: i + 1, total: localPhotos.length, generated });
    }
  }

  return { generated, failed, total: localPhotos.length };
}

