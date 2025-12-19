'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Send, Check, AlertCircle } from 'lucide-react';
import { useCreateReviewMutation } from '@/lib/redux/services/api';
import { StarRating } from './StarRating';
import { ProfessionalSelector } from './ProfessionalSelector';

export function ReviewForm() {
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [professionalId, setProfessionalId] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!professionalId || rating === 0) {
      setError('Veuillez sélectionner un professionnel et donner une note');
      return;
    }

    try {
      await createReview({
        professionalId,
        rating,
        comment: comment.trim() || undefined,
      }).unwrap();

      // Succès
      setShowSuccess(true);
      setProfessionalId('');
      setRating(0);
      setComment('');

      // Masquer le succès après 5 secondes
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (err: any) {
      setError(err.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <>
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card-spa max-w-2xl mx-auto"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Partagez votre expérience
        </h2>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Étape 1: Sélection professionnel */}
          <div>
            <label className="label-spa">
              <span className="text-lg font-semibold">
                1. Sélectionnez votre professionnel
              </span>
            </label>
            <ProfessionalSelector
              value={professionalId}
              onChange={setProfessionalId}
            />
          </div>

          {/* Étape 2: Notation */}
          <div>
            <label className="label-spa">
              <span className="text-lg font-semibold">
                2. Notez votre expérience
              </span>
            </label>
            <div className="flex items-center gap-3 p-4 bg-spa-beige-50 rounded-xl">
              <StarRating value={rating} onChange={setRating} size="lg" />
              {rating > 0 && (
                <span className="text-lg font-medium text-gray-700">
                  {rating}/5
                </span>
              )}
            </div>
          </div>

          {/* Étape 3: Commentaire */}
          <div>
            <label className="label-spa">
              <span className="text-lg font-semibold">3. Commentaire</span>
              <span className="text-sm font-normal text-gray-500 ml-2">
                (optionnel)
              </span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Partagez votre expérience en quelques mots..."
              rows={5}
              maxLength={1000}
              className="input-spa resize-none"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/1000 caractères
            </p>
          </div>

          {/* Info anonymat */}
          <div className="p-4 bg-spa-turquoise-50 border border-spa-turquoise-200 rounded-xl">
            <p className="text-sm text-spa-turquoise-800">
              <strong>Votre avis est anonyme.</strong> Aucune information
              personnelle ne sera enregistrée.
            </p>
          </div>

          {/* Bouton */}
          <button
            type="submit"
            disabled={isLoading || !professionalId || rating === 0}
            className="w-full btn-primary flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Envoyer mon avis
              </>
            )}
          </button>
        </div>
      </motion.form>

      {/* Modal de succès */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Merci pour votre avis !
              </h3>
              <p className="text-gray-600">
                Votre retour a été enregistré avec succès.
              </p>
              <button
                onClick={() => setShowSuccess(false)}
                className="mt-6 btn-primary"
              >
                Fermer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
