'use client';

import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import clsx from 'clsx';
import BookingCard from './BookingCard';
import type { Booking } from '@/lib/redux/services/api';
import { calculateBookingPosition } from '@/lib/utils/calendar';

interface ProfessionalColumnProps {
  professional: {
    id: string;
    nom: string;
    prenom: string;
    photoUrl?: string;
    color?: string;
    role: string;
  };
  timeSlots: string[];
  bookings: Booking[];
  onBookingEdit: (booking: Booking) => void;
  onBookingContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
  onSlotClick: (professionalId: string, timeSlot: string) => void;
  onSlotContextMenu?: (professionalId: string, timeSlot: string, position: { x: number; y: number }) => void;
  startHour?: number;
  slotHeight?: number;
  intervalMinutes?: number;
}

/**
 * Colonne pour un professionnel affichant ses créneaux et réservations
 */
export default function ProfessionalColumn({
  professional,
  timeSlots,
  bookings,
  onBookingEdit,
  onBookingContextMenu,
  onSlotClick,
  onSlotContextMenu,
  startHour = 7,
  slotHeight = 60,
  intervalMinutes = 60,
}: ProfessionalColumnProps) {
  // Drop zone pour ce professionnel
  const { setNodeRef, isOver } = useDroppable({
    id: `prof-${professional.id}`,
    data: { professionalId: professional.id },
  });

  // Calculer les positions des réservations
  const positionedBookings = useMemo(() => {
    return bookings.map((booking) => ({
      ...booking,
      position: calculateBookingPosition(booking, startHour, slotHeight, intervalMinutes),
    }));
  }, [bookings, startHour, slotHeight, intervalMinutes]);

  return (
    <div className="relative border-r border-gray-200 last:border-r-0">
      {/* En-tête professionnel */}
      <div
        className="h-20 border-b-2 border-gray-300 p-3 flex flex-col items-center justify-center sticky top-0 z-10 bg-white"
        style={{
          backgroundColor: professional.color ? `${professional.color}10` : '#f9fafb',
        }}
      >
        {/* Photo profil */}
        {professional.photoUrl ? (
          <img
            src={professional.photoUrl}
            alt={`${professional.prenom} ${professional.nom}`}
            className="w-10 h-10 rounded-full mb-1 object-cover shadow-sm"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full mb-1 flex items-center justify-center text-white font-semibold text-sm shadow-sm"
            style={{ backgroundColor: professional.color || '#6B7280' }}
          >
            {professional.prenom?.[0]}
            {professional.nom?.[0]}
          </div>
        )}

        {/* Nom */}
        <p className="text-sm font-semibold text-gray-900 text-center truncate w-full">
          {professional.prenom} {professional.nom}
        </p>
      </div>

      {/* Zone de drop pour les réservations */}
      <div
        ref={setNodeRef}
        className={clsx(
          'relative',
          isOver && 'bg-spa-turquoise-50/50 ring-2 ring-spa-turquoise-300'
        )}
      >
        {/* Créneaux horaires cliquables */}
        {timeSlots.map((timeSlot, index) => {
          // Vérifier si ce créneau est occupé
          const isOccupied = positionedBookings.some((booking) => {
            const slotTop = index * slotHeight;
            return (
              booking.position.top <= slotTop &&
              slotTop < booking.position.top + booking.position.height
            );
          });

          return (
            <div
              key={`${professional.id}-${timeSlot}`}
              className={clsx(
                'calendar-slot',
                !isOccupied && 'calendar-empty-slot'
              )}
              onClick={() => !isOccupied && onSlotClick(professional.id, timeSlot)}
              onContextMenu={(e) => {
                if (!isOccupied && onSlotContextMenu) {
                  e.preventDefault();
                  onSlotContextMenu(professional.id, timeSlot, { x: e.clientX, y: e.clientY });
                }
              }}
            />
          );
        })}

        {/* Réservations (positionnées absolument) */}
        {positionedBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            position={booking.position}
            onEdit={onBookingEdit}
            onContextMenu={onBookingContextMenu}
          />
        ))}
      </div>
    </div>
  );
}
