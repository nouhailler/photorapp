import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as dbModule from './db';
import type { Photo, Album } from '../types/types';

function createMockIDBDatabase(initialPhotos: Photo[] = [], initialAlbums: Album[] = []) {
  const photosStore = new Map<string, Photo>(initialPhotos.map((p) => [p.id, p]));
  const albumsStore = new Map<string, Album>(initialAlbums.map((a) => [a.id, a]));
  const settingsStore = new Map<string, unknown>();

  return {
    transaction: (stores: string | string[]) => {
      const storeArray = Array.isArray(stores) ? stores : [stores];
      const tx = {
        oncomplete: null as (() => void) | null,
        onerror: null as ((err: unknown) => void) | null,
        objectStore: (storeName: string) => {
          if (!storeArray.includes(storeName)) {
            throw new Error(`Store ${storeName} not in transaction`);
          }
          return {
            getAll: () => {
              const req: {
                onsuccess: null | ((e: { target: { result: unknown[] } }) => void);
                onerror: null;
                result?: unknown[];
              } = {
                onsuccess: null,
                onerror: null,
              };
              setTimeout(() => {
                const list =
                  storeName === 'albums'
                    ? Array.from(albumsStore.values())
                    : storeName === 'metadata'
                    ? Array.from(photosStore.values())
                    : [];
                req.result = list;
                req.onsuccess?.({ target: { result: list } });
              }, 0);
              return req;
            },
            put: (item: Record<string, unknown>) => {
              const req: { onsuccess: null | (() => void); onerror: null } = { onsuccess: null, onerror: null };
              setTimeout(() => {
                if (storeName === 'metadata' && item.id) photosStore.set(String(item.id), item as unknown as Photo);
                if (storeName === 'albums' && item.id) albumsStore.set(String(item.id), item as unknown as Album);
                if (storeName === 'settings' && item.key) settingsStore.set(String(item.key), item.value);
                req.onsuccess?.();
              }, 0);
              return req;
            },
            delete: (id: string) => {
              const req: { onsuccess: null | (() => void); onerror: null } = { onsuccess: null, onerror: null };
              setTimeout(() => {
                if (storeName === 'metadata') photosStore.delete(id);
                if (storeName === 'albums') albumsStore.delete(id);
                req.onsuccess?.();
              }, 0);
              return req;
            },
          };
        },
      };

      setTimeout(() => {
        tx.oncomplete?.();
      }, 5);

      return tx;
    },
  } as unknown as IDBDatabase;
}

describe('db migration & operations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    dbModule.setDBInstance(null);
  });

  const fallbackPhotos: Photo[] = [
    {
      id: 'mock-1',
      url: 'url-1',
      alt: 'Mock 1',
      date: '2024-01-01',
      isFavorite: false,
      albumIds: [],
      tags: [],
      metadata: { device: 'Test', resolution: '1x1', date: 'now' },
    },
  ];

  const fallbackAlbums: Album[] = [
    {
      id: 'album-1',
      title: 'Album 1',
      coverPhotoId: 'mock-1',
      photoCount: 1,
      isShared: false,
      isPrivate: false,
    },
  ];

  it('migrates candidates from localStorage independently without duplicates', async () => {
    const existingPhoto: Photo = {
      id: 'existing-p1',
      url: 'u1',
      alt: 'Existing Photo',
      date: '2024-01-01',
      isFavorite: false,
      albumIds: [],
      tags: [],
      metadata: { device: 'Cam', resolution: '1x1', date: 'now' },
    };

    // Stored photos in IDB already has existingPhoto
    const mockDB = createMockIDBDatabase([existingPhoto], []);
    dbModule.setDBInstance(mockDB);

    // LocalStorage has 1 duplicate photo + 1 new photo, and 1 new album
    const candidatePhotos = [
      existingPhoto, // Should be skipped!
      {
        id: 'new-p2',
        url: 'u2',
        alt: 'New Photo',
        date: '2024-02-01',
        isFavorite: true,
        albumIds: [],
        tags: [],
        metadata: { device: 'Cam', resolution: '1x1', date: 'now' },
      },
    ];

    const candidateAlbums = [
      {
        id: 'new-a1',
        title: 'New Album',
        coverPhotoId: 'new-p2',
        photoCount: 1,
        isShared: false,
        isPrivate: false,
      },
    ];

    localStorage.setItem('gallery_pro_photos', JSON.stringify(candidatePhotos));
    localStorage.setItem('gallery_pro_albums', JSON.stringify(candidateAlbums));

    const result = await dbModule.migrateFromLocalStorage(fallbackPhotos, fallbackAlbums);

    // Verify report
    expect(result.report.photosMigrated).toBe(1);
    expect(result.report.photosSkipped).toBe(1);
    expect(result.report.albumsMigrated).toBe(1);
    expect(result.report.albumsSkipped).toBe(0);

    // Verify returned merged collections
    expect(result.photos.length).toBe(2);
    expect(result.photos.map((p) => p.id)).toEqual(['existing-p1', 'new-p2']);
    expect(result.albums.length).toBe(1);
    expect(result.albums[0].id).toBe('new-a1');
  });

  it('is idempotent on consecutive runs and does not re-migrate', async () => {
    const existingPhoto: Photo = {
      id: 'p1',
      url: 'u1',
      alt: 'Photo 1',
      date: '2024-01-01',
      isFavorite: false,
      albumIds: [],
      tags: [],
      metadata: { device: 'Cam', resolution: '1x1', date: 'now' },
    };

    const existingAlbum: Album = {
      id: 'a1',
      title: 'Album 1',
      coverPhotoId: 'p1',
      photoCount: 1,
      isShared: false,
      isPrivate: false,
    };

    // Both are already in IndexedDB
    const mockDB = createMockIDBDatabase([existingPhoto], [existingAlbum]);
    dbModule.setDBInstance(mockDB);

    localStorage.setItem('gallery_pro_photos', JSON.stringify([existingPhoto]));
    localStorage.setItem('gallery_pro_albums', JSON.stringify([existingAlbum]));

    const result = await dbModule.migrateFromLocalStorage(fallbackPhotos, fallbackAlbums);

    expect(result.report.photosMigrated).toBe(0);
    expect(result.report.photosSkipped).toBe(1);
    expect(result.report.albumsMigrated).toBe(0);
    expect(result.report.albumsSkipped).toBe(1);
    expect(result.photos).toHaveLength(1);
    expect(result.albums).toHaveLength(1);
  });
});
