import React from 'react';

export interface PhotoFrameTemplate {
  id: string;
  name: string;
  preview: React.ReactNode; // JSX preview
  overlay: React.CSSProperties; // CSS style for overlay
  type?: 'classic' | 'polaroid';
  caption?: string;
  swatches?: string[];
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
  // Polaroid style frame
  {
    id: 'polaroid',
    name: 'Polaroid',
    preview: (
      <div style={{
        width: 48,
        height: 64,
        background: '#fff',
        border: '2px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        position: 'relative',
        paddingBottom: 8,
      }}>
        <div style={{ width: 36, height: 36, background: '#eee', marginTop: 4, borderRadius: 4 }} />
        <div style={{ width: 32, height: 6, background: '#d1d5db', borderRadius: 2, marginTop: 4 }} />
      </div>
    ),
    overlay: {}, // Not used for polaroid
    type: 'polaroid',
    caption: 'Fleeting moments, eternal memories',
    swatches: ['#bfa76a', '#c7c2b0', '#a6b1a0', '#7d8c8c'],
  },
];
