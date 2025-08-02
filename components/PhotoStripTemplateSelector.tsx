import React from 'react';
import { Button } from './Button';
import { ArrowLeftIcon } from './icons';

export interface PhotoStripTemplate {
  id: string;
  name: string;
  photoCount: number;
  layout: 'vertical' | 'landscape';
  width: number;
  height: number;
  preview: string; // CSS class or description
  description: string;
}

const TEMPLATES: PhotoStripTemplate[] = [
  {
    id: '3-vertical',
    name: 'Classic 3-Strip',
    photoCount: 3,
    layout: 'vertical',
    width: 320,
    height: 960,
    preview: 'grid-cols-1 grid-rows-3',
    description: 'Traditional 3-photo vertical strip'
  },
  {
    id: '4-vertical',
    name: '4-Strip Vertical',
    photoCount: 4,
    layout: 'vertical',
    width: 320,
    height: 1280,
    preview: 'grid-cols-1 grid-rows-4',
    description: '4-photo vertical strip'
  },
  {
    id: '4-landscape',
    name: '4-Strip Landscape',
    photoCount: 4,
    layout: 'landscape',
    width: 640,
    height: 320,
    preview: 'grid-cols-4 grid-rows-1',
    description: '4-photo horizontal strip'
  },
  {
    id: '3-landscape',
    name: '3-Strip Landscape',
    photoCount: 3,
    layout: 'landscape',
    width: 480,
    height: 320,
    preview: 'grid-cols-3 grid-rows-1',
    description: '3-photo horizontal strip'
  },
  {
    id: '2-uneven',
    name: '2-Strip Uneven',
    photoCount: 2,
    layout: 'landscape',
    width: 480,
    height: 320,
    preview: 'grid-cols-2 grid-rows-1',
    description: '2-photo with different sizes'
  }
];

interface PhotoStripTemplateSelectorProps {
  onTemplateSelect: (template: PhotoStripTemplate) => void;
  onBackToMenu: () => void;
}

const PhotoStripTemplateSelector: React.FC<PhotoStripTemplateSelectorProps> = ({
  onTemplateSelect,
  onBackToMenu
}) => {
  const renderTemplatePreview = (template: PhotoStripTemplate) => {
    const isLandscape = template.layout === 'landscape';
    const containerClass = isLandscape 
      ? 'w-40 h-24 bg-white rounded-lg shadow-md p-2' 
      : 'w-24 h-40 bg-white rounded-lg shadow-md p-2';
    
    const gridClass = template.preview;
    
    return (
      <div className={containerClass}>
        <div className={`grid ${gridClass} gap-1 h-full`}>
          {Array.from({ length: template.photoCount }, (_, i) => (
            <div 
              key={i} 
              className={`bg-gradient-to-br from-purple-200 to-pink-200 rounded border border-gray-300 ${
                template.id === '2-uneven' && i === 1 ? 'col-span-1 row-span-1' : ''
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-800 p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <Button onClick={onBackToMenu} variant="secondary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Choose Photo Strip Layout
        </h1>
        <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 w-full max-w-7xl">
        {TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className="bg-slate-700 p-6 rounded-lg shadow-lg hover:bg-slate-600 transition-colors duration-200 cursor-pointer border-2 border-transparent hover:border-purple-400"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Template Preview */}
              <div className="flex justify-center">
                {renderTemplatePreview(template)}
              </div>
              
              {/* Template Info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {template.description}
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Photos: {template.photoCount}</div>
                  <div>Layout: {template.layout}</div>
                  <div>Size: {template.width}×{template.height}px</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-300 text-sm">
          Select a template to start creating your photo strip
        </p>
      </div>
    </div>
  );
};

export default PhotoStripTemplateSelector; 