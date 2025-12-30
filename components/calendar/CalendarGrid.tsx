'use client';

import React, { useMemo } from 'react';
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor, DragOverlay } from '@dnd-kit/core';
import TimeColumn from './TimeColumn';
import ProfessionalColumn from './ProfessionalColumn';
import BookingCard from './BookingCard';
import { generateTimeSlots, getCurrentTimePosition, assignProfessionalColors } from '@/lib/utils/calendar';
import type { Booking } from '@/lib/redux/services/api';
import { useUpdateBookingMutation } from '@/lib/redux/services/api';
import toast from 'react-hot-toast';
import { format, parse, addMinutes } from 'date-fns';

interface CalendarGridProps {
  date: Date;
  professionals: any[];
  bookings: Booking[];
  onBookingEdit: (booking: Booking) => void;
  onBookingContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
  onSlotClick: (professionalId: string, date: Date, timeSlot: string) => void;
  onSlotContextMenu?: (professionalId: string, date: Date, timeSlot: string, position: { x: number; y: number }) => void;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  slotHeight?: number;
}

/**
 * Grille principale du calendrier avec drag & drop
 */
export default function CalendarGrid({
  date,
  professionals,
  bookings,
  onBookingEdit,
  onBookingContextMenu,
  onSlotClick,
  onSlotContextMenu,
  startHour = 7,
  endHour = 24,
  intervalMinutes = 60,
  slotHeight = 60,
}: CalendarGridProps) {
  const [updateBooking] = useUpdateBookingMutation();
  const [activeBooking, setActiveBooking] = React.useState<Booking | null>(null);

  // Générer les créneaux horaires
  const timeSlots = useMemo(() => {
    return generateTimeSlots(startHour, endHour, intervalMinutes);
  }, [startHour, endHour, intervalMinutes]);

  // Calculer la position de l'heure actuelle
  const currentTimePosition = useMemo(() => {
    return getCurrentTimePosition(startHour, endHour, slotHeight, intervalMinutes);
  }, [startHour, endHour, slotHeight, intervalMinutes]);

  // Assigner des couleurs aux professionnels
  const coloredProfessionals = useMemo(() => {
    return assignProfessionalColors(professionals);
  }, [professionals]);

  // Configuration des capteurs de drag
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px de mouvement avant de commencer le drag
      },
    })
  );

  // Gérer la fin du drag
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveBooking(null);

    if (!over) return;

    const booking = active.data.current as Booking;
    const dropData = over.data.current as { professionalId?: string };

    if (!dropData?.professionalId) return;

    const newProfessionalId = dropData.professionalId;

    // Si le professionnel n'a pas changé, ne rien faire
    if (booking.professionalId === newProfessionalId) {
      return;
    }

    try {
      // Mettre à jour la réservation
      await updateBooking({
        id: booking.id,
        data: {
          professionalId: newProfessionalId,
        },
      }).unwrap();

      toast.success('Réservation déplacée avec succès');
    } catch (error: any) {
      console.error('Erreur lors du déplacement:', error);
      toast.error(error.data?.error || 'Erreur lors du déplacement de la réservation');
    }
  };

  const handleDragStart = (event: any) => {
    setActiveBooking(event.active.data.current as Booking);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex overflow-x-auto">
        {/* Colonne des heures (sticky left) */}
        <TimeColumn timeSlots={timeSlots} currentTimePosition={currentTimePosition} />

        {/* Colonnes des professionnels */}
        <div className="flex-1 flex min-w-0">
          {coloredProfessionals.map((professional) => (
            <ProfessionalColumn
              key={professional.id}
              professional={professional}
              timeSlots={timeSlots}
              bookings={bookings.filter((b) => b.professionalId === professional.id)}
              onBookingEdit={onBookingEdit}
              onBookingContextMenu={onBookingContextMenu}
              onSlotClick={(profId, timeSlot) => {
                // Convertir le timeSlot string en Date
                const [hours, minutes] = timeSlot.split(':').map(Number);
                const slotDate = new Date(date);
                slotDate.setHours(hours, minutes, 0, 0);
                onSlotClick(profId, slotDate, timeSlot);
              }}
              onSlotContextMenu={onSlotContextMenu ? (profId, timeSlot, position) => {
                // Convertir le timeSlot string en Date
                const [hours, minutes] = timeSlot.split(':').map(Number);
                const slotDate = new Date(date);
                slotDate.setHours(hours, minutes, 0, 0);
                onSlotContextMenu(profId, slotDate, timeSlot, position);
              } : undefined}
              startHour={startHour}
              slotHeight={slotHeight}
              intervalMinutes={intervalMinutes}
            />
          ))}
        </div>
      </div>

      {/* Overlay pendant le drag */}
      <DragOverlay>
        {activeBooking && (
          <div className="opacity-90 rotate-3">
            <BookingCard
              booking={activeBooking}
              position={{ top: 0, height: 80 }}
              onEdit={() => {}}
              onContextMenu={() => {}}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
