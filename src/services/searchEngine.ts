import type { Photo, Album } from '../types/types';
import { parseNaturalLanguageQuery } from './naturalSearchService';

export interface SearchFilters {
  query?: string;
  year?: number;
  month?: number;
  albumId?: string;
  isFavorite?: boolean;
  hasGps?: boolean;
  location?: string;
  device?: string;
  isBlurry?: boolean;
  semanticTags?: string[];
  minQuality?: number;
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export interface AvailableFilters {
  years: number[];
  months: { number: number; label: string }[];
  locations: string[];
  devices: string[];
  tags: string[];
  albums: { id: string; title: string }[];
}

const MONTH_NAMES = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

/**
 * Extracts all unique available filter values dynamically from the current photo library.
 */
export function extractAvailableFilters(photos: Photo[], albums: Album[]): AvailableFilters {
  const yearsSet = new Set<number>();
  const locationsSet = new Set<string>();
  const devicesSet = new Set<string>();
  const tagsSet = new Set<string>();

  for (const photo of photos) {
    if (photo.date) {
      const year = parseInt(photo.date.substring(0, 4), 10);
      if (!isNaN(year)) yearsSet.add(year);
    }
    if (photo.metadata?.location && photo.metadata.location.trim()) {
      locationsSet.add(photo.metadata.location.trim());
    }
    if (photo.metadata?.device && photo.metadata.device !== 'Uploaded File' && photo.metadata.device.trim()) {
      devicesSet.add(photo.metadata.device.trim());
    }
    for (const tag of photo.tags || []) {
      if (tag.trim()) tagsSet.add(tag.trim());
    }
  }

  const sortedYears = Array.from(yearsSet).sort((a, b) => b - a);

  return {
    years: sortedYears,
    months: MONTH_NAMES.map((name, idx) => ({ number: idx + 1, label: name })),
    locations: Array.from(locationsSet).sort(),
    devices: Array.from(devicesSet).sort(),
    tags: Array.from(tagsSet).sort(),
    albums: albums.map((a) => ({ id: a.id, title: a.title })),
  };
}

/**
 * Executes unified multi-criteria search over the photo collection.
 */
export function filterPhotos(
  photos: Photo[],
  filters: SearchFilters,
  albums: Album[] = []
): Photo[] {
  const queryWords = (filters.query || '')
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const albumMap = new Map(albums.map((a) => [a.id, a.title.toLowerCase()]));

  return photos.filter((photo) => {
    // 1. Text Query Filter
    if (queryWords.length > 0) {
      const alt = (photo.alt || '').toLowerCase();
      const tags = (photo.tags || []).map((t) => t.toLowerCase()).join(' ');
      const location = (photo.metadata?.location || '').toLowerCase();
      const device = (photo.metadata?.device || '').toLowerCase();
      const cameraMake = (photo.metadata?.exif?.cameraMake || '').toLowerCase();
      const cameraModel = (photo.metadata?.exif?.cameraModel || '').toLowerCase();
      const date = photo.date || '';

      const photoAlbums = (photo.albumIds || [])
        .map((id) => albumMap.get(id) || '')
        .join(' ');

      const sceneTags = (photo.metadata?.analysis?.sceneTags || [])
        .map((s) => s.label.toLowerCase())
        .join(' ');
      const autoKeywords = (photo.metadata?.analysis?.autoKeywords || [])
        .map((k) => k.toLowerCase())
        .join(' ');

      const combinedText = `${alt} ${tags} ${sceneTags} ${autoKeywords} ${location} ${device} ${cameraMake} ${cameraModel} ${photoAlbums} ${date}`;

      const matchesAllWords = queryWords.every((word) => combinedText.includes(word));
      if (!matchesAllWords) return false;
    }

    // 2. Semantic Tags Filter
    if (filters.semanticTags && filters.semanticTags.length > 0) {
      const photoTags = (photo.tags || []).map((t) => t.toLowerCase());
      const sceneLabels = (photo.metadata?.analysis?.sceneTags || []).map((s) => s.label.toLowerCase());
      const autoKw = (photo.metadata?.analysis?.autoKeywords || []).map((k) => k.toLowerCase());
      const altWords = (photo.alt || '').toLowerCase();

      const matchesAnySemantic = filters.semanticTags.some(
        (sem) =>
          photoTags.some((t) => t.includes(sem)) ||
          sceneLabels.some((s) => s.includes(sem)) ||
          autoKw.some((k) => k.includes(sem)) ||
          altWords.includes(sem)
      );
      if (!matchesAnySemantic) return false;
    }

    // 3. Minimum Quality Score Filter
    if (filters.minQuality !== undefined) {
      const score = photo.metadata?.analysis?.qualityScore ?? 75;
      if (score < filters.minQuality) return false;
    }

    // 4. Year Filter
    if (filters.year !== undefined) {
      const photoYear = parseInt((photo.date || '').substring(0, 4), 10);
      if (photoYear !== filters.year) return false;
    }

    // 5. Month Filter
    if (filters.month !== undefined) {
      const photoMonth = parseInt((photo.date || '').substring(5, 7), 10);
      if (photoMonth !== filters.month) return false;
    }

    // 6. Album Filter
    if (filters.albumId) {
      if (!photo.albumIds?.includes(filters.albumId)) return false;
    }

    // 7. Favorite Filter
    if (filters.isFavorite !== undefined) {
      if (photo.isFavorite !== filters.isFavorite) return false;
    }

    // 8. Has GPS Coordinates
    if (filters.hasGps !== undefined) {
      const hasGps = typeof photo.metadata?.latitude === 'number' && typeof photo.metadata?.longitude === 'number';
      if (hasGps !== filters.hasGps) return false;
    }

    // 9. Location exact match
    if (filters.location) {
      if (photo.metadata?.location !== filters.location) return false;
    }

    // 10. Device exact match
    if (filters.device) {
      if (photo.metadata?.device !== filters.device) return false;
    }

    // 11. Blurry filter
    if (filters.isBlurry !== undefined) {
      if (Boolean(photo.metadata?.analysis?.isBlurry) !== filters.isBlurry) return false;
    }

    // 12. Date range filter
    if (filters.dateRange) {
      const photoDate = photo.date || '';
      if (filters.dateRange.start && photoDate < filters.dateRange.start) return false;
      if (filters.dateRange.end && photoDate > filters.dateRange.end) return false;
    }

    return true;
  });
}

/**
 * Intelligent natural language search that combines natural language parsing with multi-criteria filtering.
 */
export function smartSearchPhotos(
  photos: Photo[],
  rawQuery: string,
  baseFilters: SearchFilters = {},
  albums: Album[] = []
): { results: Photo[]; semanticTags: string[]; inferredCategory?: string } {
  if (!rawQuery.trim()) {
    return {
      results: filterPhotos(photos, baseFilters, albums),
      semanticTags: [],
    };
  }

  // Parse natural language intents (e.g. "Photos de montagnes en hiver")
  const parsed = parseNaturalLanguageQuery(rawQuery);

  const combinedFilters: SearchFilters = {
    ...baseFilters,
    ...parsed.extractedFilters,
    semanticTags: parsed.semanticTags.length > 0 ? parsed.semanticTags : baseFilters.semanticTags,
  };

  const results = filterPhotos(photos, combinedFilters, albums);

  return {
    results,
    semanticTags: parsed.semanticTags,
    inferredCategory: parsed.inferredCategory,
  };
}
