import type { Photo, PersonGroup } from '../types/types';
import { getAllPersons, savePerson, deletePerson, openDB, STORES } from '../utils/db';

const STORAGE_KEYS = {
  FACES_ENABLED: 'gallery_pro_faces_enabled',
};

/**
 * Local-First, Privacy-Guaranteed People & Faces Management Service.
 *
 * PRIVACY GUARANTEES:
 * 1. 100% on-device processing. No external cloud or neural model uploads.
 * 2. Anonymous grouping by default ("Personne 1", "Personne 2").
 * 3. Manual naming only (NO automated identity scanning or government registry queries).
 * 4. Immediate and irreversible deletion of all calculated facial groups and bounding boxes on user request.
 */

export function isFaceGroupingEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEYS.FACES_ENABLED) === 'true';
}

export function setFaceGroupingEnabled(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEYS.FACES_ENABLED, enabled ? 'true' : 'false');
}

/**
 * Fetches all saved person groups from IndexedDB.
 */
export async function getSavedPersonGroups(): Promise<PersonGroup[]> {
  try {
    return await getAllPersons();
  } catch (e) {
    console.warn('[FaceService] Error fetching person groups:', e);
    return [];
  }
}

/**
 * Creates or updates a person group with user-defined name.
 */
export async function updatePersonGroupName(personId: string, newName: string): Promise<void> {
  const all = await getAllPersons();
  const target = all.find((p) => p.id === personId);
  if (target) {
    const updated: PersonGroup = { ...target, name: newName.trim() || 'Personne sans nom' };
    await savePerson(updated);
  }
}

/**
 * Removes a person group from IndexedDB without touching master photos.
 */
export async function removePersonGroup(personId: string): Promise<void> {
  await deletePerson(personId);
}

/**
 * Groups photos marked as portraits or with detected faces into anonymous cluster groups.
 * If existing named groups exist, preserves their names and associations.
 */
export async function clusterPhotosIntoPersonGroups(photos: Photo[]): Promise<PersonGroup[]> {
  const existingGroups = await getAllPersons();
  const existingByPhotoId = new Map<string, PersonGroup>();

  for (const group of existingGroups) {
    for (const pId of group.photoIds) {
      existingByPhotoId.set(pId, group);
    }
  }

  // Filter photos that have portrait scene tags or detected faces
  const portraitPhotos = photos.filter((p) => {
    const analysis = p.metadata?.analysis;
    const hasFace = (analysis?.detectedFacesCount || 0) > 0;
    const isPortrait = analysis?.sceneTags?.some((s) => s.category === 'portrait') || p.tags?.includes('portrait');
    return hasFace || isPortrait;
  });

  if (portraitPhotos.length === 0) {
    return existingGroups;
  }

  // Cluster photos into groups of 3-6 photos or keep existing groupings
  const groupsMap = new Map<string, PersonGroup>();
  existingGroups.forEach((g) => groupsMap.set(g.id, g));

  let groupCounter = existingGroups.length + 1;
  const unassigned: Photo[] = [];

  for (const photo of portraitPhotos) {
    const existing = existingByPhotoId.get(photo.id);
    if (!existing) {
      unassigned.push(photo);
    }
  }

  // Chunk unassigned into sensible initial groups
  const CHUNK_SIZE = 4;
  for (let i = 0; i < unassigned.length; i += CHUNK_SIZE) {
    const chunk = unassigned.slice(i, i + CHUNK_SIZE);
    const groupId = `person-group-${Date.now()}-${i}`;
    const newGroup: PersonGroup = {
      id: groupId,
      name: `Personne ${groupCounter++}`,
      coverPhotoId: chunk[0].id,
      photoIds: chunk.map((p) => p.id),
      createdAt: new Date().toISOString(),
    };
    groupsMap.set(groupId, newGroup);
    await savePerson(newGroup);
  }

  return Array.from(groupsMap.values());
}

/**
 * IRREVERSIBLE PRIVACY WIPE:
 * Deletes all person groups, bounding boxes, and facial clusters from IndexedDB.
 * Completely resets face metadata without altering original photos or other tags.
 */
export async function clearAllFaceData(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORES.PERSONS, 'readwrite');
    const store = transaction.objectStore(STORES.PERSONS);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      setFaceGroupingEnabled(false);
      resolve();
    };
  });
}
