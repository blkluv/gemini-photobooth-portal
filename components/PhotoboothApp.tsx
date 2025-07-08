import React, { useState, useCallback, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CameraView } from './CameraView';
import { PhotoEditor } from './PhotoEditor';
import { PrintView } from './PrintView';
import { Modal } from './Modal';
import { LandingPage } from './LandingPage';
import { MenuPage } from './MenuPage';
import { BoomerangCaptureView } from './BoomerangCaptureView';
import { BoomerangPreviewView } from './BoomerangPreviewView';
import { VideoCaptureView } from './VideoCaptureView';
import { VideoPreviewView } from './VideoPreviewView';
import { SlowMoCaptureView } from './SlowMoCaptureView';
import { SlowMoPreviewView } from './SlowMoPreviewView';
import type { Sticker, Filter, ModalContent } from '../types';
import { ViewState } from '../types';
import { 
  INITIAL_STICKERS, 
  FILTERS,
} from '../constants';
import { generateImageWithCanvas } from '../utils/imageUtils';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { boomerangFramesToWebM } from '../utils/boomerangToWebm';
import { boomerangFramesToGif } from '../utils/boomerangToGif';
import PhotoStripView from './PhotoStripView';
import PinGate from './PinGate';
import AdminSettingsModal from './AdminSettingsModal';
import { CogIcon } from './icons';
import { extractFramesFromVideoBlob } from '../utils/imageUtils';

const PhotoboothApp: React.FC = () => {
  // --- All state, handlers, and logic from App.tsx (photobooth part) go here ---
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [pinUnlocked, setPinUnlocked] = useState(() => localStorage.getItem('photoboothPin') === '1');
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('photoboothPin') === '1');
  const [showAdminSettings, setShowAdminSettings] = useState(false);
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);
  const [userStickers, setUserStickers] = useState<Sticker[]>([]);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);
  const [boomerangFrames, setBoomerangFrames] = useState<string[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedSlowMoVideoUrl, setRecordedSlowMoVideoUrl] = useState<string | null>(null);
  const [recordedVideoFrames, setRecordedVideoFrames] = useState<string[]>([]);
  const [recordedSlowMoFrames, setRecordedSlowMoFrames] = useState<string[]>([]);
  const photoEditorRef = useRef<{ generateFinalImage: () => Promise<string | null> }>(null);

  const clearModal = useCallback(() => {
    setModalContent(null);
  }, []);

  useEffect(() => {
    if (modalContent?.duration) {
      const timer = setTimeout(() => {
        clearModal();
      }, modalContent.duration);
      return () => clearTimeout(timer);
    }
  }, [modalContent, clearModal]);

  const handleLandingComplete = useCallback(() => {
    setCurrentView('MENU');
  }, []);

  const handleAdminLogout = useCallback(() => {
    setPinUnlocked(false);
    setIsAdmin(false);
    setShowAdminSettings(false);
    setCurrentView('LANDING');
  }, []);

  const handleMenuSelection = useCallback((selectedView: ViewState) => {
    setCapturedImage(null);
    setEditedImage(null);
    setAppliedStickers([]);
    setActiveFilter(FILTERS[0]);
    setBoomerangFrames([]);
    setRecordedVideoUrl(null);
    setRecordedSlowMoVideoUrl(null);
    clearModal();
    const actionableViews: ViewState[] = ['CAMERA', 'BOOMERANG_CAPTURE', 'VIDEO_CAPTURE', 'SLOWMO_CAPTURE', 'PHOTO_STRIP'];
    if (actionableViews.includes(selectedView)) {
      setCurrentView(selectedView);
    } else {
      setCurrentView('MENU');
    }
  }, [clearModal]);

  const handleBackToMenu = useCallback(() => {
    setCurrentView('MENU');
    clearModal();
  }, [clearModal]);

  const handlePhotoCaptured = useCallback((imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setEditedImage(imageDataUrl); 
    setAppliedStickers([]); 
    setActiveFilter(FILTERS[0]); 
    setCurrentView('EDITOR');
    clearModal();
  }, [clearModal]);

  const handleRetake = useCallback(() => {
    setCapturedImage(null);
    setEditedImage(null);
    setAppliedStickers([]);
    setCurrentView('CAMERA');
    clearModal();
  }, [clearModal]);

  // ...uploadToServer, uploadMediaToServer, and all other handlers from App.tsx...
  // ...renderContent logic from App.tsx...

  // Uploads a base64 image string (Data URL)
  async function uploadToServer(base64Image: string): Promise<string> {
    function base64ToBlob(base64: string) {
      const parts = base64.split(';base64,');
      if (parts.length !== 2) {
        throw new Error('Invalid base64 string format');
      }
      const contentType = parts[0].split(':')[1];
      if (!contentType) {
        throw new Error('Could not determine content type from base64 string');
      }
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      return new Blob([uInt8Array], { type: contentType });
    }

    const blob = base64ToBlob(base64Image);
    const formData = new FormData();
    formData.append('image', blob, 'photo.png');
    formData.append('device_key', localStorage.getItem('kioskKey') || 'unknown');

    let response;
    try {
      response = await fetch('https://snapbooth.eeelab.xyz/upload_and_qr.php', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
    } catch (networkError) {
      throw new Error('Network error: Could not connect to the server for image upload.');
    }

    if (!response.ok) {
      throw new Error(`Image upload failed: Server responded with status ${response.status} (${response.statusText}).`);
    }

    try {
      const data = await response.json();
      if (data.success && data.qrCodeLink) {
        return data.qrCodeLink;
      } else {
        throw new Error(data.message || 'Image upload was successful, but the server returned an unexpected response format.');
      }
    } catch (jsonError) {
      throw new Error('Failed to parse server response for image upload.');
    }
  }

  // Uploads a media Blob (e.g., video)
  async function uploadMediaToServer(mediaBlob: Blob, fileName: string, mediaType: 'video' | 'slowmo'): Promise<string> {
    if (mediaBlob.size === 0) {
      throw new Error(`Empty ${mediaType} content. No data to upload.`);
    }
    const formData = new FormData();
    formData.append('video', mediaBlob, fileName);
    formData.append('device_key', localStorage.getItem('kioskKey') || 'unknown');
    let response;
    try {
      response = await fetch('https://snapbooth.eeelab.xyz/uploadvideo_and_qr.php', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
    } catch (networkError) {
      throw new Error(`Network error: Could not connect to server for ${mediaType} upload.`);
    }
    if (!response.ok) {
      throw new Error(`Upload failed for ${mediaType}: Server responded with status ${response.status} (${response.statusText}).`);
    }
    try {
      const data = await response.json();
      if (data.success && data.qrCodeLink) {
        return data.qrCodeLink;
      } else {
        throw new Error(data.message || `${mediaType} upload successful, but server returned unexpected response format.`);
      }
    } catch (jsonError) {
      throw new Error(`Failed to parse server response for ${mediaType}.`);
    }
  }

  const handleSavePhoto = async () => {
    if (photoEditorRef.current) {
      setModalContent({ type: 'loading', message: "Generating final photo..." });
      try {
        const finalImage = await photoEditorRef.current.generateFinalImage();
        if (finalImage) {
          setEditedImage(finalImage);
          setModalContent({ type: 'loading', message: "Uploading photo to cloud..." });
          const qrLink = await uploadToServer(finalImage);
          setModalContent({
            type: 'qr',
            message: "Scan QR to view & download your photo!",
            qrData: qrLink,
            itemType: 'photo',
          });
        } else {
          throw new Error("Failed to generate final image for saving.");
        }
      } catch (error) {
        setModalContent({ type: 'error', message: `Failed to save photo: ${(error as Error).message}`, itemType: 'photo', duration: 5000 });
      }
    }
  };

  const handlePrintPhoto = async () => {
    if (photoEditorRef.current) {
      setModalContent({ type: 'loading', message: "Preparing photo for printing..." });
      try {
        const finalImage = await photoEditorRef.current.generateFinalImage();
        if (finalImage) {
          setEditedImage(finalImage); 
          clearModal(); 
          setCurrentView('PRINTING');
        } else {
          throw new Error("Failed to generate final image for printing.");
        }
      } catch (error) {
        setModalContent({ type: 'error', message: `Failed to prepare photo for printing: ${(error as Error).message}`, duration: 3000 });
      }
    }
  };

  const handleBackToEditor = useCallback(() => {
    setCurrentView('EDITOR');
    clearModal();
  }, [clearModal]);

  const handleAddUserSticker = useCallback((sticker: Sticker) => {
    setUserStickers(prev => [sticker, ...prev]);
  }, []);
  
  const updateEditedImage = useCallback(async () => {
    if (capturedImage) {
      const finalImage = await generateImageWithCanvas(capturedImage, appliedStickers, activeFilter.style);
      setEditedImage(finalImage);
    }
  }, [capturedImage, appliedStickers, activeFilter]);

  useEffect(() => {
    if (currentView === 'EDITOR' && capturedImage) {
      updateEditedImage();
    }
  }, [appliedStickers, activeFilter, capturedImage, currentView, updateEditedImage]);

  const handleBoomerangFramesCaptured = useCallback((frames: string[] | undefined) => {
    if (frames && frames.length > 0) {
      setBoomerangFrames(frames);
      setCurrentView('BOOMERANG_PREVIEW');
    } else {
      setCurrentView('BOOMERANG_CAPTURE');
      setModalContent({ type: 'error', message: "Failed to capture Boomerang frames. Please try again.", duration: 3000 });
    }
    clearModal();
  }, [clearModal]);

  const handleBoomerangRetake = useCallback((_error: any | undefined) => { 
    setBoomerangFrames([]);
    setCurrentView('BOOMERANG_CAPTURE');
    clearModal();
  }, [clearModal]);

  const handleBoomerangSave = useCallback(async () => {
    if (boomerangFrames.length === 0) {
      setModalContent({ type: 'error', message: "No Boomerang frames to save.", itemType: 'boomerang', duration: 3000 });
      return;
    }
    setModalContent({ type: 'loading', message: "Encoding Boomerang animation as GIF..." });
    try {
      const gifBlob = await boomerangFramesToGif(boomerangFrames, 15);
      setModalContent({ type: 'loading', message: "Uploading Boomerang GIF..." });
      const fileName = `boomerang_${Date.now()}.gif`;
      const qrLink = await uploadMediaToServer(gifBlob, fileName, 'video');
      setModalContent({
        type: 'qr',
        message: "Scan QR to view & download your Boomerang GIF!",
        qrData: qrLink,
        itemType: 'boomerang',
      });
    } catch (error) {
      setModalContent({ 
        type: 'error', 
        message: `Failed to save Boomerang GIF: ${(error as Error).message}`, 
        itemType: 'boomerang', 
        duration: 5000 
      });
    }
  }, [boomerangFrames, clearModal]);

  const handleVideoRecorded = useCallback((videoUrl: string, capturedFrames: string[]) => {
    setRecordedVideoUrl(videoUrl);
    setRecordedVideoFrames(capturedFrames);
    setCurrentView('VIDEO_PREVIEW');
    clearModal();
  }, [clearModal]);

  const handleVideoRetake = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl); 
    }
    setRecordedVideoUrl(null);
    setCurrentView('VIDEO_CAPTURE');
    clearModal();
  }, [clearModal, recordedVideoUrl]);

  const handleVideoSave = useCallback(async () => {
    if (!recordedVideoUrl) {
      setModalContent({ type: 'error', message: "No video to save.", itemType: 'video', duration: 3000 });
      return;
    }
    setModalContent({ type: 'loading', message: "Preparing video for upload..." });
    try {
      const videoBlob = await fetch(recordedVideoUrl).then(res => res.blob());
      const fileName = `photobooth_video_${Date.now()}.webm`;
      setModalContent({ type: 'loading', message: "Uploading video to cloud..." });
      const qrLink = await uploadMediaToServer(videoBlob, fileName, 'video');
      setModalContent({
        type: 'qr',
        message: 'Scan QR to view & download your video!',
        qrData: qrLink,
        itemType: 'video',
      });
    } catch (error) {
      setModalContent({ type: 'error', message: `Failed to save video: ${(error as Error).message}`, itemType: 'video', duration: 5000 });
    }
  }, [recordedVideoUrl, clearModal]);

  const handleVideoSaveAsGif = useCallback(async () => {
    if (!recordedVideoFrames || recordedVideoFrames.length === 0) {
      setModalContent({ type: 'error', message: "No captured frames to save as GIF.", itemType: 'video', duration: 3000 });
      return;
    }
    setModalContent({ type: 'loading', message: "Encoding GIF from captured frames..." });
    try {
      const gifBlob = await boomerangFramesToGif(recordedVideoFrames, 10);
      const fileName = `photobooth_video_${Date.now()}.gif`;
      setModalContent({ type: 'loading', message: "Uploading GIF to cloud..." });
      const qrLink = await uploadMediaToServer(gifBlob, fileName, 'video');
      setModalContent({ type: 'qr', qrData: qrLink, itemType: 'video', message: 'Scan QR to view & download your GIF!' });
    } catch (err) {
      setModalContent({ type: 'error', message: `Failed to save video as GIF: ${err instanceof Error ? err.message : String(err)}`, itemType: 'video', duration: 4000 });
    }
  }, [recordedVideoFrames]);

  const handleSlowMoVideoRecorded = useCallback((videoUrl: string, capturedFrames: string[]) => {
    setRecordedSlowMoVideoUrl(videoUrl);
    setRecordedSlowMoFrames(capturedFrames);
    setCurrentView('SLOWMO_PREVIEW');
    clearModal();
  }, [clearModal]);

  const handleSlowMoVideoRetake = useCallback(() => {
    if (recordedSlowMoVideoUrl) {
      URL.revokeObjectURL(recordedSlowMoVideoUrl);
    }
    setRecordedSlowMoVideoUrl(null);
    setCurrentView('SLOWMO_CAPTURE');
    clearModal();
  }, [clearModal, recordedSlowMoVideoUrl]);

  const handleSlowMoVideoSave = useCallback(async () => {
    if (!recordedSlowMoVideoUrl) {
      setModalContent({ type: 'error', message: "No slow-mo video to save.", itemType: 'slowmo', duration: 3000 });
      return;
    }
    setModalContent({ type: 'loading', message: "Preparing slow-mo video for upload..." });
    try {
      const videoBlob = await fetch(recordedSlowMoVideoUrl).then(res => res.blob());
      const fileName = `photobooth_slowmo_${Date.now()}.webm`;
      setModalContent({ type: 'loading', message: "Uploading slow-mo video to cloud..." });
      const qrLink = await uploadMediaToServer(videoBlob, fileName, 'slowmo');
      setModalContent({
        type: 'qr',
        message: 'Scan QR to view & download your GIF!',
        qrData: qrLink,
        itemType: 'slowmo',
      });
    } catch (error) {
      setModalContent({ type: 'error', message: `Failed to save slow-mo video: ${(error as Error).message}`, itemType: 'slowmo', duration: 5000 });
    }
  }, [recordedSlowMoVideoUrl, clearModal]);

  const handleSlowMoSaveAsGif = useCallback(async () => {
    if (!recordedSlowMoFrames || recordedSlowMoFrames.length === 0) {
      setModalContent({ type: 'error', message: "No captured frames to save as GIF.", itemType: 'slowmo', duration: 3000 });
      return;
    }
    setModalContent({ type: 'loading', message: "Encoding GIF from captured frames..." });
    try {
      const gifBlob = await boomerangFramesToGif(recordedSlowMoFrames, 10);
      const fileName = `photobooth_slowmo_${Date.now()}.gif`;
      setModalContent({ type: 'loading', message: "Uploading GIF to cloud..." });
      const qrLink = await uploadMediaToServer(gifBlob, fileName, 'slowmo');
      setModalContent({ type: 'qr', qrData: qrLink, itemType: 'slowmo', message: 'Scan QR to view & download your GIF!' });
    } catch (err) {
      setModalContent({ type: 'error', message: `Failed to save slow-mo as GIF: ${err instanceof Error ? err.message : String(err)}`, itemType: 'slowmo', duration: 4000 });
    }
  }, [recordedSlowMoFrames]);

  // Save handler for photo strip
  const handleSavePhotoStrip = async (stripUrl: string) => {
    setModalContent({ type: 'loading', message: 'Uploading photo strip to cloud...' });
    try {
      const qrLink = await uploadToServer(stripUrl);
      setModalContent({
        type: 'qr',
        message: 'Scan QR to view & download your photo strip!',
        qrData: qrLink,
        itemType: 'photo',
      });
    } catch (error) {
      setModalContent({
        type: 'error',
        message: `Failed to save photo strip: ${(error as Error).message}`,
        itemType: 'photo',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    if (currentView === 'EDITOR' && !capturedImage) {
      setCurrentView('CAMERA');
    }
  }, [currentView, capturedImage]);

  useEffect(() => {
    if (currentView === 'PRINTING' && !editedImage) {
      setCurrentView(capturedImage ? 'EDITOR' : 'CAMERA');
    }
  }, [currentView, editedImage, capturedImage]);

  useEffect(() => {
    if (currentView === 'BOOMERANG_PREVIEW' && boomerangFrames.length === 0) {
      setCurrentView('BOOMERANG_CAPTURE');
    }
  }, [currentView, boomerangFrames]);
  
  useEffect(() => {
    if (currentView === 'VIDEO_PREVIEW' && !recordedVideoUrl) {
      setCurrentView('VIDEO_CAPTURE');
    }
  }, [currentView, recordedVideoUrl]);

  useEffect(() => {
    if (currentView === 'SLOWMO_PREVIEW' && !recordedSlowMoVideoUrl) {
      setCurrentView('SLOWMO_CAPTURE');
    }
  }, [currentView, recordedSlowMoVideoUrl]);

  useEffect(() => {
    const validViews: ViewState[] = [
        'LANDING', 'MENU', 'CAMERA', 'EDITOR', 'PRINTING', 
        'BOOMERANG_CAPTURE', 'BOOMERANG_PREVIEW', 
        'VIDEO_CAPTURE', 'VIDEO_PREVIEW',
        'SLOWMO_CAPTURE', 'SLOWMO_PREVIEW',
        'PHOTO_STRIP'
    ];
    if (!validViews.includes(currentView)) {
      setCurrentView('MENU');
    }
  }, [currentView]);

  if (!pinUnlocked) {
    return <PinGate onUnlock={() => setPinUnlocked(true)} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'LANDING':
        return <LandingPage onComplete={handleLandingComplete} />;
      case 'MENU':
        return <MenuPage onSelectView={handleMenuSelection} />;
      case 'CAMERA':
        return <CameraView onPhotoCaptured={handlePhotoCaptured} onBackToMenu={handleBackToMenu} />;
      case 'EDITOR':
        if (!capturedImage) {
          return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Editor...</div>;
        }
        return (
          <PhotoEditor
            ref={photoEditorRef}
            baseImage={capturedImage}
            initialStickers={appliedStickers}
            onStickersChange={setAppliedStickers}
            initialFilter={activeFilter}
            onFilterChange={setActiveFilter}
            availableStickers={[...INITIAL_STICKERS, ...userStickers]}
            onAddUserSticker={handleAddUserSticker}
            onRetake={handleRetake}
            onSave={handleSavePhoto}
            onPrint={handlePrintPhoto}
            onBackToMenu={handleBackToMenu}
          />
        );
      case 'PRINTING':
        if (!editedImage) {
            return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Print View...</div>;
        }
        return <PrintView imageSrc={editedImage} onDone={handleBackToEditor} />;
      case 'BOOMERANG_CAPTURE':
        return <BoomerangCaptureView onFramesCaptured={handleBoomerangFramesCaptured} onBackToMenu={handleBackToMenu} />;
      case 'BOOMERANG_PREVIEW':
        if (boomerangFrames.length === 0) {
            return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Boomerang Preview...</div>;
        }
        return <BoomerangPreviewView frames={boomerangFrames} onRetake={handleBoomerangRetake} onSave={handleBoomerangSave} onBackToMenu={handleBackToMenu} />;
      case 'VIDEO_CAPTURE':
        return <VideoCaptureView onVideoRecorded={handleVideoRecorded} onBackToMenu={handleBackToMenu} />;
      case 'VIDEO_PREVIEW':
        if (!recordedVideoUrl) {
            return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Video Preview...</div>;
        }
        return <VideoPreviewView videoUrl={recordedVideoUrl} onRetake={handleVideoRetake} onSave={handleVideoSave} onSaveAsGif={handleVideoSaveAsGif} onBackToMenu={handleBackToMenu} />;
      case 'SLOWMO_CAPTURE':
        return <SlowMoCaptureView onVideoRecorded={handleSlowMoVideoRecorded} onBackToMenu={handleBackToMenu} />;
      case 'SLOWMO_PREVIEW':
         if (!recordedSlowMoVideoUrl) {
            return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Slow-Mo Preview...</div>;
        }
        return <SlowMoPreviewView videoUrl={recordedSlowMoVideoUrl} onRetake={handleSlowMoVideoRetake} onSave={handleSlowMoVideoSave} onSaveAsGif={handleSlowMoSaveAsGif} onBackToMenu={handleBackToMenu} />;
      case 'PHOTO_STRIP':
        return <PhotoStripView onBackToMenu={handleBackToMenu} onSave={handleSavePhotoStrip} />;
      default:
        return <MenuPage onSelectView={handleMenuSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-purple-500 selection:text-white antialiased relative">
      <div className="w-full h-full sm:h-auto sm:max-w-5xl flex-grow sm:flex-grow-0 flex items-center justify-center">
        {renderContent()}
      </div>
      {isAdmin && (
        <button
          onClick={() => setShowAdminSettings(true)}
          className="fixed top-4 right-4 z-40 p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors duration-200"
          title="Admin Settings"
        >
          <CogIcon className="w-6 h-6" />
        </button>
      )}
      {modalContent && (
        <Modal onClose={modalContent.type !== 'loading' ? clearModal : undefined}>
          {modalContent.type === 'loading' && (
            <div className="flex flex-col items-center p-4">
              <Spinner size="lg" />
              <p className="mt-4 text-lg">{modalContent.message}</p>
            </div>
          )}
          {modalContent.type === 'qr' && modalContent.qrData && (
            <div className="flex flex-col items-center text-center p-4">
              <h3 className="text-xl font-semibold mb-4">{modalContent.message}</h3>
              <div className="p-2 bg-white rounded-md inline-block shadow-lg">
                <QRCodeCanvas value={modalContent.qrData} size={256} level="H" />
              </div>
              <p className="text-sm text-slate-400 mt-3">
                {modalContent.itemType === 'photo' && "Your photo is saved to the cloud."}
                {modalContent.itemType === 'boomerang' && "Your Boomerang preview is saved. Full animation coming soon."}
                {(modalContent.itemType === 'video' || modalContent.itemType === 'slowmo') && "Your video is saved to the cloud."}
              </p>
              <Button onClick={clearModal} variant="secondary" className="mt-6 w-full sm:w-auto">Close</Button>
            </div>
          )}
          {modalContent.type === 'message' && (
            <div className="text-center p-4">
              <p className="text-lg mb-6">{modalContent.message}</p>
              <Button onClick={clearModal} variant="primary" className="w-full sm:w-auto">OK</Button>
            </div>
          )}
          {modalContent.type === 'error' && (
            <div className="text-center p-4">
               <svg className="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p className="text-lg text-red-400 mb-1 whitespace-pre-wrap">{modalContent.message}</p>
              <Button onClick={clearModal} variant="danger" className="mt-6 w-full sm:w-auto">Close</Button>
            </div>
          )}
        </Modal>
      )}
      <AdminSettingsModal
        isOpen={showAdminSettings}
        onClose={() => setShowAdminSettings(false)}
        onLogout={handleAdminLogout}
      />
    </div>
  );
};

export default PhotoboothApp; 