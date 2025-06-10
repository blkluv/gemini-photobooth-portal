
import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Tailwind color class e.g. 'border-blue-500'
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', color = 'border-purple-500' }) => {
  let sizeClasses = 'h-8 w-8';
  if (size === 'sm') sizeClasses = 'h-5 w-5';
  if (size === 'lg') sizeClasses = 'h-12 w-12';

  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-t-2 border-b-2 ${color}`}></div>
  );
};
    