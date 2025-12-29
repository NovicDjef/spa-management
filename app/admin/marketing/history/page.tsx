'use client';

import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import {
  ArrowLeft,
  Calendar,
  Mail,
  Users,
  Sparkles,
  CheckCircle,
  XCircle,
  Eye,
  X,
  TrendingUp,
  Clock,
  Filter,
  Loader2,
} from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useResendFailedEmailsMutation,
  type Campaign
} from '@/lib/redux/services/api';
import Link from 'next/link';

export default function MarketingHistoryPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [dateFilter, setDateFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Calculer les dates pour les filtres
  const dateParams = useMemo(() => {
    const now = new Date();
    let startDate: string | undefined;

    if (dateFilter === '7days') {
      const date = new Date(now);
      date.setDate(date.getDate() - 7);
      startDate = date.toISOString().split('T')[0];
    } else if (dateFilter === '30days') {
      const date = new Date(now);
      date.setDate(date.getDate() - 30);
      startDate = date.toISOString().split('T')[0];
    } else if (dateFilter === '90days') {
      const date = new Date(now);
      date.setDate(date.getDate() - 90);
      startDate = date.toISOString().split('T')[0];
    }

    return startDate ? { startDate, endDate: now.toISOString().split('T')[0] } : undefined;
  }, [dateFilter]);

  // Récupérer les campagnes de l'API
  const { data: campaignsData, isLoading: campaignsLoading, error: campaignsError } = useGetCampaignsQuery({
    ...dateParams,
    page,
    limit: 20,
  });

  // Debug erreur API
  if (campaignsError) {
    console.error('❌ Erreur API Campaigns:', campaignsError);
  }

  // Récupérer les détails de la campagne depuis l'API
  const { data: campaignDetailsResponse, isLoading: detailsLoading } = useGetCampaignByIdQuery(
    selectedCampaignId!,
    { skip: !selectedCampaignId }
  );

  // Utiliser les données de l'API en priorité, sinon utiliser selectedCampaign comme fallback
  const campaignFromApi = campaignDetailsResponse?.campaign;
  const campaignDetails = campaignFromApi || selectedCampaign;

  // Debug détails de campagne
  if (selectedCampaignId) {
    console.log('🔍 Selected Campaign ID:', selectedCampaignId);
    console.log('🔍 API Response:', campaignDetailsResponse);
    console.log('🔍 Campaign from API:', campaignFromApi);
    console.log('🔍 Selected Campaign (from list):', selectedCampaign);
    console.log('🔍 Final Campaign Details:', campaignDetails);
    console.log('🔍 Emails in Campaign:', campaignDetails?.emails);
    console.log('🔍 Number of Emails:', campaignDetails?.emails?.length);
    console.log('🔍 Type of emails:', typeof campaignDetails?.emails);
    console.log('🔍 Is Array?:', Array.isArray(campaignDetails?.emails));
  }

  // Mutation pour renvoyer les emails échoués
  const [resendFailedEmails, { isLoading: isResending }] = useResendFailedEmailsMutation();

  const isLoading = campaignsLoading;

  // Gérer différents formats de réponse
  let campaigns: any[] = [];
  let paginationData: any = null;

  if (campaignsData) {
    // Format attendu: { campaigns: [...], pagination: {...} }
    if (Array.isArray(campaignsData.campaigns)) {
      campaigns = campaignsData.campaigns;
      paginationData = campaignsData.pagination;
    }
    // Format alternatif: directement un tableau
    else if (Array.isArray(campaignsData)) {
      campaigns = campaignsData as any;
      paginationData = { total: (campaignsData as any).length, page: 1, limit: 20, totalPages: 1 };
    }
    // Format alternatif: { data: { campaigns: [...] } }
    else if ('data' in campaignsData && (campaignsData as any).data) {
      campaigns = (campaignsData as any).data.campaigns || [];
      paginationData = (campaignsData as any).data.pagination;
    }
  }

  // Debug: Voir ce que l'API retourne
  console.log('📊 RAW Campaigns Data:', campaignsData);
  console.log('📊 Campaigns Array:', campaigns);
  console.log('📊 Campaigns Length:', campaigns.length);
  console.log('📊 First Campaign:', campaigns[0]);
  console.log('📊 First Campaign EMAILS:', campaigns[0]?.emails);
  console.log('📊 Pagination:', paginationData);
  console.log('📊 Is Loading:', isLoading);

  // Statistiques globales avec vérifications
  const totalCampaigns = paginationData?.total || 0;
  const totalEmailsSent = campaigns.length > 0
    ? campaigns.reduce((acc, c) => acc + (c.totalRecipients || c.totalClients || 0), 0)
    : 0;
  const totalSuccess = campaigns.length > 0
    ? campaigns.reduce((acc, c) => acc + (c.successCount || 0), 0)
    : 0;
  const totalFailures = campaigns.length > 0
    ? campaigns.reduce((acc, c) => acc + (c.failureCount || 0), 0)
    : 0;

  // Gérer le renvoi des emails échoués
  const handleResendFailed = async (campaignId: string) => {
    try {
      const result = await resendFailedEmails(campaignId).unwrap();
      alert(`${result.resentCount} emails renvoyés avec succès!`);
    } catch (error: any) {
      alert(`Erreur lors du renvoi: ${error.message || 'Erreur inconnue'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-4 sm:py-8">
        {/* Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4 sm:mb-6"
        >
          <Link
            href="/admin/marketing"
            className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">Retour aux campagnes</span>
          </Link>
        </motion.div>

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full sm:rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-spa-lavande-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Historique des Campagnes</h1>
              <p className="text-xs sm:text-base text-gray-600">
                Traçabilité complète de toutes vos campagnes marketing
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques globales - Optimisées mobile */}
        {!isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
          >
            <div className="card-spa p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Total Campagnes</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalCampaigns}</p>
                </div>
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mt-2 sm:mt-0" />
              </div>
            </div>

            <div className="card-spa p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Emails envoyés</p>
                  <p className="text-xl sm:text-2xl font-bold text-spa-turquoise-600">{totalEmailsSent}</p>
                </div>
                <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-spa-turquoise-400 mt-2 sm:mt-0" />
              </div>
            </div>

            <div className="card-spa p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Réussis</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{totalSuccess}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-400 mt-2 sm:mt-0" />
              </div>
            </div>

            <div className="card-spa p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Échoués</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{totalFailures}</p>
                </div>
                <XCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-400 mt-2 sm:mt-0" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filtre par date - Mobile-friendly */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 sm:mb-8 glass rounded-xl sm:rounded-2xl p-4 sm:p-6"
        >
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-spa-turquoise-600" />
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Filtrer par période</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === 'all'
                  ? 'bg-spa-turquoise-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-spa-turquoise-50'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === '7days'
                  ? 'bg-spa-turquoise-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-spa-turquoise-50'
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === '30days'
                  ? 'bg-spa-turquoise-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-spa-turquoise-50'
              }`}
            >
              30 jours
            </button>
            <button
              onClick={() => setDateFilter('90days')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                dateFilter === '90days'
                  ? 'bg-spa-turquoise-500 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-spa-turquoise-50'
              }`}
            >
              90 jours
            </button>
          </div>
        </motion.div>

        {/* Message d'erreur API */}
        {campaignsError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 mb-1">Erreur de connexion à l'API</h3>
                <p className="text-sm text-red-700">
                  Impossible de charger les campagnes. Vérifiez que l'API backend est démarrée et accessible.
                </p>
                <p className="text-xs text-red-600 mt-2">
                  Endpoint: GET /api/marketing/campaigns
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Liste des campagnes - Optimisée mobile */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-3 sm:space-y-4"
          >
            {campaigns.map((campaign, index) => {
              const campaignDate = new Date(campaign.createdAt);
              const totalRecipients = campaign.totalRecipients || campaign.totalClients || 0;
              const successRate = totalRecipients > 0
                ? Math.round((campaign.successCount / totalRecipients) * 100)
                : 0;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="card-spa hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCampaignId(campaign.id);
                    setSelectedCampaign(campaign);
                  }}
                >
                  <div className="p-4 sm:p-6">
                    {/* Header - Mobile stack */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-2 sm:gap-3 mb-2">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Mail className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-2">
                              {campaign.subject}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {campaignDate.toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })} à {campaignDate.toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistiques de la campagne */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-spa-turquoise-50 to-spa-menthe-50 rounded-lg border border-spa-turquoise-100">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-spa-turquoise-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-spa-turquoise-800 mb-1">Destinataires:</p>
                          <p className="text-sm font-medium text-spa-turquoise-900">
                            {totalRecipients} clients ciblés
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="text-green-600 font-medium">
                              ✓ {campaign.successCount} réussis
                            </span>
                            {campaign.failureCount > 0 && (
                              <span className="text-red-600 font-medium">
                                ✗ {campaign.failureCount} échoués
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Prompt IA si disponible */}
                    {campaign.prompt && (
                      <div className="mb-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-purple-800 mb-1">Prompt IA utilisé:</p>
                            <p className="text-xs sm:text-sm text-purple-700 line-clamp-2">{campaign.prompt}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Taux de succès */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">Taux de succès</span>
                        <span className="text-xs sm:text-sm font-bold text-gray-800">{successRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            successRate >= 80 ? 'bg-green-500' :
                            successRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${successRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Bouton voir détails */}
                    <div className="mt-4 flex justify-end">
                      <button className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 font-medium">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Voir les détails</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {campaigns.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Aucune campagne trouvée</h3>
                <p className="text-sm sm:text-base text-gray-600">Essayez de modifier les filtres ou la période</p>
              </div>
            )}

            {/* Pagination */}
            {paginationData && paginationData.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} sur {paginationData.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))}
                  disabled={page === paginationData.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Suivant
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal de détails de la campagne - Mobile-friendly */}
      {selectedCampaignId && campaignDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-2xl sm:rounded-t-3xl">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-1 line-clamp-2">
                    {campaignDetails.subject}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {new Date(campaignDetails.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedCampaignId(null);
                    setSelectedCampaign(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Statistiques de la campagne */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 bg-blue-50 rounded-xl text-center">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-base sm:text-xl font-bold text-blue-900">
                    {campaignDetails.totalRecipients || campaignDetails.totalClients || 0}
                  </p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <div className="p-3 sm:p-4 bg-green-50 rounded-xl text-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-base sm:text-xl font-bold text-green-900">{campaignDetails.successCount}</p>
                  <p className="text-xs text-gray-600">Réussis</p>
                </div>
                <div className="p-3 sm:p-4 bg-red-50 rounded-xl text-center">
                  <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 mx-auto mb-2" />
                  <p className="text-base sm:text-xl font-bold text-red-900">{campaignDetails.failureCount}</p>
                  <p className="text-xs text-gray-600">Échoués</p>
                </div>
              </div>

              {/* Prompt IA si disponible */}
              {campaignDetails.prompt && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-100">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-800 mb-2">Prompt IA utilisé:</p>
                      <p className="text-sm text-purple-700">{campaignDetails.prompt}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Liste de tous les clients ciblés */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-spa-turquoise-600" />
                  Clients ciblés par cette campagne
                  {campaignDetails.emails && ` (${campaignDetails.emails.length})`}
                </h3>

                {/* Si les emails existent, les afficher */}
                {campaignDetails.emails && campaignDetails.emails.length > 0 ? (
                  <>
                    <div className="space-y-2 max-h-96 overflow-y-auto border-2 border-spa-turquoise-100 rounded-xl p-3">
                      {campaignDetails.emails.map((email: any, index: number) => {
                        const isSuccess = email.status === 'sent';
                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isSuccess
                                ? 'bg-green-50 border-green-100'
                                : 'bg-red-50 border-red-100'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">{email.clientName}</p>
                                <p className="text-xs text-gray-600 truncate">{email.clientEmail}</p>
                              </div>
                              <div className="flex-shrink-0">
                                {isSuccess ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                            </div>
                            <p className={`text-xs mt-1 ${isSuccess ? 'text-green-700' : 'text-red-700'}`}>
                              {isSuccess ? '✓ Envoyé avec succès' : '✗ Échec d\'envoi'}
                            </p>
                            {email.errorMessage && (
                              <p className="text-xs text-red-600 mt-1">
                                Erreur: {email.errorMessage}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bouton pour renvoyer les emails échoués si nécessaire */}
                    {campaignDetails.failureCount > 0 && (
                      <button
                        onClick={() => handleResendFailed(campaignDetails.id)}
                        disabled={isResending}
                        className="mt-4 w-full px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Envoi en cours...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4" />
                            <span>Renvoyer les {campaignDetails.failureCount} email(s) échoué(s)</span>
                          </>
                        )}
                      </button>
                    )}
                  </>
                ) : (
                  // Message si aucun email n'est disponible
                  <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <Users className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-sm text-yellow-800 font-medium mb-2 text-center">
                      Liste des clients non disponible
                    </p>
                    <p className="text-xs text-yellow-700 text-center mb-3">
                      Les détails des destinataires ne sont pas retournés par l'API.
                    </p>
                    <div className="space-y-2">
                      <div className="p-3 bg-yellow-100 rounded-lg text-left">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">Debug - emails:</p>
                        <p className="text-xs font-mono text-yellow-800 break-all">
                          {JSON.stringify(campaignDetails?.emails)}
                        </p>
                      </div>
                      <div className="p-3 bg-yellow-100 rounded-lg text-left">
                        <p className="text-xs font-semibold text-yellow-900 mb-1">Debug - Structure complète:</p>
                        <pre className="text-xs font-mono text-yellow-800 overflow-auto max-h-40">
                          {JSON.stringify(campaignDetails, null, 2)}
                        </pre>
                      </div>
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-left">
                        <p className="text-xs font-semibold text-blue-900 mb-2">📋 Instructions:</p>
                        <ol className="text-xs text-blue-800 space-y-1 list-decimal list-inside">
                          <li>Ouvrez la console du navigateur (F12)</li>
                          <li>Recherchez les logs commençant par 🔍 et 📊</li>
                          <li>Vérifiez si "emails" existe dans les données</li>
                          <li>Partagez les logs avec le développeur backend</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 sm:p-6 rounded-b-2xl sm:rounded-b-3xl">
              <button
                onClick={() => {
                  setSelectedCampaignId(null);
                  setSelectedCampaign(null);
                }}
                className="btn-primary w-full"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
