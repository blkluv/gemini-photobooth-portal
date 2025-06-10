// Boomerang to GIF utility using gif.js (global)
// Usage: await boomerangFramesToGif(frames, fps)
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function boomerangFramesToGif(frames: string[], fps = 15): Promise<Blob> {
  console.debug('[GIF] Starting GIF generation with', frames.length, 'frames');

  // Filter out invalid and very short frames
  const validFrames = frames.filter(f => {
    const isValid = typeof f === 'string' && f.startsWith('data:image/') && f.length > 1000;
    if (!isValid) {
      console.warn('[GIF] Dropping invalid frame:', {
        isString: typeof f === 'string',
        isDataUrl: typeof f === 'string' && f.startsWith('data:image/'),
        length: typeof f === 'string' ? f.length : 0
      });
    }
    return isValid;
  });

  if (validFrames.length === 0) {
    throw new Error('No valid image frames for GIF export.');
  }

  // Load all images
  const images = await Promise.all(validFrames.map(loadImage));
  
  // @ts-ignore
  const GIF = window.GIF;
  if (!GIF) throw new Error('GIF.js is not loaded.');

  // Create two canvases - one for initial draw, one for scaled output
  const sourceCanvas = document.createElement('canvas');
  sourceCanvas.width = PHOTO_WIDTH;
  sourceCanvas.height = PHOTO_HEIGHT;
  const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
  if (!sourceCtx) throw new Error('Could not get source canvas context');

  // Create a smaller canvas for the final GIF to reduce file size
  const scale = 0.5; // Reduce dimensions by half
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = Math.floor(PHOTO_WIDTH * scale);
  outputCanvas.height = Math.floor(PHOTO_HEIGHT * scale);
  const outputCtx = outputCanvas.getContext('2d', { willReadFrequently: true });
  if (!outputCtx) throw new Error('Could not get output canvas context');

  // Configure GIF encoder with reduced dimensions
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: outputCanvas.width,
      height: outputCanvas.height,
      workerScript: '/gif.worker.js',
      repeat: 0,
      dither: true,
      debug: true
    });

    console.debug('[GIF] Created encoder with dimensions:', {
      width: outputCanvas.width,
      height: outputCanvas.height,
      scale,
      quality: 10
    });

    // Add forward frames
    images.forEach((img, index) => {
      sourceCtx.clearRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      sourceCtx.drawImage(img, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      
      // Scale down to output canvas
      outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      outputCtx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
      
      gif.addFrame(outputCanvas, { delay: 1000 / fps, copy: true });
      console.debug(`[GIF] Added forward frame ${index + 1}/${images.length}`);
    });

    // Backward frames (skip last and first to avoid duplicates)
    for (let i = images.length - 2; i > 0; i--) {
      sourceCtx.clearRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      sourceCtx.drawImage(images[i], 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      
      // Scale down to output canvas
      outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      outputCtx.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
      
      gif.addFrame(outputCanvas, { delay: 1000 / fps, copy: true });
      console.debug(`[GIF] Added reverse frame ${images.length - i}/${images.length - 2}`);
    }

    gif.on('progress', (p: number) => {
      console.debug(`[GIF] Encoding progress: ${Math.round(p * 100)}%`);
    });

    gif.on('finished', (blob: Blob) => {
      console.debug('[GIF] Encoding complete:', {
        size: Math.round(blob.size / 1024) + 'KB',
        frames: images.length * 2 - 2
      });
      resolve(blob);
    });

    gif.on('error', (err: any) => {
      console.error('[GIF] Encoding error:', err);
      reject(err);
    });

    console.debug('[GIF] Starting render...');
    gif.render();
  });
}
