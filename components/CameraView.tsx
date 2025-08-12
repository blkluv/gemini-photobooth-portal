import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { CameraIcon, RefreshIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';
import { useCamera } from './CameraContext';

interface CameraViewProps {
  onPhotoCaptured: (imageDataUrl: string) => void;
  onBackToMenu: () => void;
  autoNextCaptureSignal?: number; // increments to trigger next auto capture
}

export const CameraView: React.FC<CameraViewProps> = ({ onPhotoCaptured, onBackToMenu, autoNextCaptureSignal }) => {
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
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
      <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Photobooth
        </h1>
        <div style={{ width: '88px' }}></div>
      </div>

      {isDSLRConnected ? (
        <div className="w-full flex flex-col items-center">
          <div className="mb-4 text-green-400 font-semibold">
            DSLR Connected: {dslrStatus?.model || dslrStatus?.camera} (Port: {dslrStatus?.port})
          </div>
          <Button
            onClick={handleSnapPhoto}
            disabled={isDSLRCapturing}
            className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg"
          >
            {isDSLRCapturing ? 'Capturing...' : 'Capture with DSLR'}
          </Button>
          {dslrError && <div className="text-red-500 mt-4">{dslrError}</div>}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          {webcamError && (
            <div className="bg-red-500 text-white p-4 rounded-md mb-4 w-full text-center">
              <p>{webcamError}</p>
              <button
                onClick={startCamera}
                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors duration-150"
              >
                <RefreshIcon className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          )}
          <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden shadow-lg">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
              aria-label="Camera feed"
            />
            {!isCameraReady && !webcamError && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
                <p className="ml-4 text-xl">Starting camera...</p>
              </div>
            )}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                <span className="text-9xl font-bold text-white animate-pingOnce">{countdown}</span>
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden"></canvas>
          <Button
            onClick={handleSnapPhoto}
            disabled={countdown !== null || !isCameraReady || !!webcamError}
            className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg"
          >
            <CameraIcon className="w-7 h-7 mr-3" />
            Snap Photo
          </Button>
        </div>
      )}
    </div>
  );
};