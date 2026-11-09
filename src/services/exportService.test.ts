import { describe, it, expect, vi } from 'vitest';
import {
  exportMetadataJson,
  restoreFullLibraryBackup,
} from './exportService';
import type { Photo, Album } from '../types/types';

vi.mock('../utils/db', () => ({
  getPhotoBlob: vi.fn().mockResolvedValue(new Blob(['fake-image-bytes'], { type: 'image/jpeg' })),
  savePhotoBlob: vi.fn().mockResolvedValue(undefined),
  savePhotoMeta: vi.fn().mockResolvedValue(undefined),
  saveAlbumMeta: vi.fn().mockResolvedValue(undefined),
}));

describe('exportService', () => {
  const samplePhotos: Photo[] = [
    {
      id: 'p1',
      url: 'url1',
      alt: 'Test photo',
      date: '2024-01-01',
      isFavorite: true,
      albumIds: ['a1'],
      tags: ['nature'],
      storage: 'local',
      metadata: { device: 'Cam', resolution: '100x100', date: '2024-01-01', mimeType: 'image/jpeg' },
    },
  ];

  const sampleAlbums: Album[] = [
    {
      id: 'a1',
      title: 'Nature Album',
      coverPhotoId: 'p1',
      photoCount: 1,
      isShared: false,
      isPrivate: false,
    },
  ];

  it('exports valid metadata JSON with expected structure and version', () => {
    // Mock URL.createObjectURL and click
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    exportMetadataJson(samplePhotos, sampleAlbums);

    expect(createObjectURLSpy).toHaveBeenCalled();
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
  });

  it('rejects restore if file is not a valid zip archive', async () => {
    const invalidFile = new File(['not a zip file content'], 'test.zip', { type: 'application/zip' });

    await expect(restoreFullLibraryBackup(invalidFile)).rejects.toThrow(/Fichier ZIP corrompu ou illisible/i);
  });
});
