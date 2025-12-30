'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfDay } from 'date-fns';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import SingleColumnCalendarGrid from './SingleColumnCalendarGrid';
import BookingSidebar from './BookingSidebar';
import BookingContextMenu from './BookingContextMenu';
import EmptySlotContextMenu from './EmptySlotContextMenu';
import {
  useGetBookingsByDateRangeQuery,
  useGetUsersQuery,
  useChangeBookingStatusMutation,
  useDeleteBookingMutation,
  type Booking,
  type BookingStatus,
} from '@/lib/redux/services/api';
import { initializeSocket, onBookingEvent, offBookingEvent, emitEvent } from '@/lib/websocket/socket';
import { useAppSelector } from '@/lib/redux/hooks';
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
  } | null>(null);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const [changeStatus] = useChangeBookingStatusMutation();
  const [deleteBooking] = useDeleteBookingMutation();

  const bookings = bookingsData?.bookings || [];
  const allProfessionals = professionalsData?.users || [];

  // Filter only therapists and estheticians
  const professionals = allProfessionals.filter(
    (user) => user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE'
  );

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

    setEmptySlotContextMenu({ professionalId, date, timeSlot, position });
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
              {console.log('❌ Affichage CalendarGrid (admin/secrétaire)')}
              <CalendarGrid
                date={selectedDate}
                professionals={professionals}
                bookings={filteredBookings}
                onBookingEdit={handleBookingEdit}
                onBookingContextMenu={handleBookingContextMenu}
                onSlotClick={handleSlotClick}
                onSlotContextMenu={handleSlotContextMenu}
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
        />
      )}
    </div>
  );
}
