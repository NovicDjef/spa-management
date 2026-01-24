'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { SelectField, InputField } from '@/components/forms/FormFields';
import { Save, AlertCircle, Check, Plus, ChevronDown, ChevronUp, Sparkles, FileText } from 'lucide-react';
import { useUpdateClientMutation } from '@/lib/redux/services/api';
import { MICRODERMABRASION_CONSENT, IPL_CONSENT } from '@/lib/constants/consent-texts';

interface DossierEsthetiqueProps {
  client: any;
  onUpdate?: () => void;
}

type ServiceType = 'FACIAL' | 'MICRODERMABRASION' | 'IPL' | 'MANICURE_PEDICURE';

const SERVICE_LABELS: Record<ServiceType, string> = {
  FACIAL: 'Facial',
  MICRODERMABRASION: 'Microdermabrasion',
  IPL: 'IPL',
  MANICURE_PEDICURE: 'Manicure / Pédicure',
};

export function DossierEsthetique({ client, onUpdate }: DossierEsthetiqueProps) {
  const [updateClient, { isLoading }] = useUpdateClientMutation();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showAddService, setShowAddService] = useState(false);
  const [selectedNewService, setSelectedNewService] = useState<ServiceType | ''>('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    facial: true,
    microdermabrasion: true,
    ipl: true,
    manicure: true,
  });

  const [formData, setFormData] = useState({
    // Diagnostic peau
    etatPeau: client.etatPeau || '',
    etatPores: client.etatPores || '',
    coucheCornee: client.coucheCornee || '',
    irrigationSanguine: client.irrigationSanguine || '',
    impuretes: client.impuretes || '',
    sensibiliteCutanee: client.sensibiliteCutanee || '',

    // Habitudes de vie
    fumeur: client.fumeur || '',
    niveauStress: client.niveauStress || '',
    expositionSoleil: client.expositionSoleil || '',
    protectionSolaire: client.protectionSolaire || '',
    suffisanceEau: client.suffisanceEau || '',
    travailExterieur: client.travailExterieur || '',
    bainChauds: client.bainChauds || '',

    // IPL
    iplBilanSante: client.iplBilanSante || '',
    iplZonesAEpiler: client.iplZonesAEpiler || [],
    iplVeinsVarices: client.iplVeinsVarices || false,
    iplAccutane: client.iplAccutane || false,
    iplInjectionsVarices: client.iplInjectionsVarices || false,
    iplAcideGlycolique: client.iplAcideGlycolique || false,
    iplInjectionBotox: client.iplInjectionBotox || false,
    iplPeelingChimique: client.iplPeelingChimique || false,
    iplAutresProduits: client.iplAutresProduits || '',
    iplHerpesSimplex: client.iplHerpesSimplex || false,
    iplSkinCancer: client.iplSkinCancer || false,
    iplRegionsTraitees: client.iplRegionsTraitees || [],
    iplDateUtilisation: client.iplDateUtilisation || '',
    iplCommentaires: client.iplCommentaires || '',
    iplTypePeau: client.iplTypePeau || '',

    // Manicure/Pédicure
    manicurePedicureInfo: client.manicurePedicureInfo || {},

    // Consentements
    microdermConsentement: client.microdermConsentement || false,
    microdermConsentDate: client.microdermConsentDate || '',
    iplConsentement: client.iplConsentement || false,
    iplConsentDate: client.iplConsentDate || '',

    servicesCompletes: client.servicesCompletes || [],
  });

  const getCompletedServices = (): ServiceType[] => {
    const services: ServiceType[] = [];
    if (client.fumeur || client.niveauStress || client.etatPeau || client.selectedEstheticService === 'FACIAL' || formData.servicesCompletes?.includes('FACIAL')) {
      services.push('FACIAL');
    }
    if (client.microdermConsentement || client.selectedEstheticService === 'MICRODERMABRASION' || formData.servicesCompletes?.includes('MICRODERMABRASION')) {
      services.push('MICRODERMABRASION');
    }
    if (client.iplZonesAEpiler?.length > 0 || client.iplBilanSante || client.iplConsentement || client.selectedEstheticService === 'IPL' || formData.servicesCompletes?.includes('IPL')) {
      services.push('IPL');
    }
    if ((client.manicurePedicureInfo && Object.keys(client.manicurePedicureInfo).length > 0) || client.selectedEstheticService === 'MANICURE_PEDICURE' || formData.servicesCompletes?.includes('MANICURE_PEDICURE')) {
      services.push('MANICURE_PEDICURE');
    }
    return Array.from(new Set(services));
  };

  const completedServices = getCompletedServices();
  const availableServices = (['FACIAL', 'MICRODERMABRASION', 'IPL', 'MANICURE_PEDICURE'] as ServiceType[]).filter(s => !completedServices.includes(s));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddService = () => {
    if (selectedNewService) {
      setFormData(prev => ({ ...prev, servicesCompletes: [...(prev.servicesCompletes || []), selectedNewService] }));
      setShowAddService(false);
      setSelectedNewService('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    try {
      await updateClient({
        id: client.id,
        data: { ...formData, servicesCompletes: Array.from(new Set([...completedServices, ...(formData.servicesCompletes || [])])) },
      }).unwrap();
      setSuccessMessage('Dossier mis à jour !');
      setTimeout(() => setSuccessMessage(''), 3000);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      setErrorMessage(error.data?.message || error.data?.error || 'Une erreur est survenue');
    }
  };

  const isServiceActive = (service: ServiceType) => completedServices.includes(service) || formData.servicesCompletes?.includes(service);

  // Composant InfoItem simple pour afficher les infos client
  const InfoItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium text-sm">{value}</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Messages */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-green-100 text-green-800 p-3 rounded-lg flex items-center gap-2 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            {successMessage}
          </motion.div>
        )}
        {errorMessage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-red-100 text-red-800 p-3 rounded-lg flex items-center gap-2 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Services du client */}
      <div className="bg-gradient-to-r from-spa-lavande-100 to-spa-rose-100 p-4 rounded-xl">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-spa-lavande-600" />
          Services esthétiques
        </h3>

        <div className="flex flex-wrap gap-2 mb-3">
          {completedServices.map((service) => (
            <span key={service} className="px-3 py-1.5 bg-spa-lavande-500 text-white rounded-full text-xs font-medium">
              ✓ {SERVICE_LABELS[service]}
            </span>
          ))}
          {formData.servicesCompletes?.filter((s: string) => !completedServices.includes(s as ServiceType)).map((service: string) => (
            <span key={service} className="px-3 py-1.5 bg-orange-400 text-white rounded-full text-xs font-medium">
              + {SERVICE_LABELS[service as ServiceType]}
            </span>
          ))}
          {completedServices.length === 0 && formData.servicesCompletes?.length === 0 && (
            <span className="text-gray-500 text-sm">Aucun service</span>
          )}
        </div>

        {availableServices.length > 0 && (
          <>
            {!showAddService ? (
              <button type="button" onClick={() => setShowAddService(true)} className="w-full py-2.5 border-2 border-dashed border-spa-lavande-300 rounded-lg text-spa-lavande-600 text-sm font-medium flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Ajouter un service
              </button>
            ) : (
              <div className="space-y-2">
                <select value={selectedNewService} onChange={(e) => setSelectedNewService(e.target.value as ServiceType)} className="w-full p-2.5 border rounded-lg text-sm">
                  <option value="">Sélectionnez...</option>
                  {availableServices.map((service) => (
                    <option key={service} value={service}>{SERVICE_LABELS[service]}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={handleAddService} disabled={!selectedNewService} className="flex-1 py-2 bg-spa-lavande-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
                    Ajouter
                  </button>
                  <button type="button" onClick={() => { setShowAddService(false); setSelectedNewService(''); }} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ========== FACIAL ========== */}
        {isServiceActive('FACIAL') && (
          <div className="border rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('facial')} className="w-full flex items-center justify-between p-3 bg-pink-50 text-left">
              <span className="font-semibold text-gray-900">🧖‍♀️ Facial</span>
              {expandedSections.facial ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expandedSections.facial && (
              <div className="p-4 space-y-4">
                {/* Infos client existantes */}
                {(client.fumeur || client.niveauStress) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-2">📋 Infos client</p>
                    {client.fumeur && <InfoItem label="Fumeur" value={client.fumeur} />}
                    {client.niveauStress && <InfoItem label="Stress" value={client.niveauStress} />}
                    {client.expositionSoleil && <InfoItem label="Soleil" value={client.expositionSoleil} />}
                    {client.protectionSolaire && <InfoItem label="Protection" value={client.protectionSolaire} />}
                    {client.suffisanceEau && <InfoItem label="Eau" value={client.suffisanceEau} />}
                    {client.travailExterieur && <InfoItem label="Travail ext." value={client.travailExterieur} />}
                    {client.bainChauds && <InfoItem label="Bains chauds" value={client.bainChauds} />}
                  </div>
                )}

                {/* Formulaire habitudes */}
                {!client.fumeur && (
                  <>
                    <p className="text-xs font-semibold text-gray-600">Habitudes de vie</p>
                    <div className="grid grid-cols-1 gap-3">
                      <SelectField label="Fumeur" name="fumeur" value={formData.fumeur} onChange={handleInputChange} options={[{ value: 'OUI', label: 'Oui' }, { value: 'NON', label: 'Non' }, { value: 'OCCASIONNEL', label: 'Occasionnel' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Niveau de stress" name="niveauStress" value={formData.niveauStress} onChange={handleInputChange} options={[{ value: 'FAIBLE', label: 'Faible' }, { value: 'MODERE', label: 'Modéré' }, { value: 'ELEVE', label: 'Élevé' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Exposition soleil" name="expositionSoleil" value={formData.expositionSoleil} onChange={handleInputChange} options={[{ value: 'RARE', label: 'Rare' }, { value: 'MODEREE', label: 'Modérée' }, { value: 'FREQUENTE', label: 'Fréquente' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Protection solaire" name="protectionSolaire" value={formData.protectionSolaire} onChange={handleInputChange} options={[{ value: 'TOUJOURS', label: 'Toujours' }, { value: 'SOUVENT', label: 'Souvent' }, { value: 'RAREMENT', label: 'Rarement' }, { value: 'JAMAIS', label: 'Jamais' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Suffisamment d'eau?" name="suffisanceEau" value={formData.suffisanceEau} onChange={handleInputChange} options={[{ value: 'OUI', label: 'Oui' }, { value: 'NON', label: 'Non' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Travail extérieur?" name="travailExterieur" value={formData.travailExterieur} onChange={handleInputChange} options={[{ value: 'OUI', label: 'Oui' }, { value: 'NON', label: 'Non' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Bains chauds?" name="bainChauds" value={formData.bainChauds} onChange={handleInputChange} options={[{ value: 'OUI', label: 'Oui' }, { value: 'NON', label: 'Non' }]} placeholder="Sélectionnez..." />
                    </div>
                  </>
                )}

                {/* Diagnostic peau */}
                <p className="text-xs font-semibold text-gray-600 pt-2">🔍 Diagnostic peau</p>
                <div className="grid grid-cols-1 gap-3">
                  <SelectField label="État peau" name="etatPeau" value={formData.etatPeau} onChange={handleInputChange} options={[{ value: 'NORMALE', label: 'Normale' }, { value: 'SECHE', label: 'Sèche' }, { value: 'GRASSE', label: 'Grasse' }, { value: 'MIXTE', label: 'Mixte' }, { value: 'SENSIBLE', label: 'Sensible' }]} placeholder="Sélectionnez..." />
                  <SelectField label="État pores" name="etatPores" value={formData.etatPores} onChange={handleInputChange} options={[{ value: 'NORMAUX', label: 'Normaux' }, { value: 'DILATES', label: 'Dilatés' }, { value: 'OBSTRUES', label: 'Obstrués' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Couche cornée" name="coucheCornee" value={formData.coucheCornee} onChange={handleInputChange} options={[{ value: 'FINE', label: 'Fine' }, { value: 'MOYENNE', label: 'Moyenne' }, { value: 'EPAISSE', label: 'Épaisse' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Irrigation sanguine" name="irrigationSanguine" value={formData.irrigationSanguine} onChange={handleInputChange} options={[{ value: 'NORMALE', label: 'Normale' }, { value: 'FAIBLE', label: 'Faible' }, { value: 'BONNE', label: 'Bonne' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Impuretés" name="impuretes" value={formData.impuretes} onChange={handleInputChange} options={[{ value: 'AUCUNE', label: 'Aucune' }, { value: 'LEGERES', label: 'Légères' }, { value: 'MODEREES', label: 'Modérées' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Sensibilité" name="sensibiliteCutanee" value={formData.sensibiliteCutanee} onChange={handleInputChange} options={[{ value: 'AUCUNE', label: 'Aucune' }, { value: 'LEGERE', label: 'Légère' }, { value: 'MODEREE', label: 'Modérée' }, { value: 'ELEVEE', label: 'Élevée' }]} placeholder="Sélectionnez..." />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== MICRODERMABRASION ========== */}
        {isServiceActive('MICRODERMABRASION') && (
          <div className="border rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('microdermabrasion')} className="w-full flex items-center justify-between p-3 bg-purple-50 text-left">
              <span className="font-semibold text-gray-900">✨ Microdermabrasion</span>
              {expandedSections.microdermabrasion ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expandedSections.microdermabrasion && (
              <div className="p-4 space-y-4">
                {/* Infos client existantes */}
                {(client.fumeur || client.niveauStress) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-2">📋 Infos client</p>
                    {client.fumeur && <InfoItem label="Fumeur" value={client.fumeur} />}
                    {client.niveauStress && <InfoItem label="Stress" value={client.niveauStress} />}
                    {client.expositionSoleil && <InfoItem label="Soleil" value={client.expositionSoleil} />}
                    {client.protectionSolaire && <InfoItem label="Protection" value={client.protectionSolaire} />}
                  </div>
                )}

                {/* Formulaire habitudes si pas rempli */}
                {!client.fumeur && (
                  <>
                    <p className="text-xs font-semibold text-gray-600">Habitudes de vie</p>
                    <div className="grid grid-cols-1 gap-3">
                      <SelectField label="Fumeur" name="fumeur" value={formData.fumeur} onChange={handleInputChange} options={[{ value: 'OUI', label: 'Oui' }, { value: 'NON', label: 'Non' }, { value: 'OCCASIONNEL', label: 'Occasionnel' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Niveau de stress" name="niveauStress" value={formData.niveauStress} onChange={handleInputChange} options={[{ value: 'FAIBLE', label: 'Faible' }, { value: 'MODERE', label: 'Modéré' }, { value: 'ELEVE', label: 'Élevé' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Exposition soleil" name="expositionSoleil" value={formData.expositionSoleil} onChange={handleInputChange} options={[{ value: 'RARE', label: 'Rare' }, { value: 'MODEREE', label: 'Modérée' }, { value: 'FREQUENTE', label: 'Fréquente' }]} placeholder="Sélectionnez..." />
                      <SelectField label="Protection solaire" name="protectionSolaire" value={formData.protectionSolaire} onChange={handleInputChange} options={[{ value: 'TOUJOURS', label: 'Toujours' }, { value: 'SOUVENT', label: 'Souvent' }, { value: 'RAREMENT', label: 'Rarement' }, { value: 'JAMAIS', label: 'Jamais' }]} placeholder="Sélectionnez..." />
                    </div>
                  </>
                )}

                {/* Diagnostic peau */}
                <p className="text-xs font-semibold text-gray-600 pt-2">🔍 Diagnostic peau</p>
                <div className="grid grid-cols-1 gap-3">
                  <SelectField label="État peau" name="etatPeau" value={formData.etatPeau} onChange={handleInputChange} options={[{ value: 'NORMALE', label: 'Normale' }, { value: 'SECHE', label: 'Sèche' }, { value: 'GRASSE', label: 'Grasse' }, { value: 'MIXTE', label: 'Mixte' }, { value: 'SENSIBLE', label: 'Sensible' }]} placeholder="Sélectionnez..." />
                  <SelectField label="État pores" name="etatPores" value={formData.etatPores} onChange={handleInputChange} options={[{ value: 'NORMAUX', label: 'Normaux' }, { value: 'DILATES', label: 'Dilatés' }, { value: 'OBSTRUES', label: 'Obstrués' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Couche cornée" name="coucheCornee" value={formData.coucheCornee} onChange={handleInputChange} options={[{ value: 'FINE', label: 'Fine' }, { value: 'MOYENNE', label: 'Moyenne' }, { value: 'EPAISSE', label: 'Épaisse' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Irrigation sanguine" name="irrigationSanguine" value={formData.irrigationSanguine} onChange={handleInputChange} options={[{ value: 'NORMALE', label: 'Normale' }, { value: 'FAIBLE', label: 'Faible' }, { value: 'BONNE', label: 'Bonne' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Impuretés" name="impuretes" value={formData.impuretes} onChange={handleInputChange} options={[{ value: 'AUCUNE', label: 'Aucune' }, { value: 'LEGERES', label: 'Légères' }, { value: 'MODEREES', label: 'Modérées' }]} placeholder="Sélectionnez..." />
                  <SelectField label="Sensibilité" name="sensibiliteCutanee" value={formData.sensibiliteCutanee} onChange={handleInputChange} options={[{ value: 'AUCUNE', label: 'Aucune' }, { value: 'LEGERE', label: 'Légère' }, { value: 'MODEREE', label: 'Modérée' }, { value: 'ELEVEE', label: 'Élevée' }]} placeholder="Sélectionnez..." />
                </div>

                {/* Consentement Microdermabrasion */}
                <div className="bg-purple-50 p-3 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-800">Consentement</p>
                  </div>

                  {/* Soins post-traitement - Résumé */}
                  <details className="mb-3">
                    <summary className="text-xs font-medium text-purple-700 cursor-pointer">Voir les détails du consentement</summary>
                    <div className="mt-2 text-xs text-gray-600 space-y-2 pl-2 border-l-2 border-purple-200">
                      <p className="font-medium">Soins post-traitement:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Rougeurs possibles jusqu'à 3 jours</li>
                        <li>Utiliser gel d'Aloès</li>
                        <li>Ne pas retirer les peaux sèches</li>
                        <li>Éviter friction, bains chauds, piscine</li>
                      </ul>
                      <p className="font-medium mt-2">Contre-indications:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {MICRODERMABRASION_CONSENT.contraindications.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </details>

                  {/* Checkbox consentement */}
                  <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${formData.microdermConsentement ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <input
                      type="checkbox"
                      checked={formData.microdermConsentement}
                      onChange={(e) => setFormData({ ...formData, microdermConsentement: e.target.checked, microdermConsentDate: e.target.checked ? new Date().toISOString() : '' })}
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm">
                      {formData.microdermConsentement ? (
                        <span className="text-green-700 font-medium">✓ Signé le {new Date(formData.microdermConsentDate || Date.now()).toLocaleDateString('fr-CA')}</span>
                      ) : (
                        <span className="text-yellow-800">Client a lu et accepté</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== IPL ========== */}
        {isServiceActive('IPL') && (
          <div className="border rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('ipl')} className="w-full flex items-center justify-between p-3 bg-amber-50 text-left">
              <span className="font-semibold text-gray-900">💡 IPL</span>
              {expandedSections.ipl ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expandedSections.ipl && (
              <div className="p-4 space-y-4">
                {/* Infos client IPL */}
                {(client.iplZonesAEpiler?.length > 0 || client.iplBilanSante) && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-2">📋 Infos client</p>
                    {client.iplZonesAEpiler?.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Zones demandées:</p>
                        <div className="flex flex-wrap gap-1">
                          {client.iplZonesAEpiler.map((zone: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-200 text-blue-800 rounded text-xs">{zone}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {client.iplBilanSante && <InfoItem label="Bilan santé" value={client.iplBilanSante} />}

                    {/* Conditions médicales */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Conditions:</p>
                      <div className="flex flex-wrap gap-1">
                        {client.iplVeinsVarices && <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs">Varices</span>}
                        {client.iplAccutane && <span className="px-2 py-0.5 bg-orange-200 text-orange-800 rounded text-xs">Accutane</span>}
                        {client.iplHerpesSimplex && <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs">⚠️ Herpès</span>}
                        {client.iplSkinCancer && <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs">⚠️ Cancer peau</span>}
                        {!client.iplVeinsVarices && !client.iplAccutane && !client.iplHerpesSimplex && !client.iplSkinCancer && (
                          <span className="px-2 py-0.5 bg-green-200 text-green-800 rounded text-xs">✓ Aucune</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Zones à épiler si pas remplies */}
                {(!client.iplZonesAEpiler || client.iplZonesAEpiler.length === 0) && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-2">Zones à épiler</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Visage', 'Menton', 'Lèvre sup.', 'Aisselles', 'Bras', 'Maillot', 'Jambes', 'Dos'].map((zone) => (
                        <label key={zone} className="flex items-center gap-2 text-sm p-1.5 bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={formData.iplZonesAEpiler?.includes(zone) || false}
                            onChange={(e) => {
                              const newZones = e.target.checked ? [...(formData.iplZonesAEpiler || []), zone] : formData.iplZonesAEpiler?.filter((z: string) => z !== zone) || [];
                              setFormData({ ...formData, iplZonesAEpiler: newZones });
                            }}
                            className="h-4 w-4 rounded"
                          />
                          {zone}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Infos traitement esthéticienne */}
                <p className="text-xs font-semibold text-gray-600 pt-2">👩‍⚕️ Traitement</p>
                <div className="grid grid-cols-1 gap-3">
                  <InputField label="Séance" name="iplDateUtilisation" value={formData.iplDateUtilisation} onChange={handleInputChange} placeholder="Ex: Séance 1" />
                  <SelectField label="Type peau" name="iplTypePeau" value={formData.iplTypePeau} onChange={handleInputChange} options={[{ value: 'TYPE_I', label: 'I - Très claire' }, { value: 'TYPE_II', label: 'II - Claire' }, { value: 'TYPE_III', label: 'III - Moyenne' }, { value: 'TYPE_IV', label: 'IV - Mat' }, { value: 'TYPE_V', label: 'V - Foncée' }]} placeholder="Sélectionnez..." />
                  <InputField label="Observations" name="iplCommentaires" value={formData.iplCommentaires} onChange={handleInputChange} rows={2} placeholder="Réaction, ajustements..." />
                </div>

                {/* Régions traitées */}
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-2">Régions traitées</p>
                  <div className="grid grid-cols-2 gap-1">
                    {['Visage', 'Menton', 'Lèvre sup.', 'Aisselles', 'Bras', 'Maillot', 'Jambes', 'Dos'].map((region) => (
                      <label key={region} className="flex items-center gap-2 text-sm p-1.5 bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={formData.iplRegionsTraitees?.includes(region) || false}
                          onChange={(e) => {
                            const newRegions = e.target.checked ? [...(formData.iplRegionsTraitees || []), region] : formData.iplRegionsTraitees?.filter((r: string) => r !== region) || [];
                            setFormData({ ...formData, iplRegionsTraitees: newRegions });
                          }}
                          className="h-4 w-4 rounded"
                        />
                        {region}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Consentement IPL */}
                <div className="bg-amber-50 p-3 rounded-lg mt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-amber-600" />
                    <p className="text-sm font-semibold text-amber-800">Consentement IPL</p>
                  </div>

                  <details className="mb-3">
                    <summary className="text-xs font-medium text-amber-700 cursor-pointer">Voir les détails</summary>
                    <div className="mt-2 text-xs text-gray-600 space-y-2 pl-2 border-l-2 border-amber-200">
                      <p>Aucune garantie sur les résultats. Le client consent à la procédure et reconnaît avoir été informé des risques.</p>
                    </div>
                  </details>

                  <label className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${formData.iplConsentement ? 'bg-green-100' : 'bg-yellow-100'}`}>
                    <input
                      type="checkbox"
                      checked={formData.iplConsentement}
                      onChange={(e) => setFormData({ ...formData, iplConsentement: e.target.checked, iplConsentDate: e.target.checked ? new Date().toISOString() : '' })}
                      className="h-5 w-5 rounded"
                    />
                    <span className="text-sm">
                      {formData.iplConsentement ? (
                        <span className="text-green-700 font-medium">✓ Signé le {new Date(formData.iplConsentDate || Date.now()).toLocaleDateString('fr-CA')}</span>
                      ) : (
                        <span className="text-yellow-800">Client a lu et accepté</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========== MANICURE/PÉDICURE ========== */}
        {isServiceActive('MANICURE_PEDICURE') && (
          <div className="border rounded-xl overflow-hidden">
            <button type="button" onClick={() => toggleSection('manicure')} className="w-full flex items-center justify-between p-3 bg-teal-50 text-left">
              <span className="font-semibold text-gray-900">💅 Manicure / Pédicure</span>
              {expandedSections.manicure ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {expandedSections.manicure && (
              <div className="p-4 space-y-4">
                {client.manicurePedicureInfo && Object.keys(client.manicurePedicureInfo).length > 0 && (
                  <div className="bg-teal-50 p-3 rounded-lg">
                    <p className="text-xs font-semibold text-teal-800 mb-2">📋 Infos client</p>
                    {client.manicurePedicureInfo.type && <InfoItem label="Type" value={client.manicurePedicureInfo.type} />}
                    {client.manicurePedicureInfo.etatOngles && <InfoItem label="État ongles" value={client.manicurePedicureInfo.etatOngles} />}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <SelectField
                    label="Type de service"
                    name="manicurePedicureType"
                    value={formData.manicurePedicureInfo?.type || ''}
                    onChange={(e) => setFormData({ ...formData, manicurePedicureInfo: { ...formData.manicurePedicureInfo, type: e.target.value } })}
                    options={[{ value: 'MANICURE', label: 'Manicure' }, { value: 'PEDICURE', label: 'Pédicure' }, { value: 'BOTH', label: 'Les deux' }]}
                    placeholder="Sélectionnez..."
                  />
                  <SelectField
                    label="État des ongles"
                    name="manicurePedicureEtatOngles"
                    value={formData.manicurePedicureInfo?.etatOngles || ''}
                    onChange={(e) => setFormData({ ...formData, manicurePedicureInfo: { ...formData.manicurePedicureInfo, etatOngles: e.target.value } })}
                    options={[{ value: 'BON', label: 'Bon' }, { value: 'MOYEN', label: 'Moyen' }, { value: 'FRAGILES', label: 'Fragiles' }, { value: 'ABIMES', label: 'Abîmés' }]}
                    placeholder="Sélectionnez..."
                  />
                  <InputField
                    label="Notes"
                    name="manicurePedicureNotes"
                    value={formData.manicurePedicureInfo?.notes || ''}
                    onChange={(e) => setFormData({ ...formData, manicurePedicureInfo: { ...formData.manicurePedicureInfo, notes: e.target.value } })}
                    rows={2}
                    placeholder="Observations..."
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bouton Enregistrer */}
        <button type="submit" disabled={isLoading} className="w-full py-3 bg-spa-rose-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {isLoading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
              Enregistrement...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </form>
    </div>
  );
}
