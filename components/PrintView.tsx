
import React, { useEffect, useState } from 'react';
import { Button } from './Button';
import { ArrowLeftIcon } from './icons';

interface PrintViewProps {
  imageSrc: string;
  onDone: () => void;
}

export const PrintView: React.FC<PrintViewProps> = ({ imageSrc, onDone }) => {
  const [printStatus, setPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>("idle");
  const [printMessage, setPrintMessage] = useState<string>("");
  const [printSize, setPrintSize] = useState<string>('6R');


  // Automatically send to backend print service on mount
  useEffect(() => {
    let didCancel = false;
    setPrintStatus('idle');
    setPrintMessage('');
  }, [imageSrc]);

  const handlePrint = async () => {
    setPrintStatus('printing');
    setPrintMessage('Sending to printer...');
    try {
      const res = await fetch('http://localhost:3000/api/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dslr-token': 'yourtoken',
        },
        body: JSON.stringify({ imageBase64: imageSrc, printSize }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (jsonErr) {
        data = { message: 'Unknown error from print service.' };
      }
      if (!didCancel) {
        if (res.ok) {
          setPrintStatus('success');
          setPrintMessage(data.message || 'Print job sent successfully!');
        } else {
          setPrintStatus('error');
          setPrintMessage(data.message || 'Failed to print.');
        }
      }
    } catch (err) {
      if (!didCancel) {
        setPrintStatus('error');
        setPrintMessage('Failed to connect to print service.');
      }
    }
  };

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-slate-800">
      <div id="printable-area" className="mb-8">
        <img src={imageSrc} alt="Photo to print" className="max-w-[80vw] max-h-[80vh] object-contain rounded-lg shadow-2xl" />
      </div>
      <div className="no-print flex flex-col items-center gap-4">
        <div className="flex flex-col gap-2 w-full items-center">
          {/* Print size selector */}
          <div className="flex flex-col items-center w-full mb-2">
            <label htmlFor="print-size" className="text-white text-sm mb-1">Choose print size:</label>
            <select
              id="print-size"
              value={printSize}
              onChange={e => setPrintSize(e.target.value)}
              className="rounded px-2 py-1 text-black text-sm"
              style={{ minWidth: 120 }}
            >
              <option value="4R">4R (4" x 6")</option>
              <option value="5R">5R (5" x 7")</option>
              <option value="6R">6R (6" x 8")</option>
              <option value="A4">A4</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={onDone} variant="secondary">
              <ArrowLeftIcon className="w-5 h-5 mr-2" /> Back to Editor
            </Button>
            <Button onClick={handlePrint} variant="primary" disabled={printStatus === 'printing'}>
              {printStatus === 'printing' ? 'Printing...' : 'Print'}
            </Button>
          </div>
        </div>
        {printStatus !== 'idle' && (
          <div className={`text-sm ${printStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>{printMessage}</div>
        )}
        <p className="text-slate-400 mt-4 text-sm">If the print dialog didn't appear, please use your browser's print function (Ctrl/Cmd + P).</p>
      </div>
    </div>
  );
};
    