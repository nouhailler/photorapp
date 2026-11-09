import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { PhotoProvider } from './PhotoContext';
import { usePhotos } from './usePhotos';
import React from 'react';

// Mock the DB utilities
vi.mock('../utils/db', () => ({
  getPhotoBlob: vi.fn(),
  savePhotoBlob: vi.fn(),
  deletePhotoBlob: vi.fn(),
  savePhotoMeta: vi.fn().mockResolvedValue(undefined),
  deletePhotoMeta: vi.fn().mockResolvedValue(undefined),
  saveAlbumMeta: vi.fn().mockResolvedValue(undefined),
  deleteAlbumMeta: vi.fn().mockResolvedValue(undefined),
  deletePhotoAtomic: vi.fn().mockResolvedValue(undefined),
  deletePhotosAtomic: vi.fn().mockResolvedValue(undefined),
  migrateFromLocalStorage: vi.fn().mockImplementation((fallbackPhotos, fallbackAlbums) =>
    Promise.resolve({
      photos: fallbackPhotos,
      albums: fallbackAlbums,
      report: { photosMigrated: 0, albumsMigrated: 0, photosSkipped: 0, albumsSkipped: 0 },
    })
  ),
  openDB: vi.fn(),
}));

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhotoProvider>{children}</PhotoProvider>
);

const renderPhotoHook = async () => {
  const rendered = renderHook(() => usePhotos(), { wrapper });
  await waitFor(() => expect(rendered.result.current.isLoading).toBe(false));
  return rendered;
};

describe('PhotoContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with photos', async () => {
    const { result } = await renderPhotoHook();
    expect(result.current.photos.length).toBeGreaterThan(0);
  });

  it('should toggle favorite status', async () => {
    const { result } = await renderPhotoHook();
    const firstPhotoId = result.current.photos[0].id;
    const initialFavorite = result.current.photos[0].isFavorite;

    act(() => {
      result.current.toggleFavorite(firstPhotoId);
    });

    expect(result.current.photos[0].isFavorite).toBe(!initialFavorite);
  });

  it('should add a new photo', async () => {
    const { result } = await renderPhotoHook();
    const initialCount = result.current.photos.length;

    const newPhoto = {
      id: 'test-photo-1',
      url: 'test-url',
      alt: 'Test Photo',
      date: '2024-01-01',
      isFavorite: false,
      albumIds: [],
      tags: [],
      storage: 'remote' as const,
      metadata: { device: 'Test', resolution: '1x1', date: 'now' },
    };

    await act(async () => {
      await result.current.addPhotos([{ photo: newPhoto }]);
    });

    expect(result.current.photos.length).toBe(initialCount + 1);
    expect(result.current.photos[0].id).toBe('test-photo-1');
  });

  it('should delete a photo', async () => {
    const { result } = await renderPhotoHook();
    const firstPhotoId = result.current.photos[0].id;
    const initialCount = result.current.photos.length;

    await act(async () => {
      await result.current.deletePhoto(firstPhotoId);
    });

    expect(result.current.photos.length).toBe(initialCount - 1);
    expect(result.current.photos.find((p) => p.id === firstPhotoId)).toBeUndefined();
  });

  it('should delete multiple photos', async () => {
    const { result } = await renderPhotoHook();
    const idsToDelete = [result.current.photos[0].id, result.current.photos[1].id];
    const initialCount = result.current.photos.length;

    await act(async () => {
      await result.current.deletePhotos(idsToDelete);
    });

    expect(result.current.photos.length).toBe(initialCount - 2);
    expect(result.current.photos.find((p) => idsToDelete.includes(p.id))).toBeUndefined();
  });

  it('should create an album', async () => {
    const { result } = await renderPhotoHook();
    const initialAlbumCount = result.current.albums.length;

    act(() => {
      result.current.createAlbum('New Test Album');
    });

    expect(result.current.albums.length).toBe(initialAlbumCount + 1);
    expect(result.current.albums[0].title).toBe('New Test Album');
  });

  it('should remove a photo from an album without deleting the photo from library', async () => {
    const { result } = await renderPhotoHook();
    const photoId = result.current.photos[0].id;
    const albumId = result.current.albums[0].id;

    // Add photo to album
    act(() => {
      result.current.addPhotosToAlbum([photoId], albumId);
    });

    const photoInAlbum = result.current.photos.find((p) => p.id === photoId);
    expect(photoInAlbum?.albumIds).toContain(albumId);

    // Remove from album
    act(() => {
      result.current.removePhotoFromAlbum(photoId, albumId);
    });

    const photoAfterRemoval = result.current.photos.find((p) => p.id === photoId);
    expect(photoAfterRemoval).toBeDefined(); // Photo still in library!
    expect(photoAfterRemoval?.albumIds).not.toContain(albumId);
  });

  it('should reset photo adjustments', async () => {
    const { result } = await renderPhotoHook();
    const photoId = result.current.photos[0].id;

    act(() => {
      result.current.updateAdjustments(photoId, {
        brightness: 45,
        contrast: 30,
        saturation: 20,
        rotation: 90,
      });
    });

    expect(result.current.photos.find((p) => p.id === photoId)?.adjustments?.brightness).toBe(45);

    act(() => {
      result.current.resetAdjustments(photoId);
    });

    expect(result.current.photos.find((p) => p.id === photoId)?.adjustments?.brightness).toBe(0);
    expect(result.current.photos.find((p) => p.id === photoId)?.adjustments?.rotation).toBe(0);
  });
});
