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
  DollarSign,
} from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetUsersQuery, useGetAllReviewsQuery, useGetReceiptsQuery } from '@/lib/redux/services/api';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  Area,
  AreaChart,
} from 'recharts';

export default function StatisticsPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  // Fetch data
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({});
  const { data: reviewsData, isLoading: reviewsLoading } = useGetAllReviewsQuery({
    limit: 1000, // Get all reviews for statistics
  });
  const { data: receiptsData, isLoading: receiptsLoading } = useGetReceiptsQuery();

  const isLoading = usersLoading || reviewsLoading || receiptsLoading;

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

  // Financial statistics for therapists (based on receipts)
  const financialStats = useMemo(() => {
    if (!receiptsData || !usersData?.users) return [];

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Group receipts by therapist
    const therapistStats = new Map<string, {
      name: string;
      role: string;
      dailyRevenue: number;
      weeklyRevenue: number;
      monthlyRevenue: number;
      dailyCount: number;
      weeklyCount: number;
      monthlyCount: number;
      totalRevenue: number;
      totalCount: number;
    }>();

    receiptsData.forEach((receipt) => {
      const therapistName = receipt.therapistName || 'Inconnu';
      const receiptDate = new Date(receipt.sentAt || receipt.createdAt);
      const amount = Number(receipt.total) || 0;

      if (!therapistStats.has(therapistName)) {
        therapistStats.set(therapistName, {
          name: therapistName,
          role: 'MASSOTHERAPEUTE',
          dailyRevenue: 0,
          weeklyRevenue: 0,
          monthlyRevenue: 0,
          dailyCount: 0,
          weeklyCount: 0,
          monthlyCount: 0,
          totalRevenue: 0,
          totalCount: 0,
        });
      }

      const stats = therapistStats.get(therapistName)!;

      // Total
      stats.totalRevenue += amount;
      stats.totalCount += 1;

      // Daily
      if (receiptDate.toDateString() === today.toDateString()) {
        stats.dailyRevenue += amount;
        stats.dailyCount += 1;
      }

      // Weekly
      if (receiptDate >= startOfWeek) {
        stats.weeklyRevenue += amount;
        stats.weeklyCount += 1;
      }

      // Monthly
      if (receiptDate >= startOfMonth) {
        stats.monthlyRevenue += amount;
        stats.monthlyCount += 1;
      }
    });

    return Array.from(therapistStats.values())
      .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);
  }, [receiptsData, usersData]);

  // Combined employee performance data (revenue + ratings)
  const employeePerformance = useMemo(() => {
    if (!usersData?.users) return [];

    const professionals = usersData.users.filter(
      (u) => u.role === 'MASSOTHERAPEUTE' || u.role === 'ESTHETICIENNE'
    );

    return professionals.map((user) => {
      const fullName = `${user.prenom} ${user.nom}`;
      const financialData = financialStats.find((f) => f.name === fullName);

      return {
        id: user.id,
        name: fullName,
        role: user.role,
        rating: user.averageRating || 0,
        reviewCount: user._count?.reviewsReceived || 0,
        monthlyRevenue: financialData?.monthlyRevenue || 0,
        totalRevenue: financialData?.totalRevenue || 0,
        clientCount: user._count?.assignedClients || 0,
      };
    }).sort((a, b) => {
      // Sort by monthly revenue first, then by rating
      if (b.monthlyRevenue !== a.monthlyRevenue) {
        return b.monthlyRevenue - a.monthlyRevenue;
      }
      return b.rating - a.rating;
    });
  }, [usersData, financialStats]);

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

            {/* Performance Charts - Revenus et Notes par Employé */}
            {employeePerformance.length > 0 && (
              <>
                {/* Combined Chart - Revenus & Notes */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="card-spa mb-6 overflow-x-auto"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                        <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800">Performance des Employés</h2>
                        <p className="text-xs sm:text-sm text-gray-600">Revenus mensuels et notes moyennes</p>
                      </div>
                    </div>
                  </div>

                  {/* Mobile: Scroll hint */}
                  <div className="sm:hidden mb-3 flex items-center gap-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span>Glissez horizontalement pour voir tout le graphique</span>
                  </div>

                  <div className="w-full min-w-[600px] sm:min-w-0 h-[400px] sm:h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        data={employeePerformance.map(emp => ({
                          name: emp.name.split(' ')[0],
                          fullName: emp.name,
                          revenus: emp.monthlyRevenue,
                          note: emp.rating,
                          clients: emp.clientCount,
                          avis: emp.reviewCount,
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                      >
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                          </linearGradient>
                          <linearGradient id="colorNote" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                          interval={0}
                        />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#10b981"
                          tick={{ fill: '#10b981', fontSize: 12, fontWeight: 600 }}
                          label={{ value: 'Revenus ($)', angle: -90, position: 'insideLeft', fill: '#10b981', fontWeight: 700 }}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#f59e0b"
                          domain={[0, 5]}
                          tick={{ fill: '#f59e0b', fontSize: 12, fontWeight: 600 }}
                          label={{ value: 'Note Moyenne', angle: 90, position: 'insideRight', fill: '#f59e0b', fontWeight: 700 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            padding: '12px',
                          }}
                          labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}
                          formatter={(value: any, name?: string) => {
                            if (name === 'revenus') return [`${Number(value).toFixed(2)}$`, 'Revenus'];
                            if (name === 'note') return [`${Number(value).toFixed(1)}/5`, 'Note'];
                            if (name === 'clients') return [value, 'Clients'];
                            if (name === 'avis') return [value, 'Avis'];
                            return [value, name || ''];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                          formatter={(value) => {
                            if (value === 'revenus') return 'Revenus Mensuels ($)';
                            if (value === 'note') return 'Note Moyenne';
                            return value;
                          }}
                        />
                        <Bar
                          yAxisId="left"
                          dataKey="revenus"
                          fill="url(#colorRevenue)"
                          radius={[8, 8, 0, 0]}
                          animationDuration={1500}
                          animationBegin={200}
                        >
                          {employeePerformance.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={index < 3 ? '#059669' : '#10b981'}
                            />
                          ))}
                        </Bar>
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="note"
                          stroke="#f59e0b"
                          strokeWidth={3}
                          dot={{ fill: '#f59e0b', r: 6, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 8, strokeWidth: 3 }}
                          animationDuration={2000}
                          animationBegin={500}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Footer */}
                  <div className="mt-6 pt-6 border-t-2 border-gray-200 bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <DollarSign className="w-5 h-5 text-emerald-600" />
                          <span className="text-xs font-medium text-gray-600 uppercase">Total Mois</span>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                          {employeePerformance.reduce((sum, e) => sum + e.monthlyRevenue, 0).toFixed(0)}$
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Star className="w-5 h-5 text-amber-600" />
                          <span className="text-xs font-medium text-gray-600 uppercase">Moyenne</span>
                        </div>
                        <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                          {(employeePerformance.reduce((sum, e) => sum + e.rating, 0) / employeePerformance.length).toFixed(1)}/5
                        </div>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Users className="w-5 h-5 text-spa-turquoise-600" />
                          <span className="text-xs font-medium text-gray-600 uppercase">Employés</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-800">
                          {employeePerformance.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Area Chart - Évolution des Performances */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="card-spa mb-8 overflow-x-auto"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800">Classement par Performance</h2>
                      <p className="text-xs sm:text-sm text-gray-600">Vue d'ensemble des revenus générés</p>
                    </div>
                  </div>

                  {/* Mobile: Scroll hint */}
                  <div className="sm:hidden mb-3 flex items-center gap-2 text-xs text-gray-500 bg-cyan-50 px-3 py-2 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                    <span>Glissez horizontalement pour voir tout le graphique</span>
                  </div>

                  <div className="w-full min-w-[600px] sm:min-w-0 h-[350px] sm:h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={employeePerformance.map((emp, idx) => ({
                          name: emp.name.split(' ')[0],
                          fullName: emp.name,
                          revenus: emp.monthlyRevenue,
                          total: employeePerformance.slice(0, idx + 1).reduce((sum, e) => sum + e.monthlyRevenue, 0),
                        }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          tick={{ fill: '#374151', fontSize: 11, fontWeight: 500 }}
                          interval={0}
                        />
                        <YAxis
                          tick={{ fill: '#0891b2', fontSize: 12, fontWeight: 600 }}
                          label={{ value: 'Revenus Cumulés ($)', angle: -90, position: 'insideLeft', fill: '#0891b2', fontWeight: 700 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                            padding: '12px',
                          }}
                          formatter={(value: any, name?: string) => {
                            if (name === 'revenus') return [`${Number(value).toFixed(2)}$`, 'Revenus'];
                            if (name === 'total') return [`${Number(value).toFixed(2)}$`, 'Total Cumulé'];
                            return [value, name || ''];
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="total"
                          stroke="#0891b2"
                          strokeWidth={3}
                          fill="url(#colorArea)"
                          animationDuration={2000}
                          animationBegin={300}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </>
            )}

            {/* Distribution des Notes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
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
                className="card-spa mb-8"
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

            {/* Financial Performance - Massotherapists Revenue */}
            {financialStats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="card-spa"
              >
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Performances Financières des Massothérapeutes</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Thérapeute
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Aujourd'hui
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Cette Semaine
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Ce Mois
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {financialStats.map((therapist, index) => (
                        <motion.tr
                          key={therapist.name}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.05 }}
                          className="hover:bg-green-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {therapist.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600">
                                {therapist.dailyRevenue.toFixed(2)}$
                              </div>
                              <div className="text-xs text-gray-500">
                                {therapist.dailyCount} reçu{therapist.dailyCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600">
                                {therapist.weeklyRevenue.toFixed(2)}$
                              </div>
                              <div className="text-xs text-gray-500">
                                {therapist.weeklyCount} reçu{therapist.weeklyCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-center">
                              <div className="text-sm font-bold text-green-600">
                                {therapist.monthlyRevenue.toFixed(2)}$
                              </div>
                              <div className="text-xs text-gray-500">
                                {therapist.monthlyCount} reçu{therapist.monthlyCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-center">
                              <div className="text-sm font-bold text-gray-900">
                                {therapist.totalRevenue.toFixed(2)}$
                              </div>
                              <div className="text-xs text-gray-500">
                                {therapist.totalCount} reçu{therapist.totalCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gradient-to-r from-green-50 to-emerald-50 border-t-2 border-gray-300">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-bold text-gray-900">TOTAL GÉNÉRAL</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-700">
                              {financialStats.reduce((sum, t) => sum + t.dailyRevenue, 0).toFixed(2)}$
                            </div>
                            <div className="text-xs text-gray-600">
                              {financialStats.reduce((sum, t) => sum + t.dailyCount, 0)} reçu(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-700">
                              {financialStats.reduce((sum, t) => sum + t.weeklyRevenue, 0).toFixed(2)}$
                            </div>
                            <div className="text-xs text-gray-600">
                              {financialStats.reduce((sum, t) => sum + t.weeklyCount, 0)} reçu(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="text-sm font-bold text-green-700">
                              {financialStats.reduce((sum, t) => sum + t.monthlyRevenue, 0).toFixed(2)}$
                            </div>
                            <div className="text-xs text-gray-600">
                              {financialStats.reduce((sum, t) => sum + t.monthlyCount, 0)} reçu(s)
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-center">
                            <div className="text-sm font-bold text-gray-900">
                              {financialStats.reduce((sum, t) => sum + t.totalRevenue, 0).toFixed(2)}$
                            </div>
                            <div className="text-xs text-gray-600">
                              {financialStats.reduce((sum, t) => sum + t.totalCount, 0)} reçu(s)
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tfoot>
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
