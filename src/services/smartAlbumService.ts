import type { Photo, SmartAlbumCriteria } from '../types/types';

/**
 * Validates whether a SmartAlbumCriteria has at least one active, actionable condition.
 */
export function isCriteriaValid(criteria?: SmartAlbumCriteria): boolean {
  if (!criteria) return false;
  return Boolean(
    criteria.isFavorite !== undefined ||
    criteria.year !== undefined ||
    criteria.month !== undefined ||
    (criteria.tag && criteria.tag.trim().length > 0) ||
    (criteria.location && criteria.location.trim().length > 0) ||
    criteria.hasGps !== undefined ||
    criteria.isBlurry !== undefined ||
    (criteria.cameraModel && criteria.cameraModel.trim().length > 0) ||
    (criteria.dateRange && (criteria.dateRange.start || criteria.dateRange.end))
  );
}

/**
 * Evaluates whether a given photo satisfies all defined criteria of a smart album.
 * Every defined criterion is strictly checked and never silently ignored.
 */
export function evaluateSmartAlbum(photo: Photo, criteria: SmartAlbumCriteria): boolean {
  // 1. Favoris
  if (criteria.isFavorite !== undefined) {
    if (Boolean(photo.isFavorite) !== criteria.isFavorite) return false;
  }

  // 2. Année
  if (criteria.year !== undefined) {
    const photoYear = parseInt((photo.date || '').substring(0, 4), 10);
    if (isNaN(photoYear) || photoYear !== criteria.year) return false;
  }

  // 3. Mois (1 - 12)
  if (criteria.month !== undefined) {
    const photoMonth = parseInt((photo.date || '').substring(5, 7), 10);
    if (isNaN(photoMonth) || photoMonth !== criteria.month) return false;
  }

  // 4. Tag
  if (criteria.tag && criteria.tag.trim()) {
    const targetTag = criteria.tag.trim().toLowerCase();
    const hasTag = (photo.tags || []).some((t) => t.toLowerCase() === targetTag);
    if (!hasTag) return false;
  }

  // 5. Lieu (Location string match)
  if (criteria.location && criteria.location.trim()) {
    const targetLoc = criteria.location.trim().toLowerCase();
    const photoLoc = (photo.metadata?.location || '').toLowerCase();
    if (!photoLoc.includes(targetLoc)) return false;
  }

  // 6. Présence GPS
  if (criteria.hasGps !== undefined) {
    const hasGpsCoords =
      typeof photo.metadata?.latitude === 'number' &&
      typeof photo.metadata?.longitude === 'number' &&
      !isNaN(photo.metadata.latitude) &&
      !isNaN(photo.metadata.longitude);
    if (hasGpsCoords !== criteria.hasGps) return false;
  }

  // 7. Flou
  if (criteria.isBlurry !== undefined) {
    const isPhotoBlurry = Boolean(photo.metadata?.analysis?.isBlurry);
    if (isPhotoBlurry !== criteria.isBlurry) return false;
  }

  // 8. Modèle de caméra
  if (criteria.cameraModel && criteria.cameraModel.trim()) {
    const targetModel = criteria.cameraModel.trim().toLowerCase();
    const device = (photo.metadata?.device || '').toLowerCase();
    const model = (photo.metadata?.exif?.cameraModel || '').toLowerCase();
    if (!device.includes(targetModel) && !model.includes(targetModel)) return false;
  }

  // 9. Période personnalisée (dateRange)
  if (criteria.dateRange) {
    const photoDate = photo.date || '';
    if (criteria.dateRange.start && photoDate < criteria.dateRange.start) return false;
    if (criteria.dateRange.end && photoDate > criteria.dateRange.end) return false;
  }

  return true;
}

/**
 * Filters a list of photos dynamically based on SmartAlbumCriteria.
 */
export function getSmartAlbumPhotos(photos: Photo[], criteria: SmartAlbumCriteria): Photo[] {
  return photos.filter((photo) => evaluateSmartAlbum(photo, criteria));
}
