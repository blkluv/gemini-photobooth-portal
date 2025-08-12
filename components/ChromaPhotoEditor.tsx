import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Sticker, Filter } from '../types';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { Button } from './Button';
import { SaveIcon, PrintIcon, RetakeIcon, SparklesIcon, ArrowLeftIcon } from './icons';
import { geminiService } from '../services/geminiService';

interface ChromaPhotoEditorProps {
  baseImage: string;
  initialStickers: Sticker[];
  onStickersChange: (stickers: Sticker[]) => void;
  initialFilter: Filter;
  onFilterChange: (filter: Filter) => void;
  availableStickers: Sticker[];
  onAddUserSticker: (sticker: Sticker) => void;
  onRetake: () => void;
  onSave: () => void;
  onPrint: () => void;
  onBackToMenu: () => void;
}

export interface ChromaPhotoEditorRef {
  generateFinalImage: () => Promise<string | null>;
}

export const ChromaPhotoEditor = forwardRef<ChromaPhotoEditorRef, ChromaPhotoEditorProps>(({
  baseImage,
  initialStickers,
  onStickersChange,
  initialFilter,
  onFilterChange,
  availableStickers,
  onAddUserSticker,
  onRetake,
  onSave,
  onPrint,
  onBackToMenu,
}, ref) => {
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>(initialStickers);
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [error, setError] = useState<string | null>(null);
  const [backgroundPrompt, setBackgroundPrompt] = useState('');
  const [isGeneratingBackground, setIsGeneratingBackground] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<'color' | 'ai'>('color');
  const [backgroundColor, setBackgroundColor] = useState<string>('#111827');
  const [chromaSettings, setChromaSettings] = useState({
    hueCenter: 120,
    toleranceDeg: 30,
    saturationMin: 25,
    lightnessMin: 10,
    lightnessMax: 90,
    featherDeg: 10,
  });

  const photoAreaRef = useRef<HTMLDivElement>(null);
  const draggedStickerRef = useRef<{ stickerId: string; offsetX: number; offsetY: number; } | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const finalCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderTokenRef = useRef(0);

  useEffect(() => {
    setAppliedStickers(initialStickers);
  }, [initialStickers]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useImperativeHandle(ref, () => ({
    generateFinalImage: async () => {
      return generateCompositeFinalImage();
    }
  }), [baseImage, appliedStickers, activeFilter.style, backgroundImage]);

  // Default green-screen keying + live preview composite
  const renderPreviewComposite = useCallback(async () => {
    const token = ++renderTokenRef.current;
    if (!previewCanvasRef.current) return;
    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = PHOTO_WIDTH;
    canvas.height = PHOTO_HEIGHT;

    // Draw background
    if (backgroundMode === 'ai' && backgroundImage) {
      const bg = await loadImage(backgroundImage);
      if (token !== renderTokenRef.current) return;
      ctx.drawImage(bg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    }

    // Load and key the foreground
    const fg = await loadImage(baseImage);
    if (token !== renderTokenRef.current) return;
    // Draw foreground to temp canvas to access pixels
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = PHOTO_WIDTH;
    tempCanvas.height = PHOTO_HEIGHT;
    const tctx = tempCanvas.getContext('2d');
    if (!tctx) return;
    tctx.drawImage(fg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const imageData = tctx.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const alphaMul = chromaAlpha(h, s, l, chromaSettings);
      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    tctx.putImageData(imageData, 0, 0);
    if (token !== renderTokenRef.current) return;
    ctx.drawImage(tempCanvas, 0, 0);
  }, [baseImage, backgroundImage, chromaSettings, backgroundMode, backgroundColor]);

  useEffect(() => {
    renderPreviewComposite();
  }, [renderPreviewComposite]);

  const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return [h * 360, s * 100, l * 100];
  };

  const circularHueDiff = (h1: number, h2: number): number => {
    const d = Math.abs(h1 - h2) % 360;
    return d > 180 ? 360 - d : d;
  };

  // Returns alpha multiplier [0..1]; 0 = fully transparent (keyed out), 1 = opaque
  const chromaAlpha = (
    h: number,
    s: number,
    l: number,
    settings: typeof chromaSettings
  ): number => {
    if (s < settings.saturationMin || l < settings.lightnessMin || l > settings.lightnessMax) {
      return 1;
    }
    const delta = circularHueDiff(h, settings.hueCenter);
    if (delta <= settings.toleranceDeg) {
      return 0;
    }
    if (settings.featherDeg > 0 && delta <= settings.toleranceDeg + settings.featherDeg) {
      const t = (delta - settings.toleranceDeg) / settings.featherDeg; // 0..1
      return t; // soft edge
    }
    return 1;
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  // Compose final image (background + keyed foreground + stickers)
  const generateCompositeFinalImage = async (): Promise<string | null> => {
    if (!finalCanvasRef.current) return null;
    const canvas = finalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    canvas.width = PHOTO_WIDTH;
    canvas.height = PHOTO_HEIGHT;

    // Draw background (AI) or solid color
    if (backgroundMode === 'ai' && backgroundImage) {
      const bg = await loadImage(backgroundImage);
      ctx.drawImage(bg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    } else {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    }

    // Key foreground
    const fg = await loadImage(baseImage);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = PHOTO_WIDTH;
    tempCanvas.height = PHOTO_HEIGHT;
    const tctx = tempCanvas.getContext('2d');
    if (!tctx) return null;
    tctx.drawImage(fg, 0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const imageData = tctx.getImageData(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      const alphaMul = chromaAlpha(h, s, l, chromaSettings);
      data[i + 3] = Math.round(data[i + 3] * alphaMul);
    }
    tctx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0);

    // Draw stickers on top
    for (const sticker of appliedStickers) {
      const sImg = await loadImage(sticker.src);
      ctx.drawImage(
        sImg,
        (sticker.x ?? 0),
        (sticker.y ?? 0),
        sticker.width * (sticker.scale ?? 0.5),
        sticker.height * (sticker.scale ?? 0.5)
      );
    }

    return canvas.toDataURL('image/png');
  };

  const handleAddSticker = useCallback((stickerTemplate: Sticker) => {
    const newSticker: Sticker = {
      ...stickerTemplate,
      id: `applied-${stickerTemplate.id}-${Date.now()}`,
      x: (PHOTO_WIDTH / 2) - (stickerTemplate.width * 0.5 / 2), 
      y: (PHOTO_HEIGHT / 2) - (stickerTemplate.height * 0.5 / 2),
      zIndex: appliedStickers.length + 1,
      scale: 0.5, 
    };
    const updatedStickers = [...appliedStickers, newSticker];
    setAppliedStickers(updatedStickers);
    onStickersChange(updatedStickers); 
  }, [appliedStickers, onStickersChange]);
  
  const handleStickerDragStart = (e: React.DragEvent<HTMLImageElement>, sticker: Sticker) => {
    const target = e.target as HTMLImageElement;
    const rect = target.getBoundingClientRect();
    draggedStickerRef.current = { 
      stickerId: sticker.id, 
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top,
    };
    e.dataTransfer.effectAllowed = 'move';
    const emptyImage = new Image();
    emptyImage.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(emptyImage, 0, 0);
  };

  const handleStickerDrag = (e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault(); 
    if (!draggedStickerRef.current || !photoAreaRef.current) return;
    
    if (e.clientX === 0 && e.clientY === 0 && e.screenX === 0 && e.screenY === 0) { 
      return; // Ignore invalid drag events
    }
    
    const rect = photoAreaRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - draggedStickerRef.current.offsetX;
    const newY = e.clientY - rect.top - draggedStickerRef.current.offsetY;
    
    setAppliedStickers(prev => prev.map(sticker => 
      sticker.id === draggedStickerRef.current?.stickerId 
        ? { ...sticker, x: newX, y: newY }
        : sticker
    ));
  };

  const handleStickerDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
    if (!draggedStickerRef.current) return;
    
    const updatedStickers = appliedStickers.map(sticker => 
      sticker.id === draggedStickerRef.current?.stickerId 
        ? { ...sticker, x: sticker.x, y: sticker.y }
        : sticker
    );
    
    onStickersChange(updatedStickers);
    draggedStickerRef.current = null;
  };

  const handlePhotoAreaDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handlePhotoAreaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!draggedStickerRef.current || !photoAreaRef.current) return;
    
    const rect = photoAreaRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - draggedStickerRef.current.offsetX;
    const newY = e.clientY - rect.top - draggedStickerRef.current.offsetY;
    
    const updatedStickers = appliedStickers.map(sticker => 
      sticker.id === draggedStickerRef.current?.stickerId 
        ? { ...sticker, x: newX, y: newY }
        : sticker
    );
    
    setAppliedStickers(updatedStickers);
    onStickersChange(updatedStickers);
    draggedStickerRef.current = null;
  };

  // Removed AI sticker generation in chroma mode

  const removeSticker = (stickerId: string) => {
    const updatedStickers = appliedStickers.filter(sticker => sticker.id !== stickerId);
    setAppliedStickers(updatedStickers);
    onStickersChange(updatedStickers);
  };

  const handleFilterChange = (filter: Filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const handleGenerateBackground = async () => {
    if (!backgroundPrompt.trim()) return;
    setIsGeneratingBackground(true);
    setError(null);
    try {
      const result = await geminiService.generateBackground(backgroundPrompt);
      if (result) {
        setBackgroundImage(result);
        // re-render preview
        await renderPreviewComposite();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate background');
    } finally {
      setIsGeneratingBackground(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full max-w-7xl mx-auto p-4">
      {/* Left: Photo preview */}
      <div className="flex-1 flex flex-col items-center order-2 lg:order-1">
        <div className="w-full mb-4 lg:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Green Screen Preview</h2>
        </div>
        <div
          ref={photoAreaRef}
          className="relative bg-black rounded-md overflow-hidden shadow-lg select-none touch-none self-center"
          style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
          onDragOver={handlePhotoAreaDragOver}
          onDrop={handlePhotoAreaDrop}
        >
          <canvas
            ref={previewCanvasRef}
            className="absolute inset-0 w-full h-full"
            aria-label="Chroma composite preview"
          />
          {appliedStickers.map((sticker) => (
            <img
              key={sticker.id}
              src={sticker.src}
              alt={sticker.alt}
              draggable
              onDragStart={(e) => handleStickerDragStart(e, sticker)}
              onDrag={(e) => handleStickerDrag(e)}
              onDragEnd={handleStickerDragEnd}
              className="absolute cursor-grab active:cursor-grabbing"
              style={{
                left: `${sticker.x ?? 0}px`,
                top: `${sticker.y ?? 0}px`,
                width: `${sticker.width * (sticker.scale ?? 0.5)}px`,
                height: `${sticker.height * (sticker.scale ?? 0.5)}px`,
                zIndex: sticker.zIndex,
                touchAction: 'none',
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Remove this sticker?')) {
                  removeSticker(sticker.id);
                }
              }}
            />
          ))}
        </div>
        {/* Hidden canvas for final rendering */}
        <canvas ref={finalCanvasRef} className="hidden" />
      </div>

      {/* Right: Settings and actions */}
      <div className="w-full lg:w-96 flex flex-col gap-4 order-1 lg:order-2">
        <div className="flex items-center justify-between w-full">
          <Button onClick={onBackToMenu} variant="secondary" className="text-sm !py-1 !px-2">
            <ArrowLeftIcon className="w-4 h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Menu</span>
          </Button>
          <div style={{ minWidth: '76px' }} />
        </div>

        {/* Background Source */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold mb-3 text-purple-300">Background</h3>
          <div className="inline-flex rounded-lg overflow-hidden border border-slate-600 mb-4">
            <button
              className={`px-4 py-1 text-sm ${backgroundMode === 'color' ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-300'}`}
              onClick={() => { setBackgroundMode('color'); renderPreviewComposite(); }}
            >
              Solid Color
            </button>
            <button
              className={`px-4 py-1 text-sm border-l border-slate-600 ${backgroundMode === 'ai' ? 'bg-slate-600 text-white' : 'bg-slate-900 text-slate-300'}`}
              onClick={() => { setBackgroundMode('ai'); renderPreviewComposite(); }}
            >
              AI Image
            </button>
          </div>
          {backgroundMode === 'color' ? (
            <div className="flex items-center gap-3">
              <input type="color" value={backgroundColor} onChange={(e) => { setBackgroundColor(e.target.value); renderPreviewComposite(); }} className="h-10 w-16 rounded border border-slate-500" />
              <span className="text-sm text-slate-300">Pick a background color</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={backgroundPrompt}
                onChange={(e) => setBackgroundPrompt(e.target.value)}
                placeholder="e.g., 'a beach at sunset', 'neon city skyline', 'outer space'"
                className="w-full p-2 rounded bg-slate-600 text-white border border-slate-500 focus:ring-purple-500 focus:border-purple-500 text-sm"
                disabled={isGeneratingBackground}
              />
              <Button onClick={handleGenerateBackground} disabled={isGeneratingBackground || !backgroundPrompt.trim()} variant="special">
                {isGeneratingBackground ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                ) : (
                  <SparklesIcon className="w-5 h-5 mr-2" />
                )}
                {isGeneratingBackground ? 'Generating...' : 'Generate'}
              </Button>
              {backgroundImage && <p className="text-xs text-slate-400">Background ready</p>}
            </div>
          )}
        </div>

        {/* Chroma Key Settings */}
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
          <h3 className="text-lg font-semibold mb-4 text-purple-300">Chroma Settings</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Hue</label>
              <input type="range" min={0} max={360} value={chromaSettings.hueCenter} onChange={(e) => setChromaSettings(s => ({...s, hueCenter: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">{chromaSettings.hueCenter}°</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tolerance</label>
              <input type="range" min={0} max={60} value={chromaSettings.toleranceDeg} onChange={(e) => setChromaSettings(s => ({...s, toleranceDeg: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">±{chromaSettings.toleranceDeg}°</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Saturation Min</label>
              <input type="range" min={0} max={100} value={chromaSettings.saturationMin} onChange={(e) => setChromaSettings(s => ({...s, saturationMin: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">{chromaSettings.saturationMin}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Lightness Min</label>
              <input type="range" min={0} max={100} value={chromaSettings.lightnessMin} onChange={(e) => setChromaSettings(s => ({...s, lightnessMin: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">{chromaSettings.lightnessMin}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Lightness Max</label>
              <input type="range" min={0} max={100} value={chromaSettings.lightnessMax} onChange={(e) => setChromaSettings(s => ({...s, lightnessMax: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">{chromaSettings.lightnessMax}%</span>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Feather</label>
              <input type="range" min={0} max={60} value={chromaSettings.featherDeg} onChange={(e) => setChromaSettings(s => ({...s, featherDeg: parseInt(e.target.value)}))} className="w-full" />
              <span className="text-xs text-slate-400">{chromaSettings.featherDeg}°</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <Button onClick={onSave} variant="primary" className="text-sm sm:text-base">
            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Save
          </Button>
          <Button onClick={onPrint} variant="success" className="text-sm sm:text-base">
            <PrintIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Print
          </Button>
          <Button onClick={onRetake} variant="secondary" className="text-sm sm:text-base">
            <RetakeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Retake
          </Button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    </div>
  );
});
