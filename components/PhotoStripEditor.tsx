import React, { useState, useRef, useEffect, useCallback, ReactElement, ComponentType } from 'react';
import { Button } from './Button';
import { SaveIcon, PrintIcon, ArrowLeftIcon, PaletteIcon, StarSticker, HeartSticker, SmileSticker, SparkleSticker } from './icons';
import { ColorPicker } from './ColorPicker';
import { PhotoStripTemplate } from './PhotoStripTemplateSelector';

const STICKERS: { name: string; value: string | null; icon?: ComponentType<React.SVGProps<SVGSVGElement>> }[] = [
  { name: 'None', value: null },
  { name: 'Star', value: 'star', icon: StarSticker },
  { name: 'Heart', value: 'heart', icon: HeartSticker },
  { name: 'Smile', value: 'smile', icon: SmileSticker },
  { name: 'Sparkle', value: 'sparkle', icon: SparkleSticker },
];

function getStickerComponent(sticker: string | null): ComponentType<React.SVGProps<SVGSVGElement>> | null {
  switch (sticker) {
    case 'star': return StarSticker;
    case 'heart': return HeartSticker;
    case 'smile': return SmileSticker;
    case 'sparkle': return SparkleSticker;
    default: return null;
  }
}

interface PhotoStripEditorProps {
  photos: string[];
  template: PhotoStripTemplate;
  onBackToMenu: () => void;
  onSave: (stripUrl: string) => void;
  onPrint: (stripUrl: string) => void;
}

const PhotoStripEditor: React.FC<PhotoStripEditorProps> = ({ 
  photos, 
  template,
  onBackToMenu, 
  onSave, 
  onPrint 
}) => {
  const [frameColor, setFrameColor] = useState('#000000');
  const [frameWidth, setFrameWidth] = useState(10);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [eventTitle, setEventTitle] = useState('Event Title');
  const [eventDate, setEventDate] = useState('Jan 1, 2025');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate photo strip with current settings
  const generatePhotoStrip = useCallback(() => {
    if (photos.length !== template.photoCount) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill background (always white for now)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const footerSize = template.footerHeight || 0;

    const imgPromises = photos.map(
      (src) => new Promise<HTMLImageElement>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.src = src;
      })
    );

    Promise.all(imgPromises).then((imgs) => {
      if (template.layout === 'vertical') {
        // Vertical layout: footer band at bottom
        const availableHeight = template.height - footerSize;
        const photoHeight = availableHeight / template.photoCount;
        imgs.forEach((img, i) => {
          const y = i * photoHeight;

          // Draw frame
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, y, canvas.width, frameWidth); // Top frame
          ctx.fillRect(0, y + photoHeight - frameWidth, canvas.width, frameWidth); // Bottom frame
          ctx.fillRect(0, y, frameWidth, photoHeight); // Left frame
          ctx.fillRect(canvas.width - frameWidth, y, frameWidth, photoHeight); // Right frame

          // Draw photo with padding, maintaining aspect ratio
          const padding = frameWidth + 5;
          const slotW = canvas.width - (padding * 2);
          const slotH = photoHeight - (padding * 2);
          const imgRatio = img.width / img.height;
          const slotRatio = slotW / slotH;
          let drawW: number, drawH: number, offsetX: number, offsetY: number;
          if (imgRatio > slotRatio) {
            drawW = slotW;
            drawH = slotW / imgRatio;
            offsetX = padding;
            offsetY = y + padding + (slotH - drawH) / 2;
          } else {
            drawH = slotH;
            drawW = slotH * imgRatio;
            offsetX = padding + (slotW - drawW) / 2;
            offsetY = y + padding;
          }
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        });

        // Footer band
        if (footerSize > 0) {
          const footerY = template.height - footerSize;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, footerY, template.width, footerSize);
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, footerY, template.width, footerSize);

          // Render event title and date centered
          ctx.fillStyle = '#111111';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.max(14, Math.floor(footerSize * 0.28))}px sans-serif`;
          ctx.fillText(eventTitle, template.width / 2, footerY + footerSize * 0.42);
          ctx.font = `${Math.max(12, Math.floor(footerSize * 0.22))}px sans-serif`;
          ctx.fillText(eventDate, template.width / 2, footerY + footerSize * 0.75);
        }
      } else {
        // Landscape layout: footer band at right side
        const availableWidth = template.width - footerSize;
        const photoWidth = availableWidth / template.photoCount;
        imgs.forEach((img, i) => {
          const x = i * photoWidth;

          // Draw frame
          ctx.fillStyle = frameColor;
          ctx.fillRect(x, 0, frameWidth, canvas.height); // Left frame
          ctx.fillRect(x + photoWidth - frameWidth, 0, frameWidth, canvas.height); // Right frame
          ctx.fillRect(x, 0, photoWidth, frameWidth); // Top frame
          ctx.fillRect(x, canvas.height - frameWidth, photoWidth, frameWidth); // Bottom frame

          // Draw photo with padding, maintaining aspect ratio
          const padding = frameWidth + 5;
          const slotW = photoWidth - (padding * 2);
          const slotH = canvas.height - (padding * 2);
          const imgRatio = img.width / img.height;
          const slotRatio = slotW / slotH;
          let drawW: number, drawH: number, offsetX: number, offsetY: number;
          if (imgRatio > slotRatio) {
            drawW = slotW;
            drawH = slotW / imgRatio;
            offsetX = x + padding;
            offsetY = padding + (slotH - drawH) / 2;
          } else {
            drawH = slotH;
            drawW = slotH * imgRatio;
            offsetX = x + padding + (slotW - drawW) / 2;
            offsetY = padding;
          }
          ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
        });

        // Footer band (right side)
        if (footerSize > 0) {
          const footerX = template.width - footerSize;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(footerX, 0, footerSize, template.height);
          ctx.strokeStyle = '#CCCCCC';
          ctx.lineWidth = 1;
          ctx.strokeRect(footerX, 0, footerSize, template.height);

          // Render event title and date centered vertically
          ctx.save();
          ctx.translate(footerX + footerSize / 2, template.height / 2);
          ctx.rotate(-Math.PI / 2);
          ctx.fillStyle = '#111111';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.max(14, Math.floor(footerSize * 0.28))}px sans-serif`;
          ctx.fillText(eventTitle, 0, -footerSize * 0.06);
          ctx.font = `${Math.max(12, Math.floor(footerSize * 0.22))}px sans-serif`;
          ctx.fillText(eventDate, 0, footerSize * 0.22);
          ctx.restore();
        }
      }

      // Stickers at corners (same as before)
      if (selectedSticker) {
        const stickerSize = Math.max(32, Math.min(canvas.width, canvas.height) * 0.12);
        const stickerComp = getStickerComponent(selectedSticker);
        if (stickerComp) {
          // Draw via offscreen SVG rendering
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
          svg.setAttribute('width', String(stickerSize));
          svg.setAttribute('height', String(stickerSize));
          svg.setAttribute('viewBox', '0 0 32 32');
          // Create a wrapper div to render React component to string if needed
          // Simple approach: fallback to drawing a filled square if SVG string is non-trivial to obtain
          // For now, skip dynamic render and use simple marker
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(0, 0, stickerSize, stickerSize);
          ctx.fillRect(canvas.width - stickerSize, 0, stickerSize, stickerSize);
          ctx.fillRect(0, canvas.height - stickerSize, stickerSize, stickerSize);
          ctx.fillRect(canvas.width - stickerSize, canvas.height - stickerSize, stickerSize, stickerSize);
          setStripUrl(canvas.toDataURL('image/jpeg', 0.9));
        } else {
          setStripUrl(canvas.toDataURL('image/jpeg', 0.9));
        }
      } else {
        setStripUrl(canvas.toDataURL('image/jpeg', 0.9));
      }
    });
  }, [photos, template, frameColor, frameWidth, selectedSticker, eventTitle, eventDate]);

  // Regenerate strip when settings change
  useEffect(() => {
    generatePhotoStrip();
  }, [generatePhotoStrip]);

  const handleSave = () => {
    if (stripUrl) {
      onSave(stripUrl);
    }
  };

  const handlePrint = () => {
    if (stripUrl) {
      onPrint(stripUrl);
    }
  };

  // Overlay sticker preview (unchanged minimal)
  const StickerOverlay = () => null;

  return (
    <div className="w-screen h-screen bg-slate-800">
      <div className="w-full flex justify-between items-center mb-2 p-6">
        <Button onClick={onBackToMenu} variant="secondary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Customize {template.name}
        </h1>
        <div style={{ width: '120px' }}></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full h-[calc(100vh-5rem)] px-6 pb-6">
        {/* Preview Section */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center h-full">
          <h2 className="text-xl font-semibold text-white mb-2">Preview</h2>
          <div className="p-2 rounded-lg relative flex items-center justify-center w-full">
            {stripUrl ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img 
                  src={stripUrl} 
                  alt="Photo Strip Preview" 
                  className="object-contain rounded-lg shadow-lg"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    height: 'auto',
                    width: 'auto'
                  }}
                />
                <StickerOverlay />
              </div>
            ) : (
              <div className="bg-gray-200 flex items-center justify-center border-2 border-gray-300 rounded-lg"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                height: 'auto',
                width: 'auto'
              }}>
                <p className="text-gray-500">Generating preview...</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="lg:col-span-1 flex flex-col space-y-4 h-full justify-start">
          <h2 className="text-xl font-semibold text-white mb-2 flex items-center">
            <PaletteIcon className="w-6 h-6 mr-2" />
            Customize Frame
          </h2>

          {/* Color Controls */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frame Color
              </label>
              <ColorPicker
                selectedColor={frameColor}
                onColorChange={setFrameColor}
                title="Frame Color"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Frame Width: {frameWidth}px
              </label>
              <input
                type="range"
                min="5"
                max="30"
                value={frameWidth}
                onChange={(e) => setFrameWidth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Sticker Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Add Sticker (optional)
            </label>
            <div className="flex flex-wrap gap-3">
              {STICKERS.map((sticker) => {
                const Icon = sticker.icon;
                return (
                  <button
                    key={sticker.name}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-150 ${selectedSticker === sticker.value ? 'border-pink-500 bg-pink-100' : 'border-gray-300 bg-slate-700 hover:border-pink-400'}`}
                    onClick={() => setSelectedSticker(sticker.value)}
                    type="button"
                  >
                    {Icon ? <Icon width={32} height={32} /> : <span className="text-xs text-gray-400">None</span>}
                    <span className="text-xs mt-1 text-gray-700 dark:text-gray-200">{sticker.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Text Controls */}
          <div className="bg-slate-700 p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-semibold text-white">Footer / Signature</h3>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Event Title</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-600 p-2 text-white"
                placeholder="e.g., Sarah & John's Wedding"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Event Date</label>
              <input
                type="text"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded bg-slate-800 border border-slate-600 p-2 text-white"
                placeholder="e.g., Jan 1, 2025"
              />
            </div>
            <p className="text-xs text-gray-300">Footer appears {template.layout === 'vertical' ? 'at the bottom' : 'on the right'} of the strip.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-2">
            <Button 
              onClick={handleSave} 
              variant="success"
              className="w-full"
            >
              <SaveIcon className="w-5 h-5 mr-2" />
              Save Photo Strip
            </Button>
            <Button 
              onClick={handlePrint} 
              variant="special"
              className="w-full"
            >
              <PrintIcon className="w-5 h-5 mr-2" />
              Print Photo Strip
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden canvas for generating the strip */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <style>{`
        .slider::-webkit-slider-thumb { appearance: none; height: 20px; width: 20px; border-radius: 50%; background: #8b5cf6; cursor: pointer; }
        .slider::-moz-range-thumb { height: 20px; width: 20px; border-radius: 50%; background: #8b5cf6; cursor: pointer; border: none; }
      `}</style>
    </div>
  );
};

export default PhotoStripEditor; 