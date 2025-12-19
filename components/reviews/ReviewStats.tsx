'use client';

import { motion } from 'framer-motion';
import { Star, MessageSquare, TrendingUp } from 'lucide-react';
import { StarRating } from './StarRating';

interface ReviewStatsProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function ReviewStats({
  averageRating,
  totalReviews,
  ratingDistribution,
}: ReviewStatsProps) {
  const maxCount = Math.max(...Object.values(ratingDistribution));

  return (
    <div className="space-y-6">
      {/* Note moyenne */}
      <div className="card-spa text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Note moyenne
        </h3>
        <div className="flex flex-col items-center gap-2">
          <StarRating value={averageRating} readonly size="lg" />
          <div className="text-4xl font-bold text-gray-800">
            {averageRating.toFixed(1)}
            <span className="text-2xl text-gray-500">/5</span>
          </div>
          <p className="text-gray-600 flex items-center gap-1">
            <MessageSquare className="w-4 h-4" />
            {totalReviews} avis reçu{totalReviews !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Distribution */}
      <div className="card-spa">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-spa-turquoise-500" />
          Distribution des notes
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingDistribution[rating as keyof typeof ratingDistribution] || 0;
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="font-medium text-gray-700">{rating}</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: (5 - rating) * 0.1 }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                  />
                </div>
                <span className="font-medium text-gray-700 w-8 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
