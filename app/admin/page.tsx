'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  Users,
  Mail,
  BarChart3,
  Star,
  TrendingUp,
  Calendar,
  ArrowRight,
  MessageSquare,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useGetUsersQuery, useGetAllReviewsQuery, useGetClientsQuery } from '@/lib/redux/services/api';
import { useMemo } from 'react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch real statistics
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: reviewsData, isLoading: reviewsLoading } = useGetAllReviewsQuery({ limit: 1000 });
  const { data: clientsData, isLoading: clientsLoading } = useGetClientsQuery({});

  const isLoading = usersLoading || reviewsLoading || clientsLoading;

  // Calculate real statistics
  const stats = useMemo(() => {
    const activeEmployees = usersData?.users?.filter(u => u.isActive).length || 0;
    const totalReviews = reviewsData?.pagination?.totalCount || 0;
    const avgRating = reviewsData?.reviews && reviewsData.reviews.length > 0
      ? (reviewsData.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsData.reviews.length).toFixed(1)
      : '0.0';
    // Utiliser le total de la pagination au lieu du nombre de clients dans la page
    const totalClients = clientsData?.pagination?.total || clientsData?.clients?.length || 0;

    return {
      activeEmployees,
      totalReviews,
      avgRating,
      totalClients,
    };
  }, [usersData, reviewsData, clientsData]);

  const menuItems = [
    {
      title: 'Calendrier des Réservations',
      description: 'Gérer les réservations, créer de nouvelles réservations et visualiser le calendrier en temps réel.',
      icon: Calendar,
      href: '/admin/calendar',
      color: 'from-blue-500 to-indigo-500',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Gestion des Employés',
      description: 'Créer, modifier et gérer les employés. Voir les statistiques de performance et les avis clients.',
      icon: Users,
      href: '/admin/employees',
      color: 'from-spa-turquoise-500 to-spa-menthe-500',
      iconBg: 'bg-spa-turquoise-50',
      iconColor: 'text-spa-turquoise-600',
    },
    {
      title: 'Marketing & Campagnes',
      description: 'Gérer les campagnes marketing, envoyer des emails et consulter les statistiques clients.',
      icon: Mail,
      href: '/admin/marketing',
      color: 'from-spa-rose-500 to-spa-lavande-500',
      iconBg: 'bg-spa-rose-50',
      iconColor: 'text-spa-rose-600',
    },
    {
      title: 'Gestion des Avis',
      description: 'Consulter tous les avis clients avec filtres avancés. Vue globale et statistiques détaillées.',
      icon: MessageSquare,
      href: '/admin/avis',
      color: 'from-spa-lavande-500 to-spa-rose-500',
      iconBg: 'bg-spa-lavande-50',
      iconColor: 'text-spa-lavande-600',
    },
    {
      title: 'Statistiques Globales',
      description: 'Vue d\'ensemble des performances de l\'établissement et tendances.',
      icon: BarChart3,
      href: '/admin/statistics',
      color: 'from-spa-menthe-500 to-spa-turquoise-500',
      iconBg: 'bg-spa-menthe-50',
      iconColor: 'text-spa-menthe-600',
    },
  ];

  const quickStats = [
    {
      label: 'Employés Actifs',
      value: isLoading ? '—' : stats.activeEmployees.toString(),
      icon: Users,
      color: 'text-spa-turquoise-600',
      bg: 'bg-spa-turquoise-50',
    },
    {
      label: 'Avis Clients',
      value: isLoading ? '—' : stats.totalReviews.toString(),
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Note Moyenne',
      value: isLoading ? '—' : `${stats.avgRating}/5`,
      icon: TrendingUp,
      color: 'text-spa-menthe-600',
      bg: 'bg-spa-menthe-50',
    },
    {
      label: 'Clients Inscrits',
      value: isLoading ? '—' : stats.totalClients.toString(),
      icon: Calendar,
      color: 'text-spa-rose-600',
      bg: 'bg-spa-rose-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />
      <div className="container-spa py-8">
        {/* Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/professionnel/dashboard"
            className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour au tableau de bord</span>
          </Link>
        </motion.div>

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Administration
          </h1>
          <p className="text-gray-600">
            Tableau de bord administrateur - Gestion de l'établissement
          </p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card-spa"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Menu Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(item.href)}
              className="card-spa group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* Content */}
              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 ${item.iconBg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-7 h-7 ${item.iconColor}`} />
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info Box */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 p-6 bg-gradient-to-r from-spa-turquoise-50 to-spa-menthe-50 rounded-2xl border border-spa-turquoise-100"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-spa-turquoise-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">
                Nouveau : Système d'Avis Clients
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                Les clients peuvent maintenant laisser des avis anonymes sur la page{' '}
                <a href="/avis" className="font-medium text-spa-turquoise-600 hover:underline">
                  /avis
                </a>
                . Consultez les statistiques de performance dans la section{' '}
                <span className="font-medium">Gestion des Employés</span>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
