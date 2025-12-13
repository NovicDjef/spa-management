'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/clients/SearchBar';
import { ClientCard } from '@/components/clients/ClientCard';
import { Users, UserPlus, Loader2, X } from 'lucide-react';
import { useGetClientsQuery, useGetProfessionalsQuery, useAssignClientMutation } from '@/lib/redux/services/api';
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
  const { data: professionalsData } = useGetProfessionalsQuery();
  const [assignClient, { isLoading: isAssigning }] = useAssignClientMutation();

  const currentUser = useAppSelector((state) => state.auth.user) || {
    name: 'Marie Dubois',
    email: 'marie@spa.com',
    role: 'SECRETAIRE',
  };

  const clients = clientsData?.clients || [];
  const professionals = professionalsData?.professionals || [];

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
    if (!selectedClient || !selectedProfessional) return;

    try {
      await assignClient({
        clientId: selectedClient.id,
        professionalId: selectedProfessional,
      }).unwrap();

      alert('Client assigné avec succès!');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedProfessional('');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      alert('Une erreur est survenue lors de l\'assignation');
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
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-rose-50">
      <Header user={currentUser} />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Bouton Admin - Gestion Employés */}
          {currentUser.role === 'ADMIN' && (
            <div className="mb-6">
              <a
                href="/admin/employees"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Users className="w-5 h-5" />
                Gérer les Employés
              </a>
            </div>
          )}

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-rose-100 to-spa-rose-200 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-spa-rose-600" />
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
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-rose-500 animate-spin" />
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
                  <div className="w-12 h-12 bg-gradient-to-br from-spa-rose-100 to-spa-rose-200 rounded-full flex items-center justify-center">
                    <UserPlus className="w-6 h-6 text-spa-rose-600" />
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
                  Sélectionner un professionnel <span className="text-spa-rose-500">*</span>
                </label>
                <select
                  value={selectedProfessional}
                  onChange={(e) => setSelectedProfessional(e.target.value)}
                  className="input-spa"
                >
                  <option value="">Choisir un professionnel...</option>
                  {professionals
                    .filter((p) =>
                      selectedClient.serviceType === 'MASSOTHERAPIE'
                        ? p.role === 'MASSOTHERAPEUTE'
                        : p.role === 'ESTHETICIENNE'
                    )
                    .map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {getProfessionalLabel(professional)}
                      </option>
                    ))}
                </select>
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
