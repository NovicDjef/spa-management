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
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);

  const menuItems = [
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
      title: 'Statistiques Globales',
      description: 'Vue d\'ensemble des performances de l\'établissement et tendances.',
      icon: BarChart3,
      href: '/admin/statistics',
      color: 'from-spa-menthe-500 to-spa-turquoise-500',
      iconBg: 'bg-spa-menthe-50',
      iconColor: 'text-spa-menthe-600',
      comingSoon: true,
    },
  ];

  const quickStats = [
    {
      label: 'Employés Actifs',
      value: '—',
      icon: Users,
      color: 'text-spa-turquoise-600',
      bg: 'bg-spa-turquoise-50',
    },
    {
      label: 'Avis Clients',
      value: '—',
      icon: Star,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Note Moyenne',
      value: '—',
      icon: TrendingUp,
      color: 'text-spa-menthe-600',
      bg: 'bg-spa-menthe-50',
    },
    {
      label: 'Clients Total',
      value: '—',
      icon: Calendar,
      color: 'text-spa-rose-600',
      bg: 'bg-spa-rose-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* Retour à l'accueil */}
          <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-8"
              >
                <Link
                  href="/professionnel/dashboard"
                  className="text-spa-rose-600 hover:text-spa-rose-700 font-medium transition-colors"
                >
                  ← Retour au dashboard
                </Link>
              </motion.div>
      </div>

      <div className="container-spa py-8">
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
              onClick={() => !item.comingSoon && router.push(item.href)}
              className={`card-spa group relative overflow-hidden ${
                item.comingSoon ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-xl'
              } transition-all duration-300`}
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
                  {!item.comingSoon && (
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  )}
                  {item.comingSoon && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                      Bientôt
                    </span>
                  )}
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
