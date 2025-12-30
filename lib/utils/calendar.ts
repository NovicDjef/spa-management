import { format, parseISO, addMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Booking, BookingStatus } from '@/lib/redux/services/api';

// Générer les créneaux horaires
export function generateTimeSlots(
  startHour: number = 7,
  endHour: number = 23,
  intervalMinutes: number = 60
): string[] {
  const slots: string[] = [];
  let hour = startHour;
  let minute = 0;

  while (hour < endHour) {
    const label = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    slots.push(label);

    minute += intervalMinutes;
    if (minute >= 60) {
      hour += 1;
      minute = 0;
    }
  }

  return slots;
}

// Calculer la position d'une réservation dans la grille
export function calculateBookingPosition(
  booking: Booking,
  startHour: number = 7,
  slotHeightPx: number = 60,
  intervalMinutes: number = 60
): { top: number; height: number } {
  const start = parseISO(booking.startTime);
  const end = parseISO(booking.endTime);

  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const duration = endMinutes - startMinutes;

  const startOffset = startMinutes - (startHour * 60);
  const slotsFromStart = startOffset / intervalMinutes;
  const durationSlots = duration / intervalMinutes;

  return {
    top: slotsFromStart * slotHeightPx,
    height: durationSlots * slotHeightPx,
  };
}

// Couleurs de statut
export function getStatusColor(status: BookingStatus) {
  const colors = {
    PENDING: { bg: 'bg-yellow-100', border: 'border-yellow-400', text: 'text-yellow-800' },
    CONFIRMED: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
    ARRIVED: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
    IN_PROGRESS: { bg: 'bg-emerald-100', border: 'border-emerald-500', text: 'text-emerald-900' },
    COMPLETED: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' },
    NO_SHOW: { bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800' },
    CANCELLED: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
  };
  return colors[status];
}

// Labels français
export function getStatusLabel(status: BookingStatus): string {
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
}

// Formater plage horaire
export function formatTimeRange(startTime: string, endTime: string): string {
  const start = parseISO(startTime);
  const end = parseISO(endTime);
  return `${format(start, 'HH:mm', { locale: fr })} - ${format(end, 'HH:mm', { locale: fr })}`;
}

// Vérifier disponibilité d'un créneau
export function isSlotAvailable(
  professionalId: string,
  slotTime: Date,
  durationMinutes: number,
  existingBookings: Booking[]
): boolean {
  const slotEnd = addMinutes(slotTime, durationMinutes);

  return !existingBookings.some((booking) => {
    if (booking.professionalId !== professionalId) return false;
    if (booking.status === 'CANCELLED') return false;

    const bookingStart = parseISO(booking.startTime);
    const bookingEnd = parseISO(booking.endTime);

    // Vérifier chevauchement
    return (
      (slotTime >= bookingStart && slotTime < bookingEnd) ||
      (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
      (slotTime <= bookingStart && slotEnd >= bookingEnd)
    );
  });
}

// Assigner des couleurs aux professionnels
export function assignProfessionalColors(professionals: any[]): any[] {
  const colors = [
    '#7bacaf', // Turquoise spa
    '#8e67d0', // Lavande
    '#26c68c', // Menthe
    '#ed7a8e', // Rose
    '#af9b85', // Beige
    '#4ddea7', // Vert
    '#a78dde', // Violet
    '#e24965', // Rose foncé
  ];

  return professionals.map((prof, index) => ({
    ...prof,
    color: colors[index % colors.length],
  }));
}

// Position de l'indicateur d'heure actuelle
export function getCurrentTimePosition(
  startHour: number = 7,
  endHour: number = 23,
  slotHeightPx: number = 60,
  intervalMinutes: number = 60
): number | null {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  // Vérifier si l'heure actuelle est dans la plage affichée
  if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
    return null;
  }

  const minutesFromStart = currentMinutes - startMinutes;
  const slotsFromStart = minutesFromStart / intervalMinutes;

  return slotsFromStart * slotHeightPx;
}
