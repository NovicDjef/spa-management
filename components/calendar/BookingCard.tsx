'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import clsx from 'clsx';
import { User2, Clock } from 'lucide-react';
import type { Booking } from '@/lib/redux/services/api';
import { getStatusColor, getStatusLabel, formatTimeRange } from '@/lib/utils/calendar';

interface BookingCardProps {
  booking: Booking;
  position: { top: number; height: number };
  onEdit: (booking: Booking) => void;
  onContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
}

/**
 * Carte de réservation draggable affichée dans la grille du calendrier
 */
export default function BookingCard({
  booking,
  position,
  onEdit,
  onContextMenu,
}: BookingCardProps) {
  // Configuration du drag & drop
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: booking.id,
    data: booking,
  });

  const statusColors = getStatusColor(booking.status);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(booking, { x: e.clientX, y: e.clientY });
  };

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'calendar-booking',
        statusColors.bg,
        statusColors.border,
        // Styles supplémentaires
        'select-none',
        isDragging && 'cursor-grabbing shadow-lg ring-2 ring-spa-turquoise-400',
        !isDragging && 'cursor-grab hover:ring-2 hover:ring-spa-turquoise-200'
      )}
      style={{
        top: `${position.top}px`,
        height: `${position.height}px`,
        minHeight: '40px',
        borderLeftWidth: '4px',
      }}
      onClick={() => onEdit(booking)}
      onContextMenu={handleContextMenu}
    >
      <div className="flex flex-col h-full justify-between text-xs overflow-hidden">
        {/* Informations client */}
        <div className="flex-1 min-h-0">
          <div className="flex items-start gap-1 mb-1">
            <User2 className={clsx('w-3 h-3 flex-shrink-0 mt-0.5', statusColors.text)} />
            <p className={clsx('font-semibold truncate flex-1', statusColors.text)}>
              {booking.client.prenom} {booking.client.nom}
            </p>
          </div>

          {/* Service */}
          {booking.service && (
            <p className="text-gray-600 text-xs truncate ml-4">
              {booking.service.name}
            </p>
          )}
        </div>

        {/* Horaire et statut */}
        <div className="flex items-center justify-between mt-1 gap-1">
          <div className="flex items-center gap-1 text-gray-500">
            <Clock className="w-3 h-3" />
            <span className="text-xs">
              {formatTimeRange(booking.startTime, booking.endTime)}
            </span>
          </div>

          {/* Badge statut */}
          <span
            className={clsx(
              'px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
              statusColors.bg,
              statusColors.text
            )}
          >
            {getStatusLabel(booking.status)}
          </span>
        </div>

        {/* Notes (si présentes et si assez de hauteur) */}
        {booking.notes && position.height > 80 && (
          <p className="text-xs text-gray-500 mt-1 truncate italic">
            {booking.notes}
          </p>
        )}
      </div>
    </motion.div>
  );
}
