'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, FileText, Send, Loader2, CheckCircle, AlertTriangle, Download } from 'lucide-react';
import { useGetReceiptByIdQuery, useResendReceiptMutation } from '@/lib/redux/services/api';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

interface ReceiptViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptId: string;
  receiptNumber: string; // Format: "REC-2026-0006"
  clientName: string;
}

export function ReceiptViewModal({
  isOpen,
  onClose,
  receiptId,
  receiptNumber,
  clientName,
}: ReceiptViewModalProps) {
  const { data: receiptData, isLoading, error } = useGetReceiptByIdQuery(receiptId, {
    skip: !isOpen,
  });

  const [resendReceipt, { isLoading: isResending }] = useResendReceiptMutation();
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Détecter si l'utilisateur est sur Android
  const [isAndroid, setIsAndroid] = useState(false);
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsAndroid(userAgent.includes('android'));
  }, []);

  const handleResend = async () => {
    try {
      setResendError(null);
      await resendReceipt(receiptId).unwrap();
      setResendSuccess(true);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setResendSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error('❌ Erreur lors du renvoi du reçu:', err);
      const errorMsg = extractErrorMessage(err, 'Erreur lors du renvoi du reçu');
      setResendError(errorMsg);
    }
  };

  const handleClose = () => {
    setResendSuccess(false);
    setResendError(null);
    onClose();
  };

  const handleDownload = () => {
    if (!receiptData?.pdf) return;

    // Créer un lien de téléchargement
    const linkSource = `data:application/pdf;base64,${receiptData.pdf}`;
    const downloadLink = document.createElement('a');
    const fileName = `recu-${receiptNumber.toString().padStart(4, '0')}-${clientName.replace(/\s+/g, '-')}.pdf`;

    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* En-tête */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 pr-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Reçu #{receiptNumber.toString().padStart(4, '0')}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Pour {clientName}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2"
                aria-label="Fermer"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>

            {/* Messages de statut */}
            {resendSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">
                  Reçu renvoyé avec succès au client !
                </p>
              </motion.div>
            )}

            {resendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{resendError}</p>
              </motion.div>
            )}

            {/* Chargement */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-12 h-12 text-spa-turquoise-500 animate-spin mb-4" />
                <p className="text-gray-600">Chargement du reçu...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Erreur de chargement
                </h3>
                <p className="text-gray-600 text-center">
                  Impossible de charger le reçu. Veuillez réessayer.
                </p>
              </div>
            ) : receiptData?.pdf ? (
              <>
                {/* Aperçu du PDF */}
                <div className="mb-6">
                  {/* Affichage spécial pour Android */}
                  {isAndroid ? (
                    <div className="border-2 border-spa-turquoise-200 rounded-xl bg-gradient-to-br from-spa-turquoise-50 to-white p-6 sm:p-8">
                      <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-spa-turquoise-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-spa-turquoise-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          Reçu #{receiptNumber}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mb-4">
                          Pour {clientName}
                        </p>
                      </div>

                      {/* Instructions pour Android */}
                      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
                        <p className="text-xs sm:text-sm text-blue-800">
                          📱 <strong>Sur Android</strong> : Les aperçus PDF ne sont pas supportés par votre navigateur.
                          Téléchargez le reçu pour le visualiser.
                        </p>
                      </div>

                      {/* Bouton de téléchargement mis en évidence */}
                      <button
                        onClick={handleDownload}
                        className="btn-primary w-full flex items-center justify-center gap-3 py-4 text-base sm:text-lg mb-3"
                      >
                        <Download className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>Télécharger le reçu</span>
                      </button>

                      <p className="text-xs text-gray-500 text-center leading-relaxed">
                        Ce reçu a été envoyé au client par email
                      </p>
                    </div>
                  ) : (
                    /* Affichage standard pour iOS/Desktop */
                    <div className="border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-inner">
                      <object
                        data={`data:application/pdf;base64,${receiptData.pdf}`}
                        type="application/pdf"
                        className="w-full h-[500px] sm:h-[600px] md:h-[700px]"
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
                            Téléchargez le reçu pour le visualiser.
                          </p>
                          <button
                            onClick={handleDownload}
                            className="btn-primary flex items-center gap-2"
                          >
                            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span>Télécharger le reçu</span>
                          </button>
                        </div>
                      </object>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 text-center">
                        Ce reçu a été envoyé au client par email
                      </p>
                    </div>
                  )}
                </div>

                {/* Boutons d'action */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Bouton Télécharger */}
                  <button
                    onClick={handleDownload}
                    className="btn-outline py-3 sm:py-2.5 text-base sm:text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Télécharger</span>
                  </button>

                  {/* Bouton Renvoyer */}
                  <button
                    onClick={handleResend}
                    disabled={isResending}
                    className="btn-primary py-3 sm:py-2.5 text-base sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isResending ? (
                      <>
                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Envoi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Renvoyer</span>
                      </>
                    )}
                  </button>

                  {/* Bouton Fermer */}
                  <button
                    onClick={handleClose}
                    className="btn-outline py-3 sm:py-2.5 text-base sm:text-sm font-medium"
                  >
                    Fermer
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 text-center leading-relaxed">
                  Téléchargez le PDF ou renvoyez-le au client si nécessaire
                </p>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  PDF non disponible
                </h3>
                <p className="text-gray-600 text-center">
                  Le PDF de ce reçu n'est pas disponible
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
