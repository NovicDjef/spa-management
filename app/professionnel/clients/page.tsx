'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/clients/SearchBar';
import { ClientCard } from '@/components/clients/ClientCard';
import { Users, Loader2, ClipboardList, X, Sparkles } from 'lucide-react';
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
  const { data: clientsData, isLoading, error } = useGetAssignedClientsQuery(undefined, {
    pollingInterval: isAuthenticated ? 30000 : 0, // Rafraîchir toutes les 30 secondes si connecté, sinon pas de polling
    skip: !isAuthenticated, // Ne pas faire de requête si l'utilisateur n'est pas connecté
  });

  const clients = useMemo(() => {
    console.log('ClientsPage - clientsData:', clientsData);
    console.log('ClientsPage - clientsData?.clients:', clientsData?.clients);
    console.log('ClientsPage - error:', error);
    console.log('ClientsPage - currentUser:', currentUser);

    // Log détaillé de chaque client pour vérifier assignedAt et hasNoteAfterAssignment
    if (clientsData?.clients) {
      clientsData.clients.forEach((client, index) => {
        console.log(`Client ${index + 1}:`, {
          nom: `${client.prenom} ${client.nom}`,
          assignedAt: client.assignedAt,
          hasNoteAfterAssignment: client.hasNoteAfterAssignment,
          createdAt: client.createdAt,
        });
      });
    }

    return clientsData?.clients || [];
  }, [clientsData?.clients, clientsData, error, currentUser]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Afficher le popup de bienvenue au chargement de la page (une fois par session)
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Vérifier si le popup a déjà été affiché dans cette session
      const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
      if (!hasSeenWelcome) {
        // Attendre un peu pour que la page se charge complètement
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
          sessionStorage.setItem('hasSeenWelcome', 'true');
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, currentUser]);

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
        // Sort clients within each date group by assignedAt time (most recent first)
        sortedGrouped[key] = grouped[key].sort((a, b) => {
          const dateA = new Date(a.assignedAt || a.createdAt).getTime();
          const dateB = new Date(b.assignedAt || b.createdAt).getTime();
          return dateB - dateA; // Descending order (newest first)
        });
      });

    return {
      filteredClients: filtered,
      groupedByDate: sortedGrouped,
    };
  }, [clients, searchQuery, selectedFilter, selectedDate]);

  // Function to check if client needs a note (shows "Nouveau RDV" badge)
  // Le badge s'affiche si le client a été assigné MAIS n'a pas encore de note après l'assignation
  const needsNote = (client: Client) => {
    // Si pas d'assignation, pas de badge
    if (!client.assignedAt) {
      console.log(`needsNote - ${client.prenom} ${client.nom}: pas de assignedAt`);
      return false;
    }

    // Si une note a été ajoutée après l'assignation, pas de badge
    if (client.hasNoteAfterAssignment === true) {
      console.log(`needsNote - ${client.prenom} ${client.nom}: note déjà ajoutée après assignation`);
      return false;
    }

    // Sinon, le client a besoin d'une note -> afficher le badge
    console.log(`needsNote - ${client.prenom} ${client.nom}: BESOIN D'UNE NOTE (badge affiché)`);
    return true;
  };


  return (
    <>
      {/* Popup de bienvenue */}
      <AnimatePresence>
        {showWelcomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWelcomeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden"
            >
              {/* Fond décoratif */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full -ml-12 -mb-12 opacity-50"></div>

              {/* Contenu */}
              <div className="relative z-10">
                {/* Bouton fermer */}
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                {/* Icône */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200 rounded-full flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-spa-menthe-600" />
                  </div>
                </div>

                {/* Titre */}
                <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
                  Bienvenue sur votre espace professionnel
                </h2>

                {/* Message */}
                <p className="text-gray-600 text-center leading-relaxed mb-6">
                  Vous pouvez consulter les dossiers des clients qui vous ont été assignés et
                  ajouter des notes de traitement. Cliquez sur un client pour voir son dossier complet.
                </p>

                {/* Bouton */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="px-6 py-3 bg-gradient-to-r from-spa-menthe-500 to-spa-menthe-600 text-white rounded-xl font-medium hover:from-spa-menthe-600 hover:to-spa-menthe-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Compris, merci !
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
        </motion.div>

        {/* Barre de recherche et filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedFilter}
            onDateChange={setSelectedDate}
            selectedDate={selectedDate}
            placeholder="Rechercher un client par nom, email ou téléphone..."
          />
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
                      <ClientCard
                        client={client}
                        showActions={false}
                        isNewAssignment={needsNote(client)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      </div>
    </>
  );
}
