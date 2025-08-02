import React, { useState } from 'react';
import { Button } from './Button';

interface ColorPickerProps {
  selectedColor: string;
  onColorChange: (color: string) => void;
  title?: string;
  className?: string;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#A52A2A', // Brown
  '#808080', // Gray
  '#FFD700', // Gold
  '#C0C0C0', // Silver
];

export const ColorPicker: React.FC<ColorPickerProps> = ({ 
  selectedColor, 
  onColorChange, 
  title = "Choose Color",
  className = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        className="flex items-center space-x-2"
      >
        <div 
          className="w-6 h-6 rounded border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span>{title}</span>
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 min-w-[200px]">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-8 h-8 rounded border-2 transition-all ${
                  selectedColor === color 
                    ? 'border-gray-800 scale-110' 
                    : 'border-gray-300 hover:border-gray-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">Custom</span>
          </div>
        </div>
      )}
    </div>
  );
}; 