
import React from 'react';
import type { Filter } from '../types';

interface FilterPaletteProps {
  filters: Filter[];
  activeFilterId: string;
  onSelectFilter: (filter: Filter) => void;
}

export const FilterPalette: React.FC<FilterPaletteProps> = ({ filters, activeFilterId, onSelectFilter }) => {
  return (
    <div className="bg-slate-700 p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-3 text-purple-300">Filters</h3>
      <div className="grid grid-cols-3 gap-2">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelectFilter(filter)}
            className={`p-2 rounded-md text-sm font-medium transition-all duration-150 ease-in-out
              ${activeFilterId === filter.id 
                ? 'bg-purple-500 text-white ring-2 ring-purple-300 scale-105' 
                : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
              }`}
            title={filter.name}
          >
            {filter.name}
          </button>
        ))}
      </div>
    </div>
  );
};
    