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
  clientName: string; // ✅ Nom complet du client
  clientEmail: string; // ✅ Email du client (requis pour le backend)
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
  clientEmail,
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
  const [showErrorModal, setShowErrorModal] = useState(false);

  // Détecter si l'utilisateur est sur Android
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes('android'));
  }, []);

  // Services disponibles (data est déjà un tableau après transformResponse)
  const servicesList = services || [];
  const selectedService = servicesList.find(s => s.id === selectedServiceId);
  const availableDurations = selectedService?.durations || [];
  const selectedDurationData = availableDurations.find(d => d.duration === duration);

  // Gestion des erreurs de services
  useEffect(() => {
    if (servicesError) {
      console.error('Erreur lors du chargement des services:', servicesError);
    }
  }, [servicesError]);

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

  // Nettoyer l'URL du blob quand le composant est démonté
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const handleCancel = () => {
    setStep(skipConfirmation ? 'form' : 'confirm');
    setSelectedServiceId('');
    setDuration(0);
    setTreatmentDate('');
    setTreatmentTime('');
    // Nettoyer l'URL du blob si elle existe
    if (pdfBlobUrl) {
      URL.revokeObjectURL(pdfBlobUrl);
    }
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

      // Vérifier que le prix est disponible
      if (!selectedDurationData) {
        setError('Impossible de récupérer le prix du service');
        return;
      }

      // Format attendu par le backend
      const requestData = {
        clientName,           // ✅ Nom complet du client
        clientEmail,          // ✅ Email du client
        serviceName: selectedService.name, // ✅ Nom du service
        duration,             // ✅ Durée en minutes (nombre)
        price: selectedDurationData.price, // ✅ Prix avant taxes (nombre)
        serviceDate: treatmentDate, // ✅ Date du service (YYYY-MM-DD)
        // Optionnels pour référence
        clientId,
        serviceId: selectedServiceId,
        noteId: noteId || undefined,
      };

      // La réponse est maintenant directement un Blob (PDF binaire)
      const pdfBlob = await previewReceipt(requestData).unwrap();

      // Nettoyer l'ancienne URL si elle existe
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }

      // Créer une URL pour le blob PDF
      const url = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(url);
      setStep('preview');
    } catch (err: any) {
      console.error('❌ Erreur lors de la génération:', err);
      const errorMsg = extractErrorMessage(err, 'Erreur lors de la génération de l\'aperçu');
      setError(errorMsg);
      setShowErrorModal(true); // ⭐ Afficher le modal d'erreur avec les instructions
    }
  };

  const handleSendToClient = async () => {
    if (!selectedService) {
      setError('Service non trouvé');
      return;
    }

    if (!selectedDurationData) {
      setError('Impossible de récupérer le prix du service');
      return;
    }

    try {
      setError('');

      // Format attendu par le backend (identique à preview)
      const sendData = {
        clientName,           // ✅ Nom complet du client
        clientEmail,          // ✅ Email du client
        serviceName: selectedService.name, // ✅ Nom du service
        duration,             // ✅ Durée en minutes (nombre)
        price: selectedDurationData.price, // ✅ Prix avant taxes (nombre)
        serviceDate: treatmentDate, // ✅ Date du service (YYYY-MM-DD)
        // Optionnels pour référence
        clientId,
        serviceId: selectedServiceId,
        noteId: noteId || undefined,
      };

      const result = await sendReceipt(sendData).unwrap();

      setStep('success');

      // Fermer automatiquement après 3 secondes
      setTimeout(() => {
        handleCancel();
      }, 3000);
    } catch (err: any) {
      console.error('❌ Erreur lors de l\'envoi du reçu:', err);
      const errorMsg = extractErrorMessage(err, 'Erreur lors de l\'envoi du reçu');
      setError(errorMsg);
      setShowErrorModal(true);
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
                      ⚠️ Erreur lors du chargement des services. Vérifiez que le backend est démarré sur 
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
                  {/* Affichage spécial pour Android */}
                  {isAndroid && pdfBlobUrl ? (
                    <div className="border-2 border-spa-turquoise-200 rounded-xl bg-gradient-to-br from-spa-turquoise-50 to-white p-6 sm:p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-spa-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-spa-turquoise-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          Reçu généré avec succès
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                          Le reçu a été créé pour {clientName}
                        </p>
                      </div>

                      {/* Résumé du reçu */}
                      <div className="bg-white rounded-xl p-4 sm:p-5 mb-6 shadow-sm border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Détails du traitement :</h4>
                        <div className="space-y-2 text-xs sm:text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Service :</span>
                            <span className="font-medium text-gray-800">{selectedService?.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Durée :</span>
                            <span className="font-medium text-gray-800">{duration} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Date :</span>
                            <span className="font-medium text-gray-800">
                              {new Date(treatmentDate).toLocaleDateString('fr-CA')}
                            </span>
                          </div>
                          {selectedDurationData && (
                            <div className="flex justify-between pt-2 border-t border-gray-200">
                              <span className="text-gray-600">Prix (avant taxes) :</span>
                              <span className="font-bold text-spa-turquoise-700 text-base">
                                {selectedDurationData.price.toFixed(2)}$ CAD
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Instructions pour Android */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-xs sm:text-sm text-blue-800 mb-3">
                          📱 <strong>Sur Android</strong> : Les aperçus PDF ne sont pas supportés par votre navigateur.
                          Téléchargez le reçu pour le visualiser avant l'envoi.
                        </p>
                      </div>

                      {/* Bouton de téléchargement mis en évidence */}
                      <a
                        href={pdfBlobUrl}
                        download={`recu-${clientName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base sm:text-lg"
                      >
                        <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Télécharger et visualiser le reçu</span>
                      </a>

                      <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                        Ouvrez le fichier téléchargé pour vérifier toutes les informations avant d'envoyer
                      </p>
                    </div>
                  ) : (
                    /* Affichage standard pour iOS/Desktop */
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-inner">
                      {pdfBlobUrl ? (
                        <>
                          <object
                            data={pdfBlobUrl}
                            type="application/pdf"
                            className="w-full h-[600px] sm:h-[700px]"
                            aria-label="Aperçu du reçu PDF"
                          >
                            {/* Fallback si le navigateur ne peut pas afficher le PDF */}
                            <div className="flex flex-col items-center justify-center min-h-[500px] p-6 sm:p-8">
                              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-gray-400" />
                              </div>
                              <p className="text-gray-700 font-medium mb-2 text-base sm:text-lg text-center">
                                Impossible d'afficher l'aperçu PDF
                              </p>
                              <p className="text-gray-500 text-sm sm:text-base mb-6 text-center max-w-md">
                                Votre navigateur ne supporte pas l'affichage de PDFs intégrés.
                                Téléchargez le reçu pour le visualiser avant l'envoi.
                              </p>

                              {/* Résumé du reçu dans le fallback */}
                              <div className="bg-spa-turquoise-50 rounded-xl p-4 mb-6 max-w-sm w-full">
                                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Résumé :</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Service :</span>
                                    <span className="font-medium text-gray-800">{selectedService?.name}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Durée :</span>
                                    <span className="font-medium text-gray-800">{duration} min</span>
                                  </div>
                                  {selectedDurationData && (
                                    <div className="flex justify-between pt-2 border-t border-gray-300">
                                      <span className="text-gray-600">Prix :</span>
                                      <span className="font-bold text-spa-turquoise-700">
                                        {selectedDurationData.price.toFixed(2)}$
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <a
                                href={pdfBlobUrl}
                                download={`recu-${clientName.replace(/\s+/g, '-')}.pdf`}
                                className="btn-primary flex items-center gap-2"
                              >
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>Télécharger le reçu</span>
                              </a>
                            </div>
                          </object>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[600px] sm:h-[700px]">
                          <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-spa-turquoise-500 animate-spin mb-4" />
                          <p className="text-gray-600 text-sm sm:text-base">Génération de l'aperçu du reçu...</p>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-gray-500 mt-3 text-center leading-relaxed">
                    {isAndroid
                      ? "Vérifiez le reçu téléchargé avant de l'envoyer au client"
                      : "Aperçu du reçu qui sera envoyé au client par email"
                    }
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

      {/* Modal d'erreur */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">
                Erreur
              </h3>

              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-800 text-sm font-medium">
                  {error}
                </p>
              </div>

              {/* Message d'aide pour le numéro d'ordre manquant */}
              {error.toLowerCase().includes('numéro') || error.toLowerCase().includes('ordre') || error.toLowerCase().includes('rmq') ? (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
                  <p className="text-blue-800 text-sm font-medium mb-2">
                    💡 Solution :
                  </p>
                  <p className="text-blue-700 text-sm">
                    Veuillez ajouter votre numéro d'ordre RMQ dans votre profil avant de pouvoir émettre des reçus d'assurance.
                  </p>
                  <p className="text-blue-600 text-xs mt-2">
                    Allez dans Menu → Profil → Numéro d'ordre professionnel
                  </p>
                </div>
              ) : null}

              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setError('');
                }}
                className="btn-primary w-full"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
