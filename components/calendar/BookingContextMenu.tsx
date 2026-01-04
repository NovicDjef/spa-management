'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, CheckCircle, XCircle, UserCheck, AlertCircle } from 'lucide-react';
import type { Booking, BookingStatus } from '@/lib/redux/services/api';

interface BookingContextMenuProps {
  booking: Booking;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onDelete: (booking: Booking) => void;
  onChangeStatus: (booking: Booking, status: BookingStatus) => void;
  onClientArrived: (booking: Booking) => void;
}

/**
 * Menu contextuel affiché au clic droit sur une réservation
 */
export default function BookingContextMenu({
  booking,
  position,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
  onClientArrived,
}: BookingContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fermer à l'appui sur Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50" onClick={onClose}>
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[220px]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modifier */}
          <button
            onClick={() => {
              onEdit(booking);
              onClose();
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
          >
            <Edit className="w-4 h-4 text-gray-500" />
            <span>Modifier</span>
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Actions rapides */}
          <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
            Actions rapides
          </div>

          {/* Client arrivé */}
          {booking.status !== 'ARRIVED' && booking.status !== 'IN_PROGRESS' && booking.status !== 'COMPLETED' && (
            <button
              onClick={() => {
                onClientArrived(booking);
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-3 text-sm transition-colors"
            >
              <UserCheck className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">Client arrivé</span>
            </button>
          )}

          {/* Rendez-vous manqué */}
          {booking.status !== 'NO_SHOW' && booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <button
              onClick={() => {
                onChangeStatus(booking, 'NO_SHOW');
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-orange-50 flex items-center gap-3 text-sm transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-orange-700">Rendez-vous manqué</span>
            </button>
          )}

          {/* Annuler */}
          {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
            <button
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir annuler cette réservation?')) {
                  onChangeStatus(booking, 'CANCELLED');
                  onClose();
                }
              }}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm transition-colors"
            >
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-700">Annuler</span>
            </button>
          )}

          {/* Terminé - Toujours disponible sauf si déjà terminé ou annulé */}
          {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
            <button
              onClick={() => {
                onChangeStatus(booking, 'COMPLETED');
                onClose();
              }}
              className="w-full px-4 py-2 text-left hover:bg-green-50 flex items-center gap-3 text-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-700 font-medium">Terminer le soin</span>
            </button>
          )}

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Supprimer */}
          <button
            onClick={() => {
              if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation?')) {
                onDelete(booking);
                onClose();
              }
            }}
            className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Supprimer</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
