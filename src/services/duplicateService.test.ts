import { describe, it, expect } from 'vitest';
import {
  getDHashDistance,
  findExactDuplicates,
  findSimilarPhotos,
} from './duplicateService';
import type { Photo } from '../types/types';

describe('duplicateService', () => {
  it('calculates Hamming distance accurately for 64-bit dHash hex strings', () => {
    // Identical hashes
    expect(getDHashDistance('0000000000000000', '0000000000000000')).toBe(0);

    // 1 bit flip: '0' -> '1' (binary 0001)
    expect(getDHashDistance('0000000000000000', '0000000000000001')).toBe(1);

    // 'f' (1111) vs '0' (0000) -> 4 bits difference
    expect(getDHashDistance('0000000000000000', '000000000000000f')).toBe(4);

    // Max distance: 16 hex chars * 4 bits = 64
    expect(getDHashDistance('0000000000000000', 'ffffffffffffffff')).toBe(64);
  });

  it('groups exact duplicates by SHA-256 hash', () => {
    const photos: Photo[] = [
      {
        id: 'p1',
        url: 'url1',
        alt: 'Photo A',
        date: '2024-01-01',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: '2024-01-01',
          hash: 'hash-abc-123',
          fileSize: 1024,
        },
      },
      {
        id: 'p2',
        url: 'url2',
        alt: 'Photo A copy',
        date: '2024-01-02',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: '2024-01-02',
          hash: 'hash-abc-123',
          fileSize: 1024,
        },
      },
      {
        id: 'p3',
        url: 'url3',
        alt: 'Photo B Unique',
        date: '2024-01-03',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: '2024-01-03',
          hash: 'hash-xyz-999',
          fileSize: 2048,
        },
      },
    ];

    const duplicates = findExactDuplicates(photos);
    expect(duplicates).toHaveLength(1);
    expect(duplicates[0].photos).toHaveLength(2);
    expect(duplicates[0].photos.map((p) => p.id)).toEqual(['p1', 'p2']);
    expect(duplicates[0].totalSizeBytes).toBe(2048);
  });

  it('identifies visually similar photos using perceptual difference hash distance', () => {
    const photos: Photo[] = [
      {
        id: 's1',
        url: 'u1',
        alt: 'Shot 1',
        date: '2024-05-01',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: 'now',
          analysis: { dHash: '1234567890abcdef' },
        },
      },
      {
        id: 's2',
        url: 'u2',
        alt: 'Shot 1 slightly cropped',
        date: '2024-05-01',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: 'now',
          analysis: { dHash: '1234567890abcdee' }, // 1 bit flip
        },
      },
      {
        id: 's3',
        url: 'u3',
        alt: 'Completely different scene',
        date: '2024-05-02',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: {
          device: 'Cam',
          resolution: '1x1',
          date: 'now',
          analysis: { dHash: 'ffffffff00000000' },
        },
      },
    ];

    const similar = findSimilarPhotos(photos, 4);
    expect(similar).toHaveLength(1);
    expect(similar[0].photos.map((p) => p.id)).toEqual(['s1', 's2']);
  });

  it('never falsely groups photos without cryptographic hash even if names/dates match', () => {
    const photos: Photo[] = [
      {
        id: 'u1',
        url: 'u1',
        alt: 'IMG_001.jpg',
        date: '2024-01-01',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: { device: 'Cam', resolution: '100x100', fileSize: 1024, date: '2024-01-01' },
      },
      {
        id: 'u2',
        url: 'u2',
        alt: 'IMG_001.jpg',
        date: '2024-01-01',
        isFavorite: false,
        albumIds: [],
        tags: [],
        metadata: { device: 'Cam', resolution: '100x100', fileSize: 1024, date: '2024-01-01' },
      },
    ];

    const duplicates = findExactDuplicates(photos);
    expect(duplicates).toHaveLength(0);
  });
});
