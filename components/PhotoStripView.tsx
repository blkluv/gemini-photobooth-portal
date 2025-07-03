import React, { useState, useRef, useEffect } from 'react';
import { CameraView } from './CameraView';
import { PHOTO_WIDTH, PHOTO_HEIGHT } from '../constants';
import { Button } from './Button';
import { SaveIcon, PrintIcon, RetakeIcon, ArrowLeftIcon } from './icons';

const PHOTO_COUNT = 3;

interface PhotoStripViewProps {
  onBackToMenu?: () => void;
}

const PhotoStripView: React.FC<PhotoStripViewProps> = ({ onBackToMenu }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [stripUrl, setStripUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle photo capture from CameraView
  const handlePhotoCaptured = (dataUrl: string) => {
    setPhotos((prev) => [...prev, dataUrl]);
    if (currentStep < PHOTO_COUNT) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsPreview(true);
    }
  };

  // Reset the strip
  const handleRetake = () => {
    setPhotos([]);
    setCurrentStep(1);
    setIsPreview(false);
    setStripUrl(null);
  };

  // Compose the photo strip when all photos are taken
  useEffect(() => {
    if (isPreview && photos.length === PHOTO_COUNT) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = PHOTO_WIDTH;
      canvas.height = PHOTO_HEIGHT * PHOTO_COUNT;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const imgPromises = photos.map(
        (src) => new Promise<HTMLImageElement>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve(img);
          img.src = src;
        })
      );
      Promise.all(imgPromises).then((imgs) => {
        imgs.forEach((img, i) => {
          ctx.drawImage(img, 0, i * PHOTO_HEIGHT, PHOTO_WIDTH, PHOTO_HEIGHT);
        });
        setStripUrl(canvas.toDataURL('image/jpeg'));
      });
    }
  }, [isPreview, photos]);

  // Print the photo strip
  const handlePrint = () => {
    if (!stripUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo Strip</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
            img { width: 320px; height: 960px; object-fit: contain; border: 2px solid #888; background: #fff; }
            @media print {
              body { background: #fff !important; }
              img { width: 100%; height: auto; max-width: none; max-height: none; }
            }
          </style>
        </head>
        <body>
          <img src="${stripUrl}" alt="Photo Strip" />
          <script>window.onload = function() { setTimeout(() => { window.print(); window.onafterprint = window.close; }, 300); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Compose the photo strip preview (individual images before final strip)
  const renderPhotoStrip = () => (
    <div className="flex flex-col items-center border-2 border-slate-300 bg-white p-4 rounded-lg shadow-md">
      {photos.map((photo, idx) => (
        <img key={idx} src={photo} alt={`Photo ${idx + 1}`} className="w-36 h-36 mb-2 object-cover bg-slate-100 rounded-md" />
      ))}
    </div>
  );

  return (
    <div className="w-full max-w-2xl flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-2xl">
      <div className="w-full flex justify-center items-center mb-6">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Photo Strip</h1>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {!isPreview ? (
        <>
          <h2 className="text-xl font-semibold text-white mb-4">Step {currentStep} of {PHOTO_COUNT}</h2>
          <CameraView 
            onPhotoCaptured={handlePhotoCaptured}
            onBackToMenu={onBackToMenu || handleRetake}
          />
          <div className="mt-6">{renderPhotoStrip()}</div>
        </>
      ) : (
        <>
          <h3 className="text-2xl font-semibold text-white mb-4">Photo Strip Preview</h3>
          <div className="flex flex-col items-center mb-6">
            {stripUrl ? (
              <img src={stripUrl} alt="Photo Strip" className="w-44 h-[540px] object-cover border-2 border-slate-400 bg-white rounded-xl shadow-lg" />
            ) : (
              <div className="text-white">Composing strip...</div>
            )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center w-full mt-4">
            {onBackToMenu && (
              <Button onClick={onBackToMenu} variant="secondary">
                <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Menu
              </Button>
            )}
            <Button onClick={handleRetake} variant="secondary">
              <RetakeIcon className="w-5 h-5 mr-2" /> Retake
            </Button>
            {stripUrl && (
              <>
                <a href={stripUrl} download="photo-strip.jpg">
                  <Button variant="success">
                    <SaveIcon className="w-5 h-5 mr-2" /> Download
                  </Button>
                </a>
                <Button onClick={handlePrint} variant="special">
                  <PrintIcon className="w-5 h-5 mr-2" /> Print
                </Button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PhotoStripView; 