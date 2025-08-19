import React, { useState } from 'react';
import type { ViewState } from '../types';
import { CameraIcon, VideoCameraIcon, PlayCycleIcon, SparklesIcon, ClockIcon, PaletteIcon } from './icons';

interface MenuPageProps {
  onSelectView: (view: ViewState) => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick?: () => void;
  comingSoon?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, description, onClick, comingSoon = false }) => {
  const baseClasses = "relative group flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-700 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:shadow-2xl h-full text-center";
  const activeClasses = "hover:scale-105 hover:bg-slate-600 cursor-pointer";
  const inactiveClasses = "opacity-60 cursor-not-allowed";

  return (
    <button
      onClick={onClick}
      disabled={comingSoon}
      className={`${baseClasses} ${comingSoon ? inactiveClasses : activeClasses}`}
      aria-label={title}
      role="button"
      aria-disabled={comingSoon}
    >
      {comingSoon && (
        <span className="absolute top-2 right-2 bg-pink-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
          Coming Soon
        </span>
      )}
      <div className={`mb-4 text-purple-400 group-hover:text-pink-400 transition-colors ${comingSoon ? 'text-slate-500 group-hover:text-slate-500' : ''}`}>
        {icon}
      </div>
      <h3 className={`text-xl sm:text-2xl font-semibold mb-1 ${comingSoon ? 'text-slate-400' : 'text-white'}`}>{title}</h3>
      <p className={`text-sm ${comingSoon ? 'text-slate-500' : 'text-slate-300'}`}>{description}</p>
    </button>
  );
};

export const MenuPage: React.FC<MenuPageProps> = ({ onSelectView }) => {
  type Category = 'PHOTO' | 'VIDEO';

  const [activeCategory, setActiveCategory] = useState<Category>('PHOTO');

  const items: Array<{
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    view: ViewState;
    category: Category;
  }> = [
    {
      id: 'snap-photo',
      icon: <CameraIcon className="w-12 h-12 sm:w-16 sm:h-16" />, 
      title: 'Snap Photo',
      description: 'Capture a still photo and edit with fun stickers & filters.',
      view: 'PHOTO_FRAME_SELECTOR',
      category: 'PHOTO',
    },
    {
      id: 'photo-strip',
      icon: <SparklesIcon className="w-12 h-12 sm:w-16 sm:h-16" />,
      title: 'Photo Strip',
      description: 'Take 3 photos and print a classic photo strip.',
      view: 'PHOTO_STRIP',
      category: 'PHOTO',
    },
    {
      id: 'chroma-photo',
      icon: <PaletteIcon className="w-12 h-12 sm:w-16 sm:h-16" />,
      title: 'Green Screen Photo',
      description: 'Capture photos with chroma key for background replacement.',
      view: 'CHROMA_PHOTO',
      category: 'PHOTO',
    },
    {
      id: 'boomerang',
      icon: <PlayCycleIcon className="w-12 h-12 sm:w-16 sm:h-16" />,
      title: 'Boomerang Fun',
      description: 'Make fun, looping Boomerang-style videos.',
      view: 'BOOMERANG_CAPTURE',
      category: 'VIDEO',
    },
    {
      id: 'record-video',
      icon: <VideoCameraIcon className="w-12 h-12 sm:w-16 sm:h-16" />,
      title: 'Record Video',
      description: 'Create short video clips with audio. (Max 8s)',
      view: 'VIDEO_CAPTURE',
      category: 'VIDEO',
    },
    {
      id: 'slowmo',
      icon: <ClockIcon className="w-12 h-12 sm:w-16 sm:h-16" />,
      title: 'Slow-Mo Video',
      description: 'Capture videos and watch them in dramatic slow motion.',
      view: 'SLOWMO_CAPTURE',
      category: 'VIDEO',
    },
  ];

  const filteredItems = items.filter((item) => item.category === activeCategory);

  return (
    <div className="w-full max-w-5xl flex flex-col items-center justify-center p-4 animate-fadeIn">
      <div className="flex items-center mb-4 text-purple-300">
        <SparklesIcon className="w-10 h-10 mr-3" />
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
          Choose Your Experience
        </h1>
      </div>
      <p className="text-slate-300 mb-6 text-center text-lg">Select an option below to get started.</p>

      {/* Segmented control for categories */}
      <div role="tablist" aria-label="Media category" className="inline-flex rounded-xl overflow-hidden border border-slate-600 mb-8">
        <button
          role="tab"
          aria-selected={activeCategory === 'PHOTO'}
          className={`px-5 py-2 text-sm sm:text-base font-medium transition-colors ${
            activeCategory === 'PHOTO' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          onClick={() => setActiveCategory('PHOTO')}
        >
          Photos
        </button>
        <button
          role="tab"
          aria-selected={activeCategory === 'VIDEO'}
          className={`px-5 py-2 text-sm sm:text-base font-medium transition-colors border-l border-slate-600 ${
            activeCategory === 'VIDEO' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white'
          }`}
          onClick={() => setActiveCategory('VIDEO')}
        >
          Videos
        </button>
      </div>

      <div className="grid menu-grid gap-6 sm:gap-8 w-full">
        {filteredItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            title={item.title}
            description={item.description}
            onClick={() => {
              if (item.id === 'snap-photo') {
                console.log('Snap Photo clicked, view:', item.view);
              }
              onSelectView(item.view);
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }

        /* Landscape-friendly grid: more columns when wide */
        .menu-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        @media (min-width: 640px) { .menu-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (orientation: landscape) and (min-width: 640px) { .menu-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
      `}</style>
    </div>
  );
};