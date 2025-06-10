
import type { Sticker, Filter } from './types';

export const INITIAL_STICKERS: Sticker[] = [
  // Sample stickers removed to focus on AI generation
];

export const FILTERS: Filter[] = [
  { id: 'filter-none', name: 'None', style: '' },
  { id: 'filter-grayscale', name: 'Grayscale', style: 'grayscale(100%)' },
  { id: 'filter-sepia', name: 'Sepia', style: 'sepia(100%)' },
  { id: 'filter-invert', name: 'Invert', style: 'invert(100%)' },
  { id: 'filter-hue-rotate', name: 'Hue Rotate', style: 'hue-rotate(90deg)' },
  { id: 'filter-contrast', name: 'Contrast', style: 'contrast(200%)' },
  { id: 'filter-brightness', name: 'Brighten', style: 'brightness(150%)' },
  { id: 'filter-blur', name: 'Blur', style: 'blur(3px)' },
];

export const PHOTO_WIDTH = 640;
export const PHOTO_HEIGHT = 480;

export const GEMINI_API_KEY = process.env.API_KEY || ""; // Ensure this is handled gracefully if not set
export const GEMINI_IMAGE_MODEL = 'imagen-3.0-generate-002';
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';

export const MAX_QR_DATA_LENGTH = 2000; // Stricter limit for QR data
export const QR_THUMBNAIL_WIDTH = 128;
export const QR_THUMBNAIL_HEIGHT = 96; // Maintain 4:3 aspect ratio
export const QR_THUMBNAIL_QUALITY = 0.5; // Lower quality for smaller QR data
