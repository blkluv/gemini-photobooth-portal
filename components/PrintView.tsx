
import React, { useEffect } from 'react';
import { Button } from './Button';
import { ArrowLeftIcon } from './icons';

interface PrintViewProps {
  imageSrc: string;
  onDone: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ imageSrc, onDone }) => {
  useEffect(() => {
    // Trigger print dialog when component mounts
    // A slight delay can help ensure the image is rendered.
    const timer = setTimeout(() => {
      window.print();
    }, 500); 
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800">
      <div id="printable-area" className="mb-8">
        <img src={imageSrc} alt="Photo to print" className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-2xl" />
      </div>
      <div className="no-print">
        <Button onClick={onDone} variant="secondary">
           <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Editor
        </Button>
        <p className="text-slate-400 mt-4 text-sm">If the print dialog didn't appear, please use your browser's print function (Ctrl/Cmd + P).</p>
      </div>
    </div>
  );
};
    