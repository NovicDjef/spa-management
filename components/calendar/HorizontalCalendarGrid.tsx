'use client';

import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/lib/redux/services/api';
import DraggableBookingCard from './DraggableBookingCard';
import DraggableBreakCard from './DraggableBreakCard';
import { Clock, Ban, Coffee } from 'lucide-react';
import { ProfilePhotoDisplay } from '@/components/profile/ProfilePhotoDisplay';

interface HorizontalCalendarGridProps {
  date: Date;
  professionals: any[];
  bookings: Booking[];
  blocks?: any[]; // Blocages de disponibilité
  breaks?: any[]; // Pauses
  onBookingEdit: (booking: Booking) => void;
  onBookingContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
  onSlotClick: (professionalId: string, date: Date, timeSlot: string) => void;
  onSlotContextMenu?: (professionalId: string, date: Date, timeSlot: string, position: { x: number; y: number }) => void;
  onBookingMove?: (bookingId: string, newProfessionalId: string, newDate: Date, newTimeSlot: string) => void;
  onBreakMove?: (breakId: string, newProfessionalId: string, newDate: Date, newTimeSlot: string) => void;
  onBreakContextMenu?: (breakItem: any, position: { x: number; y: number }) => void;
  startHour?: number;
  endHour?: number;
}

/**
 * Grille de calendrier horizontale
 * - Professionnels en colonnes (en-tête horizontal)
 * - Heures en lignes
 * - Séparation toutes les heures
 * - Trait pointillé à 30 minutes
 */
export default function HorizontalCalendarGrid({
  date,
  professionals,
  bookings,
  blocks = [],
  breaks = [],
  onBookingEdit,
  onBookingContextMenu,
  onSlotClick,
  onSlotContextMenu,
  onBookingMove,
  onBreakMove,
  onBreakContextMenu,
  startHour = 8,
  endHour = 24,
}: HorizontalCalendarGridProps) {
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [draggedBreak, setDraggedBreak] = useState<any | null>(null);
  const [dropTarget, setDropTarget] = useState<{ professionalId: string; timeSlot: string } | null>(null);
  // Générer les créneaux horaires (par heure avec demi-heure)
  const timeSlots = useMemo(() => {
    const slots: Array<{ time: string; isHour: boolean }> = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Heure pleine
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        isHour: true,
      });
      // Demi-heure
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:30`,
        isHour: false,
      });
    }
    // Dernière heure
    slots.push({
      time: `${endHour.toString().padStart(2, '0')}:00`,
      isHour: true,
    });
    return slots;
  }, [startHour, endHour]);

  // Fonction helper pour vérifier si un créneau est bloqué
  const isSlotBlocked = (professionalId: string, timeSlot: string, blocks?: any[], breaks?: any[]) => {
    const currentDate = format(date, 'yyyy-MM-dd');

    // Vérifier les blocages de journée complète
    if (blocks) {
      const fullDayBlock = blocks.find(
        block => block.professionalId === professionalId &&
        block.date === currentDate &&
        !block.startTime && !block.endTime
      );
      if (fullDayBlock) return { type: 'block', reason: fullDayBlock.reason };
    }

    // Vérifier les blocages de période spécifique
    if (blocks) {
      const periodBlock = blocks.find(block => {
        if (block.professionalId !== professionalId || block.date !== currentDate) return false;
        if (!block.startTime || !block.endTime) return false;

        const slotTime = timeSlot;
        return slotTime >= block.startTime && slotTime < block.endTime;
      });
      if (periodBlock) return { type: 'block', reason: periodBlock.reason };
    }

    // Vérifier les pauses
    if (breaks) {
      const currentDayOfWeek = date.getDay(); // 0=Dimanche, 1=Lundi, etc.

      const breakMatch = breaks.find(br => {
        if (br.professionalId !== professionalId) return false;

        // Ignorer les pauses inactives
        if (br.isActive === false) return false;

        // Vérifier si la pause s'applique à ce jour de la semaine
        // dayOfWeek null = tous les jours
        // dayOfWeek spécifique = ce jour uniquement
        if (br.dayOfWeek !== null && br.dayOfWeek !== currentDayOfWeek) {
          return false;
        }

        const slotTime = timeSlot;
        return slotTime >= br.startTime && slotTime < br.endTime;
      });
      if (breakMatch) return { type: 'break', label: breakMatch.label };
    }

    return null;
  };

  // Calculer la position d'une réservation
  const getBookingPosition = (booking: Booking, professionalId: string) => {
    if (booking.professionalId !== professionalId) return null;

    // Utiliser startDateTime et endDateTime si disponibles (nouveau format)
    // Sinon fallback vers l'ancien format avec startTime/endTime
    const startDateTimeStr = (booking as any).startDateTime || booking.bookingDate;
    const endDateTimeStr = (booking as any).endDateTime || booking.bookingDate;

    // Parser les dates ISO correctement
    const startTime = parseISO(startDateTimeStr);
    const endTime = parseISO(endDateTimeStr);

    // Si on utilise l'ancien format (bookingDate seulement), ajouter l'heure manuellement
    if (!(booking as any).startDateTime && booking.startTime) {
      const [startHour, startMin] = booking.startTime.split(':').map(Number);
      startTime.setHours(startHour, startMin, 0, 0);
    }
    if (!(booking as any).endDateTime && booking.endTime) {
      const [endHour, endMin] = booking.endTime.split(':').map(Number);
      endTime.setHours(endHour, endMin, 0, 0);
    }

    // Vérifier que les dates sont valides
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('❌ Dates invalides pour booking:', {
        bookingId: booking.id,
        startDateTime: (booking as any).startDateTime,
        endDateTime: (booking as any).endDateTime,
        startTime: booking.startTime,
        endTime: booking.endTime,
        parsedStart: startTime,
        parsedEnd: endTime
      });
      return null;
    }

    const startHours = startTime.getHours();
    const startMinutes = startTime.getMinutes();
    const endHours = endTime.getHours();
    const endMinutes = endTime.getMinutes();

    // Calculer la position en slots (30 min = 1 slot)
    const startSlot = (startHours - startHour) * 2 + (startMinutes >= 30 ? 1 : 0);
    const endSlot = (endHours - startHour) * 2 + (endMinutes >= 30 ? 1 : 0);

    const height = (endSlot - startSlot) * 60; // 60px par slot de 30min
    const top = startSlot * 60;

    return { top, height };
  };

  // Calculer la position d'une pause
  const getBreakPosition = (breakItem: any, professionalId: string) => {
    if (breakItem.professionalId !== professionalId) return null;

    // Vérifier si cette pause s'applique à ce jour
    const currentDayOfWeek = date.getDay();
    if (breakItem.dayOfWeek !== null && breakItem.dayOfWeek !== currentDayOfWeek) {
      return null;
    }

    // Parser les heures
    const [startHours, startMinutes] = breakItem.startTime.split(':').map(Number);
    const [endHours, endMinutes] = breakItem.endTime.split(':').map(Number);

    // Calculer la position en slots (30 min = 1 slot)
    const startSlot = (startHours - startHour) * 2 + (startMinutes >= 30 ? 1 : 0);
    const endSlot = (endHours - startHour) * 2 + (endMinutes >= 30 ? 1 : 0);

    const height = (endSlot - startSlot) * 60; // 60px par slot de 30min
    const top = startSlot * 60;

    return { top, height };
  };

  // Gérer le clic sur un créneau
  const handleSlotClick = (professionalId: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    onSlotClick(professionalId, slotDate, time);
  };

  // Gérer le drag & drop pour les réservations
  const handleDragStart = (booking: Booking) => {
    setDraggedBooking(booking);
  };

  const handleDragEnd = () => {
    setDraggedBooking(null);
    setDraggedBreak(null);
    setDropTarget(null);
  };

  // Gérer le drag & drop pour les pauses
  const handleBreakDragStart = (breakItem: any) => {
    setDraggedBreak(breakItem);
  };

  const handleDragOver = (e: React.DragEvent, professionalId: string, timeSlot: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget({ professionalId, timeSlot });
  };

  const handleDragLeave = () => {
    setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent, professionalId: string, timeSlot: string) => {
    e.preventDefault();
    e.stopPropagation();

    const itemId = e.dataTransfer.getData('bookingId') || e.dataTransfer.getData('breakId');
    const type = e.dataTransfer.getData('type');

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);

    if (type === 'booking' && itemId && onBookingMove) {
      onBookingMove(itemId, professionalId, newDate, timeSlot);
    } else if (type === 'break' && itemId && onBreakMove) {
      onBreakMove(itemId, professionalId, newDate, timeSlot);
    }

    setDraggedBooking(null);
    setDraggedBreak(null);
    setDropTarget(null);
  };

  return (
    <div className="flex flex-col h-full overflow-auto bg-white">
      {/* En-tête horizontal avec les professionnels */}
      <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-300 shadow-sm">
        <div className="flex">
          {/* Colonne Heure (sticky left) */}
          <div className="sticky left-0 z-10 w-24 bg-gradient-to-r from-gray-50 to-gray-100 border-r-2 border-gray-300 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-700">
              <Clock className="w-5 h-5" />
              <span className="font-bold text-sm">Heure</span>
            </div>
          </div>

          {/* Colonnes des professionnels */}
          {professionals.map((prof) => {
            // Vérifier si ce professionnel a un blocage de journée complète
            const currentDate = format(date, 'yyyy-MM-dd');
            const fullDayBlock = blocks?.find(
              block => block.professionalId === prof.id &&
              block.date === currentDate &&
              !block.startTime && !block.endTime
            );

            return (
              <div
                key={prof.id}
                className={`w-[220px] flex-shrink-0 p-2 border-r border-gray-200 ${
                  fullDayBlock
                    ? 'bg-gradient-to-b from-red-100 to-red-50'
                    : 'bg-gradient-to-b from-spa-turquoise-50 to-white'
                }`}
              >
                {/* BANDEAU DE BLOCAGE - TRÈS VISIBLE */}
                {fullDayBlock && (
                  <div className="mb-2 -mx-2 -mt-2 px-2 py-2 bg-red-600 text-white text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-0.5">
                      <Ban className="w-4 h-4" />
                      <span className="font-bold text-xs uppercase">JOURNÉE BLOQUÉE</span>
                    </div>
                    <div className="text-[10px] font-medium">
                      {fullDayBlock.reason || 'Congé'}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 py-1">
                  {/* Photo du professionnel - Logo à côté du nom */}
                  <ProfilePhotoDisplay
                    photoUrl={prof.photoUrl || null}
                    userName={`${prof.prenom} ${prof.nom}`}
                    size="md"
                    className={`border-2 flex-shrink-0 ${
                      fullDayBlock ? 'border-red-400 opacity-60' : 'border-spa-turquoise-400'
                    }`}
                  />

                  {/* Nom du professionnel */}
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-sm truncate ${fullDayBlock ? 'text-red-700' : 'text-gray-900'}`}>
                      {prof.prenom} {prof.nom}
                    </div>
                    <div className={`text-[10px] truncate ${fullDayBlock ? 'text-red-600' : 'text-gray-500'}`}>
                      {prof.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Corps du calendrier avec les créneaux horaires */}
      <div className="flex-1 relative">
        <div className="flex">
          {/* Colonne des heures (sticky left) */}
          <div className="sticky left-0 z-10 w-24 bg-gray-50 border-r-2 border-gray-300">
            {timeSlots.map((slot, index) => (
              <div
                key={`time-${slot.time}`}
                className={`h-[60px] flex items-center justify-center font-medium ${
                  slot.isHour
                    ? 'text-gray-900 bg-gray-100 border-t-2 border-gray-300'
                    : 'text-gray-500 bg-gray-50 border-t border-dashed border-gray-300'
                }`}
              >
                {slot.isHour && (
                  <span className="text-sm">{slot.time}</span>
                )}
              </div>
            ))}
          </div>

          {/* Colonnes des professionnels avec créneaux */}
          {professionals.map((prof) => {
            // Vérifier si ce professionnel a un blocage de journée complète
            const currentDate = format(date, 'yyyy-MM-dd');
            const fullDayBlock = blocks?.find(
              block => block.professionalId === prof.id &&
              block.date === currentDate &&
              !block.startTime && !block.endTime
            );

            return (
              <div
                key={`prof-${prof.id}`}
                className={`w-[220px] flex-shrink-0 relative border-r border-gray-200 ${
                  fullDayBlock ? 'bg-red-50' : ''
                }`}
              >
              {/* Créneaux horaires */}
              {timeSlots.map((slot) => {
                const blockStatus = isSlotBlocked(prof.id, slot.time, blocks, breaks);
                const isBlocked = blockStatus?.type === 'block';
                const isBreak = blockStatus?.type === 'break';

                return (
                  <div
                    key={`slot-${prof.id}-${slot.time}`}
                    className={`h-[60px] relative transition-colors ${
                      fullDayBlock
                        ? 'bg-red-200/60 cursor-not-allowed'
                        : isBlocked
                        ? 'bg-red-500/80 cursor-not-allowed'
                        : isBreak
                        ? 'bg-orange-500/80 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      slot.isHour
                        ? 'border-t-2 border-gray-300'
                        : 'border-t border-dashed border-gray-300'
                    } ${
                      !isBlocked && !isBreak && !fullDayBlock ? 'hover:bg-spa-turquoise-50' : ''
                    } ${
                      dropTarget?.professionalId === prof.id && dropTarget?.timeSlot === slot.time
                        ? 'bg-spa-turquoise-200 border-2 border-spa-turquoise-500 shadow-inner'
                        : ''
                    }`}
                    onClick={() => {
                      if (!isBlocked && !isBreak && !fullDayBlock) {
                        handleSlotClick(prof.id, slot.time);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!isBlocked && !isBreak && !fullDayBlock && onSlotContextMenu) {
                        const [hours, minutes] = slot.time.split(':').map(Number);
                        const slotDate = new Date(date);
                        slotDate.setHours(hours, minutes, 0, 0);
                        onSlotContextMenu(
                          prof.id,
                          slotDate,
                          slot.time,
                          { x: e.clientX, y: e.clientY }
                        );
                      }
                    }}
                    onDragOver={(e) => handleDragOver(e, prof.id, slot.time)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, prof.id, slot.time)}
                  >
                    {/* Overlay pour blocage journée complète */}
                    {fullDayBlock && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex flex-col items-center gap-1 text-xs text-red-700 font-bold">
                          <Ban className="w-5 h-5" />
                          <span className="text-[10px]">{fullDayBlock.reason || 'BLOQUÉ'}</span>
                        </div>
                      </div>
                    )}

                    {/* Overlay pour blocage de période - ROUGE BIEN VISIBLE */}
                    {!fullDayBlock && isBlocked && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-1 text-xs text-white font-bold">
                          <Ban className="w-4 h-4" />
                          <span>BLOQUÉ</span>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Pauses (positionnées absolument) - z-index 15 pour être au-dessus des créneaux mais sous les réservations */}
              {!fullDayBlock && (
                <div className="absolute inset-0 pointer-events-none z-15">
                  {breaks
                    .filter((breakItem) => breakItem.isActive !== false)
                    .map((breakItem) => {
                      const position = getBreakPosition(breakItem, prof.id);
                      if (!position) return null;

                      return (
                        <div
                          key={breakItem.id}
                          className="absolute left-2 right-2 pointer-events-auto"
                          style={{
                            top: `${position.top}px`,
                            height: `${position.height}px`,
                            zIndex: 15,
                          }}
                        >
                          <DraggableBreakCard
                            breakItem={breakItem}
                            position={position}
                            onContextMenu={onBreakContextMenu || (() => {})}
                            onDragStart={handleBreakDragStart}
                            onDragEnd={handleDragEnd}
                          />
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Réservations (positionnées absolument) - z-index 20 pour être au-dessus des pauses */}
              {!fullDayBlock && (
                <div className="absolute inset-0 pointer-events-none z-10">
                {bookings
                  .filter((b) => b.professionalId === prof.id)
                  .map((booking) => {
                    const position = getBookingPosition(booking, prof.id);
                    if (!position) {
                      console.error('❌ Position null pour booking:', {
                        id: booking.id,
                        professionalId: booking.professionalId,
                        startTime: booking.startTime,
                        endTime: booking.endTime,
                        client: `${booking.client.prenom} ${booking.client.nom}`
                      });
                      return null;
                    }

                    console.log('✅ Booking affiché:', {
                      id: booking.id,
                      client: `${booking.client.prenom} ${booking.client.nom}`,
                      position,
                      professionalId: prof.id,
                      startTime: booking.startTime,
                      endTime: booking.endTime
                    });

                    return (
                      <div
                        key={booking.id}
                        className="absolute left-2 right-2 pointer-events-auto"
                        style={{
                          top: `${position.top}px`,
                          height: `${position.height}px`,
                          zIndex: 20,
                        }}
                      >
                        <DraggableBookingCard
                          booking={booking}
                          position={position}
                          onEdit={onBookingEdit}
                          onContextMenu={onBookingContextMenu}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
