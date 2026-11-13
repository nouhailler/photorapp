import type { Photo, Album, StorageDiagnostic, PersonGroup } from '../types/types';

const DB_NAME = 'GalleryProDB';
const DB_VERSION = 3;

export const STORES = {
  PHOTOS: 'photos', // Master photo blobs: { id: string, blob: Blob }
  THUMBNAILS: 'thumbnails', // Lightweight preview thumbnails: { id: string, blob: Blob }
  METADATA: 'metadata', // Photo metadata: Photo
  ALBUMS: 'albums', // Album metadata: Album
  PERSONS: 'persons', // PersonGroup: PersonGroup
  SETTINGS: 'settings', // Key-value app settings: { key: string, value: unknown }
} as const;

export interface PhotoBlob {
  id: string;
  blob: Blob;
}

export interface MigrationReport {
  version: number;
  migratedAt: string;
  photosMigrated: number;
  photosSkipped: number;
  albumsMigrated: number;
  albumsSkipped: number;
  errors: string[];
}

let dbInstance: IDBDatabase | null = null;

export const setDBInstance = (db: IDBDatabase | null): void => {
  dbInstance = db;
};

export const openDB = (): Promise<IDBDatabase> => {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[GalleryProDB] Error opening database:', request.error);
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn('[GalleryProDB] Database upgrade blocked by another connection');
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store for binary master blobs
      if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
        db.createObjectStore(STORES.PHOTOS, { keyPath: 'id' });
      }

      // Store for lightweight thumbnails
      if (!db.objectStoreNames.contains(STORES.THUMBNAILS)) {
        db.createObjectStore(STORES.THUMBNAILS, { keyPath: 'id' });
      }

      // Store for photo metadata
      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        const metaStore = db.createObjectStore(STORES.METADATA, { keyPath: 'id' });
        metaStore.createIndex('date', 'date', { unique: false });
        metaStore.createIndex('isFavorite', 'isFavorite', { unique: false });
      }

      // Store for albums
      if (!db.objectStoreNames.contains(STORES.ALBUMS)) {
        db.createObjectStore(STORES.ALBUMS, { keyPath: 'id' });
      }

      // Store for person groups
      if (!db.objectStoreNames.contains(STORES.PERSONS)) {
        db.createObjectStore(STORES.PERSONS, { keyPath: 'id' });
      }

      // Store for key-value settings
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };
  });
};

/* ============================================================
   PHOTO BLOBS (BINARY MASTER DATA)
   ============================================================ */

export const savePhotoBlob = async (photoBlob: PhotoBlob): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PHOTOS, 'readwrite');
    const store = transaction.objectStore(STORES.PHOTOS);
    const request = store.put(photoBlob);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getPhotoBlob = async (id: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PHOTOS, 'readonly');
    const store = transaction.objectStore(STORES.PHOTOS);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as PhotoBlob | undefined;
      resolve(result ? result.blob : null);
    };
  });
};

export const deletePhotoBlob = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PHOTOS, 'readwrite');
    const store = transaction.objectStore(STORES.PHOTOS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/* ============================================================
   THUMBNAILS (OPTIMIZED PREVIEW BLOBS)
   ============================================================ */

export const saveThumbnailBlob = async (thumbnail: PhotoBlob): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.THUMBNAILS, 'readwrite');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    const request = store.put(thumbnail);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getThumbnailBlob = async (id: string): Promise<Blob | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.THUMBNAILS, 'readonly');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as PhotoBlob | undefined;
      resolve(result ? result.blob : null);
    };
  });
};

export const deleteThumbnailBlob = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.THUMBNAILS, 'readwrite');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const getAllThumbnailIds = async (): Promise<string[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.THUMBNAILS, 'readonly');
    const store = transaction.objectStore(STORES.THUMBNAILS);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve((request.result as string[]) || []);
    };
  });
};

export const getAllBlobIds = async (): Promise<string[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PHOTOS, 'readonly');
    const store = transaction.objectStore(STORES.PHOTOS);
    const request = store.getAllKeys();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      resolve((request.result as string[]) || []);
    };
  });
};

/* ============================================================
   PHOTO METADATA
   ============================================================ */

export const getAllPhotosMeta = async (): Promise<Photo[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.METADATA, 'readonly');
    const store = transaction.objectStore(STORES.METADATA);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as Photo[]) || []);
  });
};

export const savePhotoMeta = async (photo: Photo): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.METADATA, 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);
    const request = store.put(photo);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const saveAllPhotosMeta = async (photos: Photo[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.METADATA, 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);

    photos.forEach((photo) => store.put(photo));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deletePhotoMeta = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.METADATA, 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/* ============================================================
   ALBUMS
   ============================================================ */

export const getAllAlbumsMeta = async (): Promise<Album[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, 'readonly');
    const store = transaction.objectStore(STORES.ALBUMS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as Album[]) || []);
  });
};

export const saveAlbumMeta = async (album: Album): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, 'readwrite');
    const store = transaction.objectStore(STORES.ALBUMS);
    const request = store.put(album);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const saveAllAlbumsMeta = async (albums: Album[]): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, 'readwrite');
    const store = transaction.objectStore(STORES.ALBUMS);

    albums.forEach((album) => store.put(album));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const deleteAlbumMeta = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.ALBUMS, 'readwrite');
    const store = transaction.objectStore(STORES.ALBUMS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/* ============================================================
   SETTINGS STORE
   ============================================================ */

export const getSetting = async <T = unknown>(key: string): Promise<T | null> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readonly');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const result = request.result as { key: string; value: T } | undefined;
      resolve(result ? result.value : null);
    };
  });
};

export const saveSetting = async (key: string, value: unknown): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.SETTINGS, 'readwrite');
    const store = transaction.objectStore(STORES.SETTINGS);
    const request = store.put({ key, value });

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/* ============================================================
   PERSONS
   ============================================================ */

export const getAllPersons = async (): Promise<PersonGroup[]> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PERSONS, 'readonly');
    const store = transaction.objectStore(STORES.PERSONS);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve((request.result as PersonGroup[]) || []);
  });
};

export const savePerson = async (person: PersonGroup): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PERSONS, 'readwrite');
    const store = transaction.objectStore(STORES.PERSONS);
    const request = store.put(person);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

export const deletePerson = async (id: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PERSONS, 'readwrite');
    const store = transaction.objectStore(STORES.PERSONS);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

/* ============================================================
   ATOMIC SAFE DELETION
   ============================================================ */

/**
 * Atomically deletes photo metadata and updates affected albums in a single transaction.
 * If the transaction succeeds, then and only then deletes the associated binary blob.
 */
export const deletePhotoAtomic = async (
  photoId: string,
  updatedAlbums: Album[],
  isLocal: boolean
): Promise<void> => {
  const db = await openDB();

  // Step 1: Atomic transaction on metadata + albums
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORES.METADATA, STORES.ALBUMS], 'readwrite');
    const metaStore = transaction.objectStore(STORES.METADATA);
    const albumStore = transaction.objectStore(STORES.ALBUMS);

    metaStore.delete(photoId);
    updatedAlbums.forEach((album) => albumStore.put(album));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted during atomic photo deletion'));
  });

  // Step 2: Delete local binary blob and thumbnail only after metadata transaction committed
  if (isLocal) {
    try {
      await deletePhotoBlob(photoId);
    } catch (e) {
      console.warn(`[GalleryProDB] Non-fatal: blob ${photoId} deletion failed after metadata removed:`, e);
    }
    try {
      await deleteThumbnailBlob(photoId);
    } catch {
      // Non-fatal
    }
  }
};

/**
 * Atomically deletes multiple photos metadata and updates albums in a single transaction.
 */
export const deletePhotosAtomic = async (
  photoIds: string[],
  updatedAlbums: Album[],
  localPhotoIds: string[]
): Promise<void> => {
  const db = await openDB();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction([STORES.METADATA, STORES.ALBUMS], 'readwrite');
    const metaStore = transaction.objectStore(STORES.METADATA);
    const albumStore = transaction.objectStore(STORES.ALBUMS);

    photoIds.forEach((id) => metaStore.delete(id));
    updatedAlbums.forEach((album) => albumStore.put(album));

    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(new Error('Transaction aborted during atomic bulk photos deletion'));
  });

  // Delete blobs and thumbnails afterwards
  for (const localId of localPhotoIds) {
    try {
      await deletePhotoBlob(localId);
    } catch (e) {
      console.warn(`[GalleryProDB] Non-fatal: blob ${localId} cleanup failed:`, e);
    }
    try {
      await deleteThumbnailBlob(localId);
    } catch {
      // Non-fatal
    }
  }
};

/* ============================================================
   MIGRATION & DIAGNOSTICS
   ============================================================ */

/**
 * Performs independent, idempotent, non-destructive migration of photos and albums from LocalStorage to IndexedDB.
 * Merges missing entries by ID without overwriting already stored records.
 */
export const migrateFromLocalStorage = async (
  fallbackPhotos: Photo[],
  fallbackAlbums: Album[]
): Promise<{ photos: Photo[]; albums: Album[]; report: MigrationReport }> => {
  const report: MigrationReport = {
    version: 2,
    migratedAt: new Date().toISOString(),
    photosMigrated: 0,
    photosSkipped: 0,
    albumsMigrated: 0,
    albumsSkipped: 0,
    errors: [],
  };

  try {
    await openDB();

    // 1. Fetch current IndexedDB records
    const storedPhotos = await getAllPhotosMeta();
    const storedAlbums = await getAllAlbumsMeta();

    const existingPhotoIds = new Set(storedPhotos.map((p) => p.id));
    const existingAlbumIds = new Set(storedAlbums.map((a) => a.id));

    // 2. Read legacy LocalStorage independently
    let candidatePhotos: Photo[] = [];
    let candidateAlbums: Album[] = [];

    try {
      const savedPhotosStr = localStorage.getItem('gallery_pro_photos');
      if (savedPhotosStr) {
        const parsed = JSON.parse(savedPhotosStr);
        if (Array.isArray(parsed)) candidatePhotos = parsed;
      }
    } catch (e) {
      report.errors.push(`Erreur parsing localStorage photos: ${e instanceof Error ? e.message : 'inconnu'}`);
    }

    try {
      const savedAlbumsStr = localStorage.getItem('gallery_pro_albums');
      if (savedAlbumsStr) {
        const parsed = JSON.parse(savedAlbumsStr);
        if (Array.isArray(parsed)) candidateAlbums = parsed;
      }
    } catch (e) {
      report.errors.push(`Erreur parsing localStorage albums: ${e instanceof Error ? e.message : 'inconnu'}`);
    }

    // If both IndexedDB and LocalStorage are totally empty for a domain, seed with fallback defaults
    const sourcePhotos = storedPhotos.length === 0 && candidatePhotos.length === 0 ? fallbackPhotos : candidatePhotos;
    const sourceAlbums = storedAlbums.length === 0 && candidateAlbums.length === 0 ? fallbackAlbums : candidateAlbums;

    // 3. Migrate photos independently (detect existing IDs, never overwrite)
    const newPhotosToSave: Photo[] = [];
    for (const photo of sourcePhotos) {
      if (photo && photo.id) {
        if (!existingPhotoIds.has(photo.id)) {
          newPhotosToSave.push(photo);
          existingPhotoIds.add(photo.id);
          report.photosMigrated++;
        } else {
          report.photosSkipped++;
        }
      }
    }

    if (newPhotosToSave.length > 0) {
      await saveAllPhotosMeta(newPhotosToSave);
    }

    // 4. Migrate albums independently (detect existing IDs, never overwrite)
    const newAlbumsToSave: Album[] = [];
    for (const album of sourceAlbums) {
      if (album && album.id) {
        if (!existingAlbumIds.has(album.id)) {
          newAlbumsToSave.push(album);
          existingAlbumIds.add(album.id);
          report.albumsMigrated++;
        } else {
          report.albumsSkipped++;
        }
      }
    }

    if (newAlbumsToSave.length > 0) {
      await saveAllAlbumsMeta(newAlbumsToSave);
    }

    // 5. Store migration report in settings
    await saveSetting('migration_v2_report', report);

    // 6. Return the full consolidated collections
    const finalPhotos = await getAllPhotosMeta();
    const finalAlbums = await getAllAlbumsMeta();

    return {
      photos: finalPhotos,
      albums: finalAlbums,
      report,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
    report.errors.push(`Migration exception: ${errorMsg}`);
    console.warn('[GalleryProDB] Migration issue, using available or fallback data:', err);

    return {
      photos: fallbackPhotos,
      albums: fallbackAlbums,
      report,
    };
  }
};

export const diagnoseStorage = async (
  currentPhotos: Photo[],
  currentAlbums: Album[]
): Promise<StorageDiagnostic> => {
  const indexedDbSupported = typeof indexedDB !== 'undefined';
  let totalEstimatedBytes = 0;
  let orphanedBlobsCount = 0;
  let missingBlobsCount = 0;
  let thumbnailsCount = 0;
  let missingThumbnailsCount = 0;

  if (indexedDbSupported) {
    try {
      const [blobIds, thumbIds] = await Promise.all([
        getAllBlobIds(),
        getAllThumbnailIds(),
      ]);
      const localPhotos = currentPhotos.filter((p) => p.storage === 'local');
      const localPhotoIds = new Set(localPhotos.map((p) => p.id));
      const thumbSet = new Set(thumbIds);

      orphanedBlobsCount = blobIds.filter((id) => !localPhotoIds.has(id)).length;
      missingBlobsCount = localPhotos.filter((p) => !blobIds.includes(p.id)).length;
      thumbnailsCount = thumbIds.length;
      missingThumbnailsCount = localPhotos.filter((p) => !thumbSet.has(p.id)).length;

      // Estimate storage through quota API if available
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        totalEstimatedBytes = estimate.usage || 0;
      }
    } catch (e) {
      console.warn('[GalleryProDB] Storage diagnostic error:', e);
    }
  }

  const localCount = currentPhotos.filter((p) => p.storage === 'local').length;

  return {
    totalPhotos: currentPhotos.length,
    localPhotosCount: localCount,
    remotePhotosCount: currentPhotos.length - localCount,
    totalAlbums: currentAlbums.length,
    totalSizeEstimatedBytes: totalEstimatedBytes,
    orphanedBlobsCount,
    missingBlobsCount,
    thumbnailsCount,
    missingThumbnailsCount,
    indexedDbSupported,
  };
};

export const cleanupOrphanedBlobs = async (activePhotoIds: string[]): Promise<number> => {
  try {
    const allBlobIds = await getAllBlobIds();
    const activeSet = new Set(activePhotoIds);
    let removed = 0;

    for (const blobId of allBlobIds) {
      if (!activeSet.has(blobId)) {
        await deletePhotoBlob(blobId);
        removed++;
      }
    }
    return removed;
  } catch (err) {
    console.error('[GalleryProDB] Error cleaning up orphaned blobs:', err);
    return 0;
  }
};

export const cleanupOrphanedThumbnails = async (activePhotoIds: string[]): Promise<number> => {
  try {
    const allThumbIds = await getAllThumbnailIds();
    const activeSet = new Set(activePhotoIds);
    let removed = 0;

    for (const thumbId of allThumbIds) {
      if (!activeSet.has(thumbId)) {
        await deleteThumbnailBlob(thumbId);
        removed++;
      }
    }
    return removed;
  } catch (err) {
    console.error('[GalleryProDB] Error cleaning up orphaned thumbnails:', err);
    return 0;
  }
};
