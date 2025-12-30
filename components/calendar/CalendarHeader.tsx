'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, addDays, subDays, startOfToday } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onNewBooking: () => void;
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
}: CalendarHeaderProps) {
  return (
    <div className="bg-white border-b-2 border-gray-200 p-4 sticky top-0 z-20 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation dates */}
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

          {/* Navigation précédent/suivant */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onPrevious}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Jour précédent"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onNext}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Jour suivant"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </motion.button>
          </div>

          {/* Date actuelle */}
          <div className="flex items-center gap-2 px-4 py-2 bg-spa-turquoise-50 rounded-lg">
            <CalendarIcon className="w-5 h-5 text-spa-turquoise-600" />
            <span className="font-semibold text-gray-900">
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>

        {/* Bouton nouvelle réservation */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNewBooking}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Réservation</span>
        </motion.button>
      </div>
    </div>
  );
}
