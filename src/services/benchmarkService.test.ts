import { describe, it, expect } from 'vitest';
import { generateSyntheticPhotoDataset, runScaleBenchmark } from './benchmarkService';

describe('benchmarkService', () => {
  it('generates exact requested volume of synthetic photos with valid metadata', () => {
    const dataset = generateSyntheticPhotoDataset(1000);
    expect(dataset).toHaveLength(1000);
    expect(dataset[0].id).toBe('synth-1');
    expect(dataset[0].metadata?.location).toBeTruthy();
    expect(dataset[0].hasThumbnail).toBe(true);
  });

  it('runs authentic scale benchmark for 1,000 and 5,000 photos cleanly', async () => {
    const m1k = await runScaleBenchmark(1000);
    expect(m1k.photoCount).toBe(1000);
    expect(m1k.status).toBe('completed');
    expect(m1k.searchFullTextMs).toBeGreaterThanOrEqual(0);
    expect(m1k.groupingByDateMs).toBeGreaterThanOrEqual(0);

    const m5k = await runScaleBenchmark(5000);
    expect(m5k.photoCount).toBe(5000);
    expect(m5k.status).toBe('completed');
  });
});
