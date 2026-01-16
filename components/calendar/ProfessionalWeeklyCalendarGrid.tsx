'use client';

import React, { useMemo, useState } from 'react';
import { format, addDays, startOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking } from '@/lib/redux/services/api';
import { Clock, Coffee, Ban, User } from 'lucide-react';
import { ProfilePhotoDisplay } from '@/components/profile/ProfilePhotoDisplay';
import { getStatusColor, getStatusLabel } from '@/lib/utils/calendar';

interface ProfessionalWeeklyCalendarGridProps {
  currentDate: Date;
  professional: {
    id: string;
    nom: string;
    prenom: string;
    photoUrl?: string;
    role: string;
  };
  bookings: Booking[];
  blocks?: any[]; // Blocages de disponibilité
  breaks?: any[]; // Pauses
  onBookingClick: (booking: Booking) => void;
  onBookingContextMenu: (booking: Booking, position: { x: number; y: number }) => void;
  onSlotClick: (timeSlot: string, dayOffset: number) => void;
  onSlotContextMenu?: (timeSlot: string, dayOffset: number, position: { x: number; y: number }) => void;
  startHour?: number;
  endHour?: number;
}

/**
 * Retourne les classes de couleur selon le statut de la réservation
 */
function getStatusColors(status: string) {
  switch (status) {
    case 'PENDING':
      return {
        bg: 'bg-yellow-500',
        border: 'border-yellow-700',
        hover: 'hover:bg-yellow-600',
        label: 'En attente'
      };
    case 'CONFIRMED':
      return {
        bg: 'bg-blue-500',
        border: 'border-blue-700',
        hover: 'hover:bg-blue-600',
        label: 'Confirmé'
      };
    case 'CLIENT_ARRIVED':
      return {
        bg: 'bg-purple-500',
        border: 'border-purple-700',
        hover: 'hover:bg-purple-600',
        label: 'Client arrivé'
      };
    case 'IN_PROGRESS':
      return {
        bg: 'bg-green-500',
        border: 'border-green-700',
        hover: 'hover:bg-green-600',
        label: 'En cours'
      };
    case 'COMPLETED':
      return {
        bg: 'bg-gray-500',
        border: 'border-gray-700',
        hover: 'hover:bg-gray-600',
        label: 'Terminé'
      };
    case 'NO_SHOW':
      return {
        bg: 'bg-orange-500',
        border: 'border-orange-700',
        hover: 'hover:bg-orange-600',
        label: 'Absent'
      };
    case 'CANCELLED':
      return {
        bg: 'bg-red-500',
        border: 'border-red-700',
        hover: 'hover:bg-red-600',
        label: 'Annulé'
      };
    default:
      return {
        bg: 'bg-gray-400',
        border: 'border-gray-600',
        hover: 'hover:bg-gray-500',
        label: status
      };
  }
}

/**
 * Grille de calendrier hebdomadaire pour les professionnels
 * - Jours de la semaine en horizontal (Lundi → Dimanche)
 * - Heures en vertical avec lignes pointillées pour diviser les plages horaires
 * - Affichage des réservations et pauses pour la semaine complète
 */
export default function ProfessionalWeeklyCalendarGrid({
  currentDate,
  professional,
  bookings,
  blocks = [],
  breaks = [],
  onBookingClick,
  onBookingContextMenu,
  onSlotClick,
  onSlotContextMenu,
  startHour = 8,
  endHour = 20,
}: ProfessionalWeeklyCalendarGridProps) {
  const [hoveredSlot, setHoveredSlot] = useState<{ timeSlot: string; dayOffset: number } | null>(null);

  // Générer les jours de la semaine (Lundi → Dimanche)
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Lundi
    return eachDayOfInterval({ start, end: addDays(start, 6) }); // Lundi → Dimanche
  }, [currentDate]);

  // Générer les créneaux horaires (par heure avec demi-heure pour les lignes pointillées)
  const timeSlots = useMemo(() => {
    const slots: Array<{ time: string; isHour: boolean }> = [];
    for (let hour = startHour; hour < endHour; hour++) {
      // Heure pleine
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        isHour: true,
      });
      // Demi-heure (pour la ligne pointillée)
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

  // Filtrer les réservations pour ce professionnel uniquement
  const professionalBookings = useMemo(() => {
    return bookings.filter(booking => booking.professionalId === professional.id);
  }, [bookings, professional.id]);

  // Filtrer les pauses pour ce professionnel uniquement
  const professionalBreaks = useMemo(() => {
    const filteredBreaks = breaks.filter(breakItem => breakItem.professionalId === professional.id);
    console.log('🔍 Pauses pour ce professionnel:', filteredBreaks.length, 'pauses');
    return filteredBreaks;
  }, [breaks, professional.id]);

  // Fonction pour vérifier si un créneau est bloqué
  const isSlotBlocked = (dayDate: Date, timeSlot: string) => {
    const currentDateStr = format(dayDate, 'yyyy-MM-dd');

    // Vérifier les blocages de journée complète
    const fullDayBlock = blocks.find(
      block => block.professionalId === professional.id &&
      block.date === currentDateStr &&
      !block.startTime && !block.endTime
    );
    if (fullDayBlock) {
      console.log('✅ Blocage journée complète trouvé:', fullDayBlock);
      return true;
    }

    // Vérifier les blocages de période spécifique
    const periodBlock = blocks.find(block => {
      if (block.professionalId !== professional.id || block.date !== currentDateStr) return false;
      if (!block.startTime || !block.endTime) return false;
      return timeSlot >= block.startTime && timeSlot < block.endTime;
    });
    
    if (periodBlock) {
      console.log('✅ Blocage période trouvé:', periodBlock);
    }
    
    return !!periodBlock;
  };

  // Fonction pour vérifier si un créneau a une pause
  const hasBreak = (dayDate: Date, timeSlot: string) => {
    const currentDayOfWeek = dayDate.getDay(); // 0=Dimanche, 1=Lundi, etc.

    return professionalBreaks.some(breakItem => {
      if (breakItem.professionalId !== professional.id) return false;
      
      // Vérifier si la pause s'applique à ce jour de la semaine
      if (breakItem.dayOfWeek !== null && breakItem.dayOfWeek !== currentDayOfWeek) {
        return false;
      }
      
      return timeSlot >= breakItem.startTime && timeSlot < breakItem.endTime;
    });
  };

  // Calculer la position des réservations
  const getBookingPosition = (booking: Booking) => {
    // Utiliser startDateTime et endDateTime si disponibles (nouveau format)
    const startDateTimeStr = (booking as any).startDateTime || booking.bookingDate;
    const endDateTimeStr = (booking as any).endDateTime || booking.bookingDate;

    // Parser les dates ISO
    let bookingStartDate: Date;
    let bookingEndDate: Date;

    try {
      bookingStartDate = new Date(startDateTimeStr);
      bookingEndDate = new Date(endDateTimeStr);

      // Si on utilise l'ancien format (bookingDate seulement), ajouter l'heure manuellement
      if (!(booking as any).startDateTime && booking.startTime) {
        const [startHour, startMin] = booking.startTime.split(':').map(Number);
        bookingStartDate.setHours(startHour, startMin, 0, 0);
      }
      if (!(booking as any).endDateTime && booking.endTime) {
        const [endHour, endMin] = booking.endTime.split(':').map(Number);
        bookingEndDate.setHours(endHour, endMin, 0, 0);
      }
    } catch (error) {
      console.error('❌ Erreur parsing dates:', error);
      return null;
    }

    // Vérifier que les dates sont valides
    if (isNaN(bookingStartDate.getTime()) || isNaN(bookingEndDate.getTime())) {
      console.error('❌ Dates invalides pour booking:', booking.id);
      return null;
    }

    // Calculer le jour de la semaine (0-6)
    const dayOffset = Math.floor((bookingStartDate.getTime() - weekDays[0].getTime()) / (1000 * 60 * 60 * 24));

    console.log('📊 Calcul dayOffset:', {
      'bookingStartDate': bookingStartDate.toISOString(),
      'weekDays[0]': weekDays[0].toISOString(),
      'diff (ms)': bookingStartDate.getTime() - weekDays[0].getTime(),
      'dayOffset calculé': dayOffset,
      'client': booking.client?.prenom,
    });

    if (dayOffset < 0 || dayOffset >= 7) {
      console.log('❌ dayOffset hors limites:', dayOffset);
      return null;
    }

    // Extraire heures et minutes
    const startHours = bookingStartDate.getHours();
    const startMinutes = bookingStartDate.getMinutes();
    const endHours = bookingEndDate.getHours();
    const endMinutes = bookingEndDate.getMinutes();

    // Calculer durée en minutes
    const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

    // Calculer la position en slots (30 min = 1 slot, 40px par slot)
    // Utiliser division exacte pour position précise (pas d'arrondi)
    const startSlot = (startHours - startHour) * 2 + (startMinutes / 30);

    // Calculer la hauteur en fonction de la durée
    const height = (durationMinutes / 30) * 40; // 40px par 30 minutes

    return {
      dayOffset,
      top: startSlot * 40, // 40px par timeSlot
      height: Math.max(height, 40), // Hauteur minimale de 40px
      startTime: `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`,
    };
  };

  // Calculer la position des pauses
  const getBreakPosition = (breakItem: any) => {
    // Les pauses récurrentes - nous devons les afficher pour chaque jour correspondant
    const positions = [];
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const dayDate = weekDays[dayOffset];
      const currentDayOfWeek = dayDate.getDay(); // 0=Dimanche, 1=Lundi, etc.
      
      // Vérifier si la pause s'applique à ce jour
      if (breakItem.dayOfWeek !== null && breakItem.dayOfWeek !== currentDayOfWeek) {
        continue;
      }

      const [startHours, startMinutes] = breakItem.startTime.split(':').map(Number);
      const [endHours, endMinutes] = breakItem.endTime.split(':').map(Number);
      const durationMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);

      // Calculer la position en slots (30 min = 1 slot, 40px par slot)
      // Utiliser division exacte pour position précise (pas d'arrondi)
      const startSlot = (startHours - startHour) * 2 + (startMinutes / 30);

      // Calculer la hauteur en fonction de la durée
      const height = (durationMinutes / 30) * 40; // 40px par 30 minutes

      positions.push({
        dayOffset,
        top: startSlot * 40,
        height: Math.max(height, 40),
        startTime: breakItem.startTime,
        endTime: breakItem.endTime,
        label: breakItem.label || 'PAUSE',
      });
    }
    
    return positions;
  };

  return (
    <div className="flex flex-col h-full overflow-auto bg-white border border-gray-200 rounded-lg">
      {/* En-tête avec les jours de la semaine */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-300">
        <div className="flex">
          {/* Cellule vide pour l'en-tête des heures */}
          <div className="w-24 h-16 flex items-center justify-center border-r border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 sticky left-0 z-10">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
              <Clock className="w-5 h-5" />
              <span className="text-sm">Heure</span>
            </div>
          </div>

          {/* Jours de la semaine */}
          {weekDays.map((day, index) => (
            <div key={index} className="flex-1 min-w-[120px] h-16 flex flex-col items-center justify-center border-r border-gray-200 last:border-r-0 p-2">
              <div className="text-xs font-medium text-gray-500 uppercase">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-spa-turquoise-600' : 'text-gray-900'}`}>
                {format(day, 'd')}
              </div>
              <div className="text-xs text-gray-500">
                {format(day, 'MMM', { locale: fr })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grille principale */}
      <div className="flex">
        {/* Colonne des heures (verticale) */}
        <div className="w-24 bg-gradient-to-r from-gray-50 to-gray-100 border-r border-gray-200 sticky left-0 z-10">
          {timeSlots.map((slot, index) => (
            <div key={index} className="h-20 flex items-center justify-end pr-4 relative" style={{ height: '40px' }}>
              {slot.isHour && (
                <div className="text-sm font-medium text-gray-700 mr-2">
                  {slot.time}
                </div>
              )}
              {/* Ligne pointillée pour les demi-heures */}
              {!slot.isHour && (
                <div className="absolute right-0 top-1/2 w-full border-t border-dotted border-gray-300 -translate-y-1/2"></div>
              )}
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        {weekDays.map((day, dayOffset) => (
          <div key={dayOffset} className="flex-1 min-w-[120px] border-r border-gray-200 last:border-r-0 relative">
            {timeSlots.map((slot, slotIndex) => {
              const timeSlot = slot.time;
              const isBlocked = isSlotBlocked(day, timeSlot);
              const hasBreakInSlot = hasBreak(day, timeSlot);
              const isHovered = hoveredSlot?.timeSlot === timeSlot && hoveredSlot?.dayOffset === dayOffset;

              return (
                <div
                  key={slotIndex}
                  className={`h-20 relative border-b border-gray-100 last:border-b-0`}
                  style={{ height: '40px' }}
                  onClick={() => onSlotClick(timeSlot, dayOffset)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (onSlotContextMenu) {
                      onSlotContextMenu(timeSlot, dayOffset, { x: e.clientX, y: e.clientY });
                    }
                  }}
                  onMouseEnter={() => setHoveredSlot({ timeSlot, dayOffset })}
                  onMouseLeave={() => setHoveredSlot(null)}
                >
                  {/* Indicateur de créneau disponible */}
                  {!isBlocked && !hasBreakInSlot && (
                    <div className={`absolute inset-0 ${isHovered ? 'bg-spa-turquoise-50' : 'hover:bg-gray-50'}`}></div>
                  )}

                  {/* Indicateur de blocage */}
                  {isBlocked && (
                    <div className="absolute inset-0 bg-gray-100 border border-gray-200 flex items-center justify-center">
                      <Ban className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {/* Indicateur de pause */}
                  {hasBreakInSlot && !isBlocked && (
                    <div className="absolute inset-0 bg-orange-50 border border-orange-200 flex items-center justify-center">
                      <Coffee className="w-4 h-4 text-orange-400" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Réservations pour ce jour */}
            {console.log('🔍 Réservations pour ce jour:', professionalBookings.length, 'réservations totales')}
            {professionalBookings
              .filter(booking => {
                const bookingDate = new Date(booking.startTime);
                const result = isSameDay(bookingDate, day);

                console.log('🔍 Comparaison dates:', {
                  'day (calendrier)': format(day, 'yyyy-MM-dd'),
                  'bookingDate (réservation)': format(bookingDate, 'yyyy-MM-dd'),
                  'booking.startTime': booking.startTime,
                  'isSameDay': result,
                  'client': booking.client.prenom,
                });

                if (!result) {
                  console.log('❌ Réservation filtrée (date différente)');
                }
                return result;
              })
              .map((booking) => {
                console.log('📅 Réservation affichée:', booking.client.prenom, booking.client.nom, booking.startTime, booking.endTime);
                const position = getBookingPosition(booking);
                if (!position || position.dayOffset !== dayOffset) return null;

                const colors = getStatusColors(booking.status);

                return (
                  <div
                    key={booking.id}
                    className={`absolute ${colors.bg} border-l-4 ${colors.border} rounded-md shadow-md p-2 cursor-pointer ${colors.hover} hover:shadow-lg transition-all overflow-hidden`}
                    style={{
                      top: `${position.top}px`,
                      height: `${position.height}px`,
                      left: '1px',
                      right: '1px',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBookingClick(booking);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onBookingContextMenu(booking, { x: e.clientX, y: e.clientY });
                    }}
                  >
                    <div className="flex flex-col h-full justify-between text-white">
                      {/* Partie haute - Client + Service */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <User className="w-3 h-3 flex-shrink-0" />
                          <p className="font-bold truncate text-sm leading-tight">
                            {booking.client.prenom} {booking.client.nom}
                          </p>
                        </div>
                        {booking.service && (
                          <p className="text-white/95 text-xs truncate font-medium leading-tight">
                            {booking.service.name}
                          </p>
                        )}
                      </div>

                      {/* Partie centrale - Statut paiement (pour grandes réservations) */}
                      {position.height > 100 && booking.payment && (
                        <div className="flex-1 flex items-center justify-center my-1">
                          <div className="bg-white/25 backdrop-blur-sm px-2 py-1 rounded-full">
                            <p className="text-xs font-semibold text-white">
                              {booking.payment.status === 'PAID' ? '✓ Payé' :
                               booking.payment.status === 'PENDING' ? '⏱ En attente' :
                               booking.payment.status === 'PARTIAL' ? '◐ Partiel' :
                               booking.payment.status === 'FAILED' ? '✗ Échoué' :
                               booking.payment.status}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Partie basse - Horaire + Paiement */}
                      <div className="flex-shrink-0 mt-auto">
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium leading-tight">
                              {position.startTime} - {position.endTime}
                            </span>
                          </div>
                          {/* Statut paiement compact pour petites réservations */}
                          {position.height <= 100 && booking.payment && (
                            <span className="text-xs font-bold text-white ml-2">
                              {booking.payment.status === 'PAID' ? '✓' :
                               booking.payment.status === 'PENDING' ? '⏱' :
                               booking.payment.status === 'PARTIAL' ? '◐' : '✗'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            {/* Pauses pour ce jour */}
            {professionalBreaks.flatMap(breakItem => getBreakPosition(breakItem))
              .filter(position => position?.dayOffset === dayOffset)
              .map((position, index) => (
                <div
                  key={`break-${dayOffset}-${position.startTime}-${index}`}
                  className="absolute bg-orange-500 border-l-4 border-orange-700 rounded-lg shadow-lg p-2 overflow-hidden"
                  style={{
                    top: `${position.top}px`,
                    height: `${position.height}px`,
                    left: '1px',
                    right: '1px',
                  }}
                >
                  <div className="flex flex-col h-full justify-center items-center text-white text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Coffee className="w-4 h-4" />
                      <span className="font-bold text-sm">
                        {position.label}
                      </span>
                    </div>
                    <div className="text-white/90 text-xs font-medium">
                      {position.startTime} - {position.endTime}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );
}