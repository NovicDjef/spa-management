'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Save, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useUpdateReceiptMutation, useGetMassageServicesQuery, type Receipt, type UpdateReceiptData } from '@/lib/redux/services/api';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

interface ReceiptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
}

export function ReceiptEditModal({
  isOpen,
  onClose,
  receipt,
}: ReceiptEditModalProps) {
  const [updateReceipt, { isLoading: isUpdating }] = useUpdateReceiptMutation();
  const { data: services } = useGetMassageServicesQuery();

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // État du formulaire
  const [formData, setFormData] = useState<UpdateReceiptData>({
    clientName: receipt.clientName,
    clientEmail: receipt.clientEmail || '',
    clientPhone: receipt.clientPhone || '',
    clientAddress: receipt.clientAddress || '',
    serviceName: receipt.serviceName,
    duration: receipt.duration,
    price: parseFloat(receipt.price),
    serviceDate: receipt.serviceDate ? new Date(receipt.serviceDate).toISOString().split('T')[0] : '',
  });

  // Réinitialiser le formulaire quand le reçu change
  useEffect(() => {
    if (receipt) {
      setFormData({
        clientName: receipt.clientName,
        clientEmail: receipt.clientEmail || '',
        clientPhone: receipt.clientPhone || '',
        clientAddress: receipt.clientAddress || '',
        serviceName: receipt.serviceName,
        duration: receipt.duration,
        price: parseFloat(receipt.price),
        serviceDate: receipt.serviceDate ? new Date(receipt.serviceDate).toISOString().split('T')[0] : '',
      });
    }
  }, [receipt]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.clientName || !formData.clientEmail || !formData.serviceName || !formData.serviceDate) {
      setUpdateError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setUpdateError(null);

      // Préparer les données avec la date au format ISO complet
      const updateData = {
        ...formData,
        // Convertir la date YYYY-MM-DD en format ISO complet avec l'heure
        serviceDate: new Date(formData.serviceDate).toISOString(),
      };

      console.log('==========================================');
      console.log('🔄 MODIFICATION DU REÇU - DÉMARRAGE');
      console.log('==========================================');
      console.log('📋 Reçu sélectionné:', {
        id: receipt.id,
        receiptNumber: receipt.receiptNumber,
        clientName: receipt.clientName,
        therapistId: receipt.therapistId,
        therapistName: receipt.therapistName,
      });
      console.log('📤 Données à envoyer:', updateData);
      console.log('🌐 URL complète:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/receipts/${receipt.id}`);
      console.log('==========================================');

      const result = await updateReceipt({
        id: receipt.id,
        data: updateData
      }).unwrap();

      console.log('✅ Reçu modifié avec succès:', result);
      console.log('==========================================');

      setUpdateSuccess(true);

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setUpdateSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      console.log('==========================================');
      console.error('❌ ERREUR LORS DE LA MODIFICATION');
      console.log('==========================================');
      console.error('Type d\'erreur:', typeof err);
      console.error('Erreur complète:', err);
      console.error('err.status:', err?.status);
      console.error('err.data:', err?.data);
      console.error('err.error:', err?.error);
      console.error('JSON stringify:', JSON.stringify(err, null, 2));
      console.log('==========================================');

      // Afficher un message d'erreur plus détaillé
      let errorMsg = extractErrorMessage(err, 'Erreur lors de la modification du reçu');

      // Si c'est une erreur "Route non trouvée", ajouter des détails
      if (err?.data?.error === "Route non trouvée" || err?.status === 404) {
        errorMsg = `Route non trouvée (404). Vérifiez que la route PUT /api/receipts/${receipt.id} existe côté backend et que vous avez les permissions nécessaires.`;
      }

      setUpdateError(errorMsg);
    }
  };

  const handleClose = () => {
    setUpdateSuccess(false);
    setUpdateError(null);
    onClose();
  };

  // Mettre à jour le prix quand le service ou la durée change
  const handleServiceChange = (serviceName: string) => {
    setFormData(prev => ({ ...prev, serviceName }));

    // Trouver le service et mettre à jour le prix si disponible
    const service = services?.find(s => s.name === serviceName);
    if (service && formData.duration) {
      const durationData = service.durations.find(d => d.duration === formData.duration);
      if (durationData) {
        setFormData(prev => ({ ...prev, price: durationData.price }));
      }
    }
  };

  const handleDurationChange = (duration: number) => {
    setFormData(prev => ({ ...prev, duration }));

    // Mettre à jour le prix si le service est sélectionné
    const service = services?.find(s => s.name === formData.serviceName);
    if (service) {
      const durationData = service.durations.find(d => d.duration === duration);
      if (durationData) {
        setFormData(prev => ({ ...prev, price: durationData.price }));
      }
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
            className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-3xl w-full p-4 sm:p-6 md:p-8 max-h-[90vh] overflow-y-auto"
          >
            {/* En-tête */}
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 pr-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Modifier le reçu #{receipt.receiptNumber}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Le reçu modifié sera automatiquement renvoyé au client
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
            {updateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <p className="text-green-800 font-medium">
                  Reçu modifié et renvoyé avec succès !
                </p>
              </motion.div>
            )}

            {updateError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-center gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800">{updateError}</p>
              </motion.div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Nom du client */}
              <div>
                <label className="label-spa">
                  Nom complet du client <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                  className="input-spa"
                  required
                  placeholder="Jean Dupont"
                />
              </div>

              {/* Email du client */}
              <div>
                <label className="label-spa">
                  Email du client <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="input-spa"
                  required
                  placeholder="jean@example.com"
                />
              </div>

              {/* Téléphone et adresse */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                    className="input-spa"
                    placeholder="418-123-4567"
                  />
                </div>
                <div>
                  <label className="label-spa">Adresse</label>
                  <input
                    type="text"
                    value={formData.clientAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientAddress: e.target.value }))}
                    className="input-spa"
                    placeholder="123 rue Test, Ville, QC"
                  />
                </div>
              </div>

              {/* Service et durée */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">
                    Service <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.serviceName}
                    onChange={(e) => handleServiceChange(e.target.value)}
                    className="input-spa"
                    required
                  >
                    <option value="">Sélectionner un service</option>
                    {services?.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-spa">
                    Durée <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => handleDurationChange(parseInt(e.target.value))}
                    className="input-spa"
                    required
                  >
                    <option value="">Sélectionner</option>
                    <option value="50">50 minutes</option>
                    <option value="80">80 minutes</option>
                  </select>
                </div>
              </div>

              {/* Prix et date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">
                    Prix (avant taxes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="input-spa"
                    required
                    placeholder="115.00"
                  />
                </div>

                <div>
                  <label className="label-spa">
                    Date du service <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.serviceDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, serviceDate: e.target.value }))}
                    className="input-spa"
                    required
                  />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-outline py-3 sm:py-2.5 text-base sm:text-sm font-medium"
                  disabled={isUpdating}
                >
                  Annuler
                </button>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="btn-primary py-3 sm:py-2.5 text-base sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Modification...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Enregistrer et renvoyer</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 text-center leading-relaxed">
                Le reçu sera automatiquement renvoyé au client après modification
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
