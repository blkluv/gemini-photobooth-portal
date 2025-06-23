import React, { useState, useCallback, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { CameraView } from './components/CameraView';
import { PhotoEditor } from './components/PhotoEditor';
import { PrintView } from './components/PrintView';
import { Modal } from './components/Modal';
import { LandingPage } from './components/LandingPage';
import { MenuPage } from './components/MenuPage';
import { BoomerangCaptureView } from './components/BoomerangCaptureView';
import { BoomerangPreviewView } from './components/BoomerangPreviewView';
import { VideoCaptureView } from './components/VideoCaptureView';
import { VideoPreviewView } from './components/VideoPreviewView';
import { SlowMoCaptureView } from './components/SlowMoCaptureView';
import { SlowMoPreviewView } from './components/SlowMoPreviewView';
import type { Sticker, Filter, ModalContent } from './types';
import { ViewState } from './types';
import { 
  INITIAL_STICKERS, 
  FILTERS,
  // MAX_QR_DATA_LENGTH, // No longer directly used in handleBoomerangSave for QR data generation
  // QR_THUMBNAIL_WIDTH,
  // QR_THUMBNAIL_HEIGHT,
  // QR_THUMBNAIL_QUALITY
} from './constants';
import { generateImageWithCanvas } from './utils/imageUtils'; // Removed generateQrFriendlyThumbnail as it's not used now
import { Button } from './components/Button';
import { Spinner } from './components/Spinner';
import { boomerangFramesToWebM } from './utils/boomerangToWebm';
import { boomerangFramesToGif } from './utils/boomerangToGif';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('LANDING');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  
  const [appliedStickers, setAppliedStickers] = useState<Sticker[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>(FILTERS[0]);
  
  const [userStickers, setUserStickers] = useState<Sticker[]>([]);
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  const [boomerangFrames, setBoomerangFrames] = useState<string[]>([]);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedSlowMoVideoUrl, setRecordedSlowMoVideoUrl] = useState<string | null>(null);

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

  const handleMenuSelection = useCallback((selectedView: ViewState) => {
    setCapturedImage(null);
    setEditedImage(null);
    setAppliedStickers([]);
    setActiveFilter(FILTERS[0]);
    setBoomerangFrames([]);
    setRecordedVideoUrl(null);
    setRecordedSlowMoVideoUrl(null);
    clearModal();

    const actionableViews: ViewState[] = ['CAMERA', 'BOOMERANG_CAPTURE', 'VIDEO_CAPTURE', 'SLOWMO_CAPTURE'];
    if (actionableViews.includes(selectedView)) {
      setCurrentView(selectedView);
    } else {
        console.warn(`Invalid menu selection: ${selectedView}. Defaulting to MENU.`);
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
    // Assuming 'photo.png' is fine for boomerang first frame too, as it's an image.
    // The PHP script on server side will generate unique name.
    formData.append('image', blob, 'photo.png'); 

    let response;
    try {
      response = await fetch('https://eeelab.xyz/photobooth/upload_and_qr.php', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
    } catch (networkError) {
      console.error('Network error during image upload:', networkError);
      if (networkError instanceof TypeError && (networkError.message.toLowerCase().includes('failed to fetch') || networkError.message.toLowerCase().includes('networkerror'))) {
          throw new Error('Network error: Could not connect to the server for image upload. Please check your internet connection. The server might be down or there could be a CORS issue preventing the connection.');
      }
      throw new Error(`Network error during image upload: ${(networkError as Error).message}`);
    }

    if (!response.ok) {
      let errorMessage = `Image upload failed: Server responded with status ${response.status} (${response.statusText}).`;
      try {
        const errorData = await response.json();
        errorMessage += ` Server message: ${errorData.message || JSON.stringify(errorData)}`;
      } catch (e) {
        const textError = await response.text();
        errorMessage += ` Server response: ${textError || '(empty or non-JSON response)'}`;
      }
      console.error('Server error during image upload:', errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      if (data.success && data.qrCodeLink) {
        return data.qrCodeLink;
      } else {
        throw new Error(data.message || 'Image upload was successful, but the server returned an unexpected response format.');
      }
    } catch (jsonError) {
      console.error('Error parsing server JSON response for image upload:', jsonError);
      throw new Error('Failed to parse server response for image upload. The server might have returned invalid JSON.');
    }
  }

  // Uploads a media Blob (e.g., video)
  async function uploadMediaToServer(mediaBlob: Blob, fileName: string, mediaType: 'video' | 'slowmo'): Promise<string> {
    // Validate blob first
    if (mediaBlob.size === 0) {
      throw new Error(`Empty ${mediaType} content. No data to upload.`);
    }

    console.debug(`[UPLOAD-DEBUG] Starting ${mediaType} upload:`, {
      fileName,
      type: mediaBlob.type || 'no-type',
      size: mediaBlob.size
    });

    const formData = new FormData();
    formData.append('video', mediaBlob, fileName);

    // Debug: Check FormData content
    console.debug('[UPLOAD-DEBUG] FormData contents:', 
      Array.from(formData.entries()).map(([key, value]) => ({
        key,
        type: value instanceof Blob ? value.type : typeof value,
        size: value instanceof Blob ? value.size : String(value).length,
        name: value instanceof File ? value.name : 'not-a-file'
      }))
    );

    let response;
    try {
      console.debug('[UPLOAD-DEBUG] Sending request to server...');
      response = await fetch('https://eeelab.xyz/photobooth/uploadvideo_and_qr.php', {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
      console.debug('[UPLOAD-DEBUG] Server responded:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        type: response.type
      });
    } catch (networkError) {
      console.error(`[UPLOAD-DEBUG] Network error during ${mediaType} upload:`, networkError);
      if (networkError instanceof TypeError && (networkError.message.toLowerCase().includes('failed to fetch') || networkError.message.toLowerCase().includes('networkerror'))) {
        setModalContent({
          type: 'error',
          message: `Network error: Could not connect to server for ${mediaType} upload. Check your internet connection.`,
          itemType: mediaType,
          duration: 5000
        });
        throw new Error(`Network error: Could not connect to server for ${mediaType} upload. Check connection or CORS. Server may be down.`);
      }
      throw new Error(`Network error during ${mediaType} upload: ${(networkError as Error).message}`);
    }

    if (!response.ok) {
      let errorMessage = `Upload failed for ${mediaType}: Server responded with status ${response.status} (${response.statusText}).`;
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const rawText = await response.text();
        console.error('[DEBUG] Server returned non-JSON response:', rawText);
        setModalContent({
          type: 'error',
          message: `Server error: Non-JSON response. Server may be misconfigured.\nDetails: ${rawText.substring(0, 200)}...`,
          itemType: mediaType,
          duration: 7000
        });
        throw new Error('Server returned non-JSON response: ' + rawText);
      }
      try {
        const errorData = await response.json();
        errorMessage += ` Server message: ${errorData.message || JSON.stringify(errorData)}`;
        setModalContent({
          type: 'error',
          message: `Server error: ${errorData.message || JSON.stringify(errorData)}`,
          itemType: mediaType,
          duration: 5000
        });
      } catch (e) {
        const textError = await response.text();
        errorMessage += ` Server response: ${textError || '(empty or non-JSON response)'}`;
      }
      console.error(`Server error during ${mediaType} upload:`, errorMessage);
      throw new Error(errorMessage);
    }

    try {
      const data = await response.json();
      if (data.success && data.qrCodeLink) {
        console.debug(`[UPLOAD-DEBUG] ${mediaType} upload successful:`, {
          qrLink: data.qrCodeLink,
          message: data.message || 'No additional message'
        });
        return data.qrCodeLink;
      } else {
        console.error(`[UPLOAD-DEBUG] Server returned success=false or missing qrCodeLink:`, data);
        throw new Error(data.message || `${mediaType} upload successful, but server returned unexpected response format.`);
      }
    } catch (jsonError) {
      console.error(`Error parsing server JSON response for ${mediaType}:`, jsonError);
      throw new Error(`Failed to parse server response for ${mediaType}. Server might have returned invalid JSON.`);
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
          const qrLink = await uploadToServer(finalImage); // Uses image uploader
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
        console.error("Error saving photo:", error);
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
        console.error("Error preparing for print:", error);
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
      // Convert frames to GIF
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
      console.error("Error saving Boomerang GIF:", error);
      setModalContent({ 
        type: 'error', 
        message: `Failed to save Boomerang GIF: ${(error as Error).message}`, 
        itemType: 'boomerang', 
        duration: 5000 
      });
    }
  }, [boomerangFrames, clearModal]);

  const handleVideoRecorded = useCallback((videoUrl: string) => {
    console.log('[DIAG] handleVideoRecorded called, videoUrl:', videoUrl);
    setRecordedVideoUrl(videoUrl);
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
      setRecordedVideoUrl(qrLink); // <-- Use server URL for preview
      setModalContent({
        type: 'qr',
        message: "Scan QR to view & download your video!",
        qrData: qrLink,
        itemType: 'video',
      });
    } catch (error) {
      console.error("Error saving video:", error);
      setModalContent({ type: 'error', message: `Failed to save video: ${(error as Error).message}`, itemType: 'video', duration: 5000 });
    }
  }, [recordedVideoUrl, clearModal]);

  const handleSlowMoVideoRecorded = useCallback((videoUrl: string) => {
    console.log('[DIAG] handleSlowMoVideoRecorded called, videoUrl:', videoUrl);
    setRecordedSlowMoVideoUrl(videoUrl);
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
      setRecordedSlowMoVideoUrl(qrLink); // <-- Use server URL for preview
      setModalContent({
        type: 'qr',
        message: "Scan QR to view & download your slow-mo video!",
        qrData: qrLink,
        itemType: 'slowmo',
      });
    } catch (error) {
      console.error("Error saving slow-mo video:", error);
      setModalContent({ type: 'error', message: `Failed to save slow-mo video: ${(error as Error).message}`, itemType: 'slowmo', duration: 5000 });
    }
  }, [recordedSlowMoVideoUrl, clearModal]);

  useEffect(() => {
    if (currentView === 'EDITOR' && !capturedImage) {
      console.warn("No captured image for EDITOR view, redirecting to CAMERA.");
      setCurrentView('CAMERA');
    }
  }, [currentView, capturedImage]);

  useEffect(() => {
    if (currentView === 'PRINTING' && !editedImage) {
      console.warn("No edited image for PRINTING view, redirecting to EDITOR.");
      setCurrentView(capturedImage ? 'EDITOR' : 'CAMERA');
    }
  }, [currentView, editedImage, capturedImage]);

  useEffect(() => {
    if (currentView === 'BOOMERANG_PREVIEW' && boomerangFrames.length === 0) {
      console.warn("No frames for BOOMERANG_PREVIEW view, redirecting to BOOMERANG_CAPTURE.");
      setCurrentView('BOOMERANG_CAPTURE');
    }
  }, [currentView, boomerangFrames]);
  
  useEffect(() => {
    if (currentView === 'VIDEO_PREVIEW' && !recordedVideoUrl) {
      console.warn("No recorded video URL for VIDEO_PREVIEW view, redirecting to VIDEO_CAPTURE.");
      setCurrentView('VIDEO_CAPTURE');
    }
  }, [currentView, recordedVideoUrl]);

  useEffect(() => {
    if (currentView === 'SLOWMO_PREVIEW' && !recordedSlowMoVideoUrl) {
      console.warn("No recorded Slow-Mo video URL for SLOWMO_PREVIEW view, redirecting to SLOWMO_CAPTURE.");
      setCurrentView('SLOWMO_CAPTURE');
    }
  }, [currentView, recordedSlowMoVideoUrl]);

  useEffect(() => {
    const validViews: ViewState[] = [
        'LANDING', 'MENU', 'CAMERA', 'EDITOR', 'PRINTING', 
        'BOOMERANG_CAPTURE', 'BOOMERANG_PREVIEW', 
        'VIDEO_CAPTURE', 'VIDEO_PREVIEW',
        'SLOWMO_CAPTURE', 'SLOWMO_PREVIEW'
    ];
    if (!validViews.includes(currentView)) {
      console.warn(`Invalid view state: ${currentView}. Redirecting to MENU.`);
      setCurrentView('MENU');
    }
  }, [currentView]);

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
        return <VideoPreviewView videoUrl={recordedVideoUrl} onRetake={handleVideoRetake} onSave={handleVideoSave} onBackToMenu={handleBackToMenu} />;
      case 'SLOWMO_CAPTURE':
        return <SlowMoCaptureView onVideoRecorded={handleSlowMoVideoRecorded} onBackToMenu={handleBackToMenu} />;
      case 'SLOWMO_PREVIEW':
         if (!recordedSlowMoVideoUrl) {
            return <div className="text-white flex items-center justify-center h-screen"><Spinner /> Loading Slow-Mo Preview...</div>;
        }
        return <SlowMoPreviewView videoUrl={recordedSlowMoVideoUrl} onRetake={handleSlowMoVideoRetake} onSave={handleSlowMoVideoSave} onBackToMenu={handleBackToMenu} />;
      default:
        return <MenuPage onSelectView={handleMenuSelection} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-0 sm:p-4 selection:bg-purple-500 selection:text-white antialiased">
      <div className="w-full h-full sm:h-auto sm:max-w-5xl flex-grow sm:flex-grow-0 flex items-center justify-center">
        {renderContent()}
      </div>
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
    </div>
  );
};

export default App;
