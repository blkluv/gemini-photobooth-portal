import React, { useRef, useEffect, useState } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { SaveIcon, RetakeIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';

interface SlowMoPreviewViewProps {
  videoUrl: string;
  onRetake: () => void;
  onSave: () => void;
  onBackToMenu: () => void;
}

const SLOW_MOTION_RATE = 0.5; // Playback at 50% speed

export const SlowMoPreviewView: React.FC<SlowMoPreviewViewProps> = ({ videoUrl, onRetake, onSave, onBackToMenu }) => {
  console.log('[DIAG] SlowMoPreviewView mounted, videoUrl:', videoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[DIAG] SlowMoPreviewView useEffect, videoUrl:', videoUrl);
    const video = videoRef.current;
    if (!video || !videoUrl) {
      setVideoError('No video data available');
      setIsLoading(false);
      return;
    }

    try {
      // Debug: log the videoUrl type
      console.debug('[PREVIEW-DEBUG] SlowMoPreviewView videoUrl:', videoUrl);
      // Accept both blob and http(s) URLs
      video.src = '';
      video.load();
      setVideoError(null);
      setIsLoading(true);

      const handleError = (e: Event) => {
        console.error('Slow-mo video playback error:', e);
        setVideoError('Failed to play video. Please try retaking or check your network connection.');
        setIsLoading(false);
      };

      const handleLoadedMetadata = () => {
        if (video) {
          video.playbackRate = SLOW_MOTION_RATE;
        }
        setIsLoading(false);
      };

      const handleLoadedData = () => {
        setIsLoading(false);
      };

      video.addEventListener('error', handleError);
      video.addEventListener('loadedmetadata', handleLoadedMetadata);
      video.addEventListener('loadeddata', handleLoadedData);

      video.src = videoUrl;
      video.load();

      // Extra: check if the blob URL is revoked or not
      if (videoUrl.startsWith('blob:')) {
        fetch(videoUrl)
          .then(res => {
            if (!res.ok) throw new Error('Blob fetch failed');
            return res.blob();
          })
          .then(blob => {
            console.debug('[PREVIEW-DEBUG] SlowMo blob size:', blob.size, 'type:', blob.type);
            if (blob.size === 0) {
              setVideoError('No video data available (empty blob)');
            }
          })
          .catch(err => {
            console.warn('[PREVIEW-DEBUG] SlowMo blob fetch error:', err);
            setVideoError('No video data available (blob fetch error)');
          });
      }

      return () => {
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    } catch (error) {
      console.error('Invalid slow-mo video URL:', error);
      setVideoError('Invalid video format');
      setIsLoading(false);
    }
  }, [videoUrl]);

  // Only revoke the URL when component unmounts, not when URL changes
  useEffect(() => {
    return () => {
      const video = videoRef.current;
      if (video) {
        const currentSrc = video.src;
        video.src = '';
        video.load();
        
        // Only revoke if it's a blob URL and hasn't been revoked already
        if (currentSrc && currentSrc.startsWith('blob:')) {
          try {
            URL.revokeObjectURL(currentSrc);
            console.debug("Revoked slow-mo Object URL on unmount");
          } catch (error) {
            console.warn("Error revoking Object URL:", error);
          }
        }
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
      <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Preview Slow-Mo</h1>
        <div style={{ width: '88px' }}></div>
      </div>
      
      <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden shadow-lg">
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-50">
            <div className="text-white text-center p-4">
              <p className="text-lg font-semibold mb-2">{videoError}</p>
              <Button onClick={onRetake} variant="secondary" className="text-sm">
                Retake Slow-Mo
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
            <p className="ml-4 text-xl">Loading slow-motion video...</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            loop
            className="w-full h-full object-contain"
            style={{ maxWidth: PHOTO_WIDTH, maxHeight: PHOTO_HEIGHT }}
            aria-label="Recorded slow-motion video preview"
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
        <Button onClick={onRetake} variant="secondary" className="flex-grow sm:flex-grow-0">
          <RetakeIcon className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={onSave} variant="success" className="flex-grow sm:flex-grow-0" disabled={!!videoError}>
          <SaveIcon className="w-5 h-5 mr-2" /> Save Slow-Mo
        </Button>
      </div>
    </div>
  );
};
