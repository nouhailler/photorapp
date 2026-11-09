import type { PhotoAnalysis } from '../types/types';

/**
 * Calculates a 64-bit difference hash (dHash) from image pixel data.
 * Scales image to 9x8 grayscale, and checks if left pixel > right pixel.
 */
function computeDHash(ctx: CanvasRenderingContext2D): string {
  const imgData = ctx.getImageData(0, 0, 9, 8);
  const data = imgData.data;
  let hashBits = '';

  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const leftIdx = (y * 9 + x) * 4;
      const rightIdx = (y * 9 + (x + 1)) * 4;

      const leftGray = data[leftIdx] * 0.299 + data[leftIdx + 1] * 0.587 + data[leftIdx + 2] * 0.114;
      const rightGray = data[rightIdx] * 0.299 + data[rightIdx + 1] * 0.587 + data[rightIdx + 2] * 0.114;

      hashBits += leftGray > rightGray ? '1' : '0';
    }
  }

  // Convert 64 bits to 16 hex characters
  let hex = '';
  for (let i = 0; i < 64; i += 4) {
    const nibble = hashBits.substring(i, i + 4);
    hex += parseInt(nibble, 2).toString(16);
  }
  return hex;
}

/**
 * Calculates the variance of the Laplacian of the image.
 * This is a standard computer vision technique for autofocus and blur detection.
 */
function computeLaplacianVariance(
  imageData: ImageData,
  width: number,
  height: number
): number {
  const data = imageData.data;
  const grayscale = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    grayscale[i] = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
  }

  // Apply discrete 3x3 Laplacian operator
  // [  0,  1,  0 ]
  // [  1, -4,  1 ]
  // [  0,  1,  0 ]
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const center = y * width + x;
      const top = (y - 1) * width + x;
      const bottom = (y + 1) * width + x;
      const left = y * width + (x - 1);
      const right = y * width + (x + 1);

      const lap =
        grayscale[top] +
        grayscale[bottom] +
        grayscale[left] +
        grayscale[right] -
        4 * grayscale[center];

      sum += lap;
      sumSq += lap * lap;
      count++;
    }
  }

  if (count === 0) return 0;
  const mean = sum / count;
  const variance = sumSq / count - mean * mean;
  return variance;
}

/**
 * Analyzes an image loaded into a canvas element:
 * - Blur detection via Laplacian variance
 * - Exposure analysis (overexposed / underexposed)
 * - Perceptual difference hash (dHash)
 */
export async function analyzeImageQuality(
  imageSource: HTMLImageElement | ImageBitmap | Blob
): Promise<PhotoAnalysis> {
  let img: HTMLImageElement | null = null;
  let objectUrl: string | null = null;

  try {
    if (imageSource instanceof Blob) {
      objectUrl = URL.createObjectURL(imageSource);
      img = new Image();
      await new Promise<void>((resolve, reject) => {
        if (!img) return reject();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image for quality analysis'));
        img.src = objectUrl!;
      });
    } else if (imageSource instanceof HTMLImageElement) {
      img = imageSource;
    }

    if (!img) {
      return {};
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return {};

    // 1. Perceptual Hash (dHash) on 9x8 canvas
    canvas.width = 9;
    canvas.height = 8;
    ctx.drawImage(img, 0, 0, 9, 8);
    const dHash = computeDHash(ctx);

    // 2. Laplacian Blur & Exposure analysis on scaled down representation (e.g. 200x200 for fast processing)
    const sampleWidth = 200;
    const sampleHeight = Math.max(1, Math.round((img.height / img.width) * sampleWidth)) || 200;
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    const data = imgData.data;

    let totalLuminance = 0;
    const totalPixels = sampleWidth * sampleHeight;

    for (let i = 0; i < data.length; i += 4) {
      const lum = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      totalLuminance += lum;
    }

    const meanLuminance = totalLuminance / totalPixels;
    const isUnderexposed = meanLuminance < 35;
    const isOverexposed = meanLuminance > 225;

    // Laplacian variance
    const variance = computeLaplacianVariance(imgData, sampleWidth, sampleHeight);
    // Typical threshold: variance < 100 on scaled image indicates noticeable blur
    const isBlurry = variance < 120;

    // Composite quality score (0 - 100)
    let score = 100;
    if (isBlurry) score -= 40;
    if (isUnderexposed || isOverexposed) score -= 30;
    if (variance < 50) score -= 20;

    return {
      qualityScore: Math.max(5, Math.min(100, Math.round(score))),
      laplacianVariance: Math.round(variance),
      isBlurry,
      meanLuminance: Math.round(meanLuminance),
      isUnderexposed,
      isOverexposed,
      dHash,
    };
  } finally {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
  }
}
