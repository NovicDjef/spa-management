'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Loader2, Coffee } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useGetClientsQuery,
  useGetUsersQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  type Booking,
} from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface BookingSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot?: {
    professionalId: string;
    date: Date;
    timeSlot: string;
  } | null;
  booking?: Booking | null;
  onSuccess: () => void;
  mode?: 'booking' | 'break';
}

/**
 * Sidebar de création/édition de réservation (20% à droite)
 */
export default function BookingSidebar({
  isOpen,
  onClose,
  selectedSlot,
  booking,
  onSuccess,
  mode = 'booking',
}: BookingSidebarProps) {
  const [clientId, setClientId] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [serviceType, setServiceType] = useState<'MASSOTHERAPIE' | 'ESTHETIQUE'>('MASSOTHERAPIE');
  const [notes, setNotes] = useState('');
  const [breakTitle, setBreakTitle] = useState('Pause');

  const { data: clientsData } = useGetClientsQuery({});
  const { data: professionalsData } = useGetUsersQuery({
    role: serviceType === 'MASSOTHERAPIE' ? 'MASSOTHERAPEUTE' : 'ESTHETICIENNE',
  });

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();

  const clients = clientsData?.clients || [];
  const professionals = professionalsData?.users || [];
  const isLoading = isCreating || isUpdating;
  const isEditMode = !!booking;

  // Initialiser avec les données du slot sélectionné
  useEffect(() => {
    if (selectedSlot && isOpen) {
      setProfessionalId(selectedSlot.professionalId);
      setDate(format(selectedSlot.date, 'yyyy-MM-dd'));
      setStartTime(selectedSlot.timeSlot);
    }
  }, [selectedSlot, isOpen]);

  // Initialiser avec les données de la réservation en mode édition
  useEffect(() => {
    if (booking && isOpen) {
      setClientId(booking.clientId);
      setProfessionalId(booking.professionalId);
      setDate(format(new Date(booking.startTime), 'yyyy-MM-dd'));
      setStartTime(format(new Date(booking.startTime), 'HH:mm'));
      setServiceType(booking.serviceType);
      setNotes(booking.notes || '');

      // Calculer la durée
      const start = new Date(booking.startTime);
      const end = new Date(booking.endTime);
      const durationMin = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
      setDuration(durationMin);
    }
  }, [booking, isOpen]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setClientId('');
      setProfessionalId('');
      setDate('');
      setStartTime('');
      setDuration(60);
      setNotes('');
      setBreakTitle('Pause');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'break') {
      // TODO: Implémenter la création de pause
      toast.success('Fonctionnalité de pause à venir!');
      onClose();
      return;
    }

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

      if (isEditMode && booking) {
        // Mode édition
        await updateBooking({
          id: booking.id,
          data: {
            professionalId,
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
            notes: notes || undefined,
          },
        }).unwrap();

        toast.success('Réservation modifiée avec succès!');
      } else {
        // Mode création
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
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.data?.error || 'Erreur lors de l\'enregistrement');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full sm:w-[400px] lg:w-[35%] xl:w-[30%] 2xl:w-[30%] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-spa-turquoise-50 to-white">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              mode === 'break' ? 'bg-orange-100' : 'bg-spa-turquoise-100'
            }`}>
              {mode === 'break' ? (
                <Coffee className={`w-5 h-5 ${mode === 'break' ? 'text-orange-600' : 'text-spa-turquoise-600'}`} />
              ) : (
                <Calendar className="w-5 h-5 text-spa-turquoise-600" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {mode === 'break'
                  ? 'Ajouter une pause'
                  : isEditMode
                  ? 'Modifier la réservation'
                  : 'Nouvelle réservation'}
              </h2>
              <p className="text-xs text-gray-500">
                {isEditMode ? 'Modifiez les détails' : 'Remplissez les informations'}
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {mode === 'booking' ? (
            <>
              {/* Type de service */}
              {!isEditMode && (
                <div>
                  <label className="label-spa">Type de service *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceType('MASSOTHERAPIE')}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        serviceType === 'MASSOTHERAPIE'
                          ? 'border-spa-turquoise-500 bg-spa-turquoise-50 text-spa-turquoise-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-600'
                      }`}
                    >
                      Massothérapie
                    </button>
                    <button
                      type="button"
                      onClick={() => setServiceType('ESTHETIQUE')}
                      className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        serviceType === 'ESTHETIQUE'
                          ? 'border-spa-lavande-500 bg-spa-lavande-50 text-spa-lavande-700'
                          : 'border-gray-300 hover:border-gray-400 text-gray-600'
                      }`}
                    >
                      Esthétique
                    </button>
                  </div>
                </div>
              )}

              {/* Client */}
              {!isEditMode && (
                <div>
                  <label className="label-spa">Client *</label>
                  <select
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="input-spa text-sm"
                    required
                  >
                    <option key="empty-client" value="">Sélectionner un client</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.prenom} {client.nom} - {client.telCellulaire}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Professionnel */}
              <div>
                <label className="label-spa">Professionnel *</label>
                <select
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="input-spa text-sm"
                  required
                >
                  <option key="empty-professional" value="">Sélectionner un professionnel</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.prenom} {prof.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="label-spa">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-spa text-sm"
                  required
                />
              </div>

              {/* Heure de début */}
              <div>
                <label className="label-spa">Heure de début *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-spa text-sm"
                  required
                />
              </div>

              {/* Durée */}
              <div>
                <label className="label-spa">Durée *</label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="input-spa text-sm"
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
                  className="input-spa text-sm"
                  placeholder="Notes spéciales..."
                />
              </div>
            </>
          ) : (
            <>
              {/* Formulaire de pause */}
              <div>
                <label className="label-spa">Titre de la pause *</label>
                <input
                  type="text"
                  value={breakTitle}
                  onChange={(e) => setBreakTitle(e.target.value)}
                  className="input-spa text-sm"
                  placeholder="Ex: Pause déjeuner, Pause café..."
                  required
                />
              </div>

              <div>
                <label className="label-spa">Professionnel *</label>
                <select
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                  className="input-spa text-sm"
                  required
                >
                  <option key="empty-professional-break" value="">Sélectionner un professionnel</option>
                  {professionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.prenom} {prof.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-spa">Date *</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-spa text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spa">Début *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-spa text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="label-spa">Durée *</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="input-spa text-sm"
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>1h</option>
                  </select>
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-outline text-sm"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 btn-primary text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <span>{isEditMode ? 'Modifier' : mode === 'break' ? 'Créer la pause' : 'Créer'}</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />
    </AnimatePresence>
  );
}
