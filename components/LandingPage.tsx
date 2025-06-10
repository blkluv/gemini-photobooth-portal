import React, { useEffect } from 'react';

interface LandingPageProps {
  onComplete: () => void;
}

const Logo: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <circle cx="50" cy="50" r="45" stroke="url(#logoGradient)" strokeWidth="5"/>
    <circle cx="50" cy="50" r="25" fill="url(#logoGradientInner)"/>
    <path d="M50 20 L53 28 L62 29 L55 35 L58 43 L50 38 L42 43 L45 35 L38 29 L47 28 Z" fill="white" className="opacity-80 animate-pulseSlow"/>
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#a855f7', stopOpacity: 1}} />
        <stop offset="100%" style={{stopColor: '#ec4899', stopOpacity: 1}} />
      </linearGradient>
      <linearGradient id="logoGradientInner" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#ec4899', stopOpacity: 0.7}} />
        <stop offset="100%" style={{stopColor: '#a855f7', stopOpacity: 0.7}} />
      </linearGradient>
    </defs>
    <style>
      {`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-pulseSlow {
          animation: pulseSlow 3s infinite ease-in-out;
        }
      `}
    </style>
  </svg>
);


export const LandingPage: React.FC<LandingPageProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000); // 3 seconds delay

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-center p-4 animate-fadeIn">
      <Logo className="mb-8" />
      <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400">
          SnapBooth 
        </span>
      </h1>
      <p className="text-xl text-slate-300">Your Story in a Snap</p>
       <div className="absolute bottom-10 w-full flex justify-center">
        <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-loader"></div>
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes loader {
          0% { transform: translateX(-50px); opacity: 0.5; }
          50% { transform: translateX(50px); opacity: 1; }
          100% { transform: translateX(-50px); opacity: 0.5; }
        }
        .animate-loader {
          animation: loader 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};
