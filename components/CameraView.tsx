import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { CameraIcon, RefreshIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';
import { useCamera } from './CameraContext';

interface CameraViewProps {
  onPhotoCaptured: (imageDataUrl: string) => void;
  onBackToMenu: () => void;
  autoNextCaptureSignal?: number; // increments to trigger next auto capture
  isFirstCapture?: boolean; // whether this is the first capture in a sequence
}

export const CameraView: React.FC<CameraViewProps> = ({ 
  onPhotoCaptured, 
  onBackToMenu, 
  autoNextCaptureSignal,
  isFirstCapture = true 
}) => {
  const {
    isDSLRConnected,
    dslrStatus,
    dslrError,
    isCapturing: isDSLRCapturing,
    capturePhoto: captureDSLRPhoto,
  } = useCamera();

  // Webcam state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);

  // Webcam logic
  const startCamera = useCallback(async () => {
    setWebcamError(null);
    setIsCameraReady(false);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        setWebcamError("Could not access camera. Please check permissions and try again.");
        if ((err as Error).name === "NotAllowedError") {
            setWebcamError("Camera access denied. Please allow camera access in your browser settings.");
        } else if ((err as Error).name === "NotFoundError") {
            setWebcamError("No camera found. Please ensure a camera is connected.");
        }
      }
    } else {
      setWebcamError("Camera access not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    if (!isDSLRConnected) {
      startCamera();
      return () => {
        if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, [isDSLRConnected, startCamera]);

  // Handler for photo capture
  const handleSnapPhoto = useCallback(async () => {
    if (isDSLRConnected) {
      // Use DSLR
      const result = await captureDSLRPhoto();
      if (result && result.success && result.filename) {
        onPhotoCaptured(`DSLR:${result.filename}`);
      }
      // Error handling is managed by context
    } else {
      // Use webcam
      if (!videoRef.current || !canvasRef.current || !isCameraReady) return;
      setCountdown(3);
      let count = 3;
      const timer = setInterval(() => {
        count -= 1;
        setCountdown(count);
        if (count === 0) {
          clearInterval(timer);
          setCountdown(null);
          const video = videoRef.current!;
          const canvas = canvasRef.current!;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageDataUrl = canvas.toDataURL('image/jpeg');
            onPhotoCaptured(imageDataUrl);
          }
        }
      }, 1000);
    }
  }, [isDSLRConnected, captureDSLRPhoto, onPhotoCaptured, isCameraReady]);

  // Auto trigger next capture when signal changes
  useEffect(() => {
    if (autoNextCaptureSignal === undefined) return;
    // Only trigger if not already counting down or capturing and camera is ready
    if (!isDSLRConnected && (!isCameraReady || countdown !== null)) return;
    if (isDSLRConnected && isDSLRCapturing) return;

    // slight delay to allow UI updates/state from previous capture
    const t = setTimeout(() => {
      handleSnapPhoto();
    }, 400);
    return () => clearTimeout(t);
  }, [autoNextCaptureSignal, isDSLRConnected, isDSLRCapturing, isCameraReady, countdown, handleSnapPhoto]);

  // UI
  return (
    <div className="w-full h-full flex flex-col bg-black relative">
      {/* Header with back button - positioned absolutely */}
      <div className="absolute top-4 left-4 z-20">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm bg-black bg-opacity-50 backdrop-blur-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
      </div>

      {/* DSLR Status - positioned absolutely */}
      {isDSLRConnected && (
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 backdrop-blur-sm text-green-400 font-semibold px-4 py-2 rounded-lg">
          DSLR: {dslrStatus?.model || dslrStatus?.camera}
        </div>
      )}

      {/* Full Screen Camera Feed */}
      <div className="w-full h-full relative">
        {isDSLRConnected ? (
          // DSLR Mode - Full screen with capture button overlay
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-pink-900">
            <div className="text-center">
              <div className="text-white text-2xl mb-8">
                DSLR Camera Ready
              </div>
              <Button
                onClick={handleSnapPhoto}
                disabled={isDSLRCapturing}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white font-bold py-6 px-12 rounded-full text-2xl shadow-2xl border-2 border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300"
              >
                {isDSLRCapturing ? 'Capturing...' : 'Capture Photo'}
              </Button>
              {dslrError && (
                <div className="text-red-400 mt-4 bg-red-900 bg-opacity-50 px-4 py-2 rounded-lg">
                  {dslrError}
                </div>
              )}
            </div>
          </div>
        ) : (
          // Webcam Mode - Full screen video with overlay controls
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Camera feed"
            />
            
            {/* Camera loading overlay */}
            {!isCameraReady && !webcamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
                  <p className="text-2xl text-white">Starting camera...</p>
                </div>
              </div>
            )}

            {/* Error overlay */}
            {webcamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90">
                <div className="text-center max-w-md mx-4">
                  <div className="bg-red-500 text-white p-6 rounded-lg mb-4">
                    <p className="text-lg">{webcamError}</p>
                  </div>
                  <button
                    onClick={startCamera}
                    className="bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-semibold py-3 px-6 rounded-lg flex items-center justify-center transition-colors duration-150 mx-auto"
                  >
                    <RefreshIcon className="w-6 h-6 mr-2" />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Countdown overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <span className="text-9xl font-bold text-white animate-pingOnce">{countdown}</span>
              </div>
            )}

            {/* Transparent Snap Button Overlay */}
            {isCameraReady && !webcamError && countdown === null && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
                <Button
                  onClick={handleSnapPhoto}
                  disabled={!isFirstCapture} // Only enable for first capture
                  className={`font-bold py-6 px-12 rounded-full text-2xl shadow-2xl border-2 transition-all duration-300 ${
                    isFirstCapture 
                      ? 'bg-white bg-opacity-20 backdrop-blur-sm text-white border-white border-opacity-30 hover:bg-opacity-30 hover:scale-105' 
                      : 'bg-gray-500 bg-opacity-50 text-gray-300 border-gray-400 border-opacity-30 cursor-not-allowed'
                  }`}
                >
                  <CameraIcon className="w-8 h-8 mr-3" />
                  {isFirstCapture ? 'Snap Photo' : 'Auto Capture'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hidden canvas for webcam capture */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};