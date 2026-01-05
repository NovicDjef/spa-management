'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import HorizontalCalendarGrid from './HorizontalCalendarGrid';
import SingleColumnCalendarGrid from './SingleColumnCalendarGrid';
import BookingSidebar from './BookingSidebar';
import BookingContextMenu from './BookingContextMenu';
import EmptySlotContextMenu from './EmptySlotContextMenu';
import AvailabilityBlockModal from './AvailabilityBlockModal';
import GeneratePeriodModal from './GeneratePeriodModal';
import EditDayModal from './EditDayModal';
import EditBreakModal from './EditBreakModal';
import {
  useGetBookingsByDateRangeQuery,
  useGetUsersQuery,
  useChangeBookingStatusMutation,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
  useGetAvailabilityBlocksQuery,
  useGetBreaksQuery,
  useUpdateBreakMutation,
  useDeleteBreakMutation,
  useDeleteAvailabilityBlockMutation,
  useUnblockDayMutation,
  type Booking,
  type BookingStatus,
} from '@/lib/redux/services/api';
import { initializeSocket, onBookingEvent, offBookingEvent, emitEvent } from '@/lib/websocket/socket';
import { useAppSelector } from '@/lib/redux/hooks';
import { useAvailabilityData } from '@/hooks/useAvailabilityData';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface CalendarViewProps {
  userRole: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  userId?: string;
}

/**
 * Container principal du calendrier des réservations
 */
export default function CalendarView({ userRole, userId }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [showSidebar, setShowSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'booking' | 'break'>('booking');
  const [selectedSlot, setSelectedSlot] = useState<{
    professionalId: string;
    date: Date;
    timeSlot: string;
  } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingContextMenu, setBookingContextMenu] = useState<{
    booking: Booking;
    position: { x: number; y: number };
  } | null>(null);
  const [emptySlotContextMenu, setEmptySlotContextMenu] = useState<{
    professionalId: string;
    date: Date;
    timeSlot: string;
    position: { x: number; y: number };
    hasExistingBlock?: boolean;
    blockId?: string;
    blockReason?: string;
    hasExistingBreak?: boolean;
    breakId?: string;
    hasAvailability?: boolean;
  } | null>(null);
  const [availabilityBlockModal, setAvailabilityBlockModal] = useState<{
    professionalId: string;
    professionalName: string;
    date: Date;
    timeSlot?: string;
    mode: 'full-day' | 'time-period';
  } | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGeneratePeriodModal, setShowGeneratePeriodModal] = useState(false);
  const [editDayModal, setEditDayModal] = useState<{
    availabilityId: string;
    professionalName: string;
    date: Date;
    startTime: string;
    endTime: string;
  } | null>(null);
  const [editBreakModal, setEditBreakModal] = useState<{
    breakId: string;
    professionalName: string;
    dayOfWeek: number | null;
    startTime: string;
    endTime: string;
    label: string;
    isActive: boolean;
  } | null>(null);

  const token = useAppSelector((state) => state.auth.token);
  const currentUser = useAppSelector((state) => state.auth.user);

  // Détecter le montage côté client
  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Fetch bookings pour la date sélectionnée
  const {
    data: bookingsData,
    isLoading: isLoadingBookings,
    refetch: refetchBookings,
  } = useGetBookingsByDateRangeQuery({
    startDate: format(selectedDate, 'yyyy-MM-dd'),
    endDate: format(selectedDate, 'yyyy-MM-dd'),
    professionalId: userRole === 'MASSOTHERAPEUTE' || userRole === 'ESTHETICIENNE' ? userId : undefined,
  });

  // Fetch professionals
  const { data: professionalsData, isLoading: isLoadingProfessionals } = useGetUsersQuery({
    role: undefined, // Get all professionals
  });

  const bookings = bookingsData?.bookings || [];
  const allProfessionals = professionalsData?.users || [];

  // Filter only therapists and estheticians
  const professionals = allProfessionals.filter(
    (user) => user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE'
  );

  // DEBUG: Log des réservations récupérées
  console.log('📊 Réservations récupérées:', {
    date: format(selectedDate, 'yyyy-MM-dd'),
    count: bookings.length,
    bookings: bookings.map(b => ({
      id: b.id,
      client: `${b.client.prenom} ${b.client.nom}`,
      professional: b.professionalId,
      start: b.startTime,
      end: b.endTime,
      status: b.status
    }))
  });

  // Récupérer les blocages et pauses pour tous les professionnels
  const professionalIds = professionals.map(p => p.id);
  const { blocks: allBlocks, breaks: allBreaks } = useAvailabilityData(
    professionalIds,
    format(selectedDate, 'yyyy-MM-dd')
  );

  // DEBUG: Log des pauses récupérées
  console.log('🔍 DEBUG Pauses récupérées:', {
    date: format(selectedDate, 'yyyy-MM-dd'),
    professionalIds,
    breaks: allBreaks,
    breaksCount: allBreaks.length,
  });

  const [changeStatus] = useChangeBookingStatusMutation();
  const [deleteBooking] = useDeleteBookingMutation();
  const [updateBooking] = useUpdateBookingMutation();
  const [updateBreak] = useUpdateBreakMutation();
  const [deleteBreak] = useDeleteBreakMutation();
  const [deleteAvailabilityBlock] = useDeleteAvailabilityBlockMutation();
  const [unblockDay] = useUnblockDayMutation();

  // Filtrer les réservations en fonction de la recherche
  const filteredBookings = searchQuery
    ? bookings.filter((booking) => {
        const searchLower = searchQuery.toLowerCase();
        const clientName = `${booking.client.prenom} ${booking.client.nom}`.toLowerCase();
        return clientName.includes(searchLower);
      })
    : bookings;

  // DEBUG: Log pour vérifier le rôle et l'utilisateur
  console.log('🔍 DEBUG CalendarView:', {
    userRole,
    userId,
    currentUser,
    isClientMounted,
    isProfessional: userRole === 'MASSOTHERAPEUTE' || userRole === 'ESTHETICIENNE',
    hasCurrentUser: !!currentUser,
    bookingsCount: bookings.length,
  });

  // Vérifier si on est un professionnel
  const isProfessionalView = userRole === 'MASSOTHERAPEUTE' || userRole === 'ESTHETICIENNE';

  // WebSocket pour temps réel
  useEffect(() => {
    if (!token) return;

    const socket = initializeSocket(token);

    const handleBookingCreated = (data: any) => {
      console.log('📅 Nouvelle réservation:', data);
      toast.success('Nouvelle réservation ajoutée');
      refetchBookings();
    };

    const handleBookingUpdated = (data: any) => {
      console.log('📝 Réservation mise à jour:', data);
      toast.success('Réservation mise à jour');
      refetchBookings();
    };

    const handleBookingCancelled = (data: any) => {
      console.log('❌ Réservation annulée:', data);
      toast.error('Réservation annulée');
      refetchBookings();
    };

    onBookingEvent('created', handleBookingCreated);
    onBookingEvent('updated', handleBookingUpdated);
    onBookingEvent('cancelled', handleBookingCancelled);

    return () => {
      offBookingEvent('created');
      offBookingEvent('updated');
      offBookingEvent('cancelled');
    };
  }, [token, refetchBookings]);

  // Navigation dates
  const goToPreviousDay = () => {
    setSelectedDate((prev) => subDays(prev, 1));
  };

  const goToNextDay = () => {
    setSelectedDate((prev) => addDays(prev, 1));
  };

  const goToToday = () => {
    setSelectedDate(startOfDay(new Date()));
  };

  // Vérifier si l'utilisateur peut créer des réservations
  const canCreateBooking = userRole === 'ADMIN' || userRole === 'SECRETAIRE';

  // Handlers
  const handleSlotClick = (professionalId: string, date: Date, timeSlot: string) => {
    // Seuls ADMIN et SECRETAIRE peuvent créer des réservations
    if (!canCreateBooking) return;

    setSelectedSlot({ professionalId, date, timeSlot });
    setSelectedBooking(null);
    setSidebarMode('booking');
    setShowSidebar(true);
  };

  const handleSlotContextMenu = (
    professionalId: string,
    date: Date,
    timeSlot: string,
    position: { x: number; y: number }
  ) => {
    // Seuls ADMIN et SECRETAIRE peuvent créer des réservations
    if (!canCreateBooking) return;

    // Détecter si ce créneau a un blocage existant
    const currentDate = format(date, 'yyyy-MM-dd');

    // Vérifier blocage de journée complète
    let existingBlock = allBlocks.find(
      block => block.professionalId === professionalId &&
      block.date === currentDate &&
      !block.startTime && !block.endTime
    );

    // Si pas de blocage journée complète, vérifier blocage de période
    if (!existingBlock) {
      existingBlock = allBlocks.find(block => {
        if (block.professionalId !== professionalId || block.date !== currentDate) return false;
        if (!block.startTime || !block.endTime) return false;
        return timeSlot >= block.startTime && timeSlot < block.endTime;
      });
    }

    // Vérifier s'il y a une availability pour ce jour (pour l'option de modification)
    const dayAvailability = allBlocks.find(
      block => block.professionalId === professionalId &&
      block.date === currentDate &&
      block.startTime && block.endTime // Pas un blocage complet
    );

    // Vérifier pause existante
    const currentDayOfWeek = date.getDay(); // 0=Dimanche, 1=Lundi, etc.

    const existingBreak = allBreaks.find(br => {
      if (br.professionalId !== professionalId) return false;

      // Vérifier si la pause s'applique à ce jour de la semaine
      if (br.dayOfWeek !== null && br.dayOfWeek !== currentDayOfWeek) {
        return false;
      }

      return timeSlot >= br.startTime && timeSlot < br.endTime;
    });

    setEmptySlotContextMenu({
      professionalId,
      date,
      timeSlot,
      position,
      hasExistingBlock: !!existingBlock,
      blockId: existingBlock?.id,
      blockReason: existingBlock?.reason,
      hasExistingBreak: !!existingBreak,
      breakId: existingBreak?.id,
      hasAvailability: !!dayAvailability,
    });
  };

  const handleBookingEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedSlot(null);
    setSidebarMode('booking');
    setShowSidebar(true);
  };

  const handleBookingContextMenu = (booking: Booking, position: { x: number; y: number }) => {
    setBookingContextMenu({ booking, position });
  };

  const handleChangeStatus = async (booking: Booking, status: BookingStatus) => {
    try {
      await changeStatus({ id: booking.id, status }).unwrap();
      toast.success(`Statut changé: ${getStatusLabel(status)}`);
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur changement statut:', error);
      toast.error(error.data?.error || 'Erreur lors du changement de statut');
    }
  };

  const handleClientArrived = async (booking: Booking) => {
    try {
      // Changer le statut à ARRIVED
      await changeStatus({ id: booking.id, status: 'ARRIVED' }).unwrap();

      // Émettre une notification WebSocket au professionnel
      emitEvent('client:arrived', {
        bookingId: booking.id,
        professionalId: booking.professionalId,
        clientName: `${booking.client.prenom} ${booking.client.nom}`,
        message: `${booking.client.prenom} ${booking.client.nom} est arrivé(e) !`,
      });

      toast.success(`${booking.client.prenom} ${booking.client.nom} est marqué(e) comme arrivé(e)`);
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur client arrivé:', error);
      toast.error(error.data?.error || 'Erreur lors de la mise à jour');
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    try {
      await deleteBooking(booking.id).unwrap();
      toast.success('Réservation supprimée');
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur suppression:', error);
      toast.error(error.data?.error || 'Erreur lors de la suppression');
    }
  };

  const handleCreateBookingFromContextMenu = () => {
    // Seuls ADMIN et SECRETAIRE peuvent créer des réservations
    if (!canCreateBooking) return;

    if (emptySlotContextMenu) {
      setSelectedSlot({
        professionalId: emptySlotContextMenu.professionalId,
        date: emptySlotContextMenu.date,
        timeSlot: emptySlotContextMenu.timeSlot,
      });
      setSelectedBooking(null);
      setSidebarMode('booking');
      setShowSidebar(true);
      setEmptySlotContextMenu(null);
    }
  };

  const handleCreateBreakFromContextMenu = () => {
    // Seuls ADMIN et SECRETAIRE peuvent créer des pauses
    if (!canCreateBooking) return;

    if (emptySlotContextMenu) {
      setSelectedSlot({
        professionalId: emptySlotContextMenu.professionalId,
        date: emptySlotContextMenu.date,
        timeSlot: emptySlotContextMenu.timeSlot,
      });
      setSelectedBooking(null);
      setSidebarMode('break');
      setShowSidebar(true);
      setEmptySlotContextMenu(null);
    }
  };

  const handleBlockFullDay = () => {
    // Seuls ADMIN et SECRETAIRE peuvent bloquer des disponibilités
    if (!canCreateBooking) return;

    if (emptySlotContextMenu) {
      const professional = professionals.find(p => p.id === emptySlotContextMenu.professionalId);
      const professionalName = professional ? `${professional.prenom} ${professional.nom}` : 'Professionnel';

      setAvailabilityBlockModal({
        professionalId: emptySlotContextMenu.professionalId,
        professionalName,
        date: emptySlotContextMenu.date,
        mode: 'full-day',
      });
      setEmptySlotContextMenu(null);
    }
  };

  const handleBlockTimePeriod = () => {
    // Seuls ADMIN et SECRETAIRE peuvent bloquer des disponibilités
    if (!canCreateBooking) return;

    if (emptySlotContextMenu) {
      const professional = professionals.find(p => p.id === emptySlotContextMenu.professionalId);
      const professionalName = professional ? `${professional.prenom} ${professional.nom}` : 'Professionnel';

      setAvailabilityBlockModal({
        professionalId: emptySlotContextMenu.professionalId,
        professionalName,
        date: emptySlotContextMenu.date,
        timeSlot: emptySlotContextMenu.timeSlot,
        mode: 'time-period',
      });
      setEmptySlotContextMenu(null);
    }
  };

  const handleDeleteBreak = async (breakId: string) => {
    try {
      await deleteBreak(breakId).unwrap();
      toast.success('Pause supprimée avec succès');
      refetchBookings(); // Rafraîchir pour mettre à jour l'affichage
    } catch (error: any) {
      console.error('Erreur suppression pause:', error);
      toast.error(error.data?.message || 'Erreur lors de la suppression de la pause');
    }
  };

  const handleUnblock = async () => {
    if (!emptySlotContextMenu) return;

    // Vérifier si c'est un blocage de journée complète
    const currentDate = format(emptySlotContextMenu.date, 'yyyy-MM-dd');
    const fullDayBlock = allBlocks.find(
      block => block.professionalId === emptySlotContextMenu.professionalId &&
      block.date === currentDate &&
      !block.startTime && !block.endTime
    );

    try {
      if (fullDayBlock) {
        // Débloquer une journée complète avec la nouvelle API
        await unblockDay({
          professionalId: emptySlotContextMenu.professionalId,
          date: currentDate,
        }).unwrap();
        toast.success('Journée débloquée avec succès ! 🎉');
      } else if (emptySlotContextMenu.blockId) {
        // Supprimer un blocage de période (ancien comportement)
        await deleteAvailabilityBlock(emptySlotContextMenu.blockId).unwrap();
        toast.success('Blocage de période supprimé avec succès');
      }

      setEmptySlotContextMenu(null);
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur déblocage:', error);
      toast.error(error.data?.message || 'Erreur lors du déblocage');
    }
  };

  const handleDeleteBreakFromContextMenu = async () => {
    if (!emptySlotContextMenu?.breakId) return;

    try {
      await deleteBreak(emptySlotContextMenu.breakId).unwrap();
      toast.success('Pause supprimée avec succès');
      setEmptySlotContextMenu(null);
      // Rafraîchir les données
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur suppression pause:', error);
      toast.error(error.data?.message || 'Erreur lors de la suppression de la pause');
    }
  };

  const handleEditDaySchedule = () => {
    if (!emptySlotContextMenu) return;

    const currentDate = format(emptySlotContextMenu.date, 'yyyy-MM-dd');

    // Trouver le bloc d'availability pour ce jour
    const dayAvailability = allBlocks.find(
      block => block.professionalId === emptySlotContextMenu.professionalId &&
      block.date === currentDate &&
      block.startTime && block.endTime // Pas un blocage complet
    );

    if (!dayAvailability) {
      toast.error('Aucun horaire trouvé pour ce jour');
      return;
    }

    const professional = professionals.find(p => p.id === emptySlotContextMenu.professionalId);
    const professionalName = professional ? `${professional.prenom} ${professional.nom}` : 'Professionnel';

    setEditDayModal({
      availabilityId: dayAvailability.id,
      professionalName,
      date: emptySlotContextMenu.date,
      startTime: dayAvailability.startTime || '08:00',
      endTime: dayAvailability.endTime || '20:00',
    });

    setEmptySlotContextMenu(null);
  };

  const handleEditBreak = () => {
    if (!emptySlotContextMenu?.breakId) return;

    const breakToEdit = allBreaks.find(br => br.id === emptySlotContextMenu.breakId);

    if (!breakToEdit) {
      toast.error('Pause non trouvée');
      return;
    }

    const professional = professionals.find(p => p.id === emptySlotContextMenu.professionalId);
    const professionalName = professional ? `${professional.prenom} ${professional.nom}` : 'Professionnel';

    setEditBreakModal({
      breakId: breakToEdit.id,
      professionalName,
      dayOfWeek: breakToEdit.dayOfWeek ?? null,
      startTime: breakToEdit.startTime || '12:00',
      endTime: breakToEdit.endTime || '13:00',
      label: breakToEdit.label || 'Pause',
      isActive: breakToEdit.isActive ?? true,
    });

    setEmptySlotContextMenu(null);
  };

  const handleBookingMove = async (bookingId: string, newProfessionalId: string, newDate: Date, newTimeSlot: string) => {
    try {
      // Trouver la réservation
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        toast.error('Réservation non trouvée');
        return;
      }

      // Calculer la durée de la réservation
      const originalStart = new Date(booking.startTime);
      const originalEnd = new Date(booking.endTime);
      const durationMinutes = (originalEnd.getTime() - originalStart.getTime()) / (1000 * 60);

      // Calculer les nouvelles heures
      const [hours, minutes] = newTimeSlot.split(':').map(Number);
      const newStart = new Date(newDate);
      newStart.setHours(hours, minutes, 0, 0);

      const newEnd = new Date(newStart);
      newEnd.setMinutes(newEnd.getMinutes() + durationMinutes);

      // Mettre à jour la réservation
      await updateBooking({
        id: bookingId,
        data: {
          professionalId: newProfessionalId,
          bookingDate: format(newDate, 'yyyy-MM-dd'),
          startTime: format(newStart, 'HH:mm'),
          endTime: format(newEnd, 'HH:mm'),
        },
      }).unwrap();

      toast.success('Réservation déplacée avec succès !');
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur déplacement réservation:', error);
      toast.error(error.data?.error || 'Erreur lors du déplacement de la réservation');
    }
  };

  const handleBreakMove = async (breakId: string, newProfessionalId: string, newDate: Date, newTimeSlot: string) => {
    try {
      // Trouver la pause
      const breakItem = allBreaks.find(b => b.id === breakId);
      if (!breakItem) {
        toast.error('Pause non trouvée');
        return;
      }

      // Calculer la durée de la pause
      const [origStartHours, origStartMinutes] = breakItem.startTime.split(':').map(Number);
      const [origEndHours, origEndMinutes] = breakItem.endTime.split(':').map(Number);
      const durationMinutes = (origEndHours * 60 + origEndMinutes) - (origStartHours * 60 + origStartMinutes);

      // Calculer les nouvelles heures
      const [hours, minutes] = newTimeSlot.split(':').map(Number);
      const newStartTotalMinutes = hours * 60 + minutes;
      const newEndTotalMinutes = newStartTotalMinutes + durationMinutes;

      const newStartTime = `${Math.floor(newStartTotalMinutes / 60).toString().padStart(2, '0')}:${(newStartTotalMinutes % 60).toString().padStart(2, '0')}`;
      const newEndTime = `${Math.floor(newEndTotalMinutes / 60).toString().padStart(2, '0')}:${(newEndTotalMinutes % 60).toString().padStart(2, '0')}`;

      // Mettre à jour la pause
      await updateBreak({
        id: breakId,
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
        },
      }).unwrap();

      toast.success('Pause déplacée avec succès !');
      refetchBookings();
    } catch (error: any) {
      console.error('Erreur déplacement pause:', error);
      toast.error(error.data?.error || 'Erreur lors du déplacement de la pause');
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    const labels: Record<BookingStatus, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      ARRIVED: 'Arrivé',
      IN_PROGRESS: 'En cours',
      COMPLETED: 'Terminé',
      NO_SHOW: 'Absent',
      CANCELLED: 'Annulé',
    };
    return labels[status];
  };

  // Afficher loading si données en cours de chargement
  if (isLoadingBookings || isLoadingProfessionals) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 text-spa-turquoise-500 animate-spin" />
      </div>
    );
  }

  // Pour les professionnels : attendre que currentUser soit chargé
  if (isProfessionalView && !currentUser && isClientMounted) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-8">
        <div className="w-20 h-20 bg-spa-turquoise-100 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-10 h-10 text-spa-turquoise-600 animate-spin" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Chargement de votre calendrier...
        </h3>
        <p className="text-sm text-gray-600 text-center max-w-md">
          Veuillez patienter pendant que nous chargeons vos informations.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <CalendarHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onPrevious={goToPreviousDay}
        onNext={goToNextDay}
        onToday={goToToday}
        onNewBooking={() => {
          setSelectedSlot(null);
          setSelectedBooking(null);
          setSidebarMode('booking');
          setShowSidebar(true);
        }}
        onGenerateSchedule={() => setShowGeneratePeriodModal(true)}
        userRole={userRole}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Calendar Grid avec Sidebar */}
      <div className="flex-1 overflow-hidden flex">
        {/* Grid principale */}
        <div className={`flex-1 overflow-auto transition-all ${showSidebar ? 'mr-0' : ''}`}>
          {/* Vue professionnelle : une seule colonne optimisée mobile */}
          {isProfessionalView && currentUser ? (
            <>
              {console.log('✅ Affichage SingleColumnCalendarGrid pour:', currentUser.prenom, currentUser.nom)}
              <SingleColumnCalendarGrid
                date={selectedDate}
                professional={{
                  id: currentUser.id,
                  nom: currentUser.nom,
                  prenom: currentUser.prenom,
                  photoUrl: (currentUser as any).photoUrl,
                  role: currentUser.role,
                }}
                bookings={filteredBookings}
                blocks={allBlocks}
                breaks={allBreaks}
                onBookingClick={handleBookingEdit}
                onBookingContextMenu={handleBookingContextMenu}
                onSlotClick={(timeSlot) => {
                  // Convertir le timeSlot en date
                  const [hours, minutes] = timeSlot.split(':').map(Number);
                  const slotDate = new Date(selectedDate);
                  slotDate.setHours(hours, minutes, 0, 0);
                  handleSlotClick(currentUser.id, slotDate, timeSlot);
                }}
                onSlotContextMenu={(timeSlot, position) => {
                  // Convertir le timeSlot en date
                  const [hours, minutes] = timeSlot.split(':').map(Number);
                  const slotDate = new Date(selectedDate);
                  slotDate.setHours(hours, minutes, 0, 0);
                  handleSlotContextMenu(currentUser.id, slotDate, timeSlot, position);
                }}
              />
            </>
          ) : (
            <>
              {console.log('✅ Affichage HorizontalCalendarGrid (admin/secrétaire)')}
              <HorizontalCalendarGrid
                date={selectedDate}
                professionals={professionals}
                bookings={filteredBookings}
                blocks={allBlocks}
                breaks={allBreaks}
                onBookingEdit={handleBookingEdit}
                onBookingContextMenu={handleBookingContextMenu}
                onSlotClick={handleSlotClick}
                onSlotContextMenu={handleSlotContextMenu}
                onBookingMove={handleBookingMove}
                onBreakMove={handleBreakMove}
                onBreakContextMenu={(breakItem, position) => {
                  // TODO: Implémenter le menu contextuel pour les pauses
                  console.log('Break context menu:', breakItem);
                }}
              />
            </>
          )}
        </div>

        {/* Sidebar */}
        <BookingSidebar
          isOpen={showSidebar}
          onClose={() => {
            setShowSidebar(false);
            setSelectedSlot(null);
            setSelectedBooking(null);
          }}
          selectedSlot={selectedSlot}
          booking={selectedBooking}
          onSuccess={() => {
            refetchBookings();
          }}
          mode={sidebarMode}
        />
      </div>

      {/* Booking Context Menu */}
      {bookingContextMenu && (
        <BookingContextMenu
          booking={bookingContextMenu.booking}
          position={bookingContextMenu.position}
          onClose={() => setBookingContextMenu(null)}
          onEdit={handleBookingEdit}
          onDelete={handleDeleteBooking}
          onChangeStatus={handleChangeStatus}
          onClientArrived={handleClientArrived}
        />
      )}

      {/* Empty Slot Context Menu */}
      {emptySlotContextMenu && (
        <EmptySlotContextMenu
          position={emptySlotContextMenu.position}
          onClose={() => setEmptySlotContextMenu(null)}
          onCreateBooking={handleCreateBookingFromContextMenu}
          onCreateBreak={handleCreateBreakFromContextMenu}
          onBlockFullDay={handleBlockFullDay}
          onBlockTimePeriod={handleBlockTimePeriod}
          onDeleteBreak={handleDeleteBreakFromContextMenu}
          onUnblock={handleUnblock}
          onEditDaySchedule={handleEditDaySchedule}
          onEditBreak={handleEditBreak}
          hasExistingBreak={emptySlotContextMenu.hasExistingBreak}
          hasExistingBlock={emptySlotContextMenu.hasExistingBlock}
          hasAvailability={emptySlotContextMenu.hasAvailability}
          blockReason={emptySlotContextMenu.blockReason}
        />
      )}

      {/* Availability Block Modal */}
      {availabilityBlockModal && (
        <AvailabilityBlockModal
          isOpen={true}
          onClose={() => setAvailabilityBlockModal(null)}
          professionalId={availabilityBlockModal.professionalId}
          professionalName={availabilityBlockModal.professionalName}
          date={availabilityBlockModal.date}
          timeSlot={availabilityBlockModal.timeSlot}
          mode={availabilityBlockModal.mode}
          onSuccess={() => {
            refetchBookings();
            setAvailabilityBlockModal(null);
          }}
        />
      )}

      {/* Generate Period Modal */}
      <GeneratePeriodModal
        isOpen={showGeneratePeriodModal}
        onClose={() => setShowGeneratePeriodModal(false)}
        professionals={professionals}
        onSuccess={() => {
          refetchBookings();
        }}
      />

      {/* Edit Day Schedule Modal */}
      {editDayModal && (
        <EditDayModal
          isOpen={true}
          onClose={() => setEditDayModal(null)}
          availabilityId={editDayModal.availabilityId}
          professionalName={editDayModal.professionalName}
          date={editDayModal.date}
          currentStartTime={editDayModal.startTime}
          currentEndTime={editDayModal.endTime}
          onSuccess={() => {
            refetchBookings();
            setEditDayModal(null);
          }}
        />
      )}

      {/* Edit Break Modal */}
      {editBreakModal && (
        <EditBreakModal
          isOpen={true}
          onClose={() => setEditBreakModal(null)}
          breakId={editBreakModal.breakId}
          professionalName={editBreakModal.professionalName}
          currentDayOfWeek={editBreakModal.dayOfWeek}
          currentStartTime={editBreakModal.startTime}
          currentEndTime={editBreakModal.endTime}
          currentLabel={editBreakModal.label}
          currentIsActive={editBreakModal.isActive}
          onSuccess={() => {
            refetchBookings();
            setEditBreakModal(null);
          }}
        />
      )}
    </div>
  );
}
