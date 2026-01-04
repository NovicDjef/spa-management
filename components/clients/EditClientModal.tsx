'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useUpdateClientMutation, type Client, type UpdateClientData } from '@/lib/redux/services/api';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

const ZONES_DOULEUR_OPTIONS = [
  'Tête',
  'Nuque',
  'Épaules',
  'Bras',
  'Coudes',
  'Poignets',
  'Mains',
  'Dos',
  'Lombaires',
  'Hanches',
  'Cuisses',
  'Genoux',
  'Mollets',
  'Chevilles',
  'Pieds',
];

export function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const [updateClient, { isLoading, isSuccess, isError, error }] = useUpdateClientMutation();

  // États du formulaire
  const [formData, setFormData] = useState<UpdateClientData>({
    nom: '',
    prenom: '',
    telCellulaire: '',
    courriel: '',
    dateNaissance: '',
    adresse: '',
    zonesDouleur: [],
    raisonConsultation: '',
    traitementsActuels: '',
    mauxDeDos: false,
    raideurs: false,
    arthrose: false,
    tendinite: false,
    entorse: false,
    fracture: false,
    accident: false,
    allergies: '',
    medicaments: '',
    problemesSante: '',
    interventionsChirurgicales: '',
    grossesse: false,
    moisGrossesse: 0,
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Pré-remplir le formulaire avec les données du client
  useEffect(() => {
    if (client && isOpen) {
      setFormData({
        nom: client.nom || '',
        prenom: client.prenom || '',
        telCellulaire: client.telCellulaire || '',
        courriel: client.courriel || '',
        dateNaissance: client.dateNaissance || '',
        adresse: client.adresse || '',
        zonesDouleur: client.zonesDouleur || [],
        raisonConsultation: client.raisonConsultation || '',
        traitementsActuels: client.traitementsActuels || '',
        mauxDeDos: client.mauxDeDos || false,
        raideurs: client.raideurs || false,
        arthrose: client.arthrose || false,
        tendinite: client.tendinite || false,
        entorse: client.entorse || false,
        fracture: client.fracture || false,
        accident: client.accident || false,
        allergies: client.allergies || '',
        medicaments: client.medicaments || '',
        problemesSante: client.problemesSante || '',
        interventionsChirurgicales: client.interventionsChirurgicales || '',
        grossesse: client.grossesse || false,
        moisGrossesse: client.moisGrossesse || 0,
      });
    }
  }, [client, isOpen]);

  // Gérer le succès/erreur
  useEffect(() => {
    if (isSuccess) {
      setSuccessMessage('Informations mises à jour avec succès !');
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 2000);
    }
  }, [isSuccess, onClose]);

  useEffect(() => {
    if (isError) {
      setErrorMessage(
        (error as any)?.data?.message || 'Erreur lors de la mise à jour'
      );
      setTimeout(() => setErrorMessage(''), 5000);
    }
  }, [isError, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateClient({
        id: client.id,
        data: formData,
      }).unwrap();
    } catch (err) {
      console.error('Erreur mise à jour client:', err);
    }
  };

  const toggleZoneDouleur = (zone: string) => {
    setFormData((prev) => {
      const zones = prev.zonesDouleur || [];
      if (zones.includes(zone)) {
        return { ...prev, zonesDouleur: zones.filter((z) => z !== zone) };
      } else {
        return { ...prev, zonesDouleur: [...zones, zone] };
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* En-tête */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Modifier les informations de {client.prenom} {client.nom}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages de succès/erreur */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{successMessage}</p>
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorMessage}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">Nom</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                    className="input-spa"
                  />
                </div>

                <div>
                  <label className="label-spa">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                    className="input-spa"
                  />
                </div>

                <div>
                  <label className="label-spa">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.telCellulaire}
                    onChange={(e) =>
                      setFormData({ ...formData, telCellulaire: e.target.value })
                    }
                    className="input-spa"
                  />
                </div>

                <div>
                  <label className="label-spa">Courriel</label>
                  <input
                    type="email"
                    value={formData.courriel}
                    onChange={(e) =>
                      setFormData({ ...formData, courriel: e.target.value })
                    }
                    className="input-spa"
                  />
                </div>
              </div>
            </div>

            {/* Zones de douleur */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Zones de douleur
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {ZONES_DOULEUR_OPTIONS.map((zone) => (
                  <button
                    key={zone}
                    type="button"
                    onClick={() => toggleZoneDouleur(zone)}
                    className={`
                      px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
                      ${
                        formData.zonesDouleur?.includes(zone)
                          ? 'bg-spa-rose-500 border-spa-rose-500 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-spa-rose-300'
                      }
                    `}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>

            {/* Raison de consultation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Informations médicales
              </h3>

              <div>
                <label className="label-spa">Raison de consultation</label>
                <textarea
                  value={formData.raisonConsultation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      raisonConsultation: e.target.value,
                    })
                  }
                  className="input-spa min-h-[80px]"
                  placeholder="Ex: Douleurs au dos depuis 2 jours"
                />
              </div>

              <div>
                <label className="label-spa">Traitements actuels</label>
                <textarea
                  value={formData.traitementsActuels}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      traitementsActuels: e.target.value,
                    })
                  }
                  className="input-spa min-h-[60px]"
                  placeholder="Ex: Physiothérapie 2x/semaine"
                />
              </div>
            </div>

            {/* Conditions médicales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Conditions médicales
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'mauxDeDos', label: 'Maux de dos' },
                  { key: 'raideurs', label: 'Raideurs' },
                  { key: 'arthrose', label: 'Arthrose' },
                  { key: 'tendinite', label: 'Tendinite' },
                  { key: 'entorse', label: 'Entorse' },
                  { key: 'fracture', label: 'Fracture' },
                  { key: 'accident', label: 'Accident' },
                ].map(({ key, label }) => (
                  <label
                    key={key}
                    className="flex items-center gap-2 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={formData[key as keyof UpdateClientData] as boolean}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.checked })
                      }
                      className="w-4 h-4 text-spa-rose-500 rounded focus:ring-spa-rose-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Allergies et médicaments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label-spa">Allergies</label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) =>
                    setFormData({ ...formData, allergies: e.target.value })
                  }
                  className="input-spa min-h-[60px]"
                  placeholder="Ex: Latex, arachides..."
                />
              </div>

              <div>
                <label className="label-spa">Médicaments</label>
                <textarea
                  value={formData.medicaments}
                  onChange={(e) =>
                    setFormData({ ...formData, medicaments: e.target.value })
                  }
                  className="input-spa min-h-[60px]"
                  placeholder="Ex: Advil 200mg 2x/jour"
                />
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
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
