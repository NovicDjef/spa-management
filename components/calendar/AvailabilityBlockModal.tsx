'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ban, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useCreateAvailabilityBlockMutation,
  type CreateAvailabilityBlockData,
} from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface AvailabilityBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId: string;
  professionalName: string;
  date: Date;
  timeSlot?: string; // Si fourni, c'est un blocage de période, sinon c'est toute la journée
  mode: 'full-day' | 'time-period';
  onSuccess: () => void;
}

/**
 * Modal pour bloquer une journée complète ou une période spécifique
 */
export default function AvailabilityBlockModal({
  isOpen,
  onClose,
  professionalId,
  professionalName,
  date,
  timeSlot,
  mode,
  onSuccess,
}: AvailabilityBlockModalProps) {
  const [reason, setReason] = useState('');
  const [startTime, setStartTime] = useState(timeSlot || '09:00');
  const [endTime, setEndTime] = useState('');
  const [blockDate, setBlockDate] = useState(format(date, 'yyyy-MM-dd'));

  const [createBlock, { isLoading }] = useCreateAvailabilityBlockMutation();

  // Initialiser les valeurs au montage
  useEffect(() => {
    if (isOpen) {
      setBlockDate(format(date, 'yyyy-MM-dd'));
      if (mode === 'time-period' && timeSlot) {
        setStartTime(timeSlot);
        // Calculer une heure de fin par défaut (2h après)
        const [hours, minutes] = timeSlot.split(':').map(Number);
        const endHours = (hours + 2) % 24;
        setEndTime(`${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }
    }
  }, [isOpen, date, timeSlot, mode]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setReason('');
      setStartTime('09:00');
      setEndTime('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const blockData: CreateAvailabilityBlockData = {
        professionalId,
        date: blockDate,
        reason: reason.trim() || undefined,
      };

      // Ajouter les heures si c'est un blocage de période
      if (mode === 'time-period') {
        if (!startTime || !endTime) {
          toast.error('Veuillez spécifier les heures de début et de fin');
          return;
        }
        blockData.startTime = startTime;
        blockData.endTime = endTime;
      }

      await createBlock(blockData).unwrap();
      toast.success(
        mode === 'full-day'
          ? 'Journée bloquée avec succès'
          : 'Période bloquée avec succès'
      );
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur lors du blocage:', error);
      const errorMessage = error.data?.message || error.message || 'Erreur lors du blocage';
      toast.error(errorMessage);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                mode === 'full-day' ? 'bg-red-100' : 'bg-amber-100'
              }`}>
                {mode === 'full-day' ? (
                  <Ban className={`w-5 h-5 ${mode === 'full-day' ? 'text-red-600' : 'text-amber-600'}`} />
                ) : (
                  <Clock className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {mode === 'full-day' ? 'Bloquer la journée' : 'Bloquer une période'}
                </h2>
                <p className="text-xs text-gray-500">
                  {professionalName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={blockDate}
                onChange={(e) => setBlockDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
            </div>

            {/* Période spécifique */}
            {mode === 'time-period' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            )}

            {/* Raison */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raison (optionnel)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Ex: Congé personnel, Formation, Rendez-vous médical..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Résumé */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">
                {mode === 'full-day' ? (
                  <>
                    <strong>Journée complète bloquée:</strong><br />
                    {format(new Date(blockDate), 'EEEE d MMMM yyyy', { locale: fr })}
                  </>
                ) : (
                  <>
                    <strong>Période bloquée:</strong><br />
                    {format(new Date(blockDate), 'EEEE d MMMM yyyy', { locale: fr })}<br />
                    De {startTime} à {endTime}
                  </>
                )}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  mode === 'full-day'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Blocage en cours...</span>
                  </>
                ) : (
                  <>
                    {mode === 'full-day' ? <Ban className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                    <span>Bloquer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
