'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetAllAssignmentsQuery, useUnassignClientMutation } from '@/lib/redux/services/api';
import { Users, Clock, UserCheck, User as UserIcon, Loader2, Trash2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';

export default function AssignationsPage() {
  const router = useRouter();
  const currentUser = useAppSelector((state) => state.auth.user);
  const { data: assignmentsData, isLoading, refetch } = useGetAllAssignmentsQuery();
  const [unassignClient, { isLoading: isUnassigning }] = useUnassignClientMutation();
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Rediriger si l'utilisateur n'a pas accès
  useEffect(() => {
    if (currentUser && currentUser.role !== 'SECRETAIRE' && currentUser.role !== 'ADMIN') {
      router.push('/professionnel/dashboard');
    }
  }, [currentUser, router]);

  const handleUnassign = async (clientId: string, professionalId: string, clientName: string, professionalName: string) => {
    const confirmMsg = `Êtes-vous sûr de vouloir retirer l'assignation de ${clientName} à ${professionalName}?\n\nCela supprimera uniquement l'assignation la plus récente.`;

    if (!confirm(confirmMsg)) {
      return;
    }

    setSelectedAssignment(`${clientId}-${professionalId}`);

    try {
      await unassignClient({
        clientId,
        professionalId,
      }).unwrap();

      setSuccessMessage(`Assignation de ${clientName} à ${professionalName} retirée avec succès!`);
      setTimeout(() => setSuccessMessage(''), 5000);
      refetch();
    } catch (error: any) {
      console.error('Erreur lors du retrait de l\'assignation:', error);
      const errorMsg = extractErrorMessage(error, 'Erreur lors du retrait de l\'assignation');
      alert(`Une erreur est survenue: ${errorMsg}`);
    } finally {
      setSelectedAssignment(null);
    }
  };

  if (!currentUser || (currentUser.role !== 'SECRETAIRE' && currentUser.role !== 'ADMIN')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={currentUser} />

      <div className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6">
        {/* Bouton retour */}
        <div className="mb-6">
          <Link href="/professionnel/dashboard">
            <button className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour au dashboard</span>
            </button>
          </Link>
        </div>

        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Gestion des Assignations
          </h1>
          <p className="text-gray-600">
            Liste de toutes les assignations. Vous pouvez retirer une assignation en cas d'erreur.
          </p>
        </div>

        {/* Message de succès */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-green-800 font-medium">Succès</p>
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Liste des assignations */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-spa-turquoise-500 animate-spin mb-4" />
            <p className="text-gray-600">Chargement des assignations...</p>
          </div>
        ) : !assignmentsData?.data || assignmentsData.data.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune assignation
            </h3>
            <p className="text-gray-600">
              Les assignations apparaîtront ici une fois que vous aurez assigné des clients aux professionnels.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Assigné à
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Assigné par
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignmentsData.data.map((assignment, index) => {
                    const isRemoving = selectedAssignment === `${assignment.clientId}-${assignment.professionalId}`;
                    return (
                      <motion.tr
                        key={assignment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="hover:bg-spa-beige-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {new Date(assignment.assignedAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="text-gray-500">
                                {new Date(assignment.assignedAt).toLocaleTimeString('fr-FR', {
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
                          {assignment.createdBy ? (
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-spa-turquoise-500" />
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">
                                  {assignment.createdBy.prenom} {assignment.createdBy.nom}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {assignment.createdBy.role === 'ADMIN' ? 'Admin' : 'Secrétaire'}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleUnassign(
                              assignment.clientId,
                              assignment.professionalId,
                              `${assignment.client.prenom} ${assignment.client.nom}`,
                              `${assignment.professional.prenom} ${assignment.professional.nom}`
                            )}
                            disabled={isRemoving || isUnassigning}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-white hover:bg-red-50 border border-red-300 text-red-700 rounded-lg transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isRemoving ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Retrait...
                              </>
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4" />
                                Retirer
                              </>
                            )}
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Info importante */}
        {assignmentsData && assignmentsData.data && assignmentsData.data.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Important</h3>
                <p className="text-sm text-blue-800">
                  Le bouton "Retirer" supprime <strong>uniquement l'assignation la plus récente</strong> du client au professionnel.
                  L'historique des assignations précédentes est préservé. Les notes déjà créées ne sont pas supprimées.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
