'use client';

import React, { useState } from 'react';
import { User2, Clock, GripVertical, DollarSign, Info } from 'lucide-react';
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
 * Retourne le label du statut de paiement
 */
function getPaymentStatusLabel(status: string) {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'PAID':
      return 'Payé';
    case 'PARTIAL':
      return 'Partiel';
    case 'REFUNDED':
      return 'Remboursé';
    case 'FAILED':
      return 'Échoué';
    default:
      return status;
  }
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
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getStatusColors(booking.status);
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
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`absolute inset-0 ${colors.bg} border-l-4 ${colors.border} rounded shadow-md px-2 py-1.5 cursor-move ${colors.hover} hover:shadow-lg transition-all group overflow-hidden`}
        onClick={(e) => {
          e.stopPropagation();
          onEdit(booking);
        }}
        onContextMenu={handleContextMenu}
      >
        {/* Grip indicator */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-3 h-3 text-white" />
        </div>

        <div className="flex flex-col h-full justify-start text-white">
          {/* Informations client - toujours visible */}
          <div className="flex items-center gap-1 mb-0.5">
            <User2 className="w-3 h-3 flex-shrink-0" />
            <p className="font-bold truncate text-xs leading-tight">
              {booking.client.prenom} {booking.client.nom}
            </p>
          </div>

          {/* Service - toujours visible */}
          {booking.service && (
            <p className="text-white text-xs truncate ml-4 opacity-90 leading-tight">
              {booking.service.name}
            </p>
          )}

          {/* Horaire - affiché si hauteur suffisante */}
          {position.height > 50 && (
            <div className="flex items-center gap-1 mt-1 text-white font-medium">
              <Clock className="w-3 h-3" />
              <span className="text-xs leading-tight">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </span>
            </div>
          )}

          {/* Durée - affichée si hauteur très suffisante */}
          {position.height > 80 && booking.service && (
            <div className="flex items-center gap-1 mt-0.5 text-white/80 text-xs">
              <span className="ml-4">{booking.service.duration} min</span>
            </div>
          )}
        </div>
      </div>

      {/* Tooltip détaillé au survol */}
      {showTooltip && (
        <div
          className="absolute left-full ml-2 top-0 z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 p-4 pointer-events-none"
          style={{
            maxWidth: '320px',
          }}
        >
          {/* En-tête avec statut */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
            <h3 className="font-bold text-gray-900 text-sm">Détails de la réservation</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.bg} text-white`}>
              {colors.label}
            </span>
          </div>

          {/* Informations client */}
          <div className="space-y-2 mb-3">
            <div className="flex items-start gap-2">
              <User2 className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-semibold text-gray-900">
                  {booking.client.prenom} {booking.client.nom}
                </p>
                {booking.client.phone && (
                  <p className="text-xs text-gray-600">{booking.client.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Service */}
          {booking.service && (
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 mb-1">{booking.service.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {booking.service.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {booking.service.price} $
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Horaire */}
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
            <Clock className="w-4 h-4 text-gray-500" />
            <div className="flex-1">
              <p className="text-xs text-gray-500">Horaire</p>
              <p className="font-semibold text-gray-900">
                {formatTimeRange(booking.startTime, booking.endTime)}
              </p>
            </div>
          </div>

          {/* Statut paiement */}
          {booking.payment && (
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Paiement</p>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">
                    {getPaymentStatusLabel(booking.payment.status)}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {booking.total} $
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Description / Notes spéciales */}
          {booking.specialNotes && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-gray-500 mb-1">Notes spéciales</p>
              <p className="text-sm text-gray-700">{booking.specialNotes}</p>
            </div>
          )}

          {/* Professionnel */}
          {booking.professional && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Professionnel</p>
              <p className="text-sm font-medium text-gray-900">
                {booking.professional.prenom} {booking.professional.nom}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
