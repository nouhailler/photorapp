import { describe, it, expect } from 'vitest';
import { applyAnalysisToPhoto } from './aiVisionService';
import type { Photo } from '../types/types';

describe('aiVisionService', () => {
  it('applyAnalysisToPhoto enriches photo metadata with scene tags, dominant colors, and deduplicated auto keywords', () => {
    const basePhoto: Photo = {
      id: 'p-1',
      url: 'https://example.com/photo.jpg',
      alt: 'Montagne test',
      date: '2025-07-15',
      isFavorite: false,
      albumIds: [],
      tags: ['vacances', 'nature'],
      storage: 'remote',
    };

    const updated = applyAnalysisToPhoto(basePhoto, {
      sceneTags: [
        { category: 'nature', label: 'Nature & Paysage', confidence: 0.88 },
      ],
      autoKeywords: ['nature', 'paysage', 'ciel', 'bleu'],
      dominantColors: ['#2a6fdb', '#358f41'],
      detectedFacesCount: 0,
    });

    expect(updated.tags).toEqual(['vacances', 'nature', 'paysage', 'ciel', 'bleu']);
    expect(updated.metadata?.analysis?.sceneTags).toHaveLength(1);
    expect(updated.metadata?.analysis?.sceneTags?.[0].category).toBe('nature');
    expect(updated.metadata?.analysis?.dominantColors).toEqual(['#2a6fdb', '#358f41']);
    expect(updated.metadata?.analysis?.detectedFacesCount).toBe(0);
    expect(updated.metadata?.analysis?.analyzedAt).toBeDefined();
  });

  it('applyAnalysisToPhoto preserves existing qualityScore and dHash analysis metrics', () => {
    const photoWithQuality: Photo = {
      id: 'p-2',
      url: 'https://example.com/p2.jpg',
      alt: 'Portrait test',
      date: '2025-08-10',
      isFavorite: true,
      albumIds: ['alb-1'],
      tags: [],
      storage: 'remote',
      metadata: {
        device: 'Sony A7IV',
        resolution: '4000x3000',
        date: '2025-08-10',
        analysis: {
          qualityScore: 91,
          isBlurry: false,
          dHash: '0123456789abcdef',
        },
      },
    };

    const updated = applyAnalysisToPhoto(photoWithQuality, {
      sceneTags: [{ category: 'portrait', label: 'Portrait & Personnes', confidence: 0.9 }],
      autoKeywords: ['portrait', 'personne'],
      dominantColors: ['#f1c27d'],
      detectedFacesCount: 1,
    });

    expect(updated.metadata?.analysis?.qualityScore).toBe(91);
    expect(updated.metadata?.analysis?.dHash).toBe('0123456789abcdef');
    expect(updated.metadata?.analysis?.detectedFacesCount).toBe(1);
    expect(updated.metadata?.device).toBe('Sony A7IV');
  });
});
