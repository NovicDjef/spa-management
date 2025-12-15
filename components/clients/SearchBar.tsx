'use client';

import { motion } from 'framer-motion';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  onDateChange?: (date: string) => void;
  selectedDate?: string;
  placeholder?: string;
}

export function SearchBar({
  onSearch,
  onFilterChange,
  onDateChange,
  selectedDate = '',
  placeholder = 'Rechercher par nom, email ou téléphone...',
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter);
    onFilterChange(filter);
    setShowFilters(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        {/* Barre de recherche */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-spa-rose-400 focus:ring-4 focus:ring-spa-rose-100 transition-all duration-200 outline-none bg-white"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Bouton filtres */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-6 py-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-2 ${
            showFilters || selectedFilter !== 'ALL' || selectedDate
              ? 'border-spa-rose-400 bg-spa-rose-50 text-spa-rose-700'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
          {(selectedFilter !== 'ALL' || selectedDate) && (
            <span className="w-2 h-2 bg-spa-rose-500 rounded-full"></span>
          )}
        </button>
      </div>

      {/* Filtres */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass rounded-xl p-4 space-y-4"
        >
          {/* Type de service */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Type de service</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange('ALL')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === 'ALL'
                    ? 'bg-spa-rose-500 text-white shadow-soft'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => handleFilterChange('MASSOTHERAPIE')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === 'MASSOTHERAPIE'
                    ? 'bg-spa-menthe-500 text-white shadow-soft'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Massothérapie
              </button>
              <button
                onClick={() => handleFilterChange('ESTHETIQUE')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedFilter === 'ESTHETIQUE'
                    ? 'bg-spa-lavande-500 text-white shadow-soft'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Esthétique
              </button>
            </div>
          </div>

          {/* Filtre par date */}
          {onDateChange && (
            <div className="pt-4 border-t border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-spa-turquoise-500" />
                Filtrer par date d'assignation
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="input-spa flex-1 max-w-xs"
                />
                {selectedDate && (
                  <button
                    onClick={() => onDateChange('')}
                    className="px-3 py-2 text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 hover:bg-spa-turquoise-50 rounded-lg font-medium transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Réinitialiser
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
