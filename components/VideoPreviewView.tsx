import React, { useRef, useEffect, useState } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { SaveIcon, RetakeIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';

interface VideoPreviewViewProps {
  videoUrl: string;
  onRetake: () => void;
  onSave: () => void;
  onBackToMenu: () => void;
}

export const VideoPreviewView: React.FC<VideoPreviewViewProps> = ({ videoUrl, onRetake, onSave, onBackToMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Ensure video playback is re-triggered if videoUrl changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    try {
      // Test if URL is still valid
      const url = new URL(videoUrl);
      if (!url.protocol.includes('blob')) {
        console.warn('Video URL is not a blob URL:', videoUrl);
        setVideoError('Invalid video format');
        return;
      }

      video.src = videoUrl;
      video.load();

      const handleError = (e: Event) => {
        console.error('Video playback error:', e);
        setVideoError('Failed to play video. Please try retaking.');
      };

      video.addEventListener('error', handleError);

      return () => {
        video.removeEventListener('error', handleError);
      };
    } catch (error) {
      console.error('Invalid video URL:', error);
      setVideoError('Invalid video URL');
    }
  }, [videoUrl]);

  // Clean up Object URL when component unmounts or videoUrl changes
  useEffect(() => {
    const video = videoRef.current;
    const currentVideoUrl = videoUrl;

    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load(); // Ensure resources are released
      }
      if (currentVideoUrl) {
        try {
          URL.revokeObjectURL(currentVideoUrl);
          console.debug("Revoked video Object URL on unmount:", currentVideoUrl.substring(0,50) + "...");
        } catch (error) {
          console.warn("Error revoking Object URL:", error);
        }
      }
    };
  }, [videoUrl]);

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
        ) : (
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
          />
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
        <Button onClick={onRetake} variant="secondary" className="flex-grow sm:flex-grow-0">
          <RetakeIcon className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={onSave} variant="success" className="flex-grow sm:flex-grow-0" disabled={!!videoError}>
          <SaveIcon className="w-5 h-5 mr-2" /> Save Video
        </Button>
      </div>
    </div>
  );
};
