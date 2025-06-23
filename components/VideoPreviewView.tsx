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
  console.log('[DIAG] VideoPreviewView mounted, videoUrl:', videoUrl);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure video playback is re-triggered if videoUrl changes
  useEffect(() => {
    console.log('[DIAG] VideoPreviewView useEffect, videoUrl:', videoUrl);
    const video = videoRef.current;
    if (!video || !videoUrl) {
      setVideoError('No video data available');
      setIsLoading(false);
      return;
    }

    try {
      // Debug: log the videoUrl type
      console.debug('[PREVIEW-DEBUG] VideoPreviewView videoUrl:', videoUrl);
      video.src = '';
      video.load();
      setVideoError(null);
      setIsLoading(true);

      // Add granular event diagnostics
      const logEvent = (evt: Event) => {
        const v = evt.target as HTMLVideoElement;
        console.log(`[DIAG] video event: ${evt.type}`, {
          error: v.error,
          networkState: v.networkState,
          readyState: v.readyState,
          currentTime: v.currentTime,
          src: v.src
        });
      };
      video.addEventListener('error', logEvent);
      video.addEventListener('loadedmetadata', logEvent);
      video.addEventListener('loadeddata', logEvent);
      video.addEventListener('canplay', logEvent);
      video.addEventListener('canplaythrough', logEvent);
      video.addEventListener('play', logEvent);
      video.addEventListener('pause', logEvent);

      const handleError = (e: Event) => {
        const v = e.target as HTMLVideoElement;
        let errMsg = 'Failed to play video. Please try retaking or check your network connection.';
        if (v.error) {
          errMsg += ` (MediaError code: ${v.error.code}, message: ${v.error.message || 'n/a'})`;
          console.error('[DIAG] MediaError:', v.error);
        }
        setVideoError(errMsg);
        setIsLoading(false);
      };

      const handleLoadedMetadata = () => {
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
            console.debug('[PREVIEW-DEBUG] Blob size:', blob.size, 'type:', blob.type);
            if (blob.size === 0) {
              setVideoError('No video data available (empty blob)');
            }
          })
          .catch(err => {
            console.warn('[PREVIEW-DEBUG] Blob fetch error:', err);
            setVideoError('No video data available (blob fetch error)');
          });
      }

      return () => {
        video.removeEventListener('error', logEvent);
        video.removeEventListener('loadedmetadata', logEvent);
        video.removeEventListener('loadeddata', logEvent);
        video.removeEventListener('canplay', logEvent);
        video.removeEventListener('canplaythrough', logEvent);
        video.removeEventListener('play', logEvent);
        video.removeEventListener('pause', logEvent);
        video.removeEventListener('error', handleError);
        video.removeEventListener('loadedmetadata', handleLoadedMetadata);
        video.removeEventListener('loadeddata', handleLoadedData);
      };
    } catch (error) {
      console.error('Invalid video URL:', error);
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
            console.debug("Revoked video Object URL on unmount");
          } catch (error) {
            console.warn("Error revoking Object URL:", error);
          }
        }
      }
    };
  }, []);

  // Download blob helper
  const handleDownloadBlob = () => {
    if (!videoUrl) return;
    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = 'recorded_video.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
        ) : (
          <>
          <video
            key={videoUrl}
            ref={videoRef}
            controls
            autoPlay
            playsInline
            loop
            className="w-full h-full object-contain"
            style={{ maxWidth: PHOTO_WIDTH, maxHeight: PHOTO_HEIGHT }}
            aria-label="Recorded video preview"
          >
            <source src={videoUrl} type="video/webm;codecs=vp9,opus" />
            Your browser does not support the video tag.
          </video>
          {/* Minimal video element for direct test */}
          <div className="mt-4">
            <div className="text-xs text-slate-400">Minimal video element test:</div>
            <video src={videoUrl} controls style={{ width: 320, height: 180, background: '#222' }} />
          </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4 w-full">
        <Button onClick={onRetake} variant="secondary" className="flex-grow sm:flex-grow-0">
          <RetakeIcon className="w-5 h-5 mr-2" /> Retake
        </Button>
        <Button onClick={onSave} variant="success" className="flex-grow sm:flex-grow-0" disabled={!!videoError}>
          <SaveIcon className="w-5 h-5 mr-2" /> Save Video
        </Button>
        <Button onClick={handleDownloadBlob} variant="secondary" className="flex-grow sm:flex-grow-0">
          Download Blob
        </Button>
      </div>
    </div>
  );
};
