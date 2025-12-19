'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useGetEmployeeReviewsQuery } from '@/lib/redux/services/api';
import { ReviewStats } from './ReviewStats';
import { ReviewsList } from './ReviewsList';

interface ReviewsModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ReviewsModal({
  userId,
  userName,
  isOpen,
  onClose,
}: ReviewsModalProps) {
  const { data, isLoading } = useGetEmployeeReviewsQuery(userId, {
    skip: !isOpen,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                Avis pour {userName}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Chargement des avis...</p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Colonne gauche: Stats */}
                <div className="lg:col-span-1">
                  <ReviewStats
                    averageRating={data.statistics.averageRating}
                    totalReviews={data.statistics.totalReviews}
                    ratingDistribution={data.statistics.ratingDistribution}
                  />
                </div>

                {/* Colonne droite: Liste */}
                <div className="lg:col-span-2">
                  <ReviewsList reviews={data.recentReviews} />
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-gray-600">
                Erreur de chargement
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
