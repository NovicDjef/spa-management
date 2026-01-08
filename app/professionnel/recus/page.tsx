'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { FileText, Loader2, Calendar, DollarSign, User, Clock, Eye, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { useGetReceiptsQuery } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { ReceiptViewModal } from '@/components/receipts/ReceiptViewModal';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

export default function ReceiptsPage() {
  const router = useRouter();
  const { data: receipts, isLoading, error } = useGetReceiptsQuery();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [isMounted, setIsMounted] = useState(false);


  // Modal de visualisation
  const [selectedReceipt, setSelectedReceipt] = useState<{
    id: string;
    receiptNumber: number;
    clientName: string;
  } | null>(null);

  // Éviter l'erreur d'hydration en s'assurant que le composant est monté côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fonction helper pour formater les dates de manière cohérente (évite l'erreur d'hydration)
  const formatDate = (dateString: string | undefined) => {
    if (!dateString || !isMounted) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-CA');
    } catch (e) {
      return 'Date invalide';
    }
  };

  const formatTime = (dateString: string | undefined) => {
    if (!dateString || !isMounted) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('fr-CA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return '';
    }
  };

  // Afficher un loader pendant l'hydration pour éviter le mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
        <Header user={currentUser ?? undefined} />
        <div className="container-spa py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Filtrer les reçus avec vérifications de sécurité
  // Vérifier que receipts est bien un tableau
  const receiptsArray = Array.isArray(receipts) ? receipts : [];

  const filteredReceipts = receiptsArray.filter((receipt) => {
    if (!receipt) return false;

    const matchesSearch = searchQuery
      ? (receipt.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         receipt.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         receipt.receiptNumber?.toString().includes(searchQuery))
      : true;

    const matchesMonth = selectedMonth !== 'ALL'
      ? (receipt.sentAt ? new Date(receipt.sentAt).getMonth() === parseInt(selectedMonth) : false)
      : true;

    const matchesDate = selectedDate
      ? (receipt.treatmentDate ? formatDate(receipt.treatmentDate) === new Date(selectedDate).toLocaleDateString('fr-CA') : false)
      : true;

    return matchesSearch && matchesMonth && matchesDate;
  });

  // Statistiques avec gestion des valeurs manquantes
  const totalRevenue = isMounted
    ? Number(filteredReceipts.reduce((sum, receipt) => sum + (Number(receipt.total) || 0), 0))
    : 0;
  const totalReceipts = filteredReceipts.length;

  // Fonction helper pour s'assurer qu'on a toujours un nombre valide
  const formatCurrency = (value: number | undefined | null) => {
    const num = Number(value) || 0;
    return num.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser} />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-spa-turquoise-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-spa-turquoise-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {currentUser?.role === 'ADMIN' ? 'Tous les Reçus' : 'Mes Reçus'}
                </h1>
                <p className="text-gray-600">
                  {currentUser?.role === 'ADMIN'
                    ? 'Historique de tous les reçus envoyés par tous les thérapeutes'
                    : 'Historique de tous les reçus envoyés'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        {!isLoading && receiptsArray.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`grid grid-cols-1 ${currentUser?.role === 'ADMIN' ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}
          >
            <div className="card-spa p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-spa-turquoise-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Reçus</p>
                  <p className="text-2xl font-bold text-gray-800">{totalReceipts}</p>
                </div>
              </div>
            </div>

            {/* Revenu Total - Seulement pour ADMIN */}
            {currentUser?.role === 'ADMIN' && (
              <div className="card-spa p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-200 rounded-full flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Revenu Total</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(totalRevenue)}$ CAD
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="card-spa p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-spa-lavande-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ce Mois</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {receiptsArray.filter((r) => {
                      if (!r?.sentAt) return false;
                      try {
                        const receiptDate = new Date(r.sentAt);
                        const now = new Date();
                        return receiptDate.getMonth() === now.getMonth() &&
                               receiptDate.getFullYear() === now.getFullYear();
                      } catch (e) {
                        return false;
                      }
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtres */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par client, service ou numéro..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-spa pl-12 w-full"
              />
            </div>

            {/* Filtre par mois d'envoi */}
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="input-spa sm:w-48"
            >
              <option value="ALL">Tous les mois</option>
              <option value="0">Janvier</option>
              <option value="1">Février</option>
              <option value="2">Mars</option>
              <option value="3">Avril</option>
              <option value="4">Mai</option>
              <option value="5">Juin</option>
              <option value="6">Juillet</option>
              <option value="7">Août</option>
              <option value="8">Septembre</option>
              <option value="9">Octobre</option>
              <option value="10">Novembre</option>
              <option value="11">Décembre</option>
            </select>

            {/* Filtre par date de traitement */}
            <div className="relative sm:w-64">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="input-spa pl-12 w-full"
                placeholder="Date du traitement"
              />
            </div>
          </div>

          {/* Indicateur de filtres actifs */}
          {(searchQuery || selectedMonth !== 'ALL' || selectedDate) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Filtres actifs:</span>
              {searchQuery && (
                <span className="px-2 py-1 bg-spa-turquoise-100 text-spa-turquoise-700 rounded-full">
                  Recherche: {searchQuery}
                </span>
              )}
              {selectedMonth !== 'ALL' && (
                <span className="px-2 py-1 bg-spa-lavande-100 text-spa-lavande-700 rounded-full">
                  Mois sélectionné
                </span>
              )}
              {selectedDate && (
                <span className="px-2 py-1 bg-spa-menthe-100 text-spa-menthe-700 rounded-full">
                  Date: {new Date(selectedDate).toLocaleDateString('fr-CA')}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedMonth('ALL');
                  setSelectedDate('');
                }}
                className="text-red-600 hover:text-red-700 font-medium ml-2"
              >
                Réinitialiser
              </button>
            </div>
          )}
        </motion.div>

        {/* Liste des reçus */}
        {isLoading ? (
          <div className="flex items-center justify-center mt-8">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-spa p-8 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Erreur de chargement
            </h3>
            <p className="text-gray-600 mb-4">
              {extractErrorMessage(error, 'Impossible de charger les reçus. Veuillez vérifier que le backend est démarré.')}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              Réessayer
            </button>
          </motion.div>
        ) : filteredReceipts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-spa p-8 text-center"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery || selectedMonth !== 'ALL' ? 'Aucun reçu trouvé' : 'Aucun reçu envoyé'}
            </h3>
            <p className="text-gray-600">
              {searchQuery || selectedMonth !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Les reçus que vous enverrez apparaîtront ici'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card-spa overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      N° Reçu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Date d'envoi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Client
                    </th>
                    {currentUser?.role === 'ADMIN' && (
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Thérapeute
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Traitement
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredReceipts.map((receipt, index) => (
                    <motion.tr
                      key={receipt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-spa-beige-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-spa-turquoise-100 rounded-full flex items-center justify-center">
                            <FileText className="w-4 h-4 text-spa-turquoise-600" />
                          </div>
                          <span className="font-mono font-semibold text-gray-900">
                            #{(receipt.receiptNumber || 0).toString().padStart(4, '0')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {formatDate(receipt.sentAt)}
                            </div>
                            <div className="text-gray-500">
                              {formatTime(receipt.sentAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {receipt.clientName || 'Client inconnu'}
                          </span>
                        </div>
                      </td>
                      {currentUser?.role === 'ADMIN' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-spa-turquoise-600">
                              {receipt.therapistName || 'Thérapeute inconnu'}
                            </div>
                            {receipt.therapistOrderNumber && (
                              <div className="text-xs text-gray-500">
                                N° {receipt.therapistOrderNumber}
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {receipt.serviceName || 'Service non spécifié'}
                          </div>
                          <div className="text-gray-500">
                            {receipt.duration || 0} minutes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {formatDate(receipt.treatmentDate)}
                          </div>
                          <div className="text-gray-500">
                            {receipt.treatmentTime || '--:--'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-bold text-green-600 text-lg">
                            {formatCurrency(receipt.total)}$
                          </div>
                          <div className="text-gray-500 text-xs">
                            + taxes
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedReceipt({
                              id: receipt.id,
                              receiptNumber: receipt.receiptNumber,
                              clientName: receipt.clientName,
                            })}
                            className="p-2 text-spa-turquoise-600 hover:bg-spa-turquoise-50 rounded-lg transition-colors"
                            title="Voir le reçu"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Résumé en bas */}
            <div className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {filteredReceipts.length} reçu{filteredReceipts.length !== 1 ? 's' : ''} affiché{filteredReceipts.length !== 1 ? 's' : ''}
                </span>
                {/* Total revenu - Seulement pour ADMIN */}
                {currentUser?.role === 'ADMIN' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(totalRevenue)}$ CAD
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Modal de visualisation du reçu */}
        {selectedReceipt && (
          <ReceiptViewModal
            isOpen={!!selectedReceipt}
            onClose={() => setSelectedReceipt(null)}
            receiptId={selectedReceipt.id}
            receiptNumber={selectedReceipt.receiptNumber}
            clientName={selectedReceipt.clientName}
          />
        )}
      </div>
    </div>
  );
}
