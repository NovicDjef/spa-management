'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import { useAppSelector } from '@/lib/redux/hooks';

/**
 * Page calendrier pour les professionnels (massothérapeutes et esthéticiennes)
 */
export default function ProfessionalCalendarPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  console.log('🔍 DEBUG ProfessionalCalendarPage:', {
    currentUser,
    hasCurrentUser: !!currentUser,
    userRole: currentUser?.role,
    userId: currentUser?.id,
  });

  // Si pas d'utilisateur, afficher un message
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={undefined} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Utilisateur non trouvé
            </h1>
            <p className="text-gray-600 mb-4">
              Impossible de charger vos informations. Veuillez vous reconnecter.
            </p>
            <Link
              href="/professionnel/connexion"
              className="btn-primary"
            >
              Se reconnecter
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={currentUser ?? undefined} />

      {/* Bouton de retour compact */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <Link
          href="/professionnel/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-spa-turquoise-600 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Link>
      </div>

      {/* Calendrier pleine hauteur */}
      <div className="flex-1 overflow-hidden">
        <CalendarView userRole={currentUser?.role as any || 'MASSOTHERAPEUTE'} userId={currentUser?.id} />
      </div>
    </div>
  );
}
