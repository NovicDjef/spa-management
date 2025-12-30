'use client';

import { motion } from 'framer-motion';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-4">
        {/* Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link
            href="/professionnel"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-spa-turquoise-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour au dashboard</span>
          </Link>
        </motion.div>

        {/* Titre */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Mon Calendrier Personnel</h1>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-spa-turquoise-100 text-spa-turquoise-700 border border-spa-turquoise-300">
              <span className="w-2 h-2 bg-spa-turquoise-500 rounded-full mr-2 animate-pulse" />
              Personnel
            </span>
          </div>
          <p className="text-gray-600">
            Visualisez uniquement vos rendez-vous assignés. Les réservations des autres professionnels ne sont pas affichées.
          </p>
          <div className="mt-3 inline-flex items-center px-3 py-1.5 bg-blue-50 rounded-lg text-sm text-blue-700 border border-blue-200">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Seules les réservations qui vous sont assignées apparaissent ici
          </div>
        </motion.div>
      </div>

      {/* Calendrier */}
      <CalendarView userRole={currentUser?.role as any || 'MASSOTHERAPEUTE'} userId={currentUser?.id} />
    </div>
  );
}
