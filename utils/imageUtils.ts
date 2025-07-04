import type { Sticker } from '../types';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';

export const generateImageWithCanvas = (
  baseImageSrc: string,
  stickers: Sticker[],
  filterStyle: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = PHOTO_WIDTH;
    canvas.height = PHOTO_HEIGHT;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return reject(new Error('Failed to get canvas context'));
    }

    const baseImage = new Image();
    baseImage.crossOrigin = "anonymous"; // Handle potential CORS issues if images are from different origins
    baseImage.onload = () => {
      // Apply filter
      if (filterStyle) {
        ctx.filter = filterStyle;
      }
      
      // Draw base image
      ctx.drawImage(baseImage, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      
      // Reset filter for stickers (they should not inherit the base image filter directly)
      ctx.filter = 'none'; 

      // Draw stickers
      const stickerPromises = stickers.map(sticker => {
        return new Promise<void>((resolveSticker, rejectSticker) => {
          const stickerImg = new Image();
          stickerImg.crossOrigin = "anonymous";
          stickerImg.onload = () => {
            const x = sticker.x ?? 0;
            const y = sticker.y ?? 0;
            const scale = sticker.scale ?? 0.5;
            const width = sticker.width * scale;
            const height = sticker.height * scale;
            
            // TODO: Add rotation if sticker.rotation is available
            // ctx.save();
            // ctx.translate(x + width / 2, y + height / 2);
            // ctx.rotate((sticker.rotation ?? 0) * Math.PI / 180);
            // ctx.drawImage(stickerImg, -width / 2, -height / 2, width, height);
            // ctx.restore();
            ctx.drawImage(stickerImg, x, y, width, height);
            resolveSticker();
          };
          stickerImg.onerror = () => rejectSticker(new Error(`Failed to load sticker: ${sticker.alt}`));
          stickerImg.src = sticker.src;
        });
      });

      Promise.all(stickerPromises)
        .then(() => {
          resolve(canvas.toDataURL('image/jpeg', 0.8)); // Set JPEG quality to 0.8
        })
        .catch(reject);
    };
    baseImage.onerror = () => reject(new Error('Failed to load base image'));
    baseImage.src = baseImageSrc;
  });
};

export const generateQrFriendlyThumbnail = (
  baseImageSrc: string,
  targetWidth: number,
  targetHeight: number,
  quality: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return reject(new Error('Failed to get canvas context for thumbnail'));
    }

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      // Calculate aspect ratios
      const imageAspectRatio = image.width / image.height;
      const canvasAspectRatio = targetWidth / targetHeight;
      let drawWidth = targetWidth;
      let drawHeight = targetHeight;

      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas
        drawHeight = targetWidth / imageAspectRatio;
      } else {
        // Image is taller than or same aspect ratio as canvas
        drawWidth = targetHeight * imageAspectRatio;
      }

      const x = (targetWidth - drawWidth) / 2;
      const y = (targetHeight - drawHeight) / 2;
      
      ctx.drawImage(image, 0, 0, image.width, image.height, x, y, drawWidth, drawHeight);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    image.onerror = () => reject(new Error('Failed to load image for thumbnail generation'));
    image.src = baseImageSrc;
  });
};

/**
 * Extract frames from a video Blob at a given FPS.
 * Returns an array of data URLs (PNG) for each frame.
 */
export async function extractFramesFromVideoBlob(
  videoBlob: Blob,
  fps: number = 10,
  maxFrames: number = 60
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(videoBlob);
    video.src = url;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.onloadedmetadata = async () => {
      let retries = 10;
      while ((!isFinite(video.duration) || video.duration <= 0) && retries > 0) {
        await new Promise(res => setTimeout(res, 100)); // wait 100ms
        retries--;
      }
      if (!isFinite(video.duration) || video.duration <= 0) {
        reject(new Error('Failed to load video duration for frame extraction.'));
        return;
      }
      const duration = video.duration;
      const totalFrames = Math.min(Math.floor(duration * fps), maxFrames);
      const interval = duration / totalFrames;
      const canvas = document.createElement('canvas');
      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error('Failed to get canvas context for frame extraction'));
      }
      const frames: string[] = [];
      let currentTime = 0;
      let frameIdx = 0;
      function seekAndCapture() {
        video.currentTime = currentTime;
      }
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
        frames.push(canvas.toDataURL('image/png'));
        frameIdx++;
        if (frameIdx < totalFrames) {
          currentTime += interval;
          seekAndCapture();
        } else {
          URL.revokeObjectURL(url);
          resolve(frames);
        }
      };
      seekAndCapture();
    };
    video.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video for frame extraction'));
    };
  });
}
