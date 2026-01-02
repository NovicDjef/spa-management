'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, User, Loader2, Coffee, Search, Mail, Smartphone, Check } from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  useGetClientsQuery,
  useGetUsersQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useGetAllServicesQuery,
  useCreateBreakMutation,
  type Booking,
  type Service,
  type ServiceCategory,
} from '@/lib/redux/services/api';
import toast from 'react-hot-toast';
import { useAppSelector } from '@/lib/redux/hooks';

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
  const [breakTitle, setBreakTitle] = useState('Pause');

  // Récupérer l'utilisateur connecté pour afficher le créateur
  const currentUser = useAppSelector((state) => state.auth.user);

  // Récupération des données
  const { data: clientsData } = useGetClientsQuery({ search: clientSearch });
  // Récupérer TOUS les professionnels pour pouvoir détecter le type de service
  const { data: professionalsData } = useGetUsersQuery({
    role: undefined,
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

  // Extraire et aplatir les services avec leurs variations depuis les catégories
  const availableServices = useMemo(() => {
    if (!servicesData?.data) return [];

    interface ServiceVariation {
      id: string;
      serviceId: string;
      serviceName: string;
      variationName?: string;
      duration: number;
      price: number;
      displayName: string;
    }

    const variations: ServiceVariation[] = [];

    servicesData.data.forEach(category => {
      if (category.services) {
        category.services.forEach(service => {
          // Si le service a des variations, ajouter chaque variation
          if (service.variations && service.variations.length > 0) {
            service.variations.forEach((variation: any) => {
              variations.push({
                id: variation.id, // serviceVariationId
                serviceId: service.id,
                serviceName: service.name,
                variationName: variation.name,
                duration: variation.duration,
                price: variation.price,
                displayName: `${service.name} - ${variation.name} (${variation.duration} min)`,
              });
            });
          } else {
            // Sinon, ajouter le service de base
            variations.push({
              id: service.id,
              serviceId: service.id,
              serviceName: service.name,
              duration: service.duration,
              price: service.price,
              displayName: `${service.name} (${service.duration} min)`,
            });
          }
        });
      }
    });

    return variations;
  }, [servicesData]);

  // Auto-remplir la durée et le prix quand un service/variation est sélectionné
  useEffect(() => {
    if (selectedService && availableServices.length > 0) {
      const variation = availableServices.find(s => s.id === selectedService);
      if (variation) {
        setSelectedDuration(variation.duration);
        setPrice(variation.price);
      }
    }
  }, [selectedService, availableServices]);

  const [createBooking, { isLoading: isCreating }] = useCreateBookingMutation();
  const [updateBooking, { isLoading: isUpdating }] = useUpdateBookingMutation();
  const [createBreak, { isLoading: isCreatingBreak }] = useCreateBreakMutation();

  const clients = clientsData?.clients || [];

  // Filtrer les professionnels en fonction du type de service sélectionné
  const professionals = useMemo(() => {
    if (!professionalsData?.users) return [];

    const allProfessionals = professionalsData.users;
    const targetRole = serviceType === 'MASSOTHERAPIE' ? 'MASSOTHERAPEUTE' : 'ESTHETICIENNE';

    return allProfessionals.filter(user => user.role === targetRole);
  }, [professionalsData, serviceType]);

  const isLoading = isCreating || isUpdating || isCreatingBreak;
  const isEditMode = !!booking;

  // Initialiser avec les données du slot sélectionné
  useEffect(() => {
    if (selectedSlot && isOpen) {
      setProfessionalId(selectedSlot.professionalId);
      setDate(format(selectedSlot.date, 'yyyy-MM-dd'));
      setStartTime(selectedSlot.timeSlot);
      
      // Définir automatiquement le type de service en fonction du professionnel sélectionné
      const selectedProfessional = professionalsData?.users?.find(p => p.id === selectedSlot.professionalId);
      if (selectedProfessional) {
        const profServiceType = selectedProfessional.role === 'MASSOTHERAPEUTE' ? 'MASSOTHERAPIE' : 'ESTHETIQUE';
        setServiceType(profServiceType);
      }
    }
  }, [selectedSlot, isOpen, professionalsData]);

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
      setSelectedDuration(durationMin);
    }
  }, [booking, isOpen]);

  // Réinitialiser le formulaire à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setClientId('');
      setClientSearch('');
      setSelectedClient(null);
      setProfessionalId('');
      setDate('');
      setStartTime('');
      setSelectedService('');
      setSelectedDuration(null);
      setPrice(null);
      setNotes('');
      setBreakTitle('Pause');
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

  try {
    // Mode PAUSE : créer une pause
    if (mode === 'break') {
      if (!professionalId || !date || !startTime || !selectedDuration) {
        toast.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      const breakData = {
        professionalId,
        startTime,
        endTime: (() => {
          const [hours, minutes] = startTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + (selectedDuration || 0);
          const endHours = Math.floor(totalMinutes / 60) % 24;
          const endMinutes = totalMinutes % 60;
          return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        })(),
        label: breakTitle || 'Pause',
        dayOfWeek: null, // null = tous les jours (pause ponctuelle pour cette date)
      };

      await createBreak(breakData).unwrap();
      toast.success('Pause créée avec succès');
      onSuccess();
      onClose();
      return;
    }

    // Mode BOOKING : créer/modifier une réservation
    // Validation des champs obligatoires
    const requiredFields = [
      { value: professionalId, name: 'Professionnel' },
      { value: date, name: 'Date' },
      { value: startTime, name: 'Heure de début' },
      { value: selectedService, name: 'Service' },
      { value: selectedDuration, name: 'Durée' }
    ];

    // Vérification des champs obligatoires
    const missingFields = requiredFields
      .filter(field => !field.value)
      .map(field => field.name);

    if (missingFields.length > 0) {
      toast.error(`Champs obligatoires manquants : ${missingFields.join(', ')}`);
      return;
    }

    // Validation client
    if (!isNewClient && !selectedClient) {
      toast.error('Veuillez sélectionner un client');
      return;
    }

    // Préparer les données selon le format backend
    const [hours, minutes] = startTime.split(':').map(Number);
    const endDate = new Date(date);
    endDate.setHours(hours, minutes, 0, 0);
    const calculatedEndDate = addMinutes(endDate, selectedDuration || 60);

    // Arrondir l'heure de fin au prochain créneau de 30 minutes
    const endMinutes = calculatedEndDate.getMinutes();
    const endHours = calculatedEndDate.getHours();
    let roundedEndMinutes = endMinutes;

    // Si les minutes ne sont pas 00 ou 30, arrondir au prochain créneau
    if (endMinutes !== 0 && endMinutes !== 30) {
      if (endMinutes < 30) {
        roundedEndMinutes = 30;
      } else {
        roundedEndMinutes = 0;
        calculatedEndDate.setHours(endHours + 1);
      }
      calculatedEndDate.setMinutes(roundedEndMinutes);
    }

    // Calculer l'heure de fin au format HH:mm
    const endTimeFormatted = format(calculatedEndDate, 'HH:mm');

    // Déterminer si c'est un serviceId ou serviceVariationId
    const selectedVariation = availableServices.find(s => s.id === selectedService);
    const isVariation = selectedVariation && selectedVariation.variationName;

    // Données de base pour la réservation (format backend)
    const bookingBase: any = {
      professionalId,
      bookingDate: date, // Format YYYY-MM-DD
      startTime, // Format HH:mm
      endTime: endTimeFormatted, // Format HH:mm
      specialNotes: notes.trim() || undefined,
      sendSmsReminder: smsReminder,
      sendEmailReminder: emailReminder,
    };

    // Ajouter serviceVariationId OU serviceId selon le cas
    if (isVariation) {
      bookingBase.serviceVariationId = selectedService;
    } else {
      bookingBase.serviceId = selectedService;
    }

    let finalBookingData;

    if (isNewClient) {
      // Validation des champs pour un nouveau client
      if (!newClientName.trim() || !newClientPhone.trim()) {
        toast.error('Veuillez remplir tous les champs obligatoires pour le nouveau client');
        return;
      }

      // Client non-existant : envoyer nom, téléphone, email
      finalBookingData = {
        ...bookingBase,
        clientName: newClientName.trim(),
        clientPhone: newClientPhone.trim().replace(/\s+/g, ''),
        clientEmail: newClientEmail.trim() || undefined,
      };
    } else {
      // Client existant : envoyer seulement clientId
      finalBookingData = {
        ...bookingBase,
        clientId: selectedClient.id,
      };
    }

    console.log('\n=== DONNÉES FINALES ENVOYÉES À L\'API ===', JSON.stringify(finalBookingData, null, 2));

    if (isEditMode && booking) {
      // Pour la mise à jour, utiliser le même format que pour la création
      const updateData = {
        professionalId: finalBookingData.professionalId,
        serviceId: finalBookingData.serviceId,
        bookingDate: finalBookingData.bookingDate,
        startTime: finalBookingData.startTime,
        endTime: finalBookingData.endTime,
        specialNotes: finalBookingData.specialNotes,
      };

      const result = await updateBooking({
        id: booking.id,
        data: updateData
      }).unwrap();
      toast.success('Réservation mise à jour avec succès');
    } else {
      const result = await createBooking(finalBookingData).unwrap();
      console.log('Réponse du serveur:', result);
      toast.success('Réservation créée avec succès');
    }

    onSuccess();
    onClose();
  } catch (error: any) {
    console.error('Erreur lors de la soumission:', error);
    const errorMessage = error.data?.message || error.message || 'Une erreur est survenue lors de la création de la réservation';
    toast.error(errorMessage);
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
        <form id="booking-form" onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6 overflow-y-auto flex-1">
          {mode === 'booking' ? (
            <>
              {/* 1. Type de service - Affichage en lecture seule */}
              <div className="bg-gradient-to-r from-spa-turquoise-50 to-white p-3 rounded-lg border border-spa-turquoise-200">
                <label className="block text-xs font-medium text-gray-600 mb-1">Catégorie de service</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${serviceType === 'MASSOTHERAPIE' ? 'bg-spa-turquoise-500' : 'bg-spa-lavande-500'}`}></div>
                  <span className="text-sm font-semibold text-gray-900">
                    {serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
                  </span>
                </div>
              </div>

              {/* 2. Liste des services avec variations */}
              <div>
                <label className="label-spa">Service et durée *</label>
                {availableServices.length > 0 ? (
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="input-spa text-sm"
                    required
                  >
                    <option value="">Sélectionnez un service</option>
                    {availableServices.map((variation) => (
                      <option key={variation.id} value={variation.id}>
                        {variation.displayName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-xs text-gray-500 italic">Chargement des services...</div>
                )}
              </div>

              {/* 3. Durée et Prix */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-spa">Durée</label>
                  <div className="h-10 flex items-center px-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
                    {selectedDuration ? (
                      <span className="font-medium">{selectedDuration} min</span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="label-spa">Prix (avant taxes)</label>
                  <div className="h-10 flex items-center px-3 text-sm border border-gray-300 rounded-lg bg-gray-50">
                    {price !== null ? (
                      <span className="font-medium text-spa-turquoise-600">{price.toFixed(2)} $</span>
                    ) : (
                      <span className="text-gray-400">--</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Professionnel */}
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

              {/* 5. Date et heure (sur une ligne) */}
              <div className="grid grid-cols-2 gap-3">
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
                <div>
                  <label className="label-spa">Heure *</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-spa text-sm"
                    required
                  />
                </div>
              </div>

              {/* 6. Créateur et heure de création */}
              {!isEditMode && currentUser && (
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Créé par</label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        {currentUser.prenom} {currentUser.nom}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{format(new Date(), 'HH:mm', { locale: fr })}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Recherche et sélection du client */}
              {!isEditMode && (
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
                      className="input-spa text-sm pr-10 w-full"
                      placeholder="Nom, prénom ou téléphone"
                      required={!isNewClient}
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
                  </div>
                  
                  {/* Liste déroulante des clients */}
                  {showClientList && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
                      {filteredClients.length > 0 ? (
                        <ul>
                          {filteredClients.map((client) => (
                            <li 
                              key={client.id}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between text-sm"
                              onClick={() => handleClientSelect(client)}
                            >
                              <div>
                                <div className="font-medium">{client.prenom} {client.nom}</div>
                                <div className="text-xs text-gray-600">{client.telCellulaire}</div>
                              </div>
                              {clientId === client.id && <Check className="w-4 h-4 text-green-500" />}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          Aucun client trouvé
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handleNewClient}
                        className="w-full text-left px-4 py-2 text-spa-turquoise-600 hover:bg-gray-50 border-t border-gray-100 text-sm"
                      >
                        + Nouveau client
                      </button>
                    </div>
                  )}

                  {/* Formulaire pour nouveau client */}
                  {isNewClient && (
                    <div className="mt-3 space-y-3 p-3 bg-gradient-to-r from-spa-turquoise-50 to-white rounded-lg border border-spa-turquoise-200">
                      <h4 className="font-medium text-sm text-spa-turquoise-700">Nouveau client</h4>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nom complet *</label>
                        <input
                          type="text"
                          value={newClientName}
                          onChange={(e) => setNewClientName(e.target.value)}
                          className="input-spa text-sm w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Téléphone *</label>
                        <input
                          type="tel"
                          value={newClientPhone}
                          onChange={(e) => setNewClientPhone(e.target.value)}
                          className="input-spa text-sm w-full"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={newClientEmail}
                          onChange={(e) => setNewClientEmail(e.target.value)}
                          className="input-spa text-sm w-full"
                        />
                      </div>
                    </div>
                  )}

                  {/* Affichage du client sélectionné */}
                  {selectedClient && !isNewClient && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{selectedClient.prenom} {selectedClient.nom}</h4>
                          <div className="flex items-center text-xs text-gray-600 mt-1">
                            <Smartphone className="w-3 h-3 mr-1" />
                            {selectedClient.telCellulaire}
                          </div>
                          {selectedClient.courriel && (
                            <div className="flex items-center text-xs text-gray-600 mt-1">
                              <Mail className="w-3 h-3 mr-1" />
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
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 8. Rappels (checkboxes SMS et Email) */}
              {!isEditMode && (
                <div className="space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <label className="block text-xs font-medium text-gray-700 mb-2">Rappels automatiques</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smsReminder"
                      checked={smsReminder}
                      onChange={(e) => setSmsReminder(e.target.checked)}
                      className="h-4 w-4 text-spa-turquoise-600 focus:ring-spa-turquoise-500 border-gray-300 rounded"
                    />
                    <label htmlFor="smsReminder" className="ml-2 block text-xs text-gray-700">
                      <Smartphone className="w-3 h-3 inline mr-1" />
                      Rappel par SMS 24h avant
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
                      <label htmlFor="emailReminder" className="ml-2 block text-xs text-gray-700">
                        <Mail className="w-3 h-3 inline mr-1" />
                        Rappel par email 24h avant
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* 9. Notes / Description */}
              <div>
                <label className="label-spa">Notes (optionnel)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="input-spa text-sm"
                  placeholder="Notes spéciales, allergies, préférences..."
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
                    value={selectedDuration || ''}
                    onChange={(e) => setSelectedDuration(Number(e.target.value))}
                    className="input-spa text-sm"
                  >
                    <option value="">Sélectionner</option>
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
            type="submit"
            form="booking-form"
            className="w-full btn-primary flex items-center justify-center gap-2 text-sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement en cours...</span>
              </>
            ) : isEditMode ? (
              <>
                <Calendar className="w-4 h-4" />
                <span>Mettre à jour la réservation</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Confirmer la réservation</span>
              </>
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
