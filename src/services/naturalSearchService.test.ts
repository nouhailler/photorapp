import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageQuery } from './naturalSearchService';
import { smartSearchPhotos } from './searchEngine';
import type { Photo } from '../types/types';

describe('naturalSearchService & smartSearchPhotos', () => {
  it('parses French seasonal and scene natural query accurately', () => {
    const parsed = parseNaturalLanguageQuery('Photos de montagnes en hiver 2024');
    expect(parsed.extractedFilters.year).toBe(2024);
    expect(parsed.inferredSeason).toBe('hiver');
    expect(parsed.inferredCategory).toBe('montagne');
    expect(parsed.semanticTags).toContain('montagne');
    expect(parsed.semanticTags).toContain('neige');
  });

  it('extracts favorite, GPS, and quality intents from natural queries', () => {
    const favGps = parseNaturalLanguageQuery('Mes coups de cœur avec GPS');
    expect(favGps.extractedFilters.isFavorite).toBe(true);
    expect(favGps.extractedFilters.hasGps).toBe(true);

    const blurry = parseNaturalLanguageQuery('Photos floues à supprimer');
    expect(blurry.extractedFilters.isBlurry).toBe(true);
  });

  it('smartSearchPhotos filters library using semantic synonyms and scene tags', () => {
    const photos: Photo[] = [
      {
        id: '1',
        url: 'a.jpg',
        alt: 'Golden Retriever',
        date: '2025-05-12',
        isFavorite: false,
        albumIds: [],
        tags: ['animal', 'jardin'],
        storage: 'remote',
        metadata: {
          device: 'Pixel 8',
          resolution: '4000x3000',
          date: '2025-05-12',
          analysis: {
            sceneTags: [{ category: 'object', label: 'Animaux & Faune', confidence: 0.9 }],
            autoKeywords: ['chien', 'verdure'],
          },
        },
      },
      {
        id: '2',
        url: 'b.jpg',
        alt: 'Musée du Louvre',
        date: '2025-05-13',
        isFavorite: true,
        albumIds: [],
        tags: ['paris', 'architecture'],
        storage: 'remote',
      },
    ];

    const dogSearch = smartSearchPhotos(photos, 'Chiens dans un jardin');
    expect(dogSearch.results.map((p) => p.id)).toEqual(['1']);
    expect(dogSearch.semanticTags).toContain('chien');

    const favSearch = smartSearchPhotos(photos, 'Mes photos favorites');
    expect(favSearch.results.map((p) => p.id)).toEqual(['2']);
  });
});
