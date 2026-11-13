import type { Photo } from '../types/types';
import { filterPhotos } from './searchEngine';

export interface BenchmarkMeasurement {
  photoCount: number;
  datasetGenerationMs: number;
  initialLoadMs: number;
  searchFullTextMs: number;
  searchFilterMultiCriteriaMs: number;
  groupingByDateMs: number;
  sortingMs: number;
  estimatedMemoryMb: number;
  status: 'completed' | 'failed';
  notes: string;
}

/**
 * Generates synthetic photo metadata for scale testing (1,000 to 20,000 items).
 * Does not bloat IndexedDB: runs in controlled memory or temporary benchmarking sandbox.
 */
export function generateSyntheticPhotoDataset(count: number): Photo[] {
  const cities = ['Paris', 'Lyon', 'Marseille', 'Nice', 'Bordeaux', 'Strasbourg', 'Toulouse', 'Nantes'];
  const cameras = ['Sony A7IV', 'Canon EOS R5', 'iPhone 15 Pro', 'Fujifilm X-T5', 'Nikon Z8', 'Pixel 8 Pro'];
  const baseTags = ['vacances', 'voyage', 'nature', 'famille', 'architecture', 'plage', 'montagne', 'ville', 'portrait', 'soirée'];

  const photos: Photo[] = new Array(count);
  const startDate = new Date(2020, 0, 1).getTime();
  const endDate = new Date(2026, 10, 10).getTime();
  const dateSpan = endDate - startDate;

  for (let i = 0; i < count; i++) {
    const randomTime = startDate + Math.random() * dateSpan;
    const dateObj = new Date(randomTime);
    const dateStr = dateObj.toISOString().split('T')[0];
    const city = cities[i % cities.length];
    const camera = cameras[i % cameras.length];
    const photoTags = [
      baseTags[i % baseTags.length],
      baseTags[(i + 3) % baseTags.length],
    ];

    photos[i] = {
      id: `synth-${i + 1}`,
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
      alt: `Photo de test ${city} #${i + 1}`,
      date: dateStr,
      isFavorite: i % 7 === 0,
      albumIds: i % 5 === 0 ? [`album-${(i % 4) + 1}`] : [],
      tags: photoTags,
      storage: 'remote',
      hasThumbnail: true,
      metadata: {
        device: camera,
        resolution: '4000 × 3000 (12.0 MP)',
        width: 4000,
        height: 3000,
        date: dateStr,
        location: city,
        latitude: 48.8566 + (Math.random() - 0.5) * 5,
        longitude: 2.3522 + (Math.random() - 0.5) * 5,
        fileSize: 4500000,
        analysis: {
          qualityScore: 70 + (i % 25),
          isBlurry: i % 20 === 0,
        },
      },
    };
  }

  return photos;
}

/**
 * Executes authentic performance benchmark tests for a given photo volume (1k, 5k, 10k, 20k).
 * Uses real high-resolution performance.now() timers.
 */
export async function runScaleBenchmark(count: number): Promise<BenchmarkMeasurement> {
  const t0 = performance.now();

  // 1. Dataset Generation
  const dataset = generateSyntheticPhotoDataset(count);
  const t1 = performance.now();
  const datasetGenerationMs = Math.round(t1 - t0);

  // 2. Simulated Initial Loading & Indexing
  const t2 = performance.now();
  const idMap = new Map<string, Photo>();
  for (const p of dataset) {
    idMap.set(p.id, p);
  }
  const t3 = performance.now();
  const initialLoadMs = Math.round(t3 - t2);

  // 3. Full-text search over entire dataset
  const t4 = performance.now();
  const textResults = filterPhotos(dataset, { query: 'Paris nature' });
  const t5 = performance.now();
  const searchFullTextMs = Math.round(t5 - t4);

  // 4. Multi-criteria filtering (Year + Favorites + GPS)
  const t6 = performance.now();
  const multiResults = filterPhotos(dataset, {
    year: 2024,
    isFavorite: true,
    hasGps: true,
  });
  const t7 = performance.now();
  const searchFilterMultiCriteriaMs = Math.round(t7 - t6);

  // 5. Grouping by Chronological Dates (Gallery Wall pipeline)
  const t8 = performance.now();
  const grouped: Record<string, Photo[]> = {};
  for (const p of dataset) {
    const d = p.date || 'Inconnue';
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(p);
  }
  const t9 = performance.now();
  const groupingByDateMs = Math.round(t9 - t8);

  // 6. Chronological Sorting
  const t10 = performance.now();
  const sorted = [...dataset].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  const t11 = performance.now();
  const sortingMs = Math.round(t11 - t10);

  // 7. Memory estimation
  let estimatedMemoryMb = Math.round((JSON.stringify(dataset.slice(0, 500)).length / 500) * count / (1024 * 1024));
  // Use performance.memory if supported by browser (e.g. Chrome)
  const perfAny = performance as unknown as { memory?: { usedJSHeapSize: number } };
  if (perfAny.memory && perfAny.memory.usedJSHeapSize) {
    estimatedMemoryMb = Math.round(perfAny.memory.usedJSHeapSize / (1024 * 1024));
  }

  // Prevent dead-code elimination by dummy checking counts
  const totalVerified = textResults.length + multiResults.length + sorted.length;

  return {
    photoCount: count,
    datasetGenerationMs,
    initialLoadMs,
    searchFullTextMs,
    searchFilterMultiCriteriaMs,
    groupingByDateMs,
    sortingMs,
    estimatedMemoryMb,
    status: totalVerified > 0 ? 'completed' : 'failed',
    notes: `Test validé : ${textResults.length} résultats texte, ${multiResults.length} filtrages multi-critères.`,
  };
}

/**
 * Runs the complete benchmark suite across the 4 required thresholds:
 * 1 000, 5 000, 10 000 and 20 000 photos.
 */
export async function runFullBenchmarkSuite(
  onProgress?: (count: number, index: number, total: number) => void
): Promise<BenchmarkMeasurement[]> {
  const counts = [1000, 5000, 10000, 20000];
  const results: BenchmarkMeasurement[] = [];

  for (let i = 0; i < counts.length; i++) {
    const count = counts[i];
    onProgress?.(count, i + 1, counts.length);
    // Yield to event loop to keep UI fluid
    await new Promise((r) => setTimeout(r, 20));
    const measurement = await runScaleBenchmark(count);
    results.push(measurement);
  }

  return results;
}
