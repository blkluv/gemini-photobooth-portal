import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface CustomQRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  level?: 'L' | 'M' | 'Q' | 'H';
  className?: string;
}

export const CustomQRCode: React.FC<CustomQRCodeProps> = ({
  value,
  size = 256,
  fgColor = '#000000',
  bgColor = '#FFFFFF',
  level = 'H',
  className = ''
}) => {
  return (
    <div className={`p-2 bg-white rounded-md inline-block shadow-lg ${className}`}>
      <QRCodeCanvas
        value={value}
        size={size}
        level={level}
        fgColor={fgColor}
        bgColor={bgColor}
        style={{ display: 'block' }}
      />
    </div>
  );
}; 