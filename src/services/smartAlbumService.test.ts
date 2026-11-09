import { describe, it, expect } from 'vitest';
import {
  isCriteriaValid,
  evaluateSmartAlbum,
  getSmartAlbumPhotos,
} from './smartAlbumService';
import type { Photo, SmartAlbumCriteria } from '../types/types';

const samplePhotos: Photo[] = [
  {
    id: 'p1',
    url: 'url1',
    alt: 'Beach vacation',
    date: '2023-07-15',
    isFavorite: true,
    albumIds: [],
    tags: ['vacances', 'plage'],
    metadata: {
      device: 'Sony A7IV',
      resolution: '4000x3000',
      date: '2023-07-15',
      location: 'Nice, France',
      latitude: 43.7102,
      longitude: 7.262,
      exif: { cameraModel: 'ILCE-7M4' },
      analysis: { isBlurry: false },
    },
  },
  {
    id: 'p2',
    url: 'url2',
    alt: 'Mountain hike',
    date: '2024-01-20',
    isFavorite: false,
    albumIds: [],
    tags: ['montagne', 'neige'],
    metadata: {
      device: 'iPhone 15 Pro',
      resolution: '3000x2000',
      date: '2024-01-20',
      location: 'Chamonix, France',
      latitude: 45.9237,
      longitude: 6.8694,
      analysis: { isBlurry: false },
    },
  },
  {
    id: 'p3',
    url: 'url3',
    alt: 'Indoor test blurry',
    date: '2024-07-10',
    isFavorite: false,
    albumIds: [],
    tags: ['test'],
    metadata: {
      device: 'Pixel 8',
      resolution: '1920x1080',
      date: '2024-07-10',
      analysis: { isBlurry: true },
    },
  },
];

describe('smartAlbumService', () => {
  it('validates whether criteria has actionable conditions', () => {
    expect(isCriteriaValid(undefined)).toBe(false);
    expect(isCriteriaValid({})).toBe(false);
    expect(isCriteriaValid({ tag: '   ' })).toBe(false);
    expect(isCriteriaValid({ isFavorite: true })).toBe(true);
    expect(isCriteriaValid({ year: 2024 })).toBe(true);
    expect(isCriteriaValid({ month: 7 })).toBe(true);
    expect(isCriteriaValid({ tag: 'plage' })).toBe(true);
    expect(isCriteriaValid({ location: 'Nice' })).toBe(true);
    expect(isCriteriaValid({ hasGps: true })).toBe(true);
    expect(isCriteriaValid({ isBlurry: true })).toBe(true);
    expect(isCriteriaValid({ cameraModel: 'Sony' })).toBe(true);
    expect(isCriteriaValid({ dateRange: { start: '2024-01-01', end: '2024-12-31' } })).toBe(true);
  });

  it('filters photos by isFavorite', () => {
    expect(evaluateSmartAlbum(samplePhotos[0], { isFavorite: true })).toBe(true);
    expect(evaluateSmartAlbum(samplePhotos[1], { isFavorite: true })).toBe(false);
    const res = getSmartAlbumPhotos(samplePhotos, { isFavorite: true });
    expect(res.map((p) => p.id)).toEqual(['p1']);
  });

  it('filters photos by year', () => {
    const res2023 = getSmartAlbumPhotos(samplePhotos, { year: 2023 });
    expect(res2023.map((p) => p.id)).toEqual(['p1']);

    const res2024 = getSmartAlbumPhotos(samplePhotos, { year: 2024 });
    expect(res2024.map((p) => p.id)).toEqual(['p2', 'p3']);
  });

  it('filters photos by month', () => {
    const resJuly = getSmartAlbumPhotos(samplePhotos, { month: 7 });
    expect(resJuly.map((p) => p.id)).toEqual(['p1', 'p3']);
  });

  it('filters photos by tag (case-insensitive)', () => {
    const res = getSmartAlbumPhotos(samplePhotos, { tag: 'PLAGE' });
    expect(res.map((p) => p.id)).toEqual(['p1']);
  });

  it('filters photos by location substring match', () => {
    const res = getSmartAlbumPhotos(samplePhotos, { location: 'france' });
    expect(res.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('filters photos by hasGps coordinate presence', () => {
    const withGps = getSmartAlbumPhotos(samplePhotos, { hasGps: true });
    expect(withGps.map((p) => p.id)).toEqual(['p1', 'p2']);

    const withoutGps = getSmartAlbumPhotos(samplePhotos, { hasGps: false });
    expect(withoutGps.map((p) => p.id)).toEqual(['p3']);
  });

  it('filters photos by isBlurry analysis metric', () => {
    const blurry = getSmartAlbumPhotos(samplePhotos, { isBlurry: true });
    expect(blurry.map((p) => p.id)).toEqual(['p3']);

    const sharp = getSmartAlbumPhotos(samplePhotos, { isBlurry: false });
    expect(sharp.map((p) => p.id)).toEqual(['p1', 'p2']);
  });

  it('filters photos by cameraModel / device', () => {
    const sony = getSmartAlbumPhotos(samplePhotos, { cameraModel: 'ILCE-7M4' });
    expect(sony.map((p) => p.id)).toEqual(['p1']);

    const iphone = getSmartAlbumPhotos(samplePhotos, { cameraModel: 'iphone' });
    expect(iphone.map((p) => p.id)).toEqual(['p2']);
  });

  it('filters photos by dateRange', () => {
    const res = getSmartAlbumPhotos(samplePhotos, {
      dateRange: { start: '2024-01-01', end: '2024-06-30' },
    });
    expect(res.map((p) => p.id)).toEqual(['p2']);
  });

  it('evaluates combined multi-criteria without dropping any', () => {
    // Both 2024 AND hasGps -> only p2
    const criteria: SmartAlbumCriteria = { year: 2024, hasGps: true };
    const res = getSmartAlbumPhotos(samplePhotos, criteria);
    expect(res.map((p) => p.id)).toEqual(['p2']);
  });
});
