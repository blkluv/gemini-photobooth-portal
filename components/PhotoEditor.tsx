import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FrameSelector } from './FrameSelector';
import { PHOTO_FRAME_TEMPLATES, PhotoFrameTemplate } from './PhotoFrameTemplates';
import { DRAW_COLORS } from './DrawColors';
import type { Sticker, Filter, Point } from '../types';
import { FILTERS, PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { StickerPalette } from './StickerPalette';
import { FilterPalette } from './FilterPalette';
import { Button } from './Button';
import { SaveIcon, PrintIcon, RetakeIcon, SparklesIcon, ArrowLeftIcon, PaletteIcon, StarIcon } from './icons';
import { geminiService } from '../services/geminiService';
import { generateImageWithCanvas } from '../utils/imageUtils';

interface PhotoEditorProps {
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
  selectedFrameTemplate?: PhotoFrameTemplate | null;
}

export interface PhotoEditorRef {
  generateFinalImage: () => Promise<string | null>;
}

export const PhotoEditor = forwardRef<PhotoEditorRef, PhotoEditorProps>(({
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
  selectedFrameTemplate,
}, ref) => {
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>(initialStickers);
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [stickerGenPrompt, setStickerGenPrompt] = useState('');
  const [isGeneratingSticker, setIsGeneratingSticker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [activeMenu, setActiveMenu] = useState<'filters' | 'stickers' | 'ai' | 'caption' | null>(null);
  const selectedFrame = selectedFrameTemplate || PHOTO_FRAME_TEMPLATES[0];
  // Editable caption state for polaroid
  const [editableCaption, setEditableCaption] = useState(selectedFrame?.caption || '');
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  // Frame overlay state
  const [frameImage, setFrameImage] = useState<string | null>(null); // for upload (deprecated by template)
  // Keep editableCaption in sync with selectedFrame
  useEffect(() => {
    if (selectedFrame?.type === 'polaroid') {
      setEditableCaption(selectedFrame.caption || '');
    }
  }, [selectedFrame]);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawColor, setDrawColor] = useState(DRAW_COLORS[0]);
  const [drawPaths, setDrawPaths] = useState<{ color: string; points: { x: number; y: number }[] }[]>([]);
  const [currentPath, setCurrentPath] = useState<{ color: string; points: { x: number; y: number }[] } | null>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);

  const photoAreaRef = useRef<HTMLDivElement>(null);
  const draggedStickerRef = useRef<{ stickerId: string; offsetX: number; offsetY: number; } | null>(null);

  // Calculate full-screen photo dimensions while maintaining aspect ratio
  const calculatePhotoSize = () => {
    const aspectRatio = PHOTO_WIDTH / PHOTO_HEIGHT;
    const maxWidth = screenSize.width * 0.95; // 95% of screen width
    const maxHeight = screenSize.height * 0.95; // 95% of screen height
    
    let displayWidth = maxWidth;
    let displayHeight = maxWidth / aspectRatio;
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight;
      displayWidth = maxHeight * aspectRatio;
    }
    
    return { width: displayWidth, height: displayHeight };
  };

  const photoSize = calculatePhotoSize();

  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setAppliedStickers(initialStickers);
  }, [initialStickers]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useImperativeHandle(ref, () => ({
    generateFinalImage: async () => {
      // Compose the final image with selected frame and drawing overlay
      // 1. Render drawing to a dataURL
      let drawingDataUrl: string | undefined = undefined;
      if (drawPaths.length > 0 && drawCanvasRef.current) {
        drawingDataUrl = drawCanvasRef.current.toDataURL('image/png');
      }
      // 2. Use selectedFrame.frameSrc as the frame overlay
      // Log the frame overlay style to confirm it's passed
      console.log('[PhotoEditor] generateFinalImage selectedFrame.overlay:', selectedFrame?.overlay);
      return generateImageWithCanvas(
        baseImage,
        appliedStickers,
        activeFilter.style,
        selectedFrame?.frameSrc,
        drawingDataUrl,
        selectedFrame?.overlay || null,
        selectedFrame?.type,
        selectedFrame?.caption,
        selectedFrame?.swatches
      );
    }
  }), [baseImage, appliedStickers, activeFilter.style, selectedFrame, drawPaths]);
  // Frame template selection removed; frame is now chosen beforehand

  // Drawing handlers
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = drawCanvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: ((e.clientX - rect.left) * PHOTO_WIDTH) / rect.width,
      y: ((e.clientY - rect.top) * PHOTO_HEIGHT) / rect.height,
    };
  };

  const handleDrawStart = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const pos = getPointerPos(e);
    setCurrentPath({ color: drawColor, points: [pos] });
  };
  const handleDrawMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath) return;
    const pos = getPointerPos(e);
    setCurrentPath({
      ...currentPath,
      points: [...currentPath.points, pos],
    });
  };
  const handleDrawEnd = () => {
    setIsDrawing(false);
    if (currentPath) {
      setDrawPaths((prev) => [...prev, currentPath]);
      setCurrentPath(null);
    }
  };

  // Redraw canvas when paths or color change
  useEffect(() => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, PHOTO_WIDTH, PHOTO_HEIGHT);
    const drawStroke = (path: { color: string; points: { x: number; y: number }[] }) => {
      if (path.points.length < 2) return;
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      // Draw bold black outline
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      // Draw color stroke
      ctx.strokeStyle = path.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
      ctx.restore();
    };
    drawPaths.forEach(drawStroke);
    if (currentPath) drawStroke(currentPath);
  }, [drawPaths, currentPath]);

  const handleAddSticker = useCallback((stickerTemplate: Sticker) => {
    const newSticker: Sticker = {
      ...stickerTemplate,
      id: `applied-${stickerTemplate.id}-${Date.now()}`,
      x: (photoSize.width / 2) - (stickerTemplate.width * 0.5 / 2), 
      y: (photoSize.height / 2) - (stickerTemplate.height * 0.5 / 2),
      zIndex: appliedStickers.length + 1,
      scale: 0.5, 
    };
    const updatedStickers = [...appliedStickers, newSticker];
    setAppliedStickers(updatedStickers);
    onStickersChange(updatedStickers); 
  }, [appliedStickers, onStickersChange, photoSize]);
  
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
        return;
    }

    const { stickerId, offsetX, offsetY } = draggedStickerRef.current;
    const photoAreaRect = photoAreaRef.current.getBoundingClientRect();
    
    let newX = e.clientX - photoAreaRect.left - offsetX;
    let newY = e.clientY - photoAreaRect.top - offsetY;
    
    const stickerToUpdate = appliedStickers.find(s => s.id === stickerId);
    if(!stickerToUpdate) return;

    const stickerWidth = stickerToUpdate.width * (stickerToUpdate.scale ?? 0.5);
    const stickerHeight = stickerToUpdate.height * (stickerToUpdate.scale ?? 0.5);

    newX = Math.max(0, Math.min(newX, photoAreaRect.width - stickerWidth));
    newY = Math.max(0, Math.min(newY, photoAreaRect.height - stickerHeight));

    setAppliedStickers(prevStickers =>
      prevStickers.map(s =>
        s.id === stickerId ? { ...s, x: newX, y: newY } : s
      )
    );
  };
  
  const handleStickerDragEnd = (e: React.DragEvent<HTMLImageElement>) => {
    if (draggedStickerRef.current) {
      onStickersChange([...appliedStickers]); 
      draggedStickerRef.current = null;
    }
  };

  const handlePhotoAreaDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); 
    if (draggedStickerRef.current) { 
        e.dataTransfer.dropEffect = 'move';
    } else {
        e.dataTransfer.dropEffect = 'none';
    }
  };

  const handlePhotoAreaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFilterChange = useCallback((filter: Filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  }, [onFilterChange]);

  const handleGenerateSticker = async () => {
    if (!stickerGenPrompt.trim()) {
      setError("Please enter a prompt for sticker generation.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setIsGeneratingSticker(true);
    setError(null);
    try {
      const base64Image = await geminiService.generateImage(stickerGenPrompt);
      if (base64Image) {
        const newSticker: Sticker = {
          id: `gemini-sticker-${Date.now()}`,
          src: `data:image/png;base64,${base64Image}`,
          alt: stickerGenPrompt,
          width: 100, 
          height: 100,
        };
        onAddUserSticker(newSticker); 
        setStickerGenPrompt('');
        setActiveMenu(null);
      } else {
        throw new Error("Gemini API did not return an image.");
      }
    } catch (err) {
      console.error("Error generating sticker:", err);
      setError(`Failed to generate sticker: ${(err as Error).message}`);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGeneratingSticker(false);
    }
  };

  const removeSticker = (stickerId: string) => {
    const updatedStickers = appliedStickers.filter(s => s.id !== stickerId);
    setAppliedStickers(updatedStickers);
    onStickersChange(updatedStickers); 
  };

  const toggleFloatingMenu = () => {
    setShowFloatingMenu(!showFloatingMenu);
    if (showFloatingMenu) {
      setActiveMenu(null);
    }
  };

  const openMenu = (menu: 'filters' | 'stickers' | 'ai' | 'caption') => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <div className="w-full h-full flex flex-col bg-black relative">
      {/* Header */}
      <div className="absolute top-4 left-4 z-20">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm bg-black bg-opacity-50 backdrop-blur-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
      </div>

      {/* Full Screen Photo Preview */}
      <div className="w-full h-full flex items-center justify-center">
        {selectedFrame?.type === 'polaroid' ? (
          <div
            className="relative flex flex-col items-center justify-center bg-transparent"
            style={{
              width: photoSize.width,
              height: photoSize.height + photoSize.height * 0.18,
              maxWidth: '95vw',
              maxHeight: '95vh',
            }}
          >
            {/* Polaroid frame */}
            <div
              className="absolute left-0 top-0 w-full"
              style={{
                height: photoSize.height + photoSize.height * 0.18,
                background: '#fff',
                border: '2px solid #ddd',
                borderRadius: 16,
                boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
                zIndex: 1,
              }}
            />
            {/* Photo area */}
            <div
              className="absolute left-1/2 top-8 transform -translate-x-1/2"
              style={{
                width: photoSize.width * 0.82,
                height: photoSize.height * 0.75,
                background: '#eee',
                borderRadius: 8,
                overflow: 'hidden',
                zIndex: 2,
              }}
            >
              <img
                src={baseImage}
                alt="Captured"
                className="w-full h-full object-contain pointer-events-none"
                style={{ filter: activeFilter.style }}
              />
              {/* Drawing canvas (above photo) */}
              <canvas
                ref={drawCanvasRef}
                width={PHOTO_WIDTH}
                height={PHOTO_HEIGHT}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                style={{ zIndex: 3, left: 0, top: 0 }}
                onPointerDown={handleDrawStart}
                onPointerMove={handleDrawMove}
                onPointerUp={handleDrawEnd}
                onPointerLeave={handleDrawEnd}
              />
              {/* Stickers */}
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
                    zIndex: sticker.zIndex ?? 4,
                    touchAction: 'none',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("Remove this sticker?")) {
                      removeSticker(sticker.id);
                    }
                  }}
                />
              ))}
            </div>
            {/* Caption */}
            {selectedFrame.caption && (
              <div
                className="absolute left-1/2"
                style={{
                  bottom: photoSize.height * 0.08,
                  transform: 'translateX(-50%)',
                  fontFamily: 'Comic Sans MS, Comic Sans, cursive',
                  fontWeight: 'bold',
                  fontSize: Math.max(18, photoSize.height * 0.06),
                  color: '#222',
                  textAlign: 'center',
                  zIndex: 3,
                  width: photoSize.width * 0.8,
                  whiteSpace: 'pre-line',
                }}
              >
                {selectedFrame.caption}
              </div>
            )}
            {/* Swatches */}
            {selectedFrame.swatches && selectedFrame.swatches.length > 0 && (
              <div
                className="absolute left-1/2 flex gap-2"
                style={{
                  bottom: photoSize.height * 0.02,
                  transform: 'translateX(-50%)',
                  zIndex: 3,
                }}
              >
                {selectedFrame.swatches.map((color, idx) => (
                  <span
                    key={color + idx}
                    style={{
                      display: 'inline-block',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: color,
                      border: '2px solid #eee',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div
            ref={photoAreaRef}
            className="relative bg-black overflow-hidden select-none touch-none"
            style={{
              width: photoSize.width,
              height: photoSize.height,
              maxWidth: '95vw',
              maxHeight: '95vh',
            }}
            onDragOver={handlePhotoAreaDragOver}
            onDrop={handlePhotoAreaDrop}
          >
            {/* User photo */}
            <img
              src={baseImage}
              alt="Captured"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              style={{ filter: activeFilter.style, zIndex: 2 }}
            />
            {/* Frame template (in front of photo) */}
            {selectedFrame && (
              <div
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 4, ...selectedFrame.overlay }}
              />
            )}
            {/* Drawing canvas (above photo) */}
            <canvas
              ref={drawCanvasRef}
              width={PHOTO_WIDTH}
              height={PHOTO_HEIGHT}
              className="absolute inset-0 w-full h-full pointer-events-auto"
              style={{ zIndex: 3 }}
              onPointerDown={handleDrawStart}
              onPointerMove={handleDrawMove}
              onPointerUp={handleDrawEnd}
              onPointerLeave={handleDrawEnd}
            />
            {/* Stickers */}
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
                  zIndex: sticker.zIndex ?? 4,
                  touchAction: 'none',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Remove this sticker?")) {
                    removeSticker(sticker.id);
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative">
          {/* Main FAB */}
          <Button
            onClick={toggleFloatingMenu}
            variant="special"
            className="w-16 h-16 rounded-full shadow-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            <PaletteIcon className="w-8 h-8" />
          </Button>

          {/* Floating Menu Options */}
          {showFloatingMenu && (
            <div className="absolute bottom-20 right-0 space-y-3">
              {/* Filters Button */}
              <Button
                onClick={() => openMenu('filters')}
                variant="secondary"
                className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                  activeMenu === 'filters' ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-20 backdrop-blur-sm text-white'
                }`}
              >
                <span className="text-xs font-bold">F</span>
              </Button>

              {/* Stickers Button */}
              <Button
                onClick={() => openMenu('stickers')}
                variant="secondary"
                className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                  activeMenu === 'stickers' ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-20 backdrop-blur-sm text-white'
                }`}
              >
                <StarIcon className="w-6 h-6" />
              </Button>

              {/* AI Generation Button */}
              <Button
                onClick={() => openMenu('ai')}
                variant="secondary"
                className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                  activeMenu === 'ai' ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-20 backdrop-blur-sm text-white'
                }`}
              >
                <SparklesIcon className="w-6 h-6" />
              </Button>

              {/* Caption Edit Button (only for polaroid) */}
              {selectedFrame?.type === 'polaroid' && (
                <Button
                  onClick={() => openMenu('caption')}
                  variant="secondary"
                  className={`w-12 h-12 rounded-full shadow-lg transition-all duration-300 ${
                    activeMenu === 'caption' ? 'bg-purple-600 text-white' : 'bg-white bg-opacity-20 backdrop-blur-sm text-white'
                  }`}
                  aria-label="Edit Caption"
                >
                  <span className="text-lg font-bold">T</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Menu Panels */}
      {showFloatingMenu && activeMenu && (
        <div className="absolute bottom-8 left-8 z-30">
          <div className="bg-slate-800 bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl p-4 max-w-sm">
            {activeMenu === 'filters' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Filters</h3>
                <FilterPalette
                  filters={FILTERS}
                  activeFilterId={activeFilter.id}
                  onSelectFilter={handleFilterChange}
                />
              </div>
            )}

            {activeMenu === 'stickers' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Stickers</h3>
                <StickerPalette
                  stickers={availableStickers}
                  onSelectSticker={handleAddSticker}
                />
              </div>
            )}

            {activeMenu === 'ai' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">AI Sticker Generator</h3>
                <input
                  type="text"
                  value={stickerGenPrompt}
                  onChange={(e) => setStickerGenPrompt(e.target.value)}
                  placeholder="e.g., 'cute cat with glasses'"
                  className="w-full p-2 rounded bg-slate-600 text-white border border-slate-500 focus:ring-purple-500 focus:border-purple-500 mb-2 text-sm"
                  disabled={isGeneratingSticker}
                />
                <Button
                  onClick={handleGenerateSticker}
                  disabled={isGeneratingSticker || !stickerGenPrompt.trim()}
                  variant="special"
                  className="w-full"
                >
                  {isGeneratingSticker ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <SparklesIcon className="w-5 h-5 mr-2" />
                  )}
                  {isGeneratingSticker ? 'Generating...' : 'Create Sticker'}
                </Button>
              </div>
            )}

            {activeMenu === 'caption' && selectedFrame?.type === 'polaroid' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Edit Caption</h3>
                <input
                  type="text"
                  value={editableCaption}
                  onChange={(e) => setEditableCaption(e.target.value)}
                  placeholder="Enter caption..."
                  className="w-full p-2 rounded bg-slate-600 text-white border border-slate-500 focus:ring-purple-500 focus:border-purple-500 mb-2 text-sm"
                  maxLength={60}
                />
                <Button
                  onClick={() => {
                    // Update the selectedFrame.caption (mutate for preview only)
                    if (selectedFrame) selectedFrame.caption = editableCaption;
                    setActiveMenu(null);
                  }}
                  variant="primary"
                  className="w-full"
                >
                  Save Caption
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons - Bottom Center */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-3 items-center">
          {/* Drawing color palette */}
          <div className="flex gap-2 bg-white bg-opacity-70 rounded-lg px-3 py-2 mr-2 shadow-lg">
            {DRAW_COLORS.map((color) => (
              <button
                key={color}
                className={`w-7 h-7 rounded-full border-2 ${drawColor === color ? 'border-black scale-110' : 'border-white'} transition-all`}
                style={{ background: color }}
                onClick={() => setDrawColor(color)}
                aria-label={`Choose color ${color}`}
              />
            ))}
          </div>
          <Button onClick={onRetake} variant="secondary" className="bg-black bg-opacity-50 backdrop-blur-sm">
            <RetakeIcon className="w-5 h-5 mr-2" />
            Retake
          </Button>
          <Button onClick={onSave} variant="primary" className="bg-black bg-opacity-50 backdrop-blur-sm">
            <SaveIcon className="w-5 h-5 mr-2" />
            Save
          </Button>
          <Button onClick={onPrint} variant="success" className="bg-black bg-opacity-50 backdrop-blur-sm">
            <PrintIcon className="w-5 h-5 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-30">
          <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        </div>
      )}
    </div>
  );
});