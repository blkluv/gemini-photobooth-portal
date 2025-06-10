
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { SaveIcon, RetakeIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';

interface BoomerangPreviewViewProps {
  frames: string[];
  onRetake: (error?: any) => void; // Changed from (error: any | undefined)
  onSave: () => void;
  onBackToMenu: () => void;
}

const PLAYBACK_SPEED_MS = 75; // Adjust for desired playback speed, lower is faster

export const BoomerangPreviewView: React.FC<BoomerangPreviewViewProps> = ({ frames, onRetake, onSave, onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlayingForward, setIsPlayingForward] = useState(true);
  const animationFrameIdRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Preload images for smoother animation
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  useEffect(() => {
    setIsLoadingImages(true);
    const imagePromises = frames.map(frameSrc => {
      return new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error(`Failed to load frame: ${e}`));
        img.src = frameSrc;
      });
    });

    Promise.all(imagePromises)
      .then(loadedImages => {
        setImages(loadedImages);
        setIsLoadingImages(false);
      })
      .catch(error => {
        console.error("Error loading boomerang frames:", error);
        // Handle error, e.g., show message or navigate back
        onRetake(error); 
      });
  }, [frames, onRetake]);

  const drawFrame = useCallback((image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Maintain aspect ratio while fitting into canvas
    const hRatio = canvas.width / image.width;
    const vRatio = canvas.height / image.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShift_x = (canvas.width - image.width * ratio) / 2;
    const centerShift_y = (canvas.height - image.height * ratio) / 2;
    
    ctx.drawImage(image, 0, 0, image.width, image.height,
                  centerShift_x, centerShift_y, image.width * ratio, image.height * ratio);

  }, []);

  useEffect(() => {
    if (isLoadingImages || images.length === 0) return;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTimeRef.current > PLAYBACK_SPEED_MS) {
        lastFrameTimeRef.current = timestamp;

        setCurrentFrameIndex(prevIndex => {
          let nextIndex = prevIndex;
          if (isPlayingForward) {
            nextIndex = prevIndex + 1;
            if (nextIndex >= images.length) {
              nextIndex = images.length - 2; // Start reversing, skip last frame
              setIsPlayingForward(false);
            }
          } else {
            nextIndex = prevIndex - 1;
            if (nextIndex < 0) {
              nextIndex = 1; // Start forward, skip first frame
              setIsPlayingForward(true);
            }
          }
          // Ensure index is valid, especially for very short frame arrays
          return Math.max(0, Math.min(nextIndex, images.length - 1));
        });
      }
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    if (images[currentFrameIndex]) {
        drawFrame(images[currentFrameIndex]);
    }
    
    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [images, currentFrameIndex, isPlayingForward, drawFrame, isLoadingImages]);

   // Effect to draw the current frame when currentFrameIndex changes
  useEffect(() => {
    if (!isLoadingImages && images.length > 0 && images[currentFrameIndex]) {
      drawFrame(images[currentFrameIndex]);
    }
  }, [currentFrameIndex, images, drawFrame, isLoadingImages]);


  if (isLoadingImages) {
    return (
      <div className="w-full max-w-2xl flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg shadow-2xl h-[600px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
        <p className="mt-4 text-xl text-slate-300">Loading Boomerang...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
      <div className="w-full flex justify-between items-center mb-6">
         <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Preview</h1>
        <div style={{ width: '88px' }}></div> {/* Spacer */}
      </div>
      
      <canvas
        ref={canvasRef}
        width={PHOTO_WIDTH}
        height={PHOTO_HEIGHT}
        className="rounded-md shadow-lg bg-black"
        aria-label="Boomerang animation preview"
      ></canvas>

      <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
        <Button onClick={() => onRetake(undefined)} variant="secondary" className="flex-grow sm:flex-grow-0">
          <RetakeIcon className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={onSave} variant="success" className="flex-grow sm:flex-grow-0">
          <SaveIcon className="w-5 h-5 mr-2" /> Save Boomerang
        </Button>
      </div>
    </div>
  );
};
