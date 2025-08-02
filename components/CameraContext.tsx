import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { dslrService, CameraStatus, CaptureResult } from '../services/dslrService';

interface CameraContextType {
  isDSLRConnected: boolean;
  dslrStatus: CameraStatus | null;
  dslrError: string | null;
  isCapturing: boolean;
  capturePhoto: () => Promise<CaptureResult | null>;
  // Add more DSLR actions as needed (startVideo, stopVideo, etc.)
  refreshStatus: () => void;
}

const CameraContext = createContext<CameraContextType | undefined>(undefined);

export const CameraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dslrStatus, setDSLRStatus] = useState<CameraStatus | null>(null);
  const [dslrError, setDSLRerror] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Poll DSLR status every 5 seconds
  const fetchStatus = useCallback(async () => {
    try {
      const status = await dslrService.getStatus();
      setDSLRStatus(status);
      setDSLRerror(null);
    } catch (err) {
      setDSLRStatus(null);
      setDSLRerror('DSLR not connected');
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const capturePhoto = useCallback(async () => {
    setIsCapturing(true);
    try {
      const result = await dslrService.capturePhoto();
      setIsCapturing(false);
      return result;
    } catch (err) {
      setIsCapturing(false);
      setDSLRerror('Failed to capture photo with DSLR');
      return null;
    }
  }, []);

  const value: CameraContextType = {
    isDSLRConnected: !!dslrStatus && dslrStatus.connected === true,
    dslrStatus,
    dslrError,
    isCapturing,
    capturePhoto,
    refreshStatus: fetchStatus,
  };

  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
};

export function useCamera() {
  const context = useContext(CameraContext);
  if (!context) {
    throw new Error('useCamera must be used within a CameraProvider');
  }
  return context;
} 