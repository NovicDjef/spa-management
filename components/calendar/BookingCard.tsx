'use client';

import React from 'react';
import { User2, Clock } from 'lucide-react';
import type { Booking } from '@/lib/redux/services/api';
import { formatTimeRange } from '@/lib/utils/calendar';

interface BookingCardProps {
  booking: Booking;
  position: { top: number; height: number };
  onEdit: (booking: Booking) => void;
  onContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
}

/**
 * Carte de réservation affichée dans la grille du calendrier
 * TOUJOURS EN VERT pour une visibilité maximale
 */
export default function BookingCard({
  booking,
  position,
  onEdit,
  onContextMenu,
}: BookingCardProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(booking, { x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className="absolute inset-0 bg-green-500 border-l-4 border-green-700 rounded-lg shadow-lg p-2 cursor-pointer hover:bg-green-600 transition-all"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(booking);
      }}
      onContextMenu={handleContextMenu}
      style={{
        minHeight: '40px',
      }}
    >
      <div className="flex flex-col h-full justify-between text-white text-xs">
        {/* Informations client */}
        <div className="flex-1 min-h-0">
          <div className="flex items-start gap-1 mb-1">
            <User2 className="w-3 h-3 flex-shrink-0 mt-0.5" />
            <p className="font-bold truncate flex-1">
              {booking.client.prenom} {booking.client.nom}
            </p>
          </div>

          {/* Service */}
          {booking.service && (
            <p className="text-white text-xs truncate ml-4 opacity-90">
              {booking.service.name}
            </p>
          )}
        </div>

        {/* Horaire */}
        <div className="flex items-center gap-1 mt-1 text-white font-medium">
          <Clock className="w-3 h-3" />
          <span className="text-xs">
            {formatTimeRange(booking.startTime, booking.endTime)}
          </span>
        </div>
      </div>
    </div>
  );
}
