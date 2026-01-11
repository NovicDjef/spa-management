'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import { SearchBar } from '@/components/clients/SearchBar';
import { ClientCard } from '@/components/clients/ClientCard';
import { Users, UserPlus, Loader2, X, Target, AlertCircle, Clock, UserCheck, User as UserIcon, ArrowRight, UserMinus, FileText, BarChart3, Calendar, Copy, Check, RefreshCw } from 'lucide-react';
import { useGetClientsQuery, useGetAssignedClientsQuery, useGetUsersQuery, useAssignClientMutation, useUnassignClientMutation, useGetAssignmentHistoryQuery } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { hasPermission, isAdminOrSecretary } from '@/lib/permissions';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import Link from 'next/link';

interface Client {
  id: string;
  nom: string;
  prenom: string;
  telCellulaire: string;
  courriel: string;
  dateNaissance: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  createdAt: string;
  assignedAt?: string;
  isActive?: boolean;
  hasNoteAfterAssignment?: boolean;
  notes?: any[];
  assignedBy?: {
    id: string;
    nom: string;
    prenom: string;
    role: 'ADMIN' | 'SECRETAIRE';
  } | null;
  assignedTo?: {
    id: string;
    nom: string;
    prenom: string;
    role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  } | null;
}

interface Professional {
  id: string;
  nom: string;
  prenom: string;
  role: string;
  email: string;
}

export default function DashboardPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  // Utiliser la bonne requête selon le rôle
  const isProfessional = currentUser?.role === 'MASSOTHERAPEUTE' || currentUser?.role === 'ESTHETICIENNE';

  // États de recherche et filtres (doivent être déclarés AVANT les queries qui les utilisent)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Pour les professionnels : récupérer uniquement leurs clients assignés
  const { data: assignedClientsData, isLoading: isLoadingAssignedClients, refetch: refetchAssignedClients } = useGetAssignedClientsQuery(undefined, {
    skip: !isProfessional,
  });

  // Pour les admin/secrétaire : récupérer tous les clients avec recherche et filtres
  const { data: allClientsData, isLoading: isLoadingAllClients, refetch: refetchAllClients } = useGetClientsQuery({
    search: searchQuery || undefined,
    serviceType: selectedFilter !== 'ALL' ? selectedFilter : undefined,
    limit: 10000, // Limite élevée pour récupérer TOUS les clients (recherche dans toute la base)
  }, {
    skip: isProfessional,
  });

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    error: usersError,
    refetch: refetchUsers
  } = useGetUsersQuery({}, {
    // Refetch automatique si la requête échoue
    refetchOnMountOrArgChange: true,
  });
  const [assignClient, { isLoading: isAssigning }] = useAssignClientMutation();
  const [unassignClient, { isLoading: isUnassigning }] = useUnassignClientMutation();
  const { data: assignmentHistoryData, isLoading: isLoadingHistory } = useGetAssignmentHistoryQuery({ limit: 10 });

  // Déterminer quelle source de clients utiliser
  const clients = isProfessional
    ? (assignedClientsData?.clients || [])
    : (allClientsData?.clients || []);

  // Nombre total de clients (utiliser pagination.total pour admin/secrétaire)
  const totalClientsCount = isProfessional
    ? clients.length  // Pour les professionnels : nombre de clients assignés
    : (allClientsData?.pagination?.total || clients.length);  // Pour admin/secrétaire : total de la pagination

  const isLoading = isProfessional ? isLoadingAssignedClients : isLoadingAllClients;

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
    
    // Filtrer les professionnels ACTIFS uniquement
    const activeProfessionals = users.filter(
      (user) => user &&
      (user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') &&
      user.isActive === true  // ⭐ IMPORTANT: Exclure les professionnels bloqués
    );

    return activeProfessionals;
  }, [usersData]);

  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState('');
  const [copiedEmailId, setCopiedEmailId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    filterClients();
  }, [clients, searchQuery, selectedFilter]);

  const filterClients = () => {
    // Pour admin/secrétaire : l'API fait la recherche côté serveur, on utilise les résultats directement
    // Pour professionnels : on fait la recherche côté client (car assignedClients ne supporte pas la recherche serveur)
    if (!isProfessional) {
      // Admin/Secrétaire : utiliser les résultats de l'API directement (déjà filtrés par le backend)
      setFilteredClients(clients);
      return;
    }

    // Professionnels : filtrage côté client
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

  const handleCopyEmail = (email: string, clientId: string) => {
    // Méthode moderne avec clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email).then(() => {
        setCopiedEmailId(clientId);
        setTimeout(() => setCopiedEmailId(null), 2000);
      }).catch(() => {
        // Fallback si clipboard API échoue
        fallbackCopyEmail(email, clientId);
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      fallbackCopyEmail(email, clientId);
    }
  };

  const fallbackCopyEmail = (email: string, clientId: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopiedEmailId(clientId);
      setTimeout(() => setCopiedEmailId(null), 2000);
    } catch (err) {
      alert('Impossible de copier l\'email');
    }
    document.body.removeChild(textArea);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (isProfessional) {
        await refetchAssignedClients();
      } else {
        await refetchAllClients();
      }
    } catch (error) {
      // Erreur silencieuse
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleAssignSubmit = async () => {
    if (!selectedClient || !selectedProfessional) {
      return;
    }

    try {
      const result = await assignClient({
        clientId: selectedClient.id,
        professionalId: selectedProfessional,
      }).unwrap();

      alert('Client assigné avec succès!');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedProfessional('');
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Erreur lors de l\'assignation du client');
      alert(`Une erreur est survenue lors de l'assignation: ${errorMsg}`);
    }
  };

  const handleUnassignClient = async () => {
    if (!selectedClient || !selectedClient.assignedTo) {
      return;
    }

    const confirmMsg = `Êtes-vous sûr de vouloir retirer l'assignation de ${selectedClient.prenom} ${selectedClient.nom} à ${selectedClient.assignedTo.prenom} ${selectedClient.assignedTo.nom}?\n\nCela supprimera uniquement l'assignation la plus récente.`;

    if (!confirm(confirmMsg)) {
      return;
    }

    try {
      await unassignClient({
        clientId: selectedClient.id,
        professionalId: selectedClient.assignedTo.id,
      }).unwrap();

      alert('Assignation retirée avec succès!');
      setShowAssignModal(false);
      setSelectedClient(null);
      setSelectedProfessional('');
    } catch (error: any) {
      const errorMsg = extractErrorMessage(error, 'Erreur lors du retrait de l\'assignation');
      alert(`Une erreur est survenue: ${errorMsg}`);
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

  // Afficher un loader si currentUser n'est pas encore chargé
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spa-turquoise-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-4 sm:py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-6"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-5">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-spa-turquoise-600" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  {currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE'
                    ? 'Mes Clients'
                    : 'Gestion des Clients'}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {searchQuery || selectedFilter !== 'ALL' ? (
                    <>
                      {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} trouvé{filteredClients.length !== 1 ? 's' : ''}
                      {!isProfessional && <span className="text-gray-500"> sur {totalClientsCount} total</span>}
                    </>
                  ) : (
                    <>
                      {totalClientsCount} client{totalClientsCount !== 1 ? 's' : ''}
                      {isProfessional ? ' assigné' + (totalClientsCount !== 1 ? 's' : '') : ' inscrit' + (totalClientsCount !== 1 ? 's' : '')}
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Bouton de rafraîchissement */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-spa-turquoise-50 border-2 border-spa-turquoise-200 text-spa-turquoise-700 rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title="Actualiser la liste des clients"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-medium">Actualiser</span>
            </motion.button>
          </div>

          {/* Cartes d'accès rapide */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE' || currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6"
            >
              {/* Assignations */}
              {(currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE') && (
                <Link href="/professionnel/assignations">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-4 sm:p-5 bg-gradient-to-br from-spa-turquoise-50 via-white to-spa-turquoise-50/30 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all cursor-pointer border-2 border-transparent hover:border-spa-turquoise-200 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-spa-turquoise-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-spa-turquoise-400 to-spa-turquoise-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-spa-turquoise-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Assignations</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Gérer les assignations clients</p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Calendrier */}
              {/* {(currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') && (
                <Link href="/professionnel/calendar">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-4 sm:p-5 bg-gradient-to-br from-blue-50 via-white to-blue-50/30 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all cursor-pointer border-2 border-transparent hover:border-blue-200 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Mon Calendrier</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Voir mes réservations</p>
                    </div>
                  </motion.div>
                </Link>
              )} */}

              {/* Reçus */}
              {(currentUser.role === 'ADMIN' || currentUser.role === 'MASSOTHERAPEUTE') && (
                <Link href="/professionnel/recus">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-4 sm:p-5 bg-gradient-to-br from-spa-menthe-50 via-white to-spa-menthe-50/30 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all cursor-pointer border-2 border-transparent hover:border-spa-menthe-200 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-spa-menthe-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-spa-menthe-400 to-spa-menthe-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-spa-menthe-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">
                        {currentUser.role === 'ADMIN' ? 'Tous les Reçus' : 'Mes Reçus'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600">Consulter les reçus d'assurance</p>
                    </div>
                  </motion.div>
                </Link>
              )}

              {/* Statistiques Globales (Admin seulement) */}
              {currentUser.role === 'ADMIN' && (
                <Link href="/admin">
                  <motion.div
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative p-4 sm:p-5 bg-gradient-to-br from-spa-rose-50 via-white to-spa-lavande-50/30 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all cursor-pointer border-2 border-transparent hover:border-spa-rose-200 overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-spa-rose-100 rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-spa-rose-400 to-spa-lavande-600 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-spa-rose-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1">Statistiques</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Statistiques globales du spa</p>
                    </div>
                  </motion.div>
                </Link>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Barre de recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 sm:mb-14"
        >
          <SearchBar
            onSearch={setSearchQuery}
            onFilterChange={setSelectedFilter}
          />
        </motion.div>

        {/* Liste des clients */}
        {isLoading ? (
          <div className="flex items-center justify-center -mt-[120px] sm:mt-4">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 sm:py-16 -mt-[120px] sm:mt-4"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Aucun client trouvé'
                : 'Aucun client enregistré'}
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              {searchQuery || selectedFilter !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les nouveaux clients apparaîtront ici'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Affichage pour ADMIN et SECRETAIRE : Format grille avec toutes les infos */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE') ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 -mt-[10px] sm:mt-4"
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
                      showActions={currentUser.role === 'ADMIN' || currentUser.role === 'SECRETAIRE'}
                      onAssign={hasPermission(currentUser.role, 'ASSIGN_CLIENTS') ? handleAssignClient : undefined}
                      currentUser={currentUser}
                      showTherapistActions={false}
                      disableLink={currentUser.role === 'SECRETAIRE'}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              /* Affichage pour MASSOTHERAPEUTE et ESTHETICIENNE : Format liste avec infos masquées */
              <div className="space-y-3 -mt-[10px] sm:mt-4">
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
                                  <span>NOUVEAU</span>
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

                              {/* Email visible avec bouton de copie */}
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm text-gray-600 truncate">{client.courriel}</span>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleCopyEmail(client.courriel, client.id);
                                  }}
                                  className="p-1.5 hover:bg-spa-turquoise-50 rounded-md transition-colors group flex-shrink-0"
                                  title="Copier l'adresse email"
                                >
                                  {copiedEmailId === client.id ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-gray-400 group-hover:text-spa-turquoise-600" />
                                  )}
                                </button>
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
          </>
        )}

        {/* Historique des Assignations Récentes */}
        {assignmentHistoryData && assignmentHistoryData.assignments && assignmentHistoryData.assignments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-spa-lavande-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Assignations Récentes</h2>
                <p className="text-sm text-gray-600">
                  Historique des {assignmentHistoryData.assignments.length} dernières assignations
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date & Heure
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Assigné à
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Assigné par
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assignmentHistoryData.assignments.map((assignment, index) => (
                      <motion.tr
                        key={assignment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-spa-beige-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {new Date(assignment.assignedAt).toLocaleDateString('fr-CA')}
                              </div>
                              <div className="text-gray-500">
                                {new Date(assignment.assignedAt).toLocaleTimeString('fr-CA', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-spa-turquoise-100 rounded-full flex items-center justify-center">
                              <UserIcon className="w-4 h-4 text-spa-turquoise-600" />
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.client.prenom} {assignment.client.nom}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              assignment.client.serviceType === 'MASSOTHERAPIE'
                                ? 'bg-spa-menthe-100 text-spa-menthe-700'
                                : 'bg-spa-lavande-100 text-spa-lavande-700'
                            }`}
                          >
                            {assignment.client.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-500" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {assignment.professional.prenom} {assignment.professional.nom}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {assignment.professional.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-spa-turquoise-500" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {assignment.assignedBy.prenom} {assignment.assignedBy.nom}
                              </div>
                              <div className="text-gray-500 text-xs">
                                {assignment.assignedBy.role === 'ADMIN' ? 'Admin' : 'Secrétaire'}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
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

              {/* Avertissement si le client est déjà assigné */}
              {selectedClient.assignedAt && selectedClient.assignedTo && (
                <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-800 mb-2">⚠️ Client déjà assigné</h3>
                      <div className="space-y-1.5 text-sm text-amber-900">
                        <p>
                          <strong>Assigné à:</strong> {selectedClient.assignedTo.prenom} {selectedClient.assignedTo.nom}
                        </p>
                        {selectedClient.assignedBy && (
                          <p>
                            <strong>Par:</strong> {selectedClient.assignedBy.prenom} {selectedClient.assignedBy.nom}
                            <span className="text-amber-700 ml-1">
                              ({selectedClient.assignedBy.role === 'ADMIN' ? 'Admin' : 'Secrétaire'})
                            </span>
                          </p>
                        )}
                        <p className="text-amber-700">
                          Le {new Date(selectedClient.assignedAt).toLocaleDateString('fr-CA')} à{' '}
                          {new Date(selectedClient.assignedAt).toLocaleTimeString('fr-CA', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-amber-800 bg-amber-100 p-2 rounded">
                        💡 <strong>Important:</strong> Une nouvelle assignation remplacera l'assignation existante.
                        Assurez-vous de coordonner avec {selectedClient.assignedBy?.prenom || 'l\'équipe'}.
                      </p>
                      <div className="mt-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleUnassignClient();
                          }}
                          disabled={isUnassigning}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-700 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isUnassigning ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Retrait en cours...
                            </>
                          ) : (
                            <>
                              <UserMinus className="w-4 h-4" />
                              Retirer l'assignation actuelle
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

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
                    onChange={(e) => setSelectedProfessional(e.target.value)}
                    className="input-spa"
                  >
                    <option value="">Choisir un professionnel...</option>
                    {professionals
                      .filter((p) => {
                        // ⭐ IMPORTANT: Exclure les professionnels inactifs (déjà fait dans useMemo)
                        // Cette vérification est redondante mais garantit la sécurité
                        if (!p.isActive) {
                          return false;
                        }

                        // Les ADMIN peuvent être assignés à n'importe quel service
                        if (p.role === 'ADMIN') {
                          return true;
                        }

                        // Sinon, filtrer selon le type de service
                        const shouldInclude = selectedClient.serviceType === 'MASSOTHERAPIE'
                          ? p.role === 'MASSOTHERAPEUTE'
                          : p.role === 'ESTHETICIENNE';
                        return shouldInclude;
                      })
                      .map((professional) => (
                        <option key={professional.id} value={professional.id}>
                          {getProfessionalLabel(professional)}
                        </option>
                      ))}
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
                    // Les ADMIN peuvent être assignés à n'importe quel service
                    if (p.role === 'ADMIN') {
                      return true;
                    }
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
