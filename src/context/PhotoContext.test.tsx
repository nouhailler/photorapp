import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PhotoProvider, usePhotos } from './PhotoContext';
import React from 'react';

// Mock the DB utilities
vi.mock('../utils/db', () => ({
  getPhotoBlob: vi.fn(),
  savePhotoBlob: vi.fn(),
  deletePhotoBlob: vi.fn(),
  openDB: vi.fn(),
}));

// Mock LocalStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <PhotoProvider>{children}</PhotoProvider>
);

describe('PhotoContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should initialize with photos', () => {
    const { result } = renderHook(() => usePhotos(), { wrapper });
    expect(result.current.photos.length).toBeGreaterThan(0);
  });

  it('should toggle favorite status', () => {
    const { result } = renderHook(() => usePhotos(), { wrapper });
    const firstPhotoId = result.current.photos[0].id;
    const initialFavorite = result.current.photos[0].isFavorite;

    act(() => {
      result.current.toggleFavorite(firstPhotoId);
    });

    expect(result.current.photos[0].isFavorite).toBe(!initialFavorite);
  });

  it('should add a new photo', async () => {
    const { result } = renderHook(() => usePhotos(), { wrapper });
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
      metadata: { device: 'Test', resolution: '1x1', date: 'now' }
    };

    await act(async () => {
      await result.current.addPhotos([{ photo: newPhoto }]);
    });

    expect(result.current.photos.length).toBe(initialCount + 1);
    expect(result.current.photos[0].id).toBe('test-photo-1');
  });

  it('should delete a photo', async () => {
    const { result } = renderHook(() => usePhotos(), { wrapper });
    const firstPhotoId = result.current.photos[0].id;
    const initialCount = result.current.photos.length;

    await act(async () => {
      await result.current.deletePhoto(firstPhotoId);
    });

    expect(result.current.photos.length).toBe(initialCount - 1);
    expect(result.current.photos.find(p => p.id === firstPhotoId)).toBeUndefined();
  });

  it('should create an album', () => {
    const { result } = renderHook(() => usePhotos(), { wrapper });
    const initialAlbumCount = result.current.albums.length;

    act(() => {
      result.current.createAlbum('New Test Album');
    });

    expect(result.current.albums.length).toBe(initialAlbumCount + 1);
    expect(result.current.albums[0].title).toBe('New Test Album');
  });
});
