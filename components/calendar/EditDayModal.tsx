'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Loader2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useUpdateDayAvailabilityMutation } from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface EditDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  availabilityId: string;
  professionalName: string;
  date: Date;
  currentStartTime: string; // Format HH:mm
  currentEndTime: string;   // Format HH:mm
  onSuccess: () => void;
}

/**
 * Modal pour modifier les horaires d'un jour spécifique
 */
export default function EditDayModal({
  isOpen,
  onClose,
  availabilityId,
  professionalName,
  date,
  currentStartTime,
  currentEndTime,
  onSuccess,
}: EditDayModalProps) {
  const [startTime, setStartTime] = useState(currentStartTime);
  const [endTime, setEndTime] = useState(currentEndTime);
  const [isAvailable, setIsAvailable] = useState(true);
  const [reason, setReason] = useState('');

  const [updateDay, { isLoading }] = useUpdateDayAvailabilityMutation();

  // Réinitialiser les valeurs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setStartTime(currentStartTime);
      setEndTime(currentEndTime);
      setIsAvailable(true);
      setReason('');
    }
  }, [isOpen, currentStartTime, currentEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (isAvailable && (!startTime || !endTime)) {
      toast.error('Veuillez remplir les horaires');
      return;
    }

    if (isAvailable && startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    try {
      await updateDay({
        id: availabilityId,
        data: {
          startTime: isAvailable ? startTime : undefined,
          endTime: isAvailable ? endTime : undefined,
          isAvailable,
          reason: reason || 'Horaire modifié manuellement',
        },
      }).unwrap();

      toast.success(
        <div>
          <div className="font-bold">✅ Horaire modifié avec succès !</div>
          <div className="text-sm mt-1">
            {isAvailable
              ? `${startTime} - ${endTime}`
              : 'Journée marquée comme indisponible'
            }
          </div>
        </div>,
        { duration: 4000 }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur modification horaire:', error);
      toast.error(error.data?.message || "Erreur lors de la modification de l'horaire");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Modifier l'Horaire
                </h2>
                <p className="text-sm text-gray-600">
                  {professionalName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mx-6 mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex gap-3">
              <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">
                  {format(date, 'EEEE d MMMM yyyy', { locale: fr })}
                </p>
                <p className="text-xs">
                  Horaire actuel : {currentStartTime} - {currentEndTime}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Disponible / Indisponible */}
            <div>
              <label className="label-spa">Statut de la journée</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsAvailable(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isAvailable
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Disponible</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsAvailable(false)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !isAvailable
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Indisponible</div>
                </button>
              </div>
            </div>

            {/* Horaires (seulement si disponible) */}
            {isAvailable && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">Heure de début</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-spa"
                    required
                  />
                </div>
                <div>
                  <label className="label-spa">Heure de fin</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-spa"
                    required
                  />
                </div>
              </div>
            )}

            {/* Raison (optionnel) */}
            <div>
              <label className="label-spa">Raison de la modification (optionnel)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex: Horaire ajusté, Réduction de journée..."
                className="input-spa"
              />
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Nouvel horaire</span>
              </div>
              {isAvailable ? (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">De {startTime} à {endTime}</span>
                  {startTime && endTime && (
                    <span className="text-gray-500 ml-2">
                      (
                      {Math.abs(
                        (parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])) -
                        (parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]))
                      ) / 60} heures)
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-sm text-red-700 font-medium">
                  Journée marquée comme indisponible
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Enregistrer</span>
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
