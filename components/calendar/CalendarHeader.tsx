'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewBooking: () => void;
  userRole?: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
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
  userRole,
}: CalendarHeaderProps) {
  // Seuls les ADMIN et SECRETAIRE peuvent créer des réservations
  const canCreateBooking = userRole === 'ADMIN' || userRole === 'SECRETAIRE';
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      <div className="flex items-center justify-between gap-4">
        {/* Navigation dates - Centré */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {/* Bouton Précédent */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Jour précédent"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </motion.button>

          {/* Date cliquable au centre */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDateClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-spa-turquoise-50 to-spa-turquoise-100 hover:from-spa-turquoise-100 hover:to-spa-turquoise-200 rounded-xl shadow-sm border-2 border-spa-turquoise-200 transition-all min-w-[320px] justify-center"
            >
              <CalendarIcon className="w-5 h-5 text-spa-turquoise-600" />
              <div className="text-center">
                <div className="font-bold text-gray-900 text-xs">
                  {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
                </div>
                <div className="text-sm text-spa-turquoise-600 font-medium">
                  Cliquez pour changer la date
                </div>
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
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </motion.button>
        </div>

        {/* Actions à droite */}
        <div className="flex items-center gap-3">
          {/* Bouton Aujourd'hui */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToday}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
          >
            Aujourd'hui
          </motion.button>

          {/* Bouton Nouvelle réservation - Seulement pour ADMIN et SECRETAIRE */}
          {canCreateBooking && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNewBooking}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nouvelle Réservation</span>
              <span className="sm:hidden">Nouveau</span>
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}
