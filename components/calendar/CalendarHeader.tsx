'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Search, X, Sparkles, Coffee } from 'lucide-react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewBooking: () => void;
  onNewBreak?: () => void; // Nouveau callback pour créer une pause
  onGenerateSchedule?: () => void; // Nouveau callback pour générer les horaires
  userRole?: 'ADMIN' | 'RECEPTIONISTE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

/**
 * En-tête du calendrier avec navigation et actions
 */
export default function CalendarHeader({
  selectedDate,
  onDateChange,
  onPrevious,
  onNext,
  onToday,
  onNewBooking,
  onGenerateSchedule,
  userRole,
  searchQuery = '',
  onSearchChange,
}: CalendarHeaderProps) {
  // Seuls les ADMIN et SECRETAIRE peuvent créer des réservations
  const canCreateBooking = userRole === 'ADMIN' || userRole === 'RECEPTIONISTE';
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const handleDateClick = () => {
    // Ouvrir le date picker natif
    dateInputRef.current?.showPicker?.();
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = parse(e.target.value, 'yyyy-MM-dd', new Date());
      onDateChange(newDate);
    }
  };

  return (
    <div className="bg-white border-b-2 border-gray-200 px-4 sticky top-0 z-20 shadow-sm">
      {/* Vue normale (non recherche mobile) */}
      {!showMobileSearch && (
        <div className="flex items-center justify-between gap-2 py-3">
          {/* Navigation dates - Gauche sur desktop, centré sur mobile */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Bouton Précédent */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Jour précédent"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </motion.button>

            {/* Date cliquable */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleDateClick}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
              >
                <CalendarIcon className="w-4 h-4 text-gray-600" />
                <div className="font-semibold text-gray-900 text-xs sm:text-sm whitespace-nowrap">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
              </motion.button>

              {/* Input date caché */}
              <input
                ref={dateInputRef}
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={handleDateInputChange}
                className="absolute opacity-0 pointer-events-none"
                style={{ width: 0, height: 0 }}
              />
            </div>

            {/* Bouton Suivant */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Jour suivant"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </motion.button>
          </div>

          {/* Barre de recherche - Desktop seulement */}
          {onSearchChange && (
            <div className="hidden md:flex flex-1 max-w-xs mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Rechercher un client..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded p-1 transition-colors"
                    aria-label="Effacer la recherche"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Actions à droite */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Icône de recherche - Mobile seulement */}
            {onSearchChange && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMobileSearch(true)}
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Rechercher"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </motion.button>
            )}

            {/* Bouton Aujourd'hui */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToday}
              className="hidden sm:flex px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
            >
              Aujourd'hui
            </motion.button>

            {/* Bouton Générer Horaires - Seulement pour ADMIN et SECRETAIRE */}
            {canCreateBooking && typeof onGenerateSchedule === 'function' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onGenerateSchedule}
                className="hidden sm:flex btn-secondary items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
                title="Générer automatiquement les horaires sur 3 mois"
              >
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Générer Horaires</span>
              </motion.button>
            )}

            {/* Bouton Nouvelle réservation - Seulement pour ADMIN et SECRETAIRE */}
            {canCreateBooking && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewBooking}
                className="btn-primary flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Nouvelle Réservation</span>
                <span className="sm:hidden">Nouveau</span>
              </motion.button>
            )}

            {/* Bouton Nouvelle pause - Seulement pour ADMIN et SECRETAIRE */}
            {canCreateBooking && typeof onNewBreak === 'function' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewBreak}
                className="btn-secondary flex items-center gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2"
              >
                <Coffee className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Ajouter Pause</span>
                <span className="sm:hidden">Pause</span>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Vue recherche mobile - Plein écran */}
      {showMobileSearch && onSearchChange && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden py-3"
        >
          <div className="flex items-center gap-3">
            {/* Bouton retour */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowMobileSearch(false);
                onSearchChange('');
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Fermer la recherche"
            >
              <X className="w-5 h-5 text-gray-600" />
            </motion.button>

            {/* Barre de recherche plein écran */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un client..."
                autoFocus
                className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-gray-100 rounded p-1 transition-colors"
                  aria-label="Effacer la recherche"
                >
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
