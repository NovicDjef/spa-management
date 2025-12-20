'use client';

import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import {
  BarChart3,
  Users,
  Star,
  MessageSquare,
  TrendingUp,
  ArrowLeft,
  Loader2,
  Award,
  Calendar,
} from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetUsersQuery, useGetAllReviewsQuery } from '@/lib/redux/services/api';
import Link from 'next/link';
import { useMemo } from 'react';

export default function StatisticsPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch data
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: reviewsData, isLoading: reviewsLoading } = useGetAllReviewsQuery({
    limit: 1000, // Get all reviews for statistics
  });

  const isLoading = usersLoading || reviewsLoading;

  // Calculate statistics
  const stats = useMemo(() => {
    if (!usersData?.users || !reviewsData?.reviews) {
      return {
        totalEmployees: 0,
        activeProfessionals: 0,
        totalReviews: 0,
        averageRating: 0,
        totalClients: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const professionals = usersData.users.filter(
      (u) => u.role === 'MASSOTHERAPEUTE' || u.role === 'ESTHETICIENNE'
    );

    const activeProfessionals = professionals.filter((u) => u.isActive).length;

    const totalReviews = reviewsData.pagination.totalCount;

    // Calculate average rating
    const sumRatings = reviewsData.reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0;

    // Calculate rating distribution
    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.reviews.forEach((review) => {
      ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
    });

    // Calculate total clients (sum of all assignedClients)
    const totalClients = usersData.users.reduce(
      (sum, user) => sum + (user._count?.assignedClients || 0),
      0
    );

    return {
      totalEmployees: usersData.users.length,
      activeProfessionals,
      totalReviews,
      averageRating,
      totalClients,
      ratingDistribution,
    };
  }, [usersData, reviewsData]);

  // Top performers (professionals with highest average rating)
  const topPerformers = useMemo(() => {
    if (!usersData?.users) return [];

    return usersData.users
      .filter((u) => (u.role === 'MASSOTHERAPEUTE' || u.role === 'ESTHETICIENNE') && u.averageRating)
      .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
      .slice(0, 5);
  }, [usersData]);

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
            href="/admin"
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
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-spa-menthe-500 to-spa-turquoise-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Statistiques Globales
              </h1>
              <p className="text-gray-600">
                Vue d'ensemble des performances de l'établissement
              </p>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : (
          <>
            {/* Statistiques Rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            >
              <div className="card-spa">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-spa-turquoise-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-spa-turquoise-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Employés</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalEmployees}</p>
                    <p className="text-xs text-gray-500">{stats.activeProfessionals} professionnels actifs</p>
                  </div>
                </div>
              </div>

              <div className="card-spa">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Note Moyenne</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-gray-500">sur 5 étoiles</p>
                  </div>
                </div>
              </div>

              <div className="card-spa">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-spa-rose-100 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-spa-rose-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Avis</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalReviews}</p>
                    <p className="text-xs text-gray-500">avis clients</p>
                  </div>
                </div>
              </div>

              <div className="card-spa">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-spa-lavande-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-spa-lavande-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Clients</p>
                    <p className="text-2xl font-bold text-gray-800">{stats.totalClients}</p>
                    <p className="text-xs text-gray-500">clients assignés</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Distribution des Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card-spa mb-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-5 h-5 text-spa-turquoise-600" />
                <h2 className="text-lg font-semibold text-gray-800">Distribution des Notes</h2>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                  const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-4">
                      <div className="flex items-center gap-1 w-20">
                        <span className="text-sm font-medium text-gray-700">{rating}</span>
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className={`h-full ${
                            rating === 5
                              ? 'bg-green-500'
                              : rating === 4
                              ? 'bg-spa-turquoise-500'
                              : rating === 3
                              ? 'bg-yellow-500'
                              : rating === 2
                              ? 'bg-orange-500'
                              : 'bg-red-500'
                          }`}
                        />
                      </div>
                      <div className="w-24 text-right">
                        <span className="text-sm font-medium text-gray-700">{count}</span>
                        <span className="text-xs text-gray-500 ml-1">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Top Performers */}
            {topPerformers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card-spa"
              >
                <div className="flex items-center gap-3 mb-6">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Meilleurs Performances</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Rang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Employé
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Note Moyenne
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre d'Avis
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Clients
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topPerformers.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.05 }}
                          className="hover:bg-spa-beige-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full">
                              <span className="text-white font-bold text-sm">#{index + 1}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.prenom} {user.nom}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs text-gray-600">
                              {user.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span className="text-sm font-semibold text-gray-900">
                                {user.averageRating?.toFixed(1)}
                              </span>
                              <span className="text-xs text-gray-500">/ 5</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4 text-spa-rose-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {user._count?.reviewsReceived || 0}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-spa-turquoise-500" />
                              <span className="text-sm font-medium text-gray-900">
                                {user._count?.assignedClients || 0}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
