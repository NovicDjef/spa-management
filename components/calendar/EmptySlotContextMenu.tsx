'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coffee, Ban, Clock, Trash2, Unlock, Edit, UnlockKeyhole } from 'lucide-react';

interface EmptySlotContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onCreateBooking: () => void;
  onCreateBreak: () => void;
  onBlockFullDay?: () => void;
  onBlockTimePeriod?: () => void;
  onDeleteBreak?: () => void;
  onUnblock?: () => void; // Débloquer une journée/période
  onEditDaySchedule?: () => void; // Modifier l'horaire du jour
  onEditBreak?: () => void; // Modifier une pause
  onOpenTimeSlot?: () => void; // Ouvrir cette horaire pour les réservations
  hasExistingBreak?: boolean; // Pour afficher l'option de suppression seulement si une pause existe
  hasExistingBlock?: boolean; // Pour afficher l'option de déblocage seulement si un blocage existe
  hasAvailability?: boolean; // Pour afficher l'option de modification d'horaire du jour
  isUnavailableSlot?: boolean; // Pour afficher l'option "Ouvrir cette horaire" si la zone est grise (non disponible)
  blockReason?: string; // Raison du blocage pour l'afficher
}

/**
 * Menu contextuel affiché au clic droit sur un emplacement vide
 */
export default function EmptySlotContextMenu({
  position,
  onClose,
  onCreateBooking,
  onCreateBreak,
  onBlockFullDay,
  onBlockTimePeriod,
  onDeleteBreak,
  onUnblock,
  onEditDaySchedule,
  onEditBreak,
  onOpenTimeSlot,
  hasExistingBreak = false,
  hasExistingBlock = false,
  hasAvailability = false,
  isUnavailableSlot = false,
  blockReason,
}: EmptySlotContextMenuProps) {
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
          {/* Ouvrir cette horaire - Pour les zones grises (non disponibles) */}
          {isUnavailableSlot && onOpenTimeSlot && (
            <>
              <button
                onClick={() => {
                  onOpenTimeSlot();
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <UnlockKeyhole className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Ouvrir cette horaire</div>
                  <div className="text-xs text-gray-500">Activer ce créneau pour les réservations</div>
                </div>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
            </>
          )}

          {/* Créer une réservation */}
          {!isUnavailableSlot && (
            <button
            onClick={() => {
              onCreateBooking();
              onClose();
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-spa-turquoise-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-spa-turquoise-100 rounded-lg flex items-center justify-center">
              <Plus className="w-4 h-4 text-spa-turquoise-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Nouvelle réservation</div>
              <div className="text-xs text-gray-500">Créer un rendez-vous client</div>
            </div>
          </button>
          )}

          {/* Divider */}
          {!isUnavailableSlot && <div className="border-t border-gray-100 my-1"></div>}

          {/* Ajouter une pause */}
          {!isUnavailableSlot && (
            <button
            onClick={() => {
              onCreateBreak();
              onClose();
            }}
            className="w-full px-4 py-2.5 text-left hover:bg-orange-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
          >
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Coffee className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">Ajouter une pause</div>
              <div className="text-xs text-gray-500">Bloquer ce créneau</div>
            </div>
          </button>
          )}

          {/* Modifier l'horaire du jour (seulement si availability existe) */}
          {!isUnavailableSlot && hasAvailability && onEditDaySchedule && (
            <button
              onClick={() => {
                onEditDaySchedule();
                onClose();
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-blue-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Modifier l'horaire du jour</div>
                <div className="text-xs text-gray-500">Ajuster les heures d'ouverture</div>
              </div>
            </button>
          )}

          {/* Modifier la pause (seulement si pause existe) */}
          {!isUnavailableSlot && hasExistingBreak && onEditBreak && (
            <button
              onClick={() => {
                onEditBreak();
                onClose();
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Edit className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Modifier la pause</div>
                <div className="text-xs text-gray-500">Changer les détails de la pause</div>
              </div>
            </button>
          )}

          {/* Divider */}
          {!isUnavailableSlot && <div className="border-t border-gray-100 my-1"></div>}

          {/* Bloquer la journée complète */}
          {!isUnavailableSlot && onBlockFullDay && (
            <button
              onClick={() => {
                onBlockFullDay();
                onClose();
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Ban className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Bloquer la journée</div>
                <div className="text-xs text-gray-500">Marquer toute la journée comme indisponible</div>
              </div>
            </button>
          )}

          {/* Bloquer une période spécifique */}
          {!isUnavailableSlot && onBlockTimePeriod && (
            <button
              onClick={() => {
                onBlockTimePeriod();
                onClose();
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-amber-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Bloquer une période</div>
                <div className="text-xs text-gray-500">Bloquer une plage horaire spécifique</div>
              </div>
            </button>
          )}

          {/* Supprimer la pause (seulement si une pause existe) */}
          {!isUnavailableSlot && hasExistingBreak && onDeleteBreak && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  onDeleteBreak();
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-red-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <div className="font-medium text-red-900">Supprimer la pause</div>
                  <div className="text-xs text-gray-500">Retirer cette pause récurrente</div>
                </div>
              </button>
            </>
          )}

          {/* Débloquer (seulement si un blocage existe) */}
          {!isUnavailableSlot && hasExistingBlock && onUnblock && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  onUnblock();
                  onClose();
                }}
                className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3 text-sm text-gray-700 transition-colors"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Unlock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-green-900">Débloquer</div>
                  <div className="text-xs text-gray-500">
                    {blockReason ? `Retirer: ${blockReason}` : 'Retirer le blocage'}
                  </div>
                </div>
              </button>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
