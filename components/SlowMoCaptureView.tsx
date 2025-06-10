import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants'; // Using PHOTO dimensions for consistency
import { ClockIcon, RefreshIcon, ArrowLeftIcon, StopIcon } from './icons'; // Changed to ClockIcon
import { Button } from './Button';

interface SlowMoCaptureViewProps {
  onVideoRecorded: (videoUrl: string) => void;
  onBackToMenu: () => void;
}

const RECORDING_DURATION_S = 5; // 5 seconds real-time for slow-mo

export const SlowMoCaptureView: React.FC<SlowMoCaptureViewProps> = ({ onVideoRecorded, onBackToMenu }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);


  const startCamera = useCallback(async () => {
    setError(null);
    setIsCameraReady(false);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: PHOTO_WIDTH, height: PHOTO_HEIGHT },
          audio: true 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsCameraReady(true);
          };
        }
        
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(blob);
          onVideoRecorded(videoUrl);
          recordedChunksRef.current = []; 
        };

      } catch (err) {
        console.error("Error accessing media devices for Slow-Mo:", err);
        let message = "Could not access camera or microphone. Please check permissions.";
        if ((err as Error).name === "NotAllowedError") {
            message = "Access to camera and/or microphone denied. Please allow access in your browser settings.";
        } else if ((err as Error).name === "NotFoundError") {
            message = "No camera or microphone found. Please ensure they are connected and enabled.";
        } else if ((err as Error).name === "NotReadableError") {
            message = "Camera or microphone is already in use or could not be accessed.";
        }
        setError(message);
      }
    } else {
      setError("Media device access not supported by this browser.");
    }
  }, [onVideoRecorded]);

  useEffect(() => {
    startCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [startCamera]);


  const handleStartRecording = () => {
    if (!mediaRecorderRef.current || !isCameraReady || isRecording) return;

    recordedChunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
    setProgress(0);
    
    const startTime = Date.now();
    recordingTimerRef.current = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const currentProgress = Math.min(100, (elapsedTime / (RECORDING_DURATION_S * 1000)) * 100);
        setProgress(currentProgress);

        if (elapsedTime >= RECORDING_DURATION_S * 1000) {
            handleStopRecording();
        }
    }, 100); 
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
    setProgress(100); 
  };

  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
       <div className="w-full flex justify-between items-center mb-6">
        <Button onClick={onBackToMenu} variant="secondary" className="text-sm">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Slow-Mo Video</h1>
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
            Retry Access
          </button>
        </div>
      )}

      <div className="relative w-full aspect-[4/3] bg-black rounded-md overflow-hidden shadow-lg">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted 
          className={`w-full h-full object-cover transition-opacity duration-500 ${isCameraReady ? 'opacity-100' : 'opacity-0'}`}
          aria-label="Camera feed for slow-motion video recording"
        />
        {!isCameraReady && !error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
            <p className="ml-4 text-xl">Starting camera & mic...</p>
          </div>
        )}
        {isRecording && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70">
            <div className="flex items-center text-blue-400 mb-3"> {/* Changed color for SlowMo REC indicator */}
                 <span className="w-3 h-3 bg-blue-400 rounded-full mr-2 animate-pulse"></span>
                <p className="text-2xl font-bold text-white">REC SLOW-MO</p>
            </div>
            <div className="w-3/4 h-3 bg-slate-600 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-100 ease-linear" // Changed gradient for SlowMo
                style={{ width: `${progress}%`}}
              ></div>
            </div>
             <p className="text-sm text-slate-300 mt-2">{Math.round(RECORDING_DURATION_S * (progress/100))}s / {RECORDING_DURATION_S}s</p>
          </div>
        )}
      </div>
      
      <Button
        onClick={isRecording ? handleStopRecording : handleStartRecording}
        disabled={!isCameraReady || !!error}
        className={`mt-8 font-bold py-4 px-8 rounded-full text-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 flex items-center
                    ${isRecording 
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-400' 
                        : 'bg-gradient-to-r from-blue-500 to-sky-600 hover:from-blue-600 hover:to-sky-700 text-white focus:ring-blue-400'}`} // Changed gradient for SlowMo button
        aria-label={isRecording ? "Stop Slow-Mo Recording" : "Start Slow-Mo Recording"}
      >
        {isRecording ? <StopIcon className="w-7 h-7 mr-3" /> : <ClockIcon className="w-7 h-7 mr-3" />}
        {isRecording ? 'Stop Recording' : 'Start Slow-Mo'}
      </Button>
    </div>
  );
};
