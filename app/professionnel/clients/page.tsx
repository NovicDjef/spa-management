'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
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
}

export default function ClientsPage() {
  const { data: clientsData, isLoading } = useGetAssignedClientsQuery();

  const currentUser = useAppSelector((state) => state.auth.user) || {
    name: 'Dr. Sophie Martin',
    email: 'sophie@spa.com',
    role: 'MASSOTHERAPEUTE',
  };

  const clients = clientsData?.clients || [];

  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, selectedFilter]);

  const filterClients = () => {
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

    setFilteredClients(filtered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser} />

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

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedFilter}
            placeholder="Rechercher un client par nom, email ou téléphone..."
          />
        </motion.div>

        {/* Liste des clients */}
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
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Aucun client trouvé'
                : 'Aucun client assigné'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Aucun client ne vous a été assigné pour le moment. Les clients assignés par la secrétaire apparaîtront ici.'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <ClientCard client={client} showActions={false} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
