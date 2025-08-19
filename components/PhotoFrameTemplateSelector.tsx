import React from 'react';
import { Button } from './Button';
import { ArrowLeftIcon } from './icons';
import { PHOTO_FRAME_TEMPLATES, PhotoFrameTemplate } from './PhotoFrameTemplates';

interface PhotoFrameTemplateSelectorProps {
  onTemplateSelect: (template: PhotoFrameTemplate) => void;
  onBackToMenu: () => void;
}

const PhotoFrameTemplateSelector: React.FC<PhotoFrameTemplateSelectorProps> = ({
  onTemplateSelect,
  onBackToMenu
}) => {
  return (
    <div className="w-full h-full flex flex-col items-center bg-slate-800 p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <Button onClick={onBackToMenu} variant="secondary">
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Choose Your Photo Frame
        </h1>
        <div style={{ width: '120px' }}></div> {/* Spacer for centering */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl">
        {PHOTO_FRAME_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className="bg-slate-700 p-6 rounded-lg shadow-lg hover:bg-slate-600 transition-colors duration-200 cursor-pointer border-2 border-transparent hover:border-purple-400"
          >
            <div className="flex flex-col items-center space-y-4">
              {/* Template Preview */}
              <div className="flex justify-center">{template.preview}</div>
              {/* Template Info */}
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">{template.name}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-300 text-sm">
          Select a frame template to start your photo experience
        </p>
      </div>
    </div>
  );
};

export default PhotoFrameTemplateSelector;
