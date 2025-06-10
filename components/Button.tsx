
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'special';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-bold py-2 px-4 rounded-lg text-base shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-50 flex items-center justify-center";
  
  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400';
      break;
    case 'secondary':
      variantStyle = 'bg-slate-600 hover:bg-slate-500 text-white focus:ring-slate-400';
      break;
    case 'danger':
      variantStyle = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400';
      break;
    case 'success':
      variantStyle = 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-400';
      break;
    case 'special':
      variantStyle = 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white focus:ring-pink-400';
      break;
    default:
      variantStyle = 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-400';
  }

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
    