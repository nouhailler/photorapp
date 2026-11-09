import { describe, it, expect } from 'vitest';
import { filterPhotos, extractAvailableFilters } from './searchEngine';
import type { Photo, Album } from '../types/types';

const mockPhotos: Photo[] = [
  {
    id: 'p1',
    url: 'test1.jpg',
    alt: 'Sunset over Lake Geneva',
    date: '2024-07-15',
    isFavorite: true,
    albumIds: ['album-1'],
    tags: ['lake', 'sunset'],
    metadata: {
      device: 'Sony A7IV',
      resolution: '33MP',
      date: '2024-07-15',
      location: 'Geneva, Switzerland',
      latitude: 46.2044,
      longitude: 6.1432,
    },
  },
  {
    id: 'p2',
    url: 'test2.jpg',
    alt: 'Mountain hike in Chamonix',
    date: '2023-08-20',
    isFavorite: false,
    albumIds: [],
    tags: ['hiking', 'mountains'],
    metadata: {
      device: 'iPhone 15 Pro',
      resolution: '12MP',
      date: '2023-08-20',
      location: 'Chamonix, France',
    },
  },
  {
    id: 'p3',
    url: 'test3.jpg',
    alt: 'Family dinner in Paris',
    date: '2024-12-25',
    isFavorite: true,
    albumIds: ['album-1'],
    tags: ['family', 'dinner'],
    metadata: {
      device: 'Sony A7IV',
      resolution: '33MP',
      date: '2024-12-25',
      location: 'Paris, France',
    },
  },
];

const mockAlbums: Album[] = [
  {
    id: 'album-1',
    title: 'Europe Trip 2024',
    coverPhotoId: 'p1',
    photoCount: 2,
    isShared: false,
    isPrivate: true,
  },
];

describe('searchEngine', () => {
  it('extracts available filters dynamically from real photos and albums', () => {
    const filters = extractAvailableFilters(mockPhotos, mockAlbums);

    expect(filters.years).toEqual([2024, 2023]);
    expect(filters.locations).toContain('Geneva, Switzerland');
    expect(filters.locations).toContain('Chamonix, France');
    expect(filters.locations).toContain('Paris, France');
    expect(filters.devices).toContain('Sony A7IV');
    expect(filters.devices).toContain('iPhone 15 Pro');
    expect(filters.tags).toContain('sunset');
    expect(filters.tags).toContain('mountains');
    expect(filters.albums).toHaveLength(1);
    expect(filters.albums[0].title).toBe('Europe Trip 2024');
  });

  it('filters photos by text query matching alt or tags', () => {
    const results = filterPhotos(mockPhotos, { query: 'Geneva' }, mockAlbums);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('p1');

    const tagResults = filterPhotos(mockPhotos, { query: 'mountains' }, mockAlbums);
    expect(tagResults).toHaveLength(1);
    expect(tagResults[0].id).toBe('p2');
  });

  it('filters photos by year', () => {
    const results2024 = filterPhotos(mockPhotos, { year: 2024 }, mockAlbums);
    expect(results2024).toHaveLength(2);
    expect(results2024.map((p) => p.id)).toEqual(['p1', 'p3']);

    const results2023 = filterPhotos(mockPhotos, { year: 2023 }, mockAlbums);
    expect(results2023).toHaveLength(1);
    expect(results2023[0].id).toBe('p2');
  });

  it('filters photos by favorites only', () => {
    const favorites = filterPhotos(mockPhotos, { isFavorite: true }, mockAlbums);
    expect(favorites).toHaveLength(2);
    expect(favorites.every((p) => p.isFavorite)).toBe(true);
  });

  it('filters photos by GPS presence', () => {
    const withGps = filterPhotos(mockPhotos, { hasGps: true }, mockAlbums);
    expect(withGps).toHaveLength(1);
    expect(withGps[0].id).toBe('p1');

    const withoutGps = filterPhotos(mockPhotos, { hasGps: false }, mockAlbums);
    expect(withoutGps).toHaveLength(2);
  });

  it('filters photos by album association', () => {
    const albumPhotos = filterPhotos(mockPhotos, { albumId: 'album-1' }, mockAlbums);
    expect(albumPhotos).toHaveLength(2);
    expect(albumPhotos.map((p) => p.id)).toEqual(['p1', 'p3']);
  });
});
