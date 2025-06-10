import React, { useState, useRef, useCallback, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { Sticker, Filter, Point } from '../types';
import { FILTERS, PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { StickerPalette } from './StickerPalette';
import { FilterPalette } from './FilterPalette';
import { Button } from './Button';
import { SaveIcon, PrintIcon, RetakeIcon, SparklesIcon, ArrowLeftIcon } from './icons';
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
  // isProcessing?: boolean; // Removed, App's modalContent handles global loading state
  onBackToMenu: () => void;
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
  // isProcessing = false, // Removed
  onBackToMenu,
}, ref) => {
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>(initialStickers);
  const [activeFilter, setActiveFilter] = useState<Filter>(initialFilter);
  const [stickerGenPrompt, setStickerGenPrompt] = useState('');
  const [isGeneratingSticker, setIsGeneratingSticker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoAreaRef = useRef<HTMLDivElement>(null);
  const draggedStickerRef = useRef<{ stickerId: string; offsetX: number; offsetY: number; } | null>(null);

  useEffect(() => {
    setAppliedStickers(initialStickers);
  }, [initialStickers]);

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  useImperativeHandle(ref, () => ({
    generateFinalImage: async () => {
      return generateImageWithCanvas(baseImage, appliedStickers, activeFilter.style);
    }
  }), [baseImage, appliedStickers, activeFilter.style]);


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

  // The global loading state is handled by App.tsx's modalContent
  // Buttons can be disabled based on their specific local processing if needed (e.g., isGeneratingSticker)
  // Or, if a global "app is busy" state is desired, PhotoEditor could receive a prop like `isAppBusy`.
  // For now, onSave and onPrint will appear active, App.tsx handles showing the loading modal.

  return (
    <div className="w-full max-w-5xl flex flex-col lg:flex-row items-start gap-6 p-2 sm:p-6 bg-slate-800 rounded-lg shadow-2xl">
      <div className="flex-grow w-full lg:w-auto flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4">
            <Button onClick={onBackToMenu} variant="secondary" className="text-sm !py-1 !px-2">
              <ArrowLeftIcon className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Menu</span>
            </Button>
            <h2 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 text-center">Edit Your Photo</h2>
            <div style={{ minWidth: '60px' }} className="sm:min-w-[76px]"></div>
        </div>
        <div
            ref={photoAreaRef}
            className="relative bg-black rounded-md overflow-hidden shadow-lg select-none touch-none"
            style={{ width: PHOTO_WIDTH, height: PHOTO_HEIGHT }}
            onDragOver={handlePhotoAreaDragOver}
            onDrop={handlePhotoAreaDrop}
        >
            <img
                src={baseImage}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                style={{ filter: activeFilter.style }}
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
                    if (window.confirm("Remove this sticker?")) {
                        removeSticker(sticker.id);
                    }
                }}
            />
            ))}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
          <Button onClick={onRetake} variant="secondary" className="flex-grow xs:flex-grow-0 text-sm sm:text-base">
            <RetakeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Retake
          </Button>
          <Button onClick={onSave} variant="primary" className="flex-grow xs:flex-grow-0 text-sm sm:text-base">
            <SaveIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Save
          </Button>
          <Button onClick={onPrint} variant="success" className="flex-grow xs:flex-grow-0 text-sm sm:text-base">
            <PrintIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" /> Print
          </Button>
        </div>
         {error && <p className="text-red-400 mt-2 text-sm text-center w-full">{error}</p>}
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6 mt-6 lg:mt-0">
        <FilterPalette
          filters={FILTERS}
          activeFilterId={activeFilter.id}
          onSelectFilter={handleFilterChange}
        />
        <StickerPalette
          stickers={availableStickers}
          onSelectSticker={handleAddSticker}
        />
        <div className="bg-slate-700 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-3 text-purple-300">Generate Sticker with AI</h3>
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
      </div>
    </div>
  );
});