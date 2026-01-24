'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import {
  MessageSquare,
  Star,
  Filter,
  User,
  Calendar,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetAllReviewsQuery, useGetUsersQuery, type ReviewWithProfessional } from '@/lib/redux/services/api';
import { StarRating } from '@/components/reviews/StarRating';
import Link from 'next/link';

export default function AdminAvisPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  // États des filtres et pagination
  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(20);

  // État pour le modal de détails d'avis
  const [selectedReview, setSelectedReview] = useState<ReviewWithProfessional | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Construire les params de query
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (selectedProfessional) params.professionalId = selectedProfessional;
    if (selectedRating) params.rating = parseInt(selectedRating);

    return params;
  }, [selectedProfessional, selectedRating, currentPage, itemsPerPage]);

  const { data: reviewsData, isLoading, error } = useGetAllReviewsQuery(queryParams);
  const { data: usersData } = useGetUsersQuery({});

  // Filtrer uniquement les professionnels actifs
  const professionals = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users.filter(
      u => (u.role === 'MASSOTHERAPEUTE' || u.role === 'ESTHETICIENNE') && u.isActive
    );
  }, [usersData]);

  const hasActiveFilters = selectedProfessional || selectedRating;

  const clearFilters = () => {
    setSelectedProfessional('');
    setSelectedRating('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openReviewModal = (review: ReviewWithProfessional) => {
    setSelectedReview(review);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedReview(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour au tableau de bord</span>
          </Link>
        </motion.div>

        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-spa-lavande-500 to-spa-rose-500 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                Tous les Avis Clients
              </h1>
              <p className="text-gray-600">
                Consultation et gestion des avis
              </p>
            </div>
          </div>
        </motion.div>

        {/* Statistiques Rapides */}
        {reviewsData?.pagination && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="card-spa">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-spa-turquoise-100 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-spa-turquoise-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Avis</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reviewsData.pagination.totalCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-spa">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-spa-lavande-100 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-spa-lavande-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Page Actuelle</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reviewsData.pagination.currentPage} / {reviewsData.pagination.totalPages}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-spa">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-spa-rose-100 rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-spa-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Par Page</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {reviewsData.pagination.limit}
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
          className="card-spa mb-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-spa-turquoise-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtre Professionnel */}
            <div>
              <label className="label-spa">Professionnel</label>
              <select
                value={selectedProfessional}
                onChange={(e) => {
                  setSelectedProfessional(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when filter changes
                }}
                className="input-spa"
              >
                <option value="">Tous les professionnels</option>
                {professionals.map(pro => (
                  <option key={pro.id} value={pro.id}>
                    {pro.prenom} {pro.nom} ({pro.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'})
                  </option>
                ))}
              </select>
            </div>

            {/* Filtre Note */}
            <div>
              <label className="label-spa">Note</label>
              <select
                value={selectedRating}
                onChange={(e) => {
                  setSelectedRating(e.target.value);
                  setCurrentPage(1); // Reset to page 1 when filter changes
                }}
                className="input-spa"
              >
                <option value="">Toutes les notes</option>
                <option value="5">⭐⭐⭐⭐⭐ (5 étoiles)</option>
                <option value="4">⭐⭐⭐⭐ (4 étoiles)</option>
                <option value="3">⭐⭐⭐ (3 étoiles)</option>
                <option value="2">⭐⭐ (2 étoiles)</option>
                <option value="1">⭐ (1 étoile)</option>
              </select>
            </div>

            {/* Items par page */}
            <div>
              <label className="label-spa">Avis par page</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1); // Reset to page 1 when limit changes
                }}
                className="input-spa"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Tableau des Avis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-soft overflow-hidden"
        >
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Chargement des avis...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-red-600">Erreur de chargement des avis</p>
            </div>
          ) : !reviewsData || reviewsData.reviews.length === 0 ? (
            <div className="py-12 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {hasActiveFilters ? 'Aucun avis trouvé' : 'Aucun avis pour le moment'}
              </h3>
              <p className="text-gray-600">
                {hasActiveFilters ? 'Essayez de modifier vos filtres' : 'Les avis apparaîtront ici'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-spa-beige-50 to-spa-turquoise-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Professionnel
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Commentaire
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reviewsData.reviews.map((review, index) => (
                      <motion.tr
                        key={review.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onClick={() => openReviewModal(review)}
                        className="hover:bg-spa-beige-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">
                                {new Date(review.createdAt).toLocaleDateString('fr-CA')}
                              </div>
                              <div className="text-gray-500">
                                {new Date(review.createdAt).toLocaleTimeString('fr-CA', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StarRating value={review.rating} readonly size="sm" showValue />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-spa-turquoise-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-spa-turquoise-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {review.professional.prenom} {review.professional.nom}
                              </div>
                              <div className="text-xs text-gray-500">
                                {review.professional.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {review.comment ? (
                            <div className="text-sm text-gray-700 max-w-md">
                              <p className="line-clamp-2">{review.comment}</p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">Aucun commentaire</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {reviewsData.pagination && reviewsData.pagination.totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Page <span className="font-semibold">{reviewsData.pagination.currentPage}</span> sur{' '}
                      <span className="font-semibold">{reviewsData.pagination.totalPages}</span>
                      {' '}({reviewsData.pagination.totalCount} avis au total)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!reviewsData.pagination.hasPrev}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          reviewsData.pagination.hasPrev
                            ? 'bg-spa-turquoise-100 text-spa-turquoise-700 hover:bg-spa-turquoise-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!reviewsData.pagination.hasNext}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          reviewsData.pagination.hasNext
                            ? 'bg-spa-turquoise-100 text-spa-turquoise-700 hover:bg-spa-turquoise-200'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Modal de détails d'avis */}
      <AnimatePresence>
        {showReviewModal && selectedReview && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={closeReviewModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col"
            >
              {/* En-tête du modal - fixe */}
              <div className="bg-gradient-to-r from-spa-lavande-500 to-spa-rose-500 p-4 sm:p-6 flex-shrink-0 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-spa-lavande-600" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-white">Détails de l'avis</h2>
                      <p className="text-xs sm:text-sm text-white/80">
                        {new Date(selectedReview.createdAt).toLocaleDateString('fr-CA', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeReviewModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Contenu du modal - scrollable */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                {/* Professionnel */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Professionnel évalué
                  </label>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-spa-turquoise-50 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-spa-turquoise-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-spa-turquoise-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedReview.professional.prenom} {selectedReview.professional.nom}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedReview.professional.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Note attribuée
                  </label>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-yellow-50 rounded-xl">
                    <StarRating value={selectedReview.rating} readonly size="lg" />
                    <div className="ml-2">
                      <p className="text-xl sm:text-2xl font-bold text-gray-800">{selectedReview.rating}</p>
                      <p className="text-sm text-gray-600">sur 5 étoiles</p>
                    </div>
                  </div>
                </div>

                {/* Commentaire */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Commentaire
                  </label>
                  {selectedReview.comment ? (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                        {selectedReview.comment}
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-gray-400 italic text-center">Aucun commentaire laissé</p>
                    </div>
                  )}
                </div>

                {/* Date et heure */}
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Date et heure de soumission
                  </label>
                  <div className="flex items-center gap-2 p-3 sm:p-4 bg-spa-beige-50 rounded-xl">
                    <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-800 text-sm sm:text-base">
                        {new Date(selectedReview.createdAt).toLocaleDateString('fr-CA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        à {new Date(selectedReview.createdAt).toLocaleTimeString('fr-CA', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pied du modal - fixe */}
              <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 flex justify-end flex-shrink-0 rounded-b-2xl border-t border-gray-200">
                <button
                  onClick={closeReviewModal}
                  className="px-5 sm:px-6 py-2 bg-spa-turquoise-500 text-white rounded-lg hover:bg-spa-turquoise-600 transition-colors font-medium text-sm sm:text-base"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
