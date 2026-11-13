import { describe, it, expect } from 'vitest';
import { generateSouvenirs } from './souvenirService';
import type { Photo } from '../types/types';

function makePhoto(id: string, date: string, overrides: Partial<Photo> = {}): Photo {
  return {
    id,
    url: `https://example.com/${id}.jpg`,
    alt: `Photo ${id}`,
    date,
    isFavorite: false,
    albumIds: [],
    tags: [],
    storage: 'remote',
    ...overrides,
  };
}

describe('souvenirService', () => {
  it('returns empty array when no photos exist', () => {
    expect(generateSouvenirs([], new Date('2026-11-13'))).toEqual([]);
  });

  it('generates authentic "Ce jour-là, il y a 1 an" souvenir strictly matching photo dates', () => {
    const refDate = new Date(2026, 10, 13); // 2026-11-13
    const photos: Photo[] = [
      makePhoto('p1', '2025-11-13', { isFavorite: true }),
      makePhoto('p2', '2025-11-13'),
      makePhoto('p3', '2024-05-01'),
    ];

    const souvenirs = generateSouvenirs(photos, refDate);
    const oneYear = souvenirs.find((s) => s.type === 'on_this_day');
    expect(oneYear).toBeDefined();
    expect(oneYear?.photos.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(oneYear?.coverPhoto.id).toBe('p1');
  });

  it('generates "Escapades & Voyages" for real location clusters of >= 4 photos', () => {
    const refDate = new Date(2026, 10, 13);
    const photos: Photo[] = [
      makePhoto('t1', '2024-07-01', { metadata: { device: 'iPhone', resolution: '4K', date: '2024-07-01', location: 'Annecy' } }),
      makePhoto('t2', '2024-07-02', { metadata: { device: 'iPhone', resolution: '4K', date: '2024-07-02', location: 'Annecy' } }),
      makePhoto('t3', '2024-07-03', { metadata: { device: 'iPhone', resolution: '4K', date: '2024-07-03', location: 'Annecy' } }),
      makePhoto('t4', '2024-07-04', { metadata: { device: 'iPhone', resolution: '4K', date: '2024-07-04', location: 'Annecy' } }),
      makePhoto('t5', '2024-08-01', { metadata: { device: 'iPhone', resolution: '4K', date: '2024-08-01', location: 'Lieu inconnu' } }),
    ];

    const souvenirs = generateSouvenirs(photos, refDate);
    const trip = souvenirs.find((s) => s.type === 'trip');
    expect(trip).toBeDefined();
    expect(trip?.title).toBe('Escapade à Annecy');
    expect(trip?.photos).toHaveLength(4);
    expect(souvenirs.some((s) => s.title.includes('Lieu inconnu'))).toBe(false);
  });

  it('generates forgotten favorites for favorites older than 6 months', () => {
    const refDate = new Date(2026, 10, 13);
    const photos: Photo[] = [
      makePhoto('f1', '2024-01-10', { isFavorite: true }),
      makePhoto('f2', '2024-02-10', { isFavorite: true }),
      makePhoto('f3', '2024-03-10', { isFavorite: true }),
    ];

    const souvenirs = generateSouvenirs(photos, refDate);
    const favSouvenir = souvenirs.find((s) => s.type === 'forgotten_favorites');
    expect(favSouvenir).toBeDefined();
    expect(favSouvenir?.photos).toHaveLength(3);
  });
});
