'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetAssignedClientsQuery } from '@/lib/redux/services/api';
import { Users, Search, Loader2, Eye, FileText, Mail, Phone, User } from 'lucide-react';
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
    return dateB - dateA; // Ordre décroissant (plus récent en premier)
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
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <Header user={currentUser} />
        <div className="container-spa py-12">
          <div className="card-spa p-8 text-center">
            <p className="text-red-600 mb-4">Erreur de chargement des clients</p>
            <button
              onClick={() => refetch()}
              className="btn-primary"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser} />
      
      <div className="container-spa py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Clients</h1>
          <p className="text-gray-600">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''} vous {filteredClients.length !== 1 ? 'sont' : 'est'} assigné{filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Bouton de rafraîchissement */}
        <div className="mb-6">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-spa-turquoise-50 text-spa-turquoise-700 rounded-lg hover:bg-spa-turquoise-100 transition-colors"
          >
            <Loader2 className="w-4 h-4" />
            Rafraîchir la liste
          </button>
        </div>

        {/* Liste des clients ou chargement */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="card-spa p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucun client assigné
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez actuellement aucun client assigné.
            </p>
            <p className="text-sm text-gray-500">
              Contactez l'administrateur ou la secrétaire pour vous assigner des clients.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-spa p-6 hover:shadow-lg transition-shadow flex flex-col"
              >
                {/* En-tête avec photo et infos principales */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-spa-turquoise-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-8 h-8 text-spa-turquoise-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-800 truncate">
                        {client.prenom} {client.nom}
                      </h3>
                      {/* Badge NEW pour les clients sans notes */}
                      {(!client._count?.notes || client._count.notes === 0) && (
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-md animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {client.isActive !== false && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Actif
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {client.assignedAt
                          ? `Assigné le ${new Date(client.assignedAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}`
                          : new Date(client.createdAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grille flexible pour les informations */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  {/* courriel */}
                  <div className="flex items-start gap-2 text-gray-600">
                    <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <a href={`mailto:${client.courriel}`} className="hover:text-spa-turquoise-600 truncate">
                      {client.courriel}
                    </a>
                  </div>

                  {/* Téléphone */}
                  <div className="flex items-start gap-2 text-gray-600">
                    <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {client.telCellulaire ? (
                      <a href={`tel:${client.telCellulaire}`} className="hover:text-spa-turquoise-600">
                        {client.telCellulaire.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
                      </a>
                    ) : (
                      <span>Non spécifié</span>
                    )}
                  </div>

                  {/* Adresse */}
                  {client.adresse && (
                    <div className="col-span-2 flex items-start gap-2 text-gray-600">
                      <span className="w-4 h-4 flex-shrink-0 mt-0.5">📍</span>
                      <span className="text-xs break-all">
                        {client.adresse} {client.ville} {client.codePostal}
                      </span>
                    </div>
                  )}
                </div>

                {/* Pied de carte avec actions */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                  <Link
                    href={`/professionnel/clients/${client.id}`}
                    className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <Eye className="w-4 h-4" />
                    Voir
                  </Link>
                  <Link
                    href={`/professionnel/clients/${client.id}`}
                    className="flex-1 bg-spa-lavande-50 text-spa-lavande-700 rounded-lg hover:bg-spa-lavande-100 transition-colors flex items-center justify-center gap-2 text-sm py-2"
                  >
                    <FileText className="w-4 h-4" />
                    Notes
                  </Link>
                  <div className="flex items-center justify-center w-10 h-10 bg-spa-turquoise-50 text-spa-turquoise-700 rounded-lg">
                    <span className="font-medium text-sm">
                      {client._count?.notes || 0}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
