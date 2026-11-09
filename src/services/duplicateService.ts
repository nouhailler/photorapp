import type { Photo } from '../types/types';

export interface DuplicateGroup {
  key: string;
  type: 'exact' | 'similar';
  photos: Photo[];
  totalSizeBytes: number;
}

/**
 * Calculates Hamming distance between two 16-hex perceptual hashes (64 bits).
 */
export function getDHashDistance(hashA: string, hashB: string): number {
  if (!hashA || !hashB || hashA.length !== 16 || hashB.length !== 16) {
    return 64;
  }
  let distance = 0;
  for (let i = 0; i < 16; i++) {
    const valA = parseInt(hashA[i], 16);
    const valB = parseInt(hashB[i], 16);
    let xor = valA ^ valB;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

/**
 * Identifies exact duplicates using verified cryptographic SHA-256 hash only.
 * Photos without a cryptographic hash are not grouped to prevent accidental data loss.
 */
export function findExactDuplicates(photos: Photo[]): DuplicateGroup[] {
  const hashMap = new Map<string, Photo[]>();

  for (const photo of photos) {
    const hash = photo.metadata?.hash;
    if (hash && hash.trim().length > 0) {
      const list = hashMap.get(hash) || [];
      list.push(photo);
      hashMap.set(hash, list);
    }
  }

  const duplicates: DuplicateGroup[] = [];
  for (const [key, group] of hashMap.entries()) {
    if (group.length > 1) {
      const totalSizeBytes = group.reduce(
        (acc, p) => acc + (p.metadata?.fileSize || 0),
        0
      );
      duplicates.push({
        key,
        type: 'exact',
        photos: group,
        totalSizeBytes,
      });
    }
  }

  return duplicates;
}

/**
 * Identifies visually similar photos using perceptual difference hash distance (threshold <= 6 bits).
 */
export function findSimilarPhotos(photos: Photo[], threshold = 6): DuplicateGroup[] {
  const analyzedPhotos = photos.filter((p) => p.metadata?.analysis?.dHash);
  const visited = new Set<string>();
  const groups: DuplicateGroup[] = [];

  for (let i = 0; i < analyzedPhotos.length; i++) {
    const photoA = analyzedPhotos[i];
    if (visited.has(photoA.id)) continue;

    const cluster: Photo[] = [photoA];
    const hashA = photoA.metadata?.analysis?.dHash || '';

    for (let j = i + 1; j < analyzedPhotos.length; j++) {
      const photoB = analyzedPhotos[j];
      if (visited.has(photoB.id)) continue;

      const hashB = photoB.metadata?.analysis?.dHash || '';
      const dist = getDHashDistance(hashA, hashB);

      if (dist <= threshold) {
        cluster.push(photoB);
        visited.add(photoB.id);
      }
    }

    if (cluster.length > 1) {
      visited.add(photoA.id);
      const totalSizeBytes = cluster.reduce(
        (acc, p) => acc + (p.metadata?.fileSize || 0),
        0
      );
      groups.push({
        key: `similar-${photoA.id}`,
        type: 'similar',
        photos: cluster,
        totalSizeBytes,
      });
    }
  }

  return groups;
}

/**
 * Returns photos that lack a cryptographic SHA-256 hash.
 */
export function getUnverifiedPhotos(photos: Photo[]): Photo[] {
  return photos.filter((p) => !p.metadata?.hash);
}
