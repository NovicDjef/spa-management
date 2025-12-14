'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/clients/SearchBar';
import { ClientCard } from '@/components/clients/ClientCard';
import { Users, Loader2, ClipboardList } from 'lucide-react';
import { useGetAssignedClientsQuery } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telCellulaire: string;
  courriel: string;
  dateNaissance: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  createdAt: string;
  assignedAt?: string; // Date d'assignation
}

// Fonction pour formater une date en "15 décembre 2023"
const formatDateLong = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  return date.toLocaleDateString('fr-FR', options);
};

// Fonction pour formater une date en "YYYY-MM-DD"
const formatDateShort = (dateString: string) => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export default function ClientsPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  
  // Utiliser useGetAssignedClientsQuery avec polling automatique toutes les 30 secondes
  // Le polling ne s'active que si l'utilisateur est connecté
  const { data: clientsData, isLoading } = useGetAssignedClientsQuery(undefined, {
    pollingInterval: isAuthenticated ? 30000 : 0, // Rafraîchir toutes les 30 secondes si connecté, sinon pas de polling
    skip: !isAuthenticated, // Ne pas faire de requête si l'utilisateur n'est pas connecté
  });

  const clients = useMemo(() => clientsData?.clients || [], [clientsData?.clients]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');

  // Calculate filtered clients and grouped by date using useMemo
  const { filteredClients, groupedByDate } = useMemo(() => {
    let filtered = [...clients];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (client) =>
          client.nom.toLowerCase().includes(query) ||
          client.prenom.toLowerCase().includes(query) ||
          client.courriel.toLowerCase().includes(query) ||
          client.telCellulaire.includes(query)
      );
    }

    // Filter by service type
    if (selectedFilter !== 'ALL') {
      filtered = filtered.filter((client) => client.serviceType === selectedFilter);
    }

    // Filter by assignment date
    if (selectedDate) {
      filtered = filtered.filter((client) => {
        const assignDate = client.assignedAt || client.createdAt;
        return formatDateShort(assignDate) === selectedDate;
      });
    }

    // Group by date
    const grouped: { [key: string]: Client[] } = {};
    filtered.forEach((client) => {
      const dateKey = formatDateShort(client.assignedAt || client.createdAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(client);
    });

    // Sort dates in descending order (most recent first)
    const sortedGrouped: { [key: string]: Client[] } = {};
    Object.keys(grouped)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .forEach((key) => {
        sortedGrouped[key] = grouped[key];
      });

    return {
      filteredClients: filtered,
      groupedByDate: sortedGrouped,
    };
  }, [clients, searchQuery, selectedFilter, selectedDate]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-spa-menthe-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mes Clients Assignés</h1>
              <p className="text-gray-600">
                {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                {searchQuery || selectedFilter !== 'ALL' ? ' trouvé' : ''}
                {filteredClients.length !== 1 && (searchQuery || selectedFilter !== 'ALL') ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Info box */}
          <div className="glass rounded-2xl p-4 flex items-start gap-3">
            <div className="w-2 h-2 bg-spa-menthe-500 rounded-full mt-2"></div>
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Bienvenue sur votre espace professionnel</p>
              <p className="text-gray-600">
                Vous pouvez consulter les dossiers des clients qui vous ont été assignés et
                ajouter des notes de traitement. Cliquez sur un client pour voir son dossier complet.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Barre de recherche et filtre par date */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 space-y-4"
        >
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedFilter}
            placeholder="Rechercher un client par nom, email ou téléphone..."
          />

          {/* Filtre par date */}
          <div className="glass rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par date d'assignation
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-spa max-w-xs"
            />
            {selectedDate && (
              <button
                onClick={() => setSelectedDate('')}
                className="ml-3 text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 font-medium"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </motion.div>

        {/* Liste des clients groupés par date */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-menthe-500 animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery || selectedFilter !== 'ALL' || selectedDate
                ? 'Aucun client trouvé'
                : 'Aucun client assigné'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || selectedFilter !== 'ALL' || selectedDate
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun client ne vous a été assigné pour le moment. Les clients assignés par la secrétaire apparaîtront ici.'}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByDate).map(([date, dateClients], groupIndex) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * groupIndex }}
              >
                {/* En-tête de date */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-spa-turquoise-300 to-transparent"></div>
                  <h2 className="text-xl font-bold text-spa-turquoise-700 px-4 py-2 glass rounded-full">
                    {formatDateLong(date)}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-spa-turquoise-300 to-transparent"></div>
                </div>

                <p className="text-sm text-gray-600 mb-4 text-center">
                  {dateClients.length} client{dateClients.length !== 1 ? 's' : ''} assigné{dateClients.length !== 1 ? 's' : ''} ce jour
                </p>

                {/* Grille de clients pour cette date */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dateClients.map((client, index) => (
                    <motion.div
                      key={client.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * index }}
                    >
                      <ClientCard client={client} showActions={false} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
