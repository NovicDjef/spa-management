'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetAssignedClientsQuery } from '@/lib/redux/services/api';
import { Users, Search, Loader2, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState('');

  // Récupérer les clients assignés
  const { data: clientsData, isLoading, error, refetch } = useGetAssignedClientsQuery();

  const clients = clientsData?.clients || [];

  // Trier les clients par date d'assignation (les plus récents en premier)
  const sortedClients = [...clients].sort((a, b) => {
    const dateA = a.assignedAt ? new Date(a.assignedAt).getTime() : 0;
    const dateB = b.assignedAt ? new Date(b.assignedAt).getTime() : 0;
    return dateB - dateA;
  });

  // Filtrer les clients par nom, prénom ou courriel
  const filteredClients = sortedClients.filter(client =>
    client.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.courriel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Rediriger si l'utilisateur n'a pas accès
  useEffect(() => {
    if (currentUser && (currentUser.role === 'SECRETAIRE' || currentUser.role === 'ADMIN')) {
      router.push('/professionnel/dashboard');
    }
  }, [currentUser, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={currentUser} />
        <div className="container-spa py-12">
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <p className="text-red-600 mb-4">Erreur de chargement des clients</p>
            <button onClick={() => refetch()} className="btn-primary">
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const newClientsCount = filteredClients.filter(c => !c.hasNoteAfterAssignment).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />

      <div className="max-w-5xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* En-tête épuré */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Mes Clients
          </h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>{filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}</span>
            {newClientsCount > 0 && (
              <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
                {newClientsCount} nouveau{newClientsCount !== 1 ? 'x' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Barre de recherche élégante */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Liste des clients */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-spa-turquoise-500 animate-spin mb-4" />
            <p className="text-gray-600">Chargement...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'Aucun résultat' : 'Aucun client'}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Essayez une autre recherche'
                : 'Vous n\'avez pas encore de clients assignés'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClients.map((client, index) => {
              const notesCount = client.notes?.length || 0;
              const isNew = !client.hasNoteAfterAssignment;
              const initials = `${client.prenom.charAt(0)}${client.nom.charAt(0)}`;

              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={`/professionnel/clients/${client.id}`}>
                    <div className="group relative bg-white rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md border border-gray-100 hover:border-spa-turquoise-200 transition-all duration-200 cursor-pointer">
                      {/* Badge Nouveau */}
                      <AnimatePresence>
                        {isNew && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-2 -right-2 sm:top-4 sm:right-4"
                          >
                            <div className="px-2.5 py-1 bg-gradient-to-r from-orange-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              NOUVEAU
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-spa-turquoise-400 to-spa-turquoise-600 rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-bold shadow-sm">
                            {initials}
                          </div>
                        </div>

                        {/* Informations */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                              {client.prenom} {client.nom}
                            </h3>
                            {client.isActive !== false && (
                              <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                Actif
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-gray-600 mb-3">
                            <span className="truncate">{client.courriel}</span>
                            {client.telCellulaire && (
                              <>
                                <span className="hidden sm:inline text-gray-300">•</span>
                                <span>{client.telCellulaire.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')}</span>
                              </>
                            )}
                          </div>

                          {/* Compteur de notes et date */}
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <div className={`px-2 py-1 rounded-md font-medium ${
                                notesCount > 0
                                  ? 'bg-spa-turquoise-50 text-spa-turquoise-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {notesCount} note{notesCount !== 1 ? 's' : ''}
                              </div>
                            </div>
                            <span className="text-gray-300">•</span>
                            <span>
                              Assigné le{' '}
                              {client.assignedAt
                                ? new Date(client.assignedAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                                : new Date(client.createdAt).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                  })
                              }
                            </span>
                          </div>
                        </div>

                        {/* Flèche */}
                        <div className="flex-shrink-0 hidden sm:block">
                          <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-spa-turquoise-50 flex items-center justify-center transition-colors">
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-spa-turquoise-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
