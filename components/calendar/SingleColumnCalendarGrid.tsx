'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, User, Ban, Coffee } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateTimeSlots, calculateBookingPosition, getStatusColor, getStatusLabel } from '@/lib/utils/calendar';
import type { Booking } from '@/lib/redux/services/api';
import clsx from 'clsx';

interface SingleColumnCalendarGridProps {
  date: Date;
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
  onSlotClick: (timeSlot: string) => void;
  onSlotContextMenu?: (timeSlot: string, position: { x: number; y: number }) => void;
  startHour?: number;
  endHour?: number;
  intervalMinutes?: number;
  slotHeight?: number;
}

/**
 * Vue calendrier optimisée pour mobile - Une seule colonne pour un professionnel
 */
export default function SingleColumnCalendarGrid({
  date,
  professional,
  bookings,
  blocks = [],
  breaks = [],
  onBookingClick,
  onBookingContextMenu,
  onSlotClick,
  onSlotContextMenu,
  startHour = 8,
  endHour = 24,
  intervalMinutes = 60,
  slotHeight = 80, // Plus grand pour mobile
}: SingleColumnCalendarGridProps) {
  // Générer les créneaux horaires
  const timeSlots = useMemo(() => {
    return generateTimeSlots(startHour, endHour, intervalMinutes);
  }, [startHour, endHour, intervalMinutes]);

  // Vérifier si la journée est bloquée
  const fullDayBlock = useMemo(() => {
    const currentDate = format(date, 'yyyy-MM-dd');
    return blocks.find(
      block => block.professionalId === professional.id &&
      block.date === currentDate &&
      !block.startTime && !block.endTime
    );
  }, [blocks, date, professional.id]);

  // Calculer les positions des réservations
  const positionedBookings = useMemo(() => {
    return bookings.map((booking) => ({
      ...booking,
      position: calculateBookingPosition(booking, startHour, slotHeight, intervalMinutes),
    }));
  }, [bookings, startHour, slotHeight, intervalMinutes]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* BANDEAU DE BLOCAGE JOURNÉE - TRÈS VISIBLE */}
      {fullDayBlock && (
        <div className="sticky top-0 z-30 bg-red-600 text-white text-center px-4 py-4 shadow-lg">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Ban className="w-6 h-6" />
            <span className="font-bold text-lg uppercase">JOURNÉE BLOQUÉE</span>
          </div>
          <div className="text-sm font-medium">
            {fullDayBlock.reason || 'Congé'}
          </div>
          <div className="text-xs mt-1 opacity-90">
            Aucune réservation possible ce jour
          </div>
        </div>
      )}

      {/* En-tête professionnel */}
      <div className={`sticky ${fullDayBlock ? 'top-[88px]' : 'top-0'} z-20 border-b-2 shadow-sm ${
        fullDayBlock
          ? 'bg-gradient-to-br from-red-100 to-red-50 border-red-300'
          : 'bg-gradient-to-br from-spa-turquoise-50 to-white border-spa-turquoise-200'
      }`}>
        {/* Badge Personnel */}
        <div className="bg-gradient-to-r from-spa-turquoise-500 to-spa-turquoise-600 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white font-semibold text-sm uppercase tracking-wide">
                📅 Mon Calendrier Personnel
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-white/90 text-spa-turquoise-700 text-xs px-3 py-1 rounded-full font-bold">
                {positionedBookings.length} RDV
              </span>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-medium">
                Mes réservations
              </span>
            </div>
          </div>
        </div>

        {/* Infos professionnel */}
        <div className="p-4">
          <div className="flex items-center gap-3">
            {/* Photo profil */}
            {professional.photoUrl ? (
              <img
                src={professional.photoUrl}
                alt={`${professional.prenom} ${professional.nom}`}
                className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-spa-turquoise-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-spa-turquoise-500 flex items-center justify-center text-white font-bold text-lg shadow-md border-2 border-spa-turquoise-200">
                {professional.prenom?.[0]}
                {professional.nom?.[0]}
              </div>
            )}

            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {professional.prenom} {professional.nom}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-spa-turquoise-100 text-spa-turquoise-700">
                  {professional.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                </span>
              </h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier */}
      <div className="flex-1 overflow-y-auto">
        {/* Message si aucune réservation */}
        {positionedBookings.length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-20 h-20 bg-spa-turquoise-100 rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="w-10 h-10 text-spa-turquoise-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune réservation aujourd'hui
            </h3>
            <p className="text-sm text-gray-600 max-w-md mb-4">
              Vous n'avez pas de rendez-vous programmés pour cette journée.
              Les nouvelles réservations qui vous seront assignées apparaîtront automatiquement ici.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-spa-turquoise-50 rounded-lg text-sm text-spa-turquoise-700 font-medium">
              <div className="w-2 h-2 bg-spa-turquoise-500 rounded-full mr-2" />
              Calendrier personnel actif
            </div>
          </div>
        )}

        <div className="relative min-h-full">
          {/* Créneaux horaires */}
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
                key={timeSlot}
                className={clsx(
                  'border-b border-gray-200 relative flex items-start px-3 py-2',
                  !isOccupied && 'hover:bg-spa-turquoise-50/30 cursor-pointer transition-colors'
                )}
                style={{ height: `${slotHeight}px` }}
                onClick={() => !isOccupied && onSlotClick(timeSlot)}
                onContextMenu={(e) => {
                  if (!isOccupied && onSlotContextMenu) {
                    e.preventDefault();
                    onSlotContextMenu(timeSlot, { x: e.clientX, y: e.clientY });
                  }
                }}
              >
                {/* Heure */}
                <div className="w-16 flex-shrink-0">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                    <Clock className="w-3 h-3" />
                    <span>{timeSlot}</span>
                  </div>
                </div>

                {/* Espace pour les réservations */}
                <div className="flex-1" />
              </div>
            );
          })}

          {/* Réservations positionnées absolument - TOUTES EN VERT */}
          {positionedBookings.map((booking) => {
            const statusLabel = getStatusLabel(booking.status);

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute left-16 right-3 bg-blue-500 border-l-4 border-blue-700 rounded-xl shadow-lg p-3 cursor-move hover:bg-blue-600 hover:shadow-xl transition-all"
                style={{
                  top: `${booking.position.top}px`,
                  height: `${Math.max(booking.position.height, slotHeight)}px`,
                }}
                onClick={() => onBookingClick(booking)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onBookingContextMenu(booking, { x: e.clientX, y: e.clientY });
                }}
              >
                {/* Infos client */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate text-white">
                        {booking.client.prenom} {booking.client.nom}
                      </p>
                      <p className="text-xs text-white/90 truncate">
                        {booking.client.telCellulaire}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Horaire */}
                <div className="flex items-center gap-2 text-xs text-white font-bold mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {format(parseISO(booking.startTime), 'HH:mm')} - {format(parseISO(booking.endTime), 'HH:mm')}
                  </span>
                </div>

                {/* Service et Statut */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-white/90 text-blue-700">
                    {booking.service?.name || (booking.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique')}
                  </span>

                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-700 text-white">
                    {statusLabel}
                  </span>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <p className="text-xs text-white/90 mt-2 line-clamp-2">
                    💬 {booking.notes}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Légende des statuts */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Légende</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-200 border border-blue-400" />
            <span className="text-gray-700">Confirmé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-200 border border-green-400" />
            <span className="text-gray-700">Arrivé</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-200 border border-emerald-500" />
            <span className="text-gray-700">En cours</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-200 border border-gray-400" />
            <span className="text-gray-700">Terminé</span>
          </div>
        </div>
      </div>
    </div>
  );
}
