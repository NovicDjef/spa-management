'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coffee, Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useUpdateBreakMutation } from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface EditBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakId: string;
  professionalName: string;
  currentDayOfWeek: number | null; // 0=Dimanche, 1=Lundi, ..., 6=Samedi, null=tous les jours
  currentStartTime: string; // Format HH:mm
  currentEndTime: string;   // Format HH:mm
  currentLabel: string;
  currentIsActive: boolean;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: null, label: 'Tous les jours' },
  { value: 1, label: 'Lundi' },
  { value: 2, label: 'Mardi' },
  { value: 3, label: 'Mercredi' },
  { value: 4, label: 'Jeudi' },
  { value: 5, label: 'Vendredi' },
  { value: 6, label: 'Samedi' },
  { value: 0, label: 'Dimanche' },
];

/**
 * Modal pour modifier une pause existante
 */
export default function EditBreakModal({
  isOpen,
  onClose,
  breakId,
  professionalName,
  currentDayOfWeek,
  currentStartTime,
  currentEndTime,
  currentLabel,
  currentIsActive,
  onSuccess,
}: EditBreakModalProps) {
  const [dayOfWeek, setDayOfWeek] = useState<number | null>(currentDayOfWeek);
  const [startTime, setStartTime] = useState(currentStartTime);
  const [endTime, setEndTime] = useState(currentEndTime);
  const [label, setLabel] = useState(currentLabel);
  const [isActive, setIsActive] = useState(currentIsActive);

  const [updateBreak, { isLoading }] = useUpdateBreakMutation();

  // Réinitialiser les valeurs à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setDayOfWeek(currentDayOfWeek);
      setStartTime(currentStartTime);
      setEndTime(currentEndTime);
      setLabel(currentLabel);
      setIsActive(currentIsActive);
    }
  }, [isOpen, currentDayOfWeek, currentStartTime, currentEndTime, currentLabel, currentIsActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!startTime || !endTime) {
      toast.error('Veuillez remplir les horaires');
      return;
    }

    if (startTime >= endTime) {
      toast.error("L'heure de fin doit être après l'heure de début");
      return;
    }

    if (!label.trim()) {
      toast.error('Veuillez donner un nom à la pause');
      return;
    }

    try {
      await updateBreak({
        id: breakId,
        data: {
          dayOfWeek,
          startTime,
          endTime,
          label,
          isActive,
        },
      }).unwrap();

      toast.success(
        <div>
          <div className="font-bold">✅ Pause modifiée avec succès !</div>
          <div className="text-sm mt-1">
            {label} : {startTime} - {endTime}
          </div>
          <div className="text-xs mt-1 text-green-700">
            {dayOfWeek !== null ? DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label : 'Tous les jours'}
            {!isActive && ' (Désactivée)'}
          </div>
        </div>,
        { duration: 4000 }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur modification pause:', error);
      toast.error(error.data?.message || 'Erreur lors de la modification de la pause');
    }
  };

  if (!isOpen) return null;

  // Calculer la durée de la pause
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0;
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return Math.abs(endMinutes - startMinutes);
  };

  const duration = calculateDuration();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Modifier la Pause
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
          <div className="mx-6 mt-6 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg">
            <div className="flex gap-3">
              <Coffee className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800">
                <p className="font-semibold mb-1">Pause actuellement :</p>
                <p className="text-xs">
                  {currentLabel} • {currentStartTime} - {currentEndTime}
                </p>
                <p className="text-xs">
                  {currentDayOfWeek !== null
                    ? DAYS_OF_WEEK.find(d => d.value === currentDayOfWeek)?.label
                    : 'Tous les jours'}
                  {!currentIsActive && ' • Désactivée'}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Nom de la pause */}
            <div>
              <label className="label-spa">Nom de la pause *</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Pause déjeuner, Pause café..."
                className="input-spa"
                required
              />
            </div>

            {/* Jour de la semaine */}
            <div>
              <label className="label-spa">Jour d'application</label>
              <select
                value={dayOfWeek === null ? 'null' : dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value === 'null' ? null : parseInt(e.target.value))}
                className="input-spa"
              >
                {DAYS_OF_WEEK.map((day) => (
                  <option key={day.value === null ? 'null' : day.value} value={day.value === null ? 'null' : day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                "Tous les jours" = la pause s'applique chaque jour de la semaine
              </p>
            </div>

            {/* Horaires */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-spa">Heure de début *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-spa"
                  required
                />
              </div>
              <div>
                <label className="label-spa">Heure de fin *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-spa"
                  required
                />
              </div>
            </div>

            {/* Activer / Désactiver */}
            <div>
              <label className="label-spa">Statut de la pause</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    isActive
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Activée</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    !isActive
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="font-semibold">Désactivée</div>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Une pause désactivée n'apparaîtra pas dans le calendrier mais sera conservée pour réactivation ultérieure
              </p>
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Nouvelle configuration</span>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">{label || 'Pause'}</span>
                </p>
                <p>
                  De {startTime} à {endTime}
                  {duration > 0 && (
                    <span className="text-gray-500 ml-2">
                      ({duration} min)
                    </span>
                  )}
                </p>
                <p className="text-gray-600">
                  {dayOfWeek !== null
                    ? DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label
                    : 'Tous les jours'}
                </p>
                <p className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isActive ? '✓ Activée' : '✗ Désactivée'}
                </p>
              </div>
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
