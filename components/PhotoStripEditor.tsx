import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { Button } from './Button';
import { SaveIcon, PrintIcon, ArrowLeftIcon, PaletteIcon } from './icons';
import { ColorPicker } from './ColorPicker';
import { PhotoStripTemplate } from './PhotoStripTemplateSelector';

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
  const [backgroundColor, setBackgroundColor] = useState('#FFFFFF');
  const [frameWidth, setFrameWidth] = useState(10);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
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

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const imgPromises = photos.map(
      (src) => new Promise<HTMLImageElement>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve(img);
        img.src = src;
      })
    );

    Promise.all(imgPromises).then((imgs) => {
      if (template.layout === 'vertical') {
        // Vertical layout
        const photoHeight = template.height / template.photoCount;
        imgs.forEach((img, i) => {
          const y = i * photoHeight;

          // Draw frame
          ctx.fillStyle = frameColor;
          ctx.fillRect(0, y, canvas.width, frameWidth); // Top frame
          ctx.fillRect(0, y + photoHeight - frameWidth, canvas.width, frameWidth); // Bottom frame
          ctx.fillRect(0, y, frameWidth, photoHeight); // Left frame
          ctx.fillRect(canvas.width - frameWidth, y, frameWidth, photoHeight); // Right frame

          // Draw photo with padding
          const padding = frameWidth + 5;
          ctx.drawImage(img, padding, y + padding, canvas.width - (padding * 2), photoHeight - (padding * 2));
        });
      } else {
        // Landscape layout
        const photoWidth = template.width / template.photoCount;
        imgs.forEach((img, i) => {
          const x = i * photoWidth;

          // Draw frame
          ctx.fillStyle = frameColor;
          ctx.fillRect(x, 0, frameWidth, canvas.height); // Left frame
          ctx.fillRect(x + photoWidth - frameWidth, 0, frameWidth, canvas.height); // Right frame
          ctx.fillRect(x, 0, photoWidth, frameWidth); // Top frame
          ctx.fillRect(x, canvas.height - frameWidth, photoWidth, frameWidth); // Bottom frame

          // Draw photo with padding
          const padding = frameWidth + 5;
          ctx.drawImage(img, x + padding, padding, photoWidth - (padding * 2), canvas.height - (padding * 2));
        });
      }

      setStripUrl(canvas.toDataURL('image/jpeg', 0.9));
    });
  }, [photos, template, frameColor, backgroundColor, frameWidth]);

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

  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-800 p-6">
      <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Customize {template.name}
        </h1>
        <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
        {/* Preview Section */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-4">Preview</h2>
          <div className="p-4 rounded-lg">
            {stripUrl ? (
              <img 
                src={stripUrl} 
                alt="Photo Strip Preview" 
                className={`object-contain rounded-lg shadow-lg ${
                  template.layout === 'vertical' 
                    ? 'max-w-80 max-h-[800px]' 
                    : 'max-w-96 max-h-64'
                }`}
                style={{
                  aspectRatio: `${template.width} / ${template.height}`
                }}
              />
            ) : (
              <div className={`bg-gray-200 flex items-center justify-center border-2 border-gray-300 rounded-lg ${
                template.layout === 'vertical' 
                  ? 'max-w-80 max-h-[800px]' 
                  : 'max-w-96 max-h-64'
              }`}
              style={{
                aspectRatio: `${template.width} / ${template.height}`
              }}>
                <p className="text-gray-500">Generating preview...</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
            <PaletteIcon className="w-6 h-6 mr-2" />
            Customize Colors
          </h2>

          {/* Color Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Color
              </label>
              <ColorPicker
                selectedColor={backgroundColor}
                onColorChange={setBackgroundColor}
                title="Background Color"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
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
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Thin</span>
                <span>Thick</span>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          <div className="bg-slate-700 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-3">Color Preview</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">Frame:</span>
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: frameColor }}
                />
                <span className="text-sm text-white">{frameColor}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-300">Background:</span>
                <div 
                  className="w-8 h-8 rounded border-2 border-gray-300"
                  style={{ backgroundColor: backgroundColor }}
                />
                <span className="text-sm text-white">{backgroundColor}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-3 pt-4">
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

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #8b5cf6;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
};

export default PhotoStripEditor; 