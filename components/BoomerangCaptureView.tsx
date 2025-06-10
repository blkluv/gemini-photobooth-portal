import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { PlayCycleIcon, RefreshIcon, ArrowLeftIcon } from './icons';
import { Button } from './Button';

interface BoomerangCaptureViewProps {
  onFramesCaptured: (frames?: string[]) => void; // Changed from (frames: string[] | undefined)
  onBackToMenu: () => void;
}

const CAPTURE_DURATION_MS = 1500; // 1.5 seconds
const FRAMES_TO_CAPTURE = 15; // Aim for 10 FPS

export const BoomerangCaptureView: React.FC<BoomerangCaptureViewProps> = ({ onFramesCaptured, onBackToMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100

  const framesRef = useRef<string[]>([]);
  const captureIntervalRef = useRef<number | undefined>();


  const startCamera = useCallback(async () => {
    setError(null);
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
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
         if ((err as Error).name === "NotAllowedError") {
            setError("Camera access denied. Please allow camera access in your browser settings.");
        } else if ((err as Error).name === "NotFoundError") {
            setError("No camera found. Please ensure a camera is connected.");
        }
      }
    } else {
      setError("Camera access not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (captureIntervalRef.current) {
        window.clearInterval(captureIntervalRef.current);
      }
    };
  }, [startCamera]);

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      const imageDataUrl = canvas.toDataURL('image/png'); // Use PNG for gif.js compatibility
      framesRef.current.push(imageDataUrl);
    }
  }, [isCameraReady]);

  const startRecording = useCallback(() => {
    if (!isCameraReady || isRecording) return;

    setIsRecording(true);
    setProgress(0);
    framesRef.current = [];
    
    const frameInterval = CAPTURE_DURATION_MS / FRAMES_TO_CAPTURE;
    let framesCapturedCount = 0;
    const startTime = Date.now();

    captureIntervalRef.current = window.setInterval(() => {
      captureFrame();
      framesCapturedCount++;
      const elapsedTime = Date.now() - startTime;
      setProgress(Math.min(100, (elapsedTime / CAPTURE_DURATION_MS) * 100));

      if (framesCapturedCount >= FRAMES_TO_CAPTURE || elapsedTime >= CAPTURE_DURATION_MS) {
        if (captureIntervalRef.current) {
          window.clearInterval(captureIntervalRef.current);
        }
        setIsRecording(false);
        setProgress(100);
        if (framesRef.current.length > 0) {
          onFramesCaptured(framesRef.current);
        } else {
          setError("Failed to capture any frames. Please try again.");
          onFramesCaptured(undefined); // Call with undefined when no frames
          setTimeout(() => setProgress(0), 500);
        }
      }
    }, frameInterval);

  }, [isCameraReady, isRecording, captureFrame, onFramesCaptured]);


  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
       <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Boomerang</h1>
        <div style={{ width: '88px' }}></div> {/* Spacer */}
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4 w-full text-center text-sm">
          <p>{error}</p>
          <button
            onClick={startCamera}
            className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-slate-800 font-semibold py-1 px-3 rounded-lg flex items-center justify-center text-xs"
          >
            <RefreshIcon className="w-4 h-4 mr-1" />
            Retry Camera
          </button>
        </div>
      )}

      <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Important for autoplay in some browsers
          className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Camera feed for Boomerang"
        />
        {!isCameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="ml-4 text-xl">Starting camera...</p>
          </div>
        )}
        {isRecording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60">
            <p className="text-2xl font-bold text-white mb-3">Recording Boomerang...</p>
            <div className="w-3/4 h-3 bg-slate-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-100 ease-linear" 
                style={{ width: `${progress}%`}}
              ></div>
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden"></canvas>
      
      <Button
        onClick={startRecording}
        disabled={!isCameraReady || isRecording || !!error}
        className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 flex items-center"
        aria-label="Start Boomerang Recording"
      >
        <PlayCycleIcon className="w-7 h-7 mr-3" />
        {isRecording ? 'Recording...' : 'Start Boomerang'}
      </Button>
    </div>
  );
};
