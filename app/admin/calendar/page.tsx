'use client';

import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import CalendarView from '@/components/calendar/CalendarView';
import { useAppSelector } from '@/lib/redux/hooks';

/**
 * Page calendrier pour les admins et réceptionnistes
 */
export default function AdminCalendarPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={currentUser ?? undefined} />

      {/* Bouton de retour compact */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-spa-turquoise-600 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </Link>
      </div>

      {/* Calendrier pleine hauteur */}
      <div className="flex-1 overflow-hidden">
        <CalendarView userRole={currentUser?.role as any || 'ADMIN'} userId={currentUser?.id} />
      </div>
    </div>
  );
}
