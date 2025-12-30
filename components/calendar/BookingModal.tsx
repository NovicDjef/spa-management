'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Loader2 } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useGetClientsQuery,
  useGetUsersQuery,
  useCreateBookingMutation,
  type Booking,
} from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot?: {
    professionalId: string;
    date: Date;
    timeSlot: string;
  } | null;
  booking?: Booking | null;
  onSuccess: () => void;
}

/**
 * Modal de création/édition de réservation
 */
export default function BookingModal({
  isOpen,
  onClose,
  selectedSlot,
  booking,
  onSuccess,
}: BookingModalProps) {
  const [clientId, setClientId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [serviceType, setServiceType] = useState<'MASSOTHERAPIE' | 'ESTHETIQUE'>('MASSOTHERAPIE');
  const [notes, setNotes] = useState('');

  const { data: clientsData } = useGetClientsQuery({});
  const { data: professionalsData } = useGetUsersQuery({
    role: serviceType === 'MASSOTHERAPIE' ? 'MASSOTHERAPEUTE' : 'ESTHETICIENNE',
  });

  const [createBooking, { isLoading }] = useCreateBookingMutation();

  const clients = clientsData?.clients || [];
  const professionals = professionalsData?.users || [];

  // Initialiser avec les données du slot sélectionné
  useEffect(() => {
    if (selectedSlot && isOpen) {
      setProfessionalId(selectedSlot.professionalId);
      setDate(format(selectedSlot.date, 'yyyy-MM-dd'));
      setStartTime(selectedSlot.timeSlot);
    }
  }, [selectedSlot, isOpen]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setClientId('');
      setProfessionalId('');
      setDate('');
      setStartTime('');
      setDuration(60);
      setNotes('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !professionalId || !date || !startTime) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Calculer l'heure de fin
      const [hours, minutes] = startTime.split(':').map(Number);
      const startDate = new Date(date);
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = addMinutes(startDate, duration);

      await createBooking({
        clientId,
        professionalId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType,
        notes: notes || undefined,
        status: 'CONFIRMED',
      }).unwrap();

      toast.success('Réservation créée avec succès!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur création réservation:', error);
      toast.error(error.data?.error || 'Erreur lors de la création de la réservation');
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
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl z-10">
            <h2 className="text-2xl font-bold text-gray-900">
              {booking ? 'Modifier la réservation' : 'Nouvelle réservation'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Type de service */}
            <div>
              <label className="label-spa">Type de service *</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setServiceType('MASSOTHERAPIE')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === 'MASSOTHERAPIE'
                      ? 'border-spa-turquoise-500 bg-spa-turquoise-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-semibold">Massothérapie</span>
                </button>
                <button
                  type="button"
                  onClick={() => setServiceType('ESTHETIQUE')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    serviceType === 'ESTHETIQUE'
                      ? 'border-spa-lavande-500 bg-spa-lavande-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="font-semibold">Esthétique</span>
                </button>
              </div>
            </div>

            {/* Client */}
            <div>
              <label className="label-spa">Client *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input-spa"
                required
              >
                <option value="">Sélectionner un client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.prenom} {client.nom} - {client.telCellulaire}
                  </option>
                ))}
              </select>
            </div>

            {/* Professionnel */}
            <div>
              <label className="label-spa">Professionnel *</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="input-spa"
                required
              >
                <option value="">Sélectionner un professionnel</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.prenom} {prof.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Date et heure */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-spa">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-spa"
                  required
                />
              </div>
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
            </div>

            {/* Durée */}
            <div>
              <label className="label-spa">Durée (minutes) *</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="input-spa"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1h30</option>
                <option value={120}>2 heures</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="label-spa">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-spa"
                placeholder="Notes spéciales..."
              />
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
              <button type="submit" className="btn-primary" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <span>Créer la réservation</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
