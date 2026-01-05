'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Loader2, Search, Mail, Smartphone, Check } from 'lucide-react';
import { format, addMinutes, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useGetClientsQuery,
  useGetUsersQuery,
  useCreateBookingMutation,
  useGetAllServicesQuery,
  type Booking,
  type Service,
  type ServiceCategory,
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
  // États du formulaire
  const [clientId, setClientId] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showClientList, setShowClientList] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [professionalId, setProfessionalId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [serviceType, setServiceType] = useState<'MASSOTHERAPIE' | 'ESTHETIQUE'>('MASSOTHERAPIE');
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [smsReminder, setSmsReminder] = useState(true);
  const [emailReminder, setEmailReminder] = useState(true);
  const [isNewClient, setIsNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Récupération des données
  const { data: clientsData } = useGetClientsQuery({ search: clientSearch });
  const { data: professionalsData } = useGetUsersQuery({
    role: serviceType === 'MASSOTHERAPIE' ? 'MASSOTHERAPEUTE' : 'ESTHETICIENNE',
  });

  // Récupérer tous les services avec filtre par catégorie
  const { data: servicesData, isError: servicesError } = useGetAllServicesQuery({
    categoryName: serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'
  }, {
    // Continuer même si l'API échoue
    skip: false,
  });

  // Filtrage des clients en fonction de la recherche
  const filteredClients = useMemo(() => {
    if (!clientsData?.clients) return [];
    if (!clientSearch) return clientsData.clients.slice(0, 5);
    return clientsData.clients.filter(client =>
      `${client.prenom} ${client.nom}`.toLowerCase().includes(clientSearch.toLowerCase()) ||
      client.telCellulaire?.includes(clientSearch)
    ).slice(0, 5);
  }, [clientsData, clientSearch]);

  // Extraire et aplatir les services depuis les catégories
  const availableServices = useMemo(() => {
    if (!servicesData?.data) return [];

    // Aplatir tous les services de toutes les catégories
    const services: Service[] = [];
    servicesData.data.forEach(category => {
      if (category.services) {
        services.push(...category.services);
      }
    });

    return services;
  }, [servicesData]);

  // Mise à jour des durées et prix disponibles lorsqu'un service est sélectionné
  const availableDurations = useMemo(() => {
    if (!selectedService) return [];
    const service = availableServices.find(s => s.id === selectedService);

    if (!service) return [];

    // Retourner le seul couple durée/prix du service
    return [{
      duration: service.duration,
      price: service.price
    }];
  }, [selectedService, availableServices]);

  // Mise à jour du prix lorsque la durée change
  useEffect(() => {
    if (selectedDuration && availableDurations.length > 0) {
      const selected = availableDurations.find(d => d.duration === selectedDuration);
      setPrice(selected?.price || null);
    } else {
      setPrice(null);
    }
  }, [selectedDuration, availableDurations]);

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
      setClientSearch('');
      setSelectedClient(null);
      setProfessionalId('');
      setDate('');
      setStartTime('');
      setSelectedDuration(null);
      setSelectedService('');
      setPrice(null);
      setNotes('');
      setIsNewClient(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
    }
  }, [isOpen]);

  const handleClientSelect = (client: any) => {
    setSelectedClient(client);
    setClientId(client.id);
    setClientSearch(`${client.prenom} ${client.nom}`);
    setShowClientList(false);
    setIsNewClient(false);
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setClientId('');
    setIsNewClient(true);
    setShowClientList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((!clientId && !isNewClient) || !professionalId || !date || !startTime || !selectedService || !selectedDuration) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      // Calculer l'heure de fin
      const [hours, minutes] = startTime.split(':').map(Number);

      // Créer la date en temps local (pas UTC) pour éviter les problèmes de fuseau horaire
      const [year, month, day] = date.split('-').map(Number);
      const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
      const endDate = addMinutes(startDate, selectedDuration);

      // Préparer les données de réservation
      const bookingData: any = {
        professionalId,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        serviceType,
        serviceId: selectedService,
        duration: selectedDuration,
        notes: notes || undefined,
        status: 'CONFIRMED',
        smsReminder,
        emailReminder,
      };

      // Client existant ou nouveau
      if (isNewClient) {
        bookingData.isNewClient = true;
        bookingData.clientName = newClientName.trim();
        bookingData.clientPhone = newClientPhone.trim().replace(/\s+/g, '');
        bookingData.clientEmail = newClientEmail.trim();
      } else {
        bookingData.clientId = clientId;
        bookingData.clientName = `${selectedClient.prenom} ${selectedClient.nom}`.trim();
        bookingData.clientPhone = selectedClient.telCellulaire.replace(/\s+/g, '');
        bookingData.clientEmail = selectedClient.courriel || '';
      }

      await createBooking(bookingData).unwrap();

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

            {/* Recherche et sélection du client */}
            <div className="relative">
              <label className="label-spa">Rechercher un client *</label>
              <div className="relative">
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setShowClientList(true);
                  }}
                  onFocus={() => setShowClientList(true)}
                  className="input-spa pr-10"
                  placeholder="Nom, prénom ou téléphone"
                  required={!isNewClient}
                />
                <Search className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
              </div>
              
              {/* Liste déroulante des clients */}
              {showClientList && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredClients.length > 0 ? (
                    <ul>
                      {filteredClients.map((client) => (
                        <li 
                          key={client.id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between"
                          onClick={() => handleClientSelect(client)}
                        >
                          <div>
                            <div className="font-medium">{client.prenom} {client.nom}</div>
                            <div className="text-sm text-gray-600">{client.telCellulaire}</div>
                          </div>
                          {clientId === client.id && <Check className="w-4 h-4 text-green-500" />}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-2 text-gray-500">
                      Aucun client trouvé
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleNewClient}
                    className="w-full text-left px-4 py-2 text-spa-turquoise-600 hover:bg-gray-50 border-t border-gray-100"
                  >
                    + Nouveau client
                  </button>
                </div>
              )}

              {/* Formulaire pour nouveau client */}
              {isNewClient && (
                <div className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">Nouveau client</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                    <input
                      type="text"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      className="input-spa w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      className="input-spa w-full"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      className="input-spa w-full"
                    />
                  </div>
                </div>
              )}

              {/* Affichage du client sélectionné */}
              {selectedClient && !isNewClient && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{selectedClient.prenom} {selectedClient.nom}</h4>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <Smartphone className="w-4 h-4 mr-1" />
                        {selectedClient.telCellulaire}
                      </div>
                      {selectedClient.courriel && (
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Mail className="w-4 h-4 mr-1" />
                          {selectedClient.courriel}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setClientId('');
                        setClientSearch('');
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
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
                <option key="empty-professional" value="">Sélectionner un professionnel</option>
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

            {/* Type de service */}
            <div>
              <label className="label-spa">Type de service *</label>
              {availableServices.length > 0 ? (
                <select
                  value={selectedService}
                  onChange={(e) => {
                    setSelectedService(e.target.value);
                    setSelectedDuration(null);
                  }}
                  className="input-spa"
                  required
                >
                  <option value="">Sélectionnez un service</option>
                  {availableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-gray-500">Chargement des services...</div>
              )}
            </div>

            {/* Durée et prix */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label-spa">Durée *</label>
                {selectedService ? (
                  <select
                    value={selectedDuration || ''}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="input-spa w-full"
                    required
                  >
                    <option value="">Sélectionnez une durée</option>
                    {availableDurations.map((duration) => (
                      <option key={duration.duration} value={duration.duration}>
                        {duration.duration} minutes
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500">Sélectionnez d'abord un service</div>
                )}
              </div>
              <div>
                <label className="label-spa">Prix (avant taxes)</label>
                <div className="h-12 flex items-center px-4 border border-gray-300 rounded-lg bg-gray-50">
                  {price !== null ? (
                    <span className="font-medium">{price.toFixed(2)} $</span>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </div>
              </div>
            </div>

            {/* Rappels */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="smsReminder"
                  checked={smsReminder}
                  onChange={(e) => setSmsReminder(e.target.checked)}
                  className="h-4 w-4 text-spa-turquoise-600 focus:ring-spa-turquoise-500 border-gray-300 rounded"
                />
                <label htmlFor="smsReminder" className="ml-2 block text-sm text-gray-700">
                  Envoyer un rappel par SMS 24h avant le rendez-vous
                </label>
              </div>
              
              {(selectedClient?.courriel || newClientEmail) && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailReminder"
                    checked={emailReminder}
                    onChange={(e) => setEmailReminder(e.target.checked)}
                    className="h-4 w-4 text-spa-turquoise-600 focus:ring-spa-turquoise-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emailReminder" className="ml-2 block text-sm text-gray-700">
                    Envoyer un rappel par email 24h avant le rendez-vous
                  </label>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="label-spa">Notes (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-spa"
                placeholder="Notes spéciales, allergies, préférences..."
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
              <button 
                type="submit" 
                className="btn-primary flex items-center justify-center gap-2" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5" />
                    <span>Confirmer la réservation</span>
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
