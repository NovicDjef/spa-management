'use client';

import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/lib/redux/services/api';
import BookingCard from './BookingCard';
import { Clock, Ban, Coffee } from 'lucide-react';

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
  startHour = 7,
  endHour = 20,
}: HorizontalCalendarGridProps) {
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

    // Parser les dates ISO correctement
    const startTime = parseISO(booking.startTime);
    const endTime = parseISO(booking.endTime);

    // Vérifier que les dates sont valides
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      console.error('❌ Dates invalides pour booking:', {
        bookingId: booking.id,
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

  // Gérer le clic sur un créneau
  const handleSlotClick = (professionalId: string, time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    onSlotClick(professionalId, slotDate, time);
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
                className={`w-[280px] flex-shrink-0 p-4 border-r border-gray-200 ${
                  fullDayBlock
                    ? 'bg-gradient-to-b from-red-100 to-red-50'
                    : 'bg-gradient-to-b from-spa-turquoise-50 to-white'
                }`}
              >
                {/* BANDEAU DE BLOCAGE - TRÈS VISIBLE */}
                {fullDayBlock && (
                  <div className="mb-3 -mx-4 -mt-4 px-4 py-3 bg-red-600 text-white text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Ban className="w-5 h-5" />
                      <span className="font-bold text-sm uppercase">JOURNÉE BLOQUÉE</span>
                    </div>
                    <div className="text-xs font-medium">
                      {fullDayBlock.reason || 'Congé'}
                    </div>
                  </div>
                )}

                <div className="flex flex-col items-center gap-2">
                  {/* Photo du professionnel */}
                  {prof.photoUrl ? (
                    <img
                      src={prof.photoUrl}
                      alt={`${prof.prenom} ${prof.nom}`}
                      className={`w-12 h-12 rounded-full object-cover border-2 ${
                        fullDayBlock ? 'border-red-400 opacity-60' : 'border-spa-turquoise-400'
                      }`}
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                      fullDayBlock
                        ? 'bg-red-200 border-red-400 opacity-60'
                        : 'bg-spa-turquoise-200 border-spa-turquoise-400'
                    }`}>
                      <span className={`font-bold text-lg ${
                        fullDayBlock ? 'text-red-700' : 'text-spa-turquoise-700'
                      }`}>
                        {prof.prenom[0]}{prof.nom[0]}
                      </span>
                    </div>
                  )}

                  {/* Nom du professionnel */}
                  <div className="text-center">
                    <div className={`font-semibold ${fullDayBlock ? 'text-red-700' : 'text-gray-900'}`}>
                      {prof.prenom} {prof.nom}
                    </div>
                    <div className={`text-xs ${fullDayBlock ? 'text-red-600' : 'text-gray-500'}`}>
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
                className={`w-[280px] flex-shrink-0 relative border-r border-gray-200 ${
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

                    {/* Overlay pour pause - ORANGE BIEN VISIBLE */}
                    {!fullDayBlock && isBreak && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="flex items-center gap-1 text-xs text-white font-bold">
                          <Coffee className="w-4 h-4" />
                          <span>{blockStatus.label || 'PAUSE'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Réservations (positionnées absolument) */}
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
                        <BookingCard
                          booking={booking}
                          position={position}
                          onEdit={onBookingEdit}
                          onContextMenu={onBookingContextMenu}
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
