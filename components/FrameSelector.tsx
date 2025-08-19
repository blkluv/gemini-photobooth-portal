import React from 'react';
import { PHOTO_FRAME_TEMPLATES, PhotoFrameTemplate } from './PhotoFrameTemplates';

interface FrameSelectorProps {
  selectedFrameId: string;
  onSelect: (frame: PhotoFrameTemplate) => void;
}

export const FrameSelector: React.FC<FrameSelectorProps> = ({ selectedFrameId, onSelect }) => (
  <div className="absolute top-8 right-8 z-40 bg-white bg-opacity-90 rounded-lg shadow-xl p-4 flex flex-col items-center">
    <h3 className="text-base font-bold mb-2 text-slate-700">Choose Frame</h3>
    <div className="flex gap-3">
      {PHOTO_FRAME_TEMPLATES.map((frame) => (
        <button
          key={frame.id}
          className={`rounded-lg border-2 p-1 transition-all duration-200 ${selectedFrameId === frame.id ? 'border-purple-500' : 'border-transparent'}`}
          onClick={() => onSelect(frame)}
        >
          <div className="w-12 h-16 flex items-center justify-center">{frame.preview}</div>
          <div className="text-xs text-center mt-1 text-slate-700">{frame.name}</div>
        </button>
      ))}
    </div>
  </div>
);
