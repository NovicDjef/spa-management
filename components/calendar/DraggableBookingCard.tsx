'use client';

import React from 'react';
import { User2, Clock, GripVertical } from 'lucide-react';
import type { Booking } from '@/lib/redux/services/api';
import { formatTimeRange } from '@/lib/utils/calendar';

interface DraggableBookingCardProps {
  booking: Booking;
  position: { top: number; height: number };
  onEdit: (booking: Booking) => void;
  onContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
  onDragStart?: (booking: Booking) => void;
  onDragEnd?: () => void;
}

/**
 * Carte de réservation affichée dans la grille du calendrier avec support du drag & drop
 */
export default function DraggableBookingCard({
  booking,
  position,
  onEdit,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: DraggableBookingCardProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(booking, { x: e.clientX, y: e.clientY });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    // Stocker les informations de la réservation dans le dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('bookingId', booking.id);
    e.dataTransfer.setData('type', 'booking');
    if (onDragStart) {
      onDragStart(booking);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-blue-500 border-l-4 border-blue-700 rounded-lg shadow-lg p-2 cursor-move hover:bg-blue-600 hover:shadow-xl transition-all group"
      onClick={(e) => {
        e.stopPropagation();
        onEdit(booking);
      }}
      onContextMenu={handleContextMenu}
      style={{
        minHeight: '40px',
      }}
    >
      {/* Grip indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-white" />
      </div>

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
