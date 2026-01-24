'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useUpdateClientMutation, type Client, type UpdateClientData } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { BodyMap } from '@/components/forms/BodyMap';

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
}

// Mapping entre les IDs du BodyMap et les labels lisibles
const ZONE_ID_TO_LABEL: Record<string, string> = {
  'tete': 'Tête',
  'cou': 'Nuque',
  'epaule-gauche': 'Épaule gauche',
  'epaule-droite': 'Épaule droite',
  'bras-gauche': 'Bras gauche',
  'bras-droit': 'Bras droit',
  'coude-gauche': 'Coude gauche',
  'coude-droit': 'Coude droit',
  'avant-bras-gauche': 'Avant-bras gauche',
  'avant-bras-droit': 'Avant-bras droit',
  'main-gauche': 'Main gauche',
  'main-droite': 'Main droite',
  'poitrine': 'Poitrine',
  'abdomen': 'Abdomen',
  'bassin': 'Bassin',
  'cuisse-gauche': 'Cuisse gauche',
  'cuisse-droite': 'Cuisse droite',
  'genou-gauche': 'Genou gauche',
  'genou-droit': 'Genou droit',
  'mollet-gauche': 'Mollet gauche',
  'mollet-droit': 'Mollet droit',
  'pied-gauche': 'Pied gauche',
  'pied-droit': 'Pied droit',
  'dos-haut': 'Haut du dos',
  'dos-milieu': 'Milieu du dos',
  'dos-bas': 'Bas du dos / Lombaires',
  'hanche-gauche': 'Hanche gauche',
  'hanche-droite': 'Hanche droite',
  'fessier-gauche': 'Fessier gauche',
  'fessier-droit': 'Fessier droit',
};

// Mapping inverse pour convertir les labels en IDs
const LABEL_TO_ZONE_ID: Record<string, string> = Object.entries(ZONE_ID_TO_LABEL).reduce(
  (acc, [id, label]) => ({ ...acc, [label.toLowerCase()]: id }),
  {}
);

export function EditClientModal({ isOpen, onClose, client }: EditClientModalProps) {
  const [updateClient, { isLoading, isSuccess, isError, error }] = useUpdateClientMutation();
  const currentUser = useAppSelector((state) => state.auth.user);

  // Vérifier le rôle
  const isAdmin = currentUser?.role === 'ADMIN';
  const isReceptioniste = currentUser?.role === 'RECEPTIONISTE';
  const isMassotherapeute = currentUser?.role === 'MASSOTHERAPEUTE';
  const isEstheticienne = currentUser?.role === 'ESTHETICIENNE';
  const isProfessional = isMassotherapeute || isEstheticienne;

  // Détecter le type de service du client
  const isMassotherapieClient = client?.serviceType === 'MASSOTHERAPIE';
  const isEsthetiqueClient = client?.serviceType === 'ESTHETIQUE';

  // Détecter le type de service esthétique en fonction des champs présents
  // (utile si selectedEstheticService n'est pas retourné par le backend)
  const detectEstheticServiceType = () => {
    if (client?.selectedEstheticService) return client.selectedEstheticService;

    // Détecter IPL
    if (client?.iplZonesAEpiler?.length > 0 || client?.iplBilanSante || client?.iplConsentement) {
      return 'IPL';
    }

    // Détecter MANICURE_PEDICURE
    if (client?.manicurePedicureInfo && Object.keys(client.manicurePedicureInfo).length > 0) {
      return 'MANICURE_PEDICURE';
    }

    // Détecter MICRODERMABRASION
    if (client?.microdermConsentement) {
      return 'MICRODERMABRASION';
    }

    // Par défaut FACIAL si des champs habitudes existent
    if (client?.fumeur || client?.niveauStress || client?.expositionSoleil) {
      return 'FACIAL';
    }

    return null;
  };

  const detectedServiceType = detectEstheticServiceType();

  // Bloquer l'accès aux réceptionnistes
  if (isReceptioniste) {
    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full"
            >
              <div className="text-center space-y-4">
                <div className="text-6xl">🚫</div>
                <h3 className="text-2xl font-bold text-gray-800">Accès Refusé</h3>
                <p className="text-gray-700 leading-relaxed">
                  Les réceptionnistes n'ont pas la permission de modifier les informations des clients.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-primary mt-4"
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

  // États du formulaire
  const [formData, setFormData] = useState<any>({
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
    // Champs esthétiques
    fumeur: '',
    niveauStress: '',
    expositionSoleil: '',
    protectionSolaire: '',
    suffisanceEau: '',
    travailExterieur: '',
    bainChauds: '',
    iplBilanSante: '',
    iplZonesAEpiler: [],
    manicurePedicureInfo: {},
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // État pour les zones sélectionnées dans le BodyMap (IDs)
  const [selectedBodyZones, setSelectedBodyZones] = useState<string[]>([]);

  // Convertir les labels de zones en IDs pour le BodyMap
  const labelsToIds = (labels: string[]): string[] => {
    return labels
      .map(label => {
        const normalizedLabel = label.toLowerCase();
        return LABEL_TO_ZONE_ID[normalizedLabel] || null;
      })
      .filter((id): id is string => id !== null);
  };

  // Convertir les IDs du BodyMap en labels pour le backend
  const idsToLabels = (ids: string[]): string[] => {
    return ids
      .map(id => ZONE_ID_TO_LABEL[id])
      .filter((label): label is string => label !== undefined);
  };

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
        // Champs esthétiques
        fumeur: client.fumeur || '',
        niveauStress: client.niveauStress || '',
        expositionSoleil: client.expositionSoleil || '',
        protectionSolaire: client.protectionSolaire || '',
        suffisanceEau: client.suffisanceEau || '',
        travailExterieur: client.travailExterieur || '',
        bainChauds: client.bainChauds || '',
        iplBilanSante: client.iplBilanSante || '',
        iplZonesAEpiler: client.iplZonesAEpiler || [],
        manicurePedicureInfo: client.manicurePedicureInfo || {},
      });

      // Convertir les zones de douleur en IDs pour le BodyMap
      const zoneIds = labelsToIds(client.zonesDouleur || []);
      setSelectedBodyZones(zoneIds);
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
      // Convertir les IDs des zones en labels pour le backend
      const zonesLabels = idsToLabels(selectedBodyZones);

      await updateClient({
        id: client.id,
        data: {
          ...formData,
          zonesDouleur: zonesLabels,
        },
      }).unwrap();
    } catch (err) {
      console.error('Erreur mise à jour client:', err);
    }
  };

  // Handler pour les changements de zones du BodyMap
  const handleBodyZonesChange = (zones: string[]) => {
    setSelectedBodyZones(zones);
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

          {/* Formulaire pour tous les clients */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            {!isProfessional && (
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

                  <div className="md:col-span-2">
                    <label className="label-spa">Adresse</label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) =>
                        setFormData({ ...formData, adresse: e.target.value })
                      }
                      className="input-spa"
                      placeholder="Adresse complète"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Zones de douleur avec BodyMap - MASSOTHÉRAPIE UNIQUEMENT */}
            {isMassotherapieClient && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Zones de douleur
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Cliquez sur les zones du corps où le client ressent de la douleur ou de l'inconfort
              </p>

              <div className="bg-gradient-to-br from-spa-beige-50 to-white p-6 rounded-xl border-2 border-spa-rose-100">
                <BodyMap
                  selectedZones={selectedBodyZones}
                  onZonesChange={handleBodyZonesChange}
                />
              </div>

              {/* Liste des zones sélectionnées */}
              {selectedBodyZones.length > 0 && (
                <div className="bg-spa-turquoise-50 p-4 rounded-lg border border-spa-turquoise-200">
                  <p className="text-sm font-semibold text-spa-turquoise-800 mb-2">
                    Zones sélectionnées ({selectedBodyZones.length}) :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {idsToLabels(selectedBodyZones).map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1 bg-spa-turquoise-500 text-white text-xs rounded-full"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Raison de consultation - MASSOTHÉRAPIE */}
            {isMassotherapieClient && (
            <>
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
            </>
            )}

            {/* Formulaire ESTHÉTIQUE */}
            {isEsthetiqueClient && (
              <div className="space-y-6">
                {/* Service sélectionné */}
                <div className="bg-spa-lavande-50 p-4 rounded-xl border-2 border-spa-lavande-200">
                  <p className="text-sm font-medium text-gray-700">
                    Service esthétique: <span className="text-spa-rose-600 font-semibold">
                      {detectedServiceType === 'FACIAL' && 'Facial'}
                      {detectedServiceType === 'MICRODERMABRASION' && 'Microdermabrasion'}
                      {detectedServiceType === 'IPL' && 'IPL (Épilation lumière pulsée)'}
                      {detectedServiceType === 'MANICURE_PEDICURE' && 'Manicure / Pédicure'}
                      {!detectedServiceType && 'Non spécifié'}
                    </span>
                  </p>
                </div>

                {/* FACIAL et MICRODERMABRASION - Habitudes de vie */}
                {(detectedServiceType === 'FACIAL' || detectedServiceType === 'MICRODERMABRASION' || !detectedServiceType) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Habitudes de Vie & Soins
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="label-spa">Fumeur *</label>
                        <select
                          value={formData.fumeur}
                          onChange={(e) => setFormData({ ...formData, fumeur: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="OUI">Oui</option>
                          <option value="NON">Non</option>
                          <option value="OCCASIONNEL">Occasionnel</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Niveau de stress *</label>
                        <select
                          value={formData.niveauStress}
                          onChange={(e) => setFormData({ ...formData, niveauStress: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="FAIBLE">Faible</option>
                          <option value="MODERE">Modéré</option>
                          <option value="ELEVE">Élevé</option>
                          <option value="TRES_ELEVE">Très élevé</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Exposition au soleil *</label>
                        <select
                          value={formData.expositionSoleil}
                          onChange={(e) => setFormData({ ...formData, expositionSoleil: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="RARE">Rare</option>
                          <option value="MODEREE">Modérée</option>
                          <option value="FREQUENTE">Fréquente</option>
                          <option value="TRES_FREQUENTE">Très fréquente</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Protection solaire *</label>
                        <select
                          value={formData.protectionSolaire}
                          onChange={(e) => setFormData({ ...formData, protectionSolaire: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="TOUJOURS">Toujours</option>
                          <option value="SOUVENT">Souvent</option>
                          <option value="RAREMENT">Rarement</option>
                          <option value="JAMAIS">Jamais</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Buvez-vous suffisamment d'eau? *</label>
                        <select
                          value={formData.suffisanceEau}
                          onChange={(e) => setFormData({ ...formData, suffisanceEau: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="OUI">Oui (1,5L+ par jour)</option>
                          <option value="NON">Non</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Travaillez-vous à l'extérieur? *</label>
                        <select
                          value={formData.travailExterieur}
                          onChange={(e) => setFormData({ ...formData, travailExterieur: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="OUI">Oui</option>
                          <option value="NON">Non</option>
                        </select>
                      </div>

                      <div>
                        <label className="label-spa">Prenez-vous des bains chauds? *</label>
                        <select
                          value={formData.bainChauds}
                          onChange={(e) => setFormData({ ...formData, bainChauds: e.target.value })}
                          className="input-spa"
                        >
                          <option value="">Sélectionnez...</option>
                          <option value="OUI">Oui</option>
                          <option value="NON">Non</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* IPL - Questionnaire */}
                {detectedServiceType === 'IPL' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Questionnaire IPL
                    </h3>

                    <div>
                      <label className="label-spa">Bilan de santé général</label>
                      <textarea
                        value={formData.iplBilanSante}
                        onChange={(e) => setFormData({ ...formData, iplBilanSante: e.target.value })}
                        className="input-spa min-h-[80px]"
                        placeholder="Décrivez votre état de santé général..."
                      />
                    </div>

                    <div>
                      <label className="label-spa">Zones à épiler</label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                        {[
                          'Visage', 'Menton', 'Lèvre supérieure', 'Joues', 'Cou',
                          'Aisselles', 'Bras complets', 'Avant-bras', 'Mains',
                          'Poitrine', 'Abdomen', 'Dos', 'Maillot', 'Maillot brésilien',
                          'Maillot intégral', 'Cuisses', 'Jambes complètes', 'Demi-jambes', 'Pieds'
                        ].map((zone) => (
                          <div key={zone} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`zone-${zone}`}
                              checked={formData.iplZonesAEpiler?.includes(zone) || false}
                              onChange={(e) => {
                                const currentZones = formData.iplZonesAEpiler || [];
                                const newZones = e.target.checked
                                  ? [...currentZones, zone]
                                  : currentZones.filter((z: string) => z !== zone);
                                setFormData({ ...formData, iplZonesAEpiler: newZones });
                              }}
                              className="h-4 w-4 text-spa-rose-500 rounded border-gray-300 focus:ring-spa-lavande-500"
                            />
                            <label htmlFor={`zone-${zone}`} className="text-sm text-gray-700">
                              {zone}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* MANICURE_PEDICURE - Questions */}
                {detectedServiceType === 'MANICURE_PEDICURE' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      Questions Manicure / Pédicure
                    </h3>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Les informations détaillées de manicure/pédicure sont enregistrées lors de l'inscription.
                        Vous pouvez modifier les informations personnelles ci-dessus.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

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
