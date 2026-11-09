import type { Photo, Album, StorageDiagnostic, PersonGroup } from '../types/types';

const DB_NAME = 'GalleryProDB';
const DB_VERSION = 2;

export const STORES = {
  PHOTOS: 'photos', // Photo blobs: { id: string, blob: Blob }
  METADATA: 'metadata', // Photo metadata: Photo
  ALBUMS: 'albums', // Album metadata: Album
  PERSONS: 'persons', // PersonGroup: PersonGroup
  SETTINGS: 'settings', // Key-value app settings
} as const;

export interface PhotoBlob {
  id: string;
  blob: Blob;
}

let dbInstance: IDBDatabase | null = null;

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

      // Store for binary blobs
      if (!db.objectStoreNames.contains(STORES.PHOTOS)) {
        db.createObjectStore(STORES.PHOTOS, { keyPath: 'id' });
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
   PHOTO BLOBS (BINARY DATA)
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
   MIGRATION & DIAGNOSTICS
   ============================================================ */

export const migrateFromLocalStorage = async (
  fallbackPhotos: Photo[],
  fallbackAlbums: Album[]
): Promise<{ photos: Photo[]; albums: Album[] }> => {
  try {
    await openDB();
    const storedPhotos = await getAllPhotosMeta();
    const storedAlbums = await getAllAlbumsMeta();

    if (storedPhotos.length > 0 || storedAlbums.length > 0) {
      // IndexedDB already has data
      return {
        photos: storedPhotos,
        albums: storedAlbums.length > 0 ? storedAlbums : fallbackAlbums,
      };
    }

    // Try reading legacy localStorage
    let initialPhotos = fallbackPhotos;
    let initialAlbums = fallbackAlbums;

    try {
      const savedPhotosStr = localStorage.getItem('gallery_pro_photos');
      if (savedPhotosStr) {
        const parsed = JSON.parse(savedPhotosStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialPhotos = parsed;
        }
      }
    } catch (e) {
      console.warn('[GalleryProDB] Error parsing localStorage photos:', e);
    }

    try {
      const savedAlbumsStr = localStorage.getItem('gallery_pro_albums');
      if (savedAlbumsStr) {
        const parsed = JSON.parse(savedAlbumsStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          initialAlbums = parsed;
        }
      }
    } catch (e) {
      console.warn('[GalleryProDB] Error parsing localStorage albums:', e);
    }

    // Populate IndexedDB with initial/migrated data
    await saveAllPhotosMeta(initialPhotos);
    await saveAllAlbumsMeta(initialAlbums);

    return { photos: initialPhotos, albums: initialAlbums };
  } catch (err) {
    console.warn('[GalleryProDB] IndexedDB init failed, using localStorage fallback:', err);
    return { photos: fallbackPhotos, albums: fallbackAlbums };
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

  if (indexedDbSupported) {
    try {
      const blobIds = await getAllBlobIds();
      const localPhotos = currentPhotos.filter((p) => p.storage === 'local');
      const localPhotoIds = new Set(localPhotos.map((p) => p.id));

      orphanedBlobsCount = blobIds.filter((id) => !localPhotoIds.has(id)).length;
      missingBlobsCount = localPhotos.filter((p) => !blobIds.includes(p.id)).length;

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
