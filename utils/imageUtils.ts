import type { Sticker } from '../types';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';

export const generateImageWithCanvas = (
  baseImageSrc: string,
  stickers: Sticker[],
  filterStyle: string,
  frameImageSrc?: string | null,
  drawingOverlaySrc?: string | null,
  frameOverlayStyle?: React.CSSProperties | null
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
      
      // Draw frame overlay if present (bottom layer)
      const drawFrame = () => {
        return new Promise<void>((resolveFrame, rejectFrame) => {
          // Draw image-based frame if provided
          if (frameImageSrc) {
            const frameImg = new Image();
            frameImg.crossOrigin = "anonymous";
            frameImg.onload = () => {
              ctx.drawImage(frameImg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
              // After drawing image, also draw CSS-style overlay if present
              if (frameOverlayStyle) drawCssFrame(ctx, frameOverlayStyle);
              resolveFrame();
            };
            frameImg.onerror = () => rejectFrame(new Error('Failed to load frame image'));
            frameImg.src = frameImageSrc;
            return;
          }
          // Draw CSS-style frame if provided
          if (frameOverlayStyle) {
            drawCssFrame(ctx, frameOverlayStyle);
          }
          resolveFrame();
        });
      };

      // Helper to draw CSS-style frame overlays
      function drawCssFrame(ctx: CanvasRenderingContext2D, style: React.CSSProperties) {
        console.log('[drawCssFrame] Drawing CSS frame with style:', style);
        // Enhanced: Support border, borderRadius, boxShadow, and fallback for visibility
        // 1. Box shadow (draw as outer glow first, so border is on top)
        if (style.boxShadow) {
          // Support multiple box shadows, use the first
          const boxShadowStr = String(style.boxShadow).split(',')[0].trim();
          // Parse boxShadow: e.g. '0 0 0 12px #bfa76a' or '0 0 0 12px rgba(191,167,106,1)'
          const shadowMatch = boxShadowStr.match(/0 0 0 (\d+)px (#[0-9a-fA-F]{3,8}|rgba?\([^\)]+\)|[a-zA-Z]+)/i);
          if (shadowMatch) {
            const shadowWidth = parseInt(shadowMatch[1], 10);
            const shadowColor = shadowMatch[2];
            ctx.save();
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowWidth;
            ctx.lineWidth = shadowWidth;
            ctx.strokeStyle = shadowColor;
            // Draw shadow as a rounded rect outside border
            let radius = 0;
            if (style.borderRadius) {
              // Support multiple values, use the first
              const rMatch = String(style.borderRadius).split(' ')[0].match(/(\d+)px/);
              if (rMatch) radius = parseInt(rMatch[1], 10);
            }
            drawRoundedRect(ctx, shadowWidth/2, shadowWidth/2, PHOTO_WIDTH-shadowWidth, PHOTO_HEIGHT-shadowWidth, radius);
            ctx.stroke();
            ctx.restore();
          }
        }
        // 2. Border (draw on top of shadow)
        if (style.border) {
          // Parse border: e.g. '16px solid #fff', '14px dashed #ff69b4', '12px double #222', '10px groove #bfa76a', '8px solid rgba(255,0,0,0.5)'
          // Allow extra spaces, case-insensitive, and rgb(a)
          const borderMatch = String(style.border).trim().match(/(\d+)px\s+(solid|dashed|double|groove)\s+(#[0-9a-fA-F]{3,8}|rgba?\([^\)]+\)|[a-zA-Z]+)/i);
          if (borderMatch) {
            const borderWidth = parseInt(borderMatch[1], 10);
            let borderStyle = borderMatch[2].toLowerCase();
            const borderColor = borderMatch[3];
            // Treat double/groove as solid for canvas
            if (borderStyle === 'double' || borderStyle === 'groove') borderStyle = 'solid';
            ctx.save();
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = borderWidth;
            if (borderStyle === 'dashed') {
              ctx.setLineDash([borderWidth * 2, borderWidth]);
            } else {
              ctx.setLineDash([]);
            }
            // Border radius
            let radius = 0;
            if (style.borderRadius) {
              // Support multiple values, use the first
              const rMatch = String(style.borderRadius).split(' ')[0].match(/(\d+)px/);
              if (rMatch) radius = parseInt(rMatch[1], 10);
            }
            // Draw rounded rectangle border
            drawRoundedRect(ctx, borderWidth/2, borderWidth/2, PHOTO_WIDTH-borderWidth, PHOTO_HEIGHT-borderWidth, radius);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();
          } else {
            // Fallback: draw a thick red border for debug
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 12;
            drawRoundedRect(ctx, 6, 6, PHOTO_WIDTH-12, PHOTO_HEIGHT-12, 32);
            ctx.stroke();
            ctx.restore();
          }
        } else {
          // Fallback: draw a visible border if no border style is set
          ctx.save();
          ctx.strokeStyle = 'magenta';
          ctx.lineWidth = 8;
          drawRoundedRect(ctx, 4, 4, PHOTO_WIDTH-8, PHOTO_HEIGHT-8, 32);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Helper to draw rounded rectangles
      function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }


      // Draw everything in order: base photo -> drawing -> stickers -> frame (CSS/image)
      // 1. Draw base image (photo)
      ctx.filter = filterStyle || 'none';
      ctx.drawImage(baseImage, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
      ctx.filter = 'none';


      // 2. Draw drawing overlay (if any)
      function drawOverlay() {
        return new Promise<void>((resolveOverlay) => {
          if (!drawingOverlaySrc) return resolveOverlay();
          const overlayImg = new Image();
          overlayImg.onload = () => {
            ctx.drawImage(overlayImg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
            resolveOverlay();
          };
          overlayImg.onerror = () => resolveOverlay();
          overlayImg.src = drawingOverlaySrc;
        });
      }

      // 3. Draw stickers
      const drawStickers = () => {
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
              ctx.drawImage(stickerImg, x, y, width, height);
              resolveSticker();
            };
            stickerImg.onerror = () => rejectSticker(new Error(`Failed to load sticker: ${sticker.alt}`));
            stickerImg.src = sticker.src;
          });
        });
        return Promise.all(stickerPromises);
      };

      // 4. Draw frame overlay (CSS/image) on top
      drawOverlay()
        .then(() => drawStickers())
        .then(() => drawFrame())
        .then(() => {
          resolve(canvas.toDataURL('image/jpeg', 0.8));
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
