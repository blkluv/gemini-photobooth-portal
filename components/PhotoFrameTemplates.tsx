import React from 'react';

export interface PhotoFrameTemplate {
  id: string;
  name: string;
  preview: React.ReactNode; // JSX preview
  overlay: React.CSSProperties; // CSS style for overlay
}

export const PHOTO_FRAME_TEMPLATES: PhotoFrameTemplate[] = [
  {
    id: 'classic',
    name: 'Classic',
    preview: (
      <div style={{ width: 48, height: 64, border: '6px solid #fff', borderRadius: 16, boxShadow: '0 0 0 4px #bfa76a' }} />
    ),
    overlay: {
      border: '16px solid #fff',
      borderRadius: '32px',
      boxShadow: '0 0 0 12px #bfa76a',
      pointerEvents: 'none',
    },
  },
  {
    id: 'modern',
    name: 'Modern',
    preview: (
      <div style={{ width: 48, height: 64, border: '6px solid #222', borderRadius: 8, boxShadow: '0 0 0 4px #7f5af0' }} />
    ),
    overlay: {
      border: '12px solid #222',
      borderRadius: '16px',
      boxShadow: '0 0 0 8px #7f5af0',
      pointerEvents: 'none',
    },
  },
  {
    id: 'fun',
    name: 'Fun',
    preview: (
      <div style={{ width: 48, height: 64, border: '6px dashed #ff69b4', borderRadius: 24, boxShadow: '0 0 0 4px #fff' }} />
    ),
    overlay: {
      border: '14px dashed #ff69b4',
      borderRadius: '28px',
      boxShadow: '0 0 0 10px #fff',
      pointerEvents: 'none',
    },
  },
];
