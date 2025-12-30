'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Coffee } from 'lucide-react';

interface EmptySlotContextMenuProps {
  position: { x: number; y: number };
  onClose: () => void;
  onCreateBooking: () => void;
  onCreateBreak: () => void;
}

/**
 * Menu contextuel affiché au clic droit sur un emplacement vide
 */
export default function EmptySlotContextMenu({
  position,
  onClose,
  onCreateBooking,
  onCreateBreak,
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
          {/* Créer une réservation */}
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

          {/* Divider */}
          <div className="border-t border-gray-100 my-1"></div>

          {/* Ajouter une pause */}
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
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
