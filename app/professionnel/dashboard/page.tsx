'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/clients/SearchBar';
import { ClientCard } from '@/components/clients/ClientCard';
import { Users, UserPlus, Loader2, X, Target } from 'lucide-react';
import { useGetClientsQuery, useGetUsersQuery, useAssignClientMutation } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { hasPermission, isAdminOrSecretary } from '@/lib/permissions';

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

interface Professional {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
}

export default function DashboardPage() {
  const { data: clientsData, isLoading } = useGetClientsQuery({});
  const { 
    data: usersData, 
    isLoading: isLoadingUsers, 
    error: usersError,
    refetch: refetchUsers 
  } = useGetUsersQuery({}, {
    // Refetch automatique si la requête échoue
    refetchOnMountOrArgChange: true,
    // Réessayer en cas d'échec
    retry: 2,
  });
  const [assignClient, { isLoading: isAssigning }] = useAssignClientMutation();

  const currentUser = useAppSelector((state) => state.auth.user) || {
    name: 'Marie Dubois',
    email: 'marie@spa.com',
    role: 'SECRETAIRE',
  };

  const clients = clientsData?.clients || [];

  // Filtrer uniquement les professionnels (massothérapeutes et esthéticiennes)
  // Utiliser useMemo pour éviter de recalculer à chaque render
  const professionals = useMemo(() => {
    // Vérifier que les données sont disponibles et valides
    if (!usersData) {
      return [];
    }
    
    // S'assurer que users est un tableau
    const users = usersData.users;
    if (!users || !Array.isArray(users)) {
      return [];
    }
    
    // Filtrer les professionnels
    return users.filter(
      (user) => user && (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE')
    );
  }, [usersData]);

  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState('');

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

  const handleAssignClient = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowAssignModal(true);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedClient || !selectedProfessional) {
      console.log('Assignation annulée - données manquantes:', {
        selectedClient,
        selectedProfessional
      });
      return;
    }

    console.log('Début de l\'assignation:', {
      clientId: selectedClient.id,
      clientNom: `${selectedClient.prenom} ${selectedClient.nom}`,
      professionalId: selectedProfessional,
    });

    try {
      const result = await assignClient({
        clientId: selectedClient.id,
        professionalId: selectedProfessional,
      }).unwrap();

      console.log('Assignation réussie:', result);
      alert('Client assigné avec succès!');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedProfessional('');
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation:', error);
      alert(`Une erreur est survenue lors de l'assignation: ${error?.data?.message || error.message || 'Erreur inconnue'}`);
    }
  };

  const getProfessionalLabel = (professional: Professional) => {
    const roleLabel =
      professional.role === 'MASSOTHERAPEUTE'
        ? 'Massothérapeute'
        : professional.role === 'ESTHETICIENNE'
        ? 'Esthéticienne'
        : professional.role;
    return `${professional.prenom} ${professional.nom} - ${roleLabel}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Boutons Admin */}
          {currentUser.role === 'ADMIN' && (
            <div className="mb-6 flex gap-4">
              <a
                href="/admin/employees"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Users className="w-5 h-5" />
                Gérer les Employés
              </a>
              <a
                href="/admin/marketing"
                className="inline-flex items-center gap-2 px-4 py-2 bg-spa-turquoise-600 text-white rounded-lg hover:bg-spa-turquoise-700 transition-colors"
              >
                <Target className="w-5 h-5" />
                Campagnes Marketing
              </a>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-spa-turquoise-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Clients</h1>
                <p className="text-gray-600">
                  {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
                  {searchQuery || selectedFilter !== 'ALL' ? ' trouvé' : ''}
                  {filteredClients.length !== 1 && (searchQuery || selectedFilter !== 'ALL') ? 's' : ''}
                </p>
              </div>
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
          />
        </motion.div>

        {/* Liste des clients */}
        {isLoading ? (
          <div className="flex items-center justify-center mt-8">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
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
                : 'Aucun client enregistré'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les nouveaux clients apparaîtront ici'}
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
                <ClientCard
                  client={client}
                  showActions={true}
                  onAssign={hasPermission(currentUser.role, 'ASSIGN_CLIENTS') ? handleAssignClient : undefined}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal d'assignation */}
      <AnimatePresence>
        {showAssignModal && selectedClient && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAssignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-soft-lg max-w-md w-full p-8"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-spa-turquoise-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Assigner un client</h2>
                    <p className="text-sm text-gray-600">
                      {selectedClient.prenom} {selectedClient.nom}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <label className="label-spa">
                  Sélectionner un professionnel <span className="text-spa-turquoise-500">*</span>
                </label>
                {isLoadingUsers ? (
                  <div className="input-spa flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-spa-turquoise-500 animate-spin" />
                    <span className="ml-2 text-gray-500">Chargement...</span>
                  </div>
                ) : (
                  <select
                    value={selectedProfessional}
                    onChange={(e) => {
                      console.log('Professional sélectionné:', e.target.value);
                      setSelectedProfessional(e.target.value);
                    }}
                    className="input-spa"
                  >
                    <option value="">Choisir un professionnel...</option>
                    {professionals
                      .filter((p) => {
                        const shouldInclude = selectedClient.serviceType === 'MASSOTHERAPIE'
                          ? p.role === 'MASSOTHERAPEUTE'
                          : p.role === 'ESTHETICIENNE';
                        console.log(`Filtrage ${p.prenom} ${p.nom} (${p.role}):`, shouldInclude);
                        return shouldInclude;
                      })
                      .map((professional) => {
                        const label = getProfessionalLabel(professional);
                        console.log('Option ajoutée:', label, professional.id);
                        return (
                          <option key={professional.id} value={professional.id}>
                            {label}
                          </option>
                        );
                      })}
                  </select>
                )}
                {/* Messages d'erreur et d'avertissement */}
                {!isLoadingUsers && usersError && (
                  <div className="text-sm text-yellow-600 mt-2">
                    <p className="mb-2">
                      ⚠️ Impossible de charger les professionnels. Veuillez réessayer.
                    </p>
                    <button
                      onClick={() => refetchUsers()}
                      className="text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 font-medium underline"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                {!isLoadingUsers && !usersError && usersData && professionals.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">
                    ⚠️ Aucun professionnel trouvé. Vérifiez que des utilisateurs avec le rôle MASSOTHERAPEUTE ou ESTHETICIENNE existent.
                  </p>
                )}
                {!isLoadingUsers && !usersError && usersData && professionals.length > 0 && selectedClient && (() => {
                  const filteredProfessionals = professionals.filter((p) => {
                    return selectedClient.serviceType === 'MASSOTHERAPIE'
                      ? p.role === 'MASSOTHERAPEUTE'
                      : p.role === 'ESTHETICIENNE';
                  });
                  return filteredProfessionals.length === 0 ? (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ Aucun {selectedClient.serviceType === 'MASSOTHERAPIE' ? 'massothérapeute' : 'esthéticienne'} disponible pour ce type de service.
                    </p>
                  ) : null;
                })()}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 btn-outline"
                  disabled={isAssigning}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssignSubmit}
                  disabled={!selectedProfessional || isAssigning}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Assignation...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Assigner
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
