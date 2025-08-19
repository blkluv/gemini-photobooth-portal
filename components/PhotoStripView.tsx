import React, { useState, useRef } from 'react';
import { CameraView } from './CameraView';
import PhotoStripEditor from './PhotoStripEditor';
import PhotoStripTemplateSelector, { PhotoStripTemplate } from './PhotoStripTemplateSelector';

interface PhotoStripViewProps {
  onBackToMenu?: () => void;
  onSave?: (stripUrl: string) => void;
}

const PhotoStripView: React.FC<PhotoStripViewProps> = ({ onBackToMenu, onSave }) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PhotoStripTemplate | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle template selection
  const handleTemplateSelect = (template: PhotoStripTemplate) => {
    setSelectedTemplate(template);
  };

  // Auto-capture flow: undefined initially so first shot is manual; then increment after each capture
  const [autoSignal, setAutoSignal] = useState<number | undefined>(undefined);

  // Handle photo capture from CameraView
  const handlePhotoCaptured = (dataUrl: string) => {
    setPhotos((prev) => [...prev, dataUrl]);
    const photoCount = selectedTemplate?.photoCount || 3;
    if (currentStep < photoCount) {
      setCurrentStep((prev) => prev + 1);
      // trigger next capture automatically (start auto only after the first picture)
      setAutoSignal((s) => (typeof s === 'number' ? s + 1 : 1));
    } else {
      setIsEditing(true);
    }
  };

  // Reset the strip
  const handleRetake = () => {
    setPhotos([]);
    setCurrentStep(1);
    setIsEditing(false);
    setSelectedTemplate(null);
    setAutoSignal(undefined);
  };

  // Handle save from editor
  const handleSaveFromEditor = (stripUrl: string) => {
    if (onSave) {
      onSave(stripUrl);
    }
  };

  // Handle print from editor
  const handlePrintFromEditor = (stripUrl: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photo Strip</title>
          <style>
            body { 
              margin: 0; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              background: #fff; 
            }
            img { 
              width: 320px; 
              height: 960px; 
              object-fit: contain; 
              border: 2px solid #000; 
              background: #fff; 
            }
            @media print {
              body { background: #fff !important; }
              img { 
                width: 100%; 
                height: auto; 
                max-width: none; 
                max-height: none; 
                border: 2px solid #000;
              }
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

  // If we're in editing mode, show the editor
  if (isEditing && selectedTemplate) {
    return (
      <PhotoStripEditor
        photos={photos}
        template={selectedTemplate}
        onBackToMenu={onBackToMenu || handleRetake}
        onSave={handleSaveFromEditor}
        onPrint={handlePrintFromEditor}
      />
    );
  }

  // If no template selected, show template selector
  if (!selectedTemplate) {
    return (
      <PhotoStripTemplateSelector
        onTemplateSelect={handleTemplateSelect}
        onBackToMenu={onBackToMenu || handleRetake}
      />
    );
  }

  // Compose the photo strip preview (individual images before final strip)
  const renderPhotoStrip = () => {
    const isLandscape = selectedTemplate?.layout === 'landscape';
    const containerClass = isLandscape 
      ? 'flex flex-row items-center border-2 border-slate-300 bg-white p-4 rounded-lg shadow-md' 
      : 'flex flex-col items-center border-2 border-slate-300 bg-white p-4 rounded-lg shadow-md';
    
    return (
      <div className={containerClass}>
        {photos.map((photo, idx) => (
          <img 
            key={idx} 
            src={photo} 
            alt={`Photo ${idx + 1}`} 
            className={`object-cover bg-slate-100 rounded-md ${
              isLandscape 
                ? 'w-24 h-24 mx-1' 
                : 'w-36 h-36 mb-2'
            }`} 
          />
        ))}
        {/* Show placeholder slots for remaining photos */}
        {Array.from({ length: (selectedTemplate?.photoCount || 3) - photos.length }, (_, idx) => (
          <div 
            key={`placeholder-${idx}`} 
            className={`bg-slate-200 border-2 border-dashed border-slate-400 rounded-md flex items-center justify-center ${
              isLandscape 
                ? 'w-24 h-24 mx-1' 
                : 'w-36 h-36 mb-2'
            }`}
          >
            <span className="text-slate-500 text-sm">Photo {photos.length + idx + 1}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-800 relative">
      {/* Header */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-black bg-opacity-50 backdrop-blur-sm px-6 py-2 rounded-lg">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Photo Strip</h1>
        <p className="text-white text-sm text-center">Step {currentStep} of {selectedTemplate?.photoCount || 3}</p>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Camera View - Full screen */}
      <div className="w-full h-full relative">
        <CameraView 
          onPhotoCaptured={handlePhotoCaptured}
          onBackToMenu={onBackToMenu || handleRetake}
          autoNextCaptureSignal={autoSignal}
          isFirstCapture={currentStep === 1}
        />
      </div>
      
      {/* Vertical Template Preview - Right Side Overlay (for 3-4 image vertical templates) */}
      {selectedTemplate?.layout === 'vertical' && selectedTemplate?.photoCount >= 3 && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2 z-10 pointer-events-none">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-50 rounded-lg p-3 shadow-lg">
            <div className="grid grid-rows-4 gap-2">
              {Array.from({ length: selectedTemplate?.photoCount || 3 }, (_, idx) => (
                <div key={idx} className="relative w-20 h-24">
                  <div className={`w-full h-full border-2 border-white border-opacity-70 rounded-md bg-black bg-opacity-30 flex items-center justify-center ${
                    idx < photos.length ? 'border-green-400' : 'border-dashed'
                  }`}>
                    {idx < photos.length ? (
                      <img 
                        src={photos[idx]} 
                        alt={`Photo ${idx + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-white text-opacity-80 font-semibold text-sm">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  {idx + 1 === currentStep && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-white font-bold text-xs">{currentStep}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Landscape Template Preview - Above Snap Button (for all landscape templates) */}
      {selectedTemplate?.layout === 'landscape' && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10 pointer-events-none">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm border-2 border-white border-opacity-50 rounded-lg p-3 shadow-lg">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: selectedTemplate?.photoCount || 3 }, (_, idx) => (
                <div key={idx} className="relative w-16 h-16">
                  <div className={`w-full h-full border-2 border-white border-opacity-70 rounded-md bg-black bg-opacity-30 flex items-center justify-center ${
                    idx < photos.length ? 'border-green-400' : 'border-dashed'
                  }`}>
                    {idx < photos.length ? (
                      <img 
                        src={photos[idx]} 
                        alt={`Photo ${idx + 1}`} 
                        className="w-full h-full object-cover rounded-md"
                      />
                    ) : (
                      <span className="text-white text-opacity-80 font-semibold text-sm">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  {idx + 1 === currentStep && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                      <span className="text-white font-bold text-xs">{currentStep}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 backdrop-blur-sm px-3 py-1 rounded-lg">
            <p className="text-white text-xs text-center">
              Position yourself in the highlighted area
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoStripView; 