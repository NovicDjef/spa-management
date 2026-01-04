'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { format, addMonths } from 'date-fns';
import { useGeneratePeriodScheduleMutation } from '@/lib/redux/services/api';
import toast from 'react-hot-toast';

interface GeneratePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  professionalId?: string;
  professionals: Array<{
    id: string;
    prenom: string;
    nom: string;
    role: string;
  }>;
  onSuccess: () => void;
}

/**
 * Modal pour générer automatiquement les horaires sur une période (3 mois ou plus)
 */
export default function GeneratePeriodModal({
  isOpen,
  onClose,
  professionalId: initialProfessionalId,
  professionals,
  onSuccess,
}: GeneratePeriodModalProps) {
  const [professionalId, setProfessionalId] = useState(initialProfessionalId || '');
  const [periodMonths, setPeriodMonths] = useState(3); // 3 mois par défaut
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [generatePeriod, { isLoading }] = useGeneratePeriodScheduleMutation();

  // Calculer la date de fin basée sur les mois sélectionnés
  const endDate = format(addMonths(new Date(startDate), periodMonths), 'yyyy-MM-dd');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!professionalId) {
      toast.error('Veuillez sélectionner un professionnel');
      return;
    }

    try {
      console.log('📤 Envoi de la requête de génération:', { professionalId, startDate, endDate });

      const result = await generatePeriod({
        professionalId,
        startDate,
        endDate,
      }).unwrap();

      console.log('✅ Réponse reçue:', result);

      toast.success(
        <div>
          <div className="font-bold">✅ Horaires générés avec succès !</div>
          <div className="text-sm mt-1">{result.message}</div>
          <div className="text-xs mt-1 text-green-700">
            Période : {result.data.period}
          </div>
        </div>,
        { duration: 5000 }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erreur génération horaires COMPLÈTE:', error);
      console.error('❌ Error data:', error.data);
      console.error('❌ Error status:', error.status);
      console.error('❌ Error message:', error.message);

      let errorMessage = 'Erreur lors de la génération des horaires';

      if (error.status === 'PARSING_ERROR') {
        errorMessage = 'Erreur de communication avec le serveur. Vérifiez que le backend est démarré.';
      } else if (error.status === 'FETCH_ERROR') {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion et que le backend est démarré.';
      } else if (error.status === 404) {
        errorMessage = "L'endpoint /availability/generate-period n'existe pas sur le serveur. Contactez l'administrateur.";
      } else if (error.status === 401) {
        errorMessage = 'Vous devez être connecté pour effectuer cette action.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = error.error;
      }

      toast.error(
        <div>
          <div className="font-bold">Erreur</div>
          <div className="text-sm mt-1">{errorMessage}</div>
          {error.status && (
            <div className="text-xs mt-1 opacity-75">Code: {error.status}</div>
          )}
        </div>,
        { duration: 6000 }
      );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-lg w-full"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-spa-turquoise-50 to-spa-lavande-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-500 to-spa-lavande-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Générer les Horaires
                </h2>
                <p className="text-sm text-gray-600">
                  Automatique sur une période
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Info Banner */}
          <div className="mx-6 mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Comment ça fonctionne ?</p>
                <ul className="space-y-1 text-xs">
                  <li>• Génère automatiquement les horaires depuis le template hebdomadaire</li>
                  <li>• Ignore les jours sans horaire template</li>
                  <li>• Évite les doublons (skip les dates existantes)</li>
                  <li>• Gain de temps énorme !</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Professionnel */}
            <div>
              <label className="label-spa">Professionnel *</label>
              <select
                value={professionalId}
                onChange={(e) => setProfessionalId(e.target.value)}
                className="input-spa"
                required
                disabled={!!initialProfessionalId}
              >
                <option value="">Sélectionner un professionnel</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.prenom} {prof.nom} - {prof.role === 'MASSOTHERAPEUTE' ? 'Massothérapeute' : 'Esthéticienne'}
                  </option>
                ))}
              </select>
            </div>

            {/* Date de début */}
            <div>
              <label className="label-spa">Date de début *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input-spa"
                required
              />
            </div>

            {/* Période (en mois) */}
            <div>
              <label className="label-spa">Période à générer</label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 3, 6, 12].map((months) => (
                  <button
                    key={months}
                    type="button"
                    onClick={() => setPeriodMonths(months)}
                    className={`p-3 rounded-xl border-2 transition-all text-center ${
                      periodMonths === months
                        ? 'border-spa-turquoise-500 bg-spa-turquoise-50 text-spa-turquoise-700'
                        : 'border-gray-300 hover:border-gray-400 text-gray-700'
                    }`}
                  >
                    <div className="font-bold text-lg">{months}</div>
                    <div className="text-xs">mois</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Résumé */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">Résumé</span>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Début :</span>{' '}
                  {format(new Date(startDate), 'dd MMMM yyyy', { locale: require('date-fns/locale/fr') })}
                </p>
                <p>
                  <span className="font-medium">Fin :</span>{' '}
                  {format(new Date(endDate), 'dd MMMM yyyy', { locale: require('date-fns/locale/fr') })}
                </p>
                <p className="text-spa-turquoise-600 font-semibold mt-2">
                  ≈ {Math.round(periodMonths * 30)} jours à générer
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="btn-outline"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Générer les horaires</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
