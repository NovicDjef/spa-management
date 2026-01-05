'use client';

import React from 'react';
import clsx from 'clsx';

interface TimeColumnProps {
  timeSlots: string[];
  currentTimePosition?: number | null;
}

/**
 * Colonne des heures affichée à gauche du calendrier
 */
export default function TimeColumn({ timeSlots, currentTimePosition }: TimeColumnProps) {
  return (
    <div className="sticky left-0 z-10 bg-gray-50 border-r-2 border-gray-300">
      {/* En-tête vide pour aligner avec les colonnes professionnels */}
      <div className="h-20 border-b-2 border-gray-300 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-500 uppercase">Heures</span>
      </div>

      {/* Créneaux horaires */}
      <div className="relative">
        {timeSlots.map((time, index) => (
          <div
            key={time}
            className={clsx(
              'calendar-slot flex items-center justify-center px-3',
              'text-sm font-medium text-gray-700',
              // Aligner les heures au centre verticalement
              'relative'
            )}
          >
            <span className="bg-gray-50 px-2">{time}</span>
          </div>
        ))}

        {/* Indicateur de l'heure actuelle */}
        {currentTimePosition !== null && currentTimePosition !== undefined && (
          <div
            className="absolute left-0 right-0 pointer-events-none z-20"
            style={{ top: `${currentTimePosition}px` }}
          >
            <div className="h-0.5 bg-red-600 relative">
              {/* Point rouge à gauche */}
              <div className="absolute -left-1 -top-1.5 w-3 h-3 rounded-full bg-red-600"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
