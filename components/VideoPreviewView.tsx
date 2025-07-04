import React, { useRef, useEffect, useState } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { SaveIcon, RetakeIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';

interface VideoPreviewViewProps {
  videoUrl: string;
  onRetake: () => void;
  onSave: () => void;
  onSaveAsGif: () => void;
  onBackToMenu: () => void;
}

export const VideoPreviewView: React.FC<VideoPreviewViewProps> = ({ videoUrl, onRetake, onSave, onSaveAsGif, onBackToMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setVideoError(null);
    setIsLoading(true);
  }, [videoUrl]);

  const handleError = () => {
    setVideoError('Failed to play video. Please try retaking or check your browser support.');
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
      <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Preview Video</h1>
        <div style={{ width: '88px' }}></div>
      </div>
      <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden shadow-lg">
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
            <div className="text-white text-center p-4">
              <p className="text-lg font-semibold mb-2">{videoError}</p>
              <Button onClick={onRetake} variant="secondary" className="text-sm">
                Retake Video
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="ml-4 text-xl">Loading video...</p>
          </div>
        ) : null}
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          autoPlay
          playsInline
          loop
          className="w-full h-full object-contain"
          style={{ maxWidth: PHOTO_WIDTH, maxHeight: PHOTO_HEIGHT }}
          aria-label="Recorded video preview"
          onError={handleError}
          onLoadedData={handleLoadedData}
        />
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
        <Button onClick={onRetake} variant="secondary" className="flex-grow sm:flex-grow-0">
          <RetakeIcon className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={onSave} variant="success" className="flex-grow sm:flex-grow-0" disabled={!!videoError}>
          <SaveIcon className="w-5 h-5 mr-2" /> Save Video
        </Button>
        <Button onClick={onSaveAsGif} variant="special" className="flex-grow sm:flex-grow-0" disabled={!!videoError}>
          <SaveIcon className="w-5 h-5 mr-2" /> Save as GIF
        </Button>
      </div>
    </div>
  );
};
