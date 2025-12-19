'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Clock } from 'lucide-react';
import { StarRating } from './StarRating';
import type { Review } from '@/lib/redux/services/api';

interface ReviewsListProps {
  reviews: Review[];
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Aujourd'hui";
    if (diffInDays === 1) return 'Hier';
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    if (diffInDays < 30)
      return `Il y a ${Math.floor(diffInDays / 7)} semaine${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (reviews.length === 0) {
    return (
      <div className="card-spa p-8 text-center">
        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Aucun avis pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Avis récents ({reviews.length})
      </h3>
      {reviews.map((review, index) => (
        <motion.div
          key={review.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="card-spa !p-4"
        >
          <div className="flex items-start justify-between mb-2">
            <StarRating value={review.rating} readonly size="sm" />
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(review.createdAt)}
            </span>
          </div>
          {review.comment && (
            <p className="text-gray-700 text-sm bg-spa-beige-50 p-3 rounded-lg">
              {review.comment}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
