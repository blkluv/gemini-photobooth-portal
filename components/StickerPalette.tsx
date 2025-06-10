
import React from 'react';
import type { Sticker } from '../types';

interface StickerPaletteProps {
  stickers: Sticker[];
  onSelectSticker: (sticker: Sticker) => void;
}

export const StickerPalette: React.FC<StickerPaletteProps> = ({ stickers, onSelectSticker }) => {
  
  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, sticker: Sticker) => {
    // This is for dragging from palette to photo. Let PhotoEditor handle drop.
    // We pass a simplified sticker object stringified.
    e.dataTransfer.setData('application/photobooth-sticker', JSON.stringify(sticker));
    e.dataTransfer.effectAllowed = 'copy';
  };


  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-purple-300">Stickers</h3>
      {stickers.length === 0 ? (
        <p className="text-sm text-slate-400">No stickers available. Try generating one with AI!</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto pr-2">
          {stickers.map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => onSelectSticker(sticker)}
              className="p-2 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors aspect-square flex items-center justify-center"
              title={`Add ${sticker.alt}`}
            >
              <img
                src={sticker.src}
                alt={sticker.alt}
                className="max-w-full max-h-full object-contain"
                style={{ width: '50px', height: '50px' }} // Consistent preview size
                draggable={false} // Prevent native drag, use button click
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
    