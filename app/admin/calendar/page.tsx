'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import { useAppSelector } from '@/lib/redux/hooks';

/**
 * Page calendrier pour les admins et secrétaires
 */
export default function AdminCalendarPage() {
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
            href="/admin"
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
          <h1 className="text-3xl font-bold text-gray-900">Calendrier des Réservations</h1>
          <p className="text-gray-600 mt-2">
            Gérez les réservations de tous les professionnels en temps réel
          </p>
        </motion.div>
      </div>

      {/* Calendrier */}
      <CalendarView userRole={currentUser?.role as any || 'ADMIN'} userId={currentUser?.id} />
    </div>
  );
}
