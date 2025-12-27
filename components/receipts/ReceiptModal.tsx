'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, FileText, Clock, Send, Loader2, CheckCircle, Calendar, DollarSign, Eye, ArrowLeft } from 'lucide-react';
import { useSendReceiptMutation, usePreviewReceiptMutation, useGetMassageServicesQuery } from '@/lib/redux/services/api';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string; // ✅ ID du client (requis)
  clientName: string;
  therapistName: string;
  therapistOrderNumber?: string;
  skipConfirmation?: boolean; // Si true, ouvre directement le formulaire
  noteId?: string; // ⚠️ ID de la note (optionnel)
}

export function ReceiptModal({
  isOpen,
  onClose,
  clientId,
  clientName,
  therapistName,
  therapistOrderNumber,
  skipConfirmation = false,
  noteId,
}: ReceiptModalProps) {
  const [step, setStep] = useState<'confirm' | 'form' | 'preview' | 'success'>(
    skipConfirmation ? 'form' : 'confirm'
  );
  const [previewReceipt, { isLoading: isLoadingPreview }] = usePreviewReceiptMutation();
  const [sendReceipt, { isLoading: isSending }] = useSendReceiptMutation();
  const [pdfBase64, setPdfBase64] = useState<string>('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const {
    data: services,
    isLoading: isLoadingServices,
    error: servicesError
  } = useGetMassageServicesQuery();

  // États du formulaire
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [duration, setDuration] = useState<number>(0);
  const [treatmentDate, setTreatmentDate] = useState('');
  const [treatmentTime, setTreatmentTime] = useState('');
  const [error, setError] = useState('');

  // Services disponibles (data est déjà un tableau après transformResponse)
  const servicesList = services || [];
  const selectedService = servicesList.find(s => s.id === selectedServiceId);
  const availableDurations = selectedService?.durations || [];
  const selectedDurationData = availableDurations.find(d => d.duration === duration);

  // Debug: Log des données reçues
  useEffect(() => {
    if (services) {
      console.log('Services reçus:', services);
      console.log('Nombre de services:', servicesList.length);
    }
    if (servicesError) {
      console.error('Erreur lors du chargement des services:', servicesError);
    }
  }, [services, servicesError]);

  // Initialiser la date d'aujourd'hui par défaut
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0]; // Format YYYY-MM-DD
      const timeStr = today.toTimeString().slice(0, 5); // Format HH:mm
      setTreatmentDate(dateStr);
      setTreatmentTime(timeStr);
    }
  }, [isOpen]);

  // Réinitialiser la durée quand le service change
  useEffect(() => {
    if (selectedService && selectedService.durations.length > 0) {
      setDuration(selectedService.durations[0].duration);
    }
  }, [selectedServiceId]);

  // Convertir le base64 en Blob URL pour affichage dans l'iframe
  useEffect(() => {
    if (pdfBase64) {
      console.log('🔄 Conversion base64 → Blob URL...');
      console.log('📏 Taille base64:', pdfBase64.length);

      try {
        // Convertir base64 en Blob
        const byteCharacters = atob(pdfBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });

        console.log('📦 Blob créé, taille:', blob.size, 'bytes');

        // Créer une URL pour le blob
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);

        console.log('✅ Blob URL créée:', url);

        // Nettoyer l'URL quand le composant est démonté ou le PDF change
        return () => {
          if (url) {
            console.log('🧹 Nettoyage de l\'URL Blob');
            URL.revokeObjectURL(url);
          }
        };
      } catch (error) {
        console.error('❌ Erreur lors de la conversion base64 → Blob:', error);
        setError('Erreur lors de la préparation du PDF');
      }
    }
  }, [pdfBase64]);

  const handleCancel = () => {
    setStep(skipConfirmation ? 'form' : 'confirm');
    setSelectedServiceId('');
    setDuration(0);
    setTreatmentDate('');
    setTreatmentTime('');
    setPdfBase64('');
    setPdfBlobUrl('');
    setError('');
    onClose();
  };

  const handleConfirm = () => {
    setStep('form');
  };

  const handleGeneratePreview = async () => {
    if (!selectedServiceId) {
      setError('Veuillez sélectionner un type de massage');
      return;
    }

    if (!selectedService) {
      setError('Service non trouvé');
      return;
    }

    if (!duration) {
      setError('Veuillez sélectionner une durée');
      return;
    }

    if (!treatmentDate) {
      setError('Veuillez sélectionner une date de rendez-vous');
      return;
    }

    if (!treatmentTime) {
      setError('Veuillez sélectionner une heure de rendez-vous');
      return;
    }

    try {
      setError('');
      console.log('📤 Envoi de la requête d\'aperçu...');

      const response = await previewReceipt({
        clientId,
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        duration,
        treatmentDate,
        treatmentTime,
        ...(noteId && { noteId }), // Ajouter noteId seulement s'il existe
      }).unwrap();

      console.log('📥 Réponse reçue:', response);
      console.log('📄 PDF base64 reçu (longueur):', response.data?.pdf?.length || 0);

      if (response.data?.pdf) {
        setPdfBase64(response.data.pdf);
        setStep('preview');
        console.log('✅ PDF défini, passage à l\'étape preview');
      } else {
        console.error('❌ Pas de PDF dans la réponse');
        setError('Aucun PDF reçu du serveur');
      }
    } catch (err: any) {
      console.error('❌ Erreur lors de la génération:', err);
      const errorMsg = extractErrorMessage(err, 'Erreur lors de la génération de l\'aperçu');
      setError(errorMsg);
    }
  };

  const handleSendToClient = async () => {
    if (!selectedService) {
      setError('Service non trouvé');
      return;
    }

    try {
      setError('');
      await sendReceipt({
        clientId,
        serviceId: selectedServiceId,
        serviceName: selectedService.name,
        duration,
        treatmentDate,
        treatmentTime,
        ...(noteId && { noteId }), // Ajouter noteId seulement s'il existe
      }).unwrap();

      setStep('success');

      // Fermer automatiquement après 3 secondes
      setTimeout(() => {
        handleCancel();
      }, 3000);
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'envoi du reçu:', err);
      const errorMsg = extractErrorMessage(err, 'Erreur lors de l\'envoi du reçu');
      setError(errorMsg);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* Étape 1 : Confirmation */}
            {step === 'confirm' && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Envoyer le reçu au client ?
                    </h2>
                    <p className="text-gray-600">
                      Pour {clientName}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-2">Reçu pour assurances</p>
                      <p>
                        Le client recevra automatiquement un reçu officiel par email pour soumettre à son assurance.
                        Vous devrez remplir les détails du traitement.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleCancel}
                    className="btn-outline flex-1"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="btn-primary flex-1"
                  >
                    Continuer
                  </button>
                </div>
              </>
            )}

            {/* Étape 2 : Formulaire */}
            {step === 'form' && (
              <>
                <div className="flex justify-between items-start mb-4 sm:mb-6">
                  <div className="flex-1 pr-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                      Créer un reçu pour les assurances
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600">
                      Remplissez les informations du traitement
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2"
                    aria-label="Fermer"
                  >
                    <X className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Informations automatiques */}
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-spa-turquoise-50 rounded-xl space-y-2 sm:space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Client:</span>
                    <span className="font-semibold text-gray-800 text-right">{clientName}</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Thérapeute:</span>
                    <span className="font-semibold text-gray-800 text-right">{therapistName}</span>
                  </div>
                  {therapistOrderNumber && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gray-600 font-medium">N° d'ordre:</span>
                      <span className="font-semibold text-gray-800">{therapistOrderNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Entreprise:</span>
                    <span className="font-semibold text-gray-800">Spa Renaissance</span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Adresse:</span>
                    <span className="font-semibold text-gray-800 text-right leading-tight">
                      451 avenue Arnaud, suite 101<br />Sept-Îles, Québec G4R 3B3
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-gray-600 font-medium">Téléphone:</span>
                    <span className="font-semibold text-gray-800">418-968-0606</span>
                  </div>
                </div>

                {/* Chargement des services */}
                {isLoadingServices ? (
                  <div className="mb-6 flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
                    <span className="ml-3 text-gray-600">Chargement des services...</span>
                  </div>
                ) : servicesError ? (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-red-800 text-sm">
                      ⚠️ Erreur lors du chargement des services. Vérifiez que le backend est démarré sur http://localhost:5003
                    </p>
                    <p className="text-red-600 text-xs mt-2">
                      Endpoint: GET /api/receipts/massage-services
                    </p>
                  </div>
                ) : servicesList.length === 0 ? (
                  <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <p className="text-yellow-800 text-sm">
                      ⚠️ Aucun service disponible. Vérifiez la configuration du backend.
                    </p>
                    <p className="text-yellow-600 text-xs mt-2">
                      Les services devraient être retournés par: GET /api/receipts/massage-services
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Type de massage */}
                    <div className="mb-3 sm:mb-4">
                      <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                        Type de massage <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedServiceId}
                        onChange={(e) => setSelectedServiceId(e.target.value)}
                        className="w-full px-4 py-3 sm:py-3.5 text-base sm:text-base border-2 border-gray-300 rounded-xl focus:border-spa-turquoise-500 focus:ring-2 focus:ring-spa-turquoise-200 transition-all"
                      >
                        <option value="">Sélectionnez un type</option>
                        {servicesList.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1.5">
                        {servicesList.length} service(s) disponible(s)
                      </p>
                    </div>

                    {/* Durée - Affichée seulement si un service est sélectionné */}
                    {selectedService && availableDurations.length > 0 && (
                      <div className="mb-3 sm:mb-4">
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                          Durée du traitement <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(Number(e.target.value))}
                          className="w-full px-4 py-3 sm:py-3.5 text-base sm:text-base border-2 border-gray-300 rounded-xl focus:border-spa-turquoise-500 focus:ring-2 focus:ring-spa-turquoise-200 transition-all"
                        >
                          {availableDurations.map((dur) => (
                            <option key={dur.duration} value={dur.duration}>
                              {dur.duration} min - {dur.price.toFixed(2)}$ CAD
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Prix affiché (calculé automatiquement) */}
                    {selectedDurationData && (
                      <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gradient-to-r from-spa-menthe-50 to-spa-turquoise-50 border-2 border-spa-turquoise-200 rounded-xl">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-spa-turquoise-600 flex-shrink-0" />
                            <span className="text-sm sm:text-base font-semibold text-gray-700">Prix avant taxes:</span>
                          </div>
                          <span className="text-lg sm:text-xl font-bold text-spa-turquoise-700 whitespace-nowrap">
                            {selectedDurationData.price.toFixed(2)}$ CAD
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 mt-2 sm:mt-2.5 leading-relaxed">
                          Les taxes (TPS 5% + TVQ 9.975%) seront calculées automatiquement sur le reçu
                        </p>
                      </div>
                    )}

                    {/* Date et heure du rendez-vous */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Date du rendez-vous <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={treatmentDate}
                          onChange={(e) => setTreatmentDate(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-base border-2 border-gray-300 rounded-xl focus:border-spa-turquoise-500 focus:ring-2 focus:ring-spa-turquoise-200 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm sm:text-base font-semibold text-gray-700 mb-2">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Heure du rendez-vous <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          value={treatmentTime}
                          onChange={(e) => setTreatmentTime(e.target.value)}
                          className="w-full px-4 py-3 sm:py-3.5 text-base border-2 border-gray-300 rounded-xl focus:border-spa-turquoise-500 focus:ring-2 focus:ring-spa-turquoise-200 transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    onClick={() => skipConfirmation ? handleCancel() : setStep('confirm')}
                    className="btn-outline flex-1 py-3 sm:py-2.5 text-base sm:text-sm font-medium"
                    disabled={isLoadingPreview}
                  >
                    {skipConfirmation ? 'Annuler' : 'Retour'}
                  </button>
                  <button
                    onClick={handleGeneratePreview}
                    disabled={isLoadingPreview || !selectedServiceId || !duration || !treatmentDate || !treatmentTime || isLoadingServices}
                    className="btn-primary flex-1 py-3 sm:py-2.5 text-base sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingPreview ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline animate-spin" />
                        <span className="text-base sm:text-sm">Génération...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
                        <span className="text-base sm:text-sm">Voir l'aperçu</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 text-center leading-relaxed">
                  Vous pourrez voir un aperçu du reçu avant de l'envoyer au client.
                </p>
              </>
            )}

            {/* Étape 3 : Aperçu du reçu */}
            {step === 'preview' && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Aperçu du reçu
                    </h2>
                    <p className="text-gray-600">
                      Vérifiez le reçu avant de l'envoyer à {clientName}
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-red-800"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Affichage du PDF */}
                <div className="mb-6">
                  <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner">
                    {pdfBlobUrl ? (
                      <>
                        <object
                          data={pdfBlobUrl}
                          type="application/pdf"
                          className="w-full h-[700px]"
                          aria-label="Aperçu du reçu PDF"
                        >
                          {/* Fallback si le navigateur ne peut pas afficher le PDF */}
                          <div className="flex flex-col items-center justify-center h-[700px] p-8">
                            <FileText className="w-16 h-16 text-gray-400 mb-4" />
                            <p className="text-gray-700 font-medium mb-2">
                              Impossible d'afficher l'aperçu PDF dans ce navigateur
                            </p>
                            <p className="text-gray-500 text-sm mb-4 text-center">
                              Veuillez cliquer sur le bouton ci-dessous pour télécharger et visualiser le reçu
                            </p>
                            <a
                              href={pdfBlobUrl}
                              download={`recu-${clientName.replace(/\s+/g, '-')}.pdf`}
                              className="btn-outline flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              Télécharger le PDF
                            </a>
                          </div>
                        </object>
                        {/* Debug info (à retirer en production) */}
                        <p className="text-xs text-gray-400 mt-1 px-2">
                          PDF chargé: {pdfBlobUrl.substring(0, 30)}...
                        </p>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[700px]">
                        <Loader2 className="w-12 h-12 text-spa-turquoise-500 animate-spin mb-4" />
                        <p className="text-gray-600">Génération de l'aperçu du reçu...</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Aperçu du reçu qui sera envoyé au client par email
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="btn-outline flex-1"
                    disabled={isSending}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2 inline" />
                    Modifier
                  </button>
                  <button
                    onClick={handleSendToClient}
                    disabled={isSending}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2 inline" />
                        Envoyer au client
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  Le reçu sera envoyé automatiquement au client par email sans exposer son adresse.
                </p>
              </>
            )}

            {/* Étape 4 : Succès */}
            {step === 'success' && (
              <>
                <div className="flex flex-col items-center justify-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"
                  >
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-gray-800 mb-3">
                    Reçu envoyé !
                  </h2>
                  <p className="text-gray-600 text-center mb-2">
                    Le client {clientName} a reçu le reçu par email.
                  </p>
                  <p className="text-sm text-gray-500 text-center mb-6">
                    Le reçu inclut le détail des taxes (TPS + TVQ) et le montant total.
                  </p>

                  <button
                    onClick={handleCancel}
                    className="btn-primary"
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
