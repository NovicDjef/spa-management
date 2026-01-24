'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, SelectField, CheckboxField, RadioField } from '@/components/forms/FormFields';
import { ChevronLeft, ChevronRight, Check, Loader2, X, AlertCircle } from 'lucide-react';
import { useCreateClientMutation } from '@/lib/redux/services/api';
import { extractErrorMessage } from '@/lib/utils/errorHandler';
import { MICRODERMABRASION_CONSENT, IPL_CONSENT, MANICURE_PEDICURE_QUESTIONS, MANICURE_PEDICURE_CONSENT } from '@/lib/constants/consent-texts';

interface FormData {
  // Sélection du service esthétique
  selectedEstheticService: string;

  // Informations personnelles
  nom: string;
  prenom: string;
  adresse: string;
  ville: string;
  codePostal: string;
  telMaison: string;
  telBureau: string;
  telCellulaire: string;
  courriel: string;
  dateNaissance: string;
  occupation: string;
  gender: string;
  assuranceCouvert: string;

  // Informations esthétique (FACIAL - Habitudes & Soins)
  fumeur: string;
  niveauStress: string;
  expositionSoleil: string;
  protectionSolaire: string;
  suffisanceEau: string;
  travailExterieur: string;
  bainChauds: string;
  routineSoins: string;
  changementsRecents: string;
  preferencePeau: string;

  // Diagnostic Peau (rempli par esthéticienne dans son espace)
  etatPeau: string;
  etatPores: string;
  coucheCornee: string;
  irrigationSanguine: string;
  impuretes: string;
  sensibiliteCutanee: string;
  diagnosticVisuelNotes: string;

  // Microdermabrasion
  microdermConsentement: boolean;

  // IPL - Questionnaire client
  iplBilanSante: string;
  iplVeinsVarices: boolean;
  iplAccutane: boolean;
  iplInjectionsVarices: boolean;
  iplAcideGlycolique: boolean;
  iplInjectionBotox: boolean;
  iplPeelingChimique: boolean;
  iplAutresProduits: string;
  iplZonesAEpiler: string[];
  iplHerpesSimplex: boolean;
  iplSkinCancer: boolean;
  iplConsentement: boolean;

  // Manicure/Pédicure
  manicurePedicureInfo: any;
  manicurePedicureConsent: boolean;
}

const initialFormData: FormData = {
  // Sélection du service
  selectedEstheticService: '',

  // Informations personnelles
  nom: '',
  prenom: '',
  adresse: '',
  ville: '',
  codePostal: '',
  telMaison: '',
  telBureau: '',
  telCellulaire: '',
  courriel: '',
  dateNaissance: '',
  occupation: '',
  gender: '',
  assuranceCouvert: '',

  // Habitudes & Soins (FACIAL)
  fumeur: '',
  niveauStress: '',
  expositionSoleil: '',
  protectionSolaire: '',
  suffisanceEau: '',
  travailExterieur: '',
  bainChauds: '',
  routineSoins: '',
  changementsRecents: '',
  preferencePeau: '',

  // Diagnostic Peau (esthéticienne)
  etatPeau: '',
  etatPores: '',
  coucheCornee: '',
  irrigationSanguine: '',
  impuretes: '',
  sensibiliteCutanee: '',
  diagnosticVisuelNotes: '',

  // Microdermabrasion
  microdermConsentement: false,

  // IPL
  iplBilanSante: '',
  iplVeinsVarices: false,
  iplAccutane: false,
  iplInjectionsVarices: false,
  iplAcideGlycolique: false,
  iplInjectionBotox: false,
  iplPeelingChimique: false,
  iplAutresProduits: '',
  iplZonesAEpiler: [],
  iplHerpesSimplex: false,
  iplSkinCancer: false,
  iplConsentement: false,

  // Manicure/Pédicure
  manicurePedicureInfo: {},
  manicurePedicureConsent: false,
};

export default function EsthetiqueFormPage() {
  const router = useRouter();
  const [createClient, { isLoading }] = useCreateClientMutation();
  const [currentStep, setCurrentStep] = useState(0); // Commence à 0 pour la sélection du service
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [age, setAge] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculer le nombre total d'étapes selon le service sélectionné
  const getTotalSteps = () => {
    switch (formData.selectedEstheticService) {
      case 'FACIAL':
        return 2; // Étape 0: Sélection, Étape 1: Infos, Étape 2: Habitudes
      case 'MICRODERMABRASION':
        return 3; // Étape 0: Sélection, Étape 1: Infos, Étape 2: Habitudes, Étape 3: Consentement
      case 'IPL':
        return 3; // Étape 0: Sélection, Étape 1: Infos, Étape 2: Questionnaire IPL, Étape 3: Consentement
      case 'MANICURE_PEDICURE':
        return 3; // Étape 0: Sélection, Étape 1: Infos, Étape 2: Questions, Étape 3: Consentement
      default:
        return 0; // Juste la sélection du service
    }
  };

  const totalSteps = getTotalSteps();

  // Calculer l'âge à partir de la date de naissance
  const calculateAge = (dateNaissance: string): number | null => {
    if (!dateNaissance) return null;

    const birthDate = new Date(dateNaissance);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calculer l'âge si le champ modifié est la date de naissance
    if (name === 'dateNaissance') {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Validation étape 0 : Sélection du service
    if (step === 0) {
      if (!formData.selectedEstheticService) {
        newErrors.selectedEstheticService = 'Veuillez sélectionner un service';
      }
    }

    // Validation étape 1 : Informations personnelles
    if (step === 1) {
      if (!formData.nom) newErrors.nom = 'Le nom est requis';
      if (!formData.prenom) newErrors.prenom = 'Le prénom est requis';
      if (!formData.adresse) newErrors.adresse = 'L\'adresse est requise';
      if (!formData.ville) newErrors.ville = 'La ville est requise';
      if (!formData.codePostal) newErrors.codePostal = 'Le code postal est requis';
      if (!formData.telCellulaire) newErrors.telCellulaire = 'Le téléphone cellulaire est requis';
      if (!formData.courriel) {
        newErrors.courriel = 'Le courriel est requis';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.courriel)) {
        newErrors.courriel = 'Le courriel n\'est pas valide';
      }
      if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
      if (!formData.gender) newErrors.gender = 'Le genre est requis';
      if (!formData.assuranceCouvert) newErrors.assuranceCouvert = 'Veuillez indiquer si vous avez une assurance';
    }

    // Validation étape 2 : Habitudes & Soins (pour FACIAL et MICRODERMABRASION) ou Questionnaire (IPL, MANICURE_PEDICURE)
    if (step === 2) {
      if (formData.selectedEstheticService === 'FACIAL' || formData.selectedEstheticService === 'MICRODERMABRASION') {
        if (!formData.fumeur) newErrors.fumeur = 'Ce champ est requis';
        if (!formData.niveauStress) newErrors.niveauStress = 'Le niveau de stress est requis';
      }

      if (formData.selectedEstheticService === 'IPL') {
        if (!formData.iplZonesAEpiler || formData.iplZonesAEpiler.length === 0) {
          newErrors.iplZonesAEpiler = 'Veuillez sélectionner au moins une zone à épiler';
        }
      }
    }

    // Validation étape 3 : Consentement (pour MICRODERMABRASION, IPL, MANICURE_PEDICURE)
    if (step === 3) {
      if (formData.selectedEstheticService === 'MICRODERMABRASION') {
        if (!formData.microdermConsentement) {
          newErrors.microdermConsentement = 'Vous devez accepter le consentement pour continuer';
        }
      }

      if (formData.selectedEstheticService === 'IPL') {
        if (!formData.iplConsentement) {
          newErrors.iplConsentement = 'Vous devez accepter le consentement pour continuer';
        }
      }

      if (formData.selectedEstheticService === 'MANICURE_PEDICURE') {
        if (!formData.manicurePedicureConsent) {
          newErrors.manicurePedicureConsent = 'Vous devez accepter le consentement pour continuer';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0)); // Permet de revenir à l'étape 0 (sélection du service)
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Vérifier si le bouton SOUMETTRE doit être désactivé (consentement non accepté)
  const isSubmitDisabled = () => {
    // Si en cours de chargement
    if (isLoading) return true;

    // Si on est sur la dernière étape (étape de consentement)
    if (currentStep === totalSteps) {
      // Pour MICRODERMABRASION - consentement requis
      if (formData.selectedEstheticService === 'MICRODERMABRASION') {
        return !formData.microdermConsentement;
      }

      // Pour IPL - consentement requis
      if (formData.selectedEstheticService === 'IPL') {
        return !formData.iplConsentement;
      }

      // Pour MANICURE_PEDICURE - consentement requis
      if (formData.selectedEstheticService === 'MANICURE_PEDICURE') {
        return !formData.manicurePedicureConsent;
      }
    }

    return false;
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const dataToSubmit: any = {
      ...formData,
      serviceType: 'ESTHETIQUE' as const,
    };

    // Nettoyer les champs vides selon le service sélectionné
    if (formData.selectedEstheticService === 'IPL') {
      // Pour IPL, supprimer les champs FACIAL/MICRODERMABRASION
      delete dataToSubmit.fumeur;
      delete dataToSubmit.niveauStress;
      delete dataToSubmit.expositionSoleil;
      delete dataToSubmit.protectionSolaire;
      delete dataToSubmit.suffisanceEau;
      delete dataToSubmit.travailExterieur;
      delete dataToSubmit.bainChauds;
      delete dataToSubmit.routineSoins;
      delete dataToSubmit.changementsRecents;
      delete dataToSubmit.preferencePeau;
      delete dataToSubmit.etatPeau;
      delete dataToSubmit.etatPores;
      delete dataToSubmit.coucheCornee;
      delete dataToSubmit.irrigationSanguine;
      delete dataToSubmit.impuretes;
      delete dataToSubmit.sensibiliteCutanee;
      delete dataToSubmit.diagnosticVisuelNotes;
      delete dataToSubmit.microdermConsentement;
      delete dataToSubmit.manicurePedicureInfo;
      delete dataToSubmit.manicurePedicureConsent;
    } else if (formData.selectedEstheticService === 'FACIAL' || formData.selectedEstheticService === 'MICRODERMABRASION') {
      // Pour FACIAL/MICRODERMABRASION, supprimer les champs IPL et MANICURE_PEDICURE
      delete dataToSubmit.iplBilanSante;
      delete dataToSubmit.iplVeinsVarices;
      delete dataToSubmit.iplAccutane;
      delete dataToSubmit.iplInjectionsVarices;
      delete dataToSubmit.iplAcideGlycolique;
      delete dataToSubmit.iplInjectionBotox;
      delete dataToSubmit.iplPeelingChimique;
      delete dataToSubmit.iplAutresProduits;
      delete dataToSubmit.iplZonesAEpiler;
      delete dataToSubmit.iplHerpesSimplex;
      delete dataToSubmit.iplSkinCancer;
      delete dataToSubmit.iplConsentement;
      delete dataToSubmit.manicurePedicureInfo;
      delete dataToSubmit.manicurePedicureConsent;

      // Convertir les chaînes vides en null pour les enums optionnels
      if (dataToSubmit.fumeur === '') dataToSubmit.fumeur = null;
      if (dataToSubmit.expositionSoleil === '') dataToSubmit.expositionSoleil = null;
      if (dataToSubmit.protectionSolaire === '') dataToSubmit.protectionSolaire = null;
      if (dataToSubmit.suffisanceEau === '') dataToSubmit.suffisanceEau = null;
      if (dataToSubmit.travailExterieur === '') dataToSubmit.travailExterieur = null;
      if (dataToSubmit.bainChauds === '') dataToSubmit.bainChauds = null;
    } else if (formData.selectedEstheticService === 'MANICURE_PEDICURE') {
      // Pour MANICURE_PEDICURE, supprimer les champs FACIAL/MICRODERMABRASION et IPL
      delete dataToSubmit.fumeur;
      delete dataToSubmit.niveauStress;
      delete dataToSubmit.expositionSoleil;
      delete dataToSubmit.protectionSolaire;
      delete dataToSubmit.suffisanceEau;
      delete dataToSubmit.travailExterieur;
      delete dataToSubmit.bainChauds;
      delete dataToSubmit.routineSoins;
      delete dataToSubmit.changementsRecents;
      delete dataToSubmit.preferencePeau;
      delete dataToSubmit.etatPeau;
      delete dataToSubmit.etatPores;
      delete dataToSubmit.coucheCornee;
      delete dataToSubmit.irrigationSanguine;
      delete dataToSubmit.impuretes;
      delete dataToSubmit.sensibiliteCutanee;
      delete dataToSubmit.diagnosticVisuelNotes;
      delete dataToSubmit.microdermConsentement;
      delete dataToSubmit.iplBilanSante;
      delete dataToSubmit.iplVeinsVarices;
      delete dataToSubmit.iplAccutane;
      delete dataToSubmit.iplInjectionsVarices;
      delete dataToSubmit.iplAcideGlycolique;
      delete dataToSubmit.iplInjectionBotox;
      delete dataToSubmit.iplPeelingChimique;
      delete dataToSubmit.iplAutresProduits;
      delete dataToSubmit.iplZonesAEpiler;
      delete dataToSubmit.iplHerpesSimplex;
      delete dataToSubmit.iplSkinCancer;
      delete dataToSubmit.iplConsentement;
    }

    // Ajouter la date de consentement pour MICRODERMABRASION
    if (formData.selectedEstheticService === 'MICRODERMABRASION' && formData.microdermConsentement) {
      dataToSubmit.microdermConsentDate = new Date().toISOString();
    }

    // Ajouter la date de consentement pour IPL
    if (formData.selectedEstheticService === 'IPL' && formData.iplConsentement) {
      dataToSubmit.iplConsentDate = new Date().toISOString();
    }

    // Ajouter la date de consentement pour MANICURE_PEDICURE
    if (formData.selectedEstheticService === 'MANICURE_PEDICURE' && formData.manicurePedicureConsent) {
      dataToSubmit.manicurePedicureConsentDate = new Date().toISOString();
    }

    console.log('='.repeat(80));
    console.log('📤 SOUMISSION DU FORMULAIRE ESTHÉTIQUE');
    console.log('='.repeat(80));
    console.log('Données complètes à envoyer au backend:');
    console.log(JSON.stringify(dataToSubmit, null, 2));
    console.log('='.repeat(80));
    console.log('Endpoint:', 'POST /api/clients');
    console.log('Service Type:', dataToSubmit.serviceType);
    console.log('='.repeat(80));

    try {
      const result = await createClient(dataToSubmit).unwrap();

      console.log('✅ SUCCÈS - Réponse du backend:');
      console.log(JSON.stringify(result, null, 2));
      console.log('='.repeat(80));

      router.push('/client/confirmation');
    } catch (error: any) {
      console.error('❌ ERREUR lors de la soumission:');
      console.error('Détails:', error);
      console.error('Message:', error.data?.message || error.message);
      console.log('='.repeat(80));

      const errorMsg = extractErrorMessage(error, 'Une erreur est survenue lors de l\'enregistrement');
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const renderProgressBar = () => {
    // Générer les étapes en fonction du service sélectionné
    const getSteps = () => {
      const baseSteps = [
        { number: 0, label: 'Service' },
        { number: 1, label: 'Personnel' },
      ];

      switch (formData.selectedEstheticService) {
        case 'FACIAL':
          return [
            ...baseSteps,
            { number: 2, label: 'Habitudes & Soins' },
          ];

        case 'MICRODERMABRASION':
          return [
            ...baseSteps,
            { number: 2, label: 'Habitudes & Soins' },
            { number: 3, label: 'Consentement' },
          ];

        case 'IPL':
          return [
            ...baseSteps,
            { number: 2, label: 'Questionnaire' },
            { number: 3, label: 'Consentement' },
          ];

        case 'MANICURE_PEDICURE':
          return [
            ...baseSteps,
            { number: 2, label: 'Questions' },
            { number: 3, label: 'Consentement' },
          ];

        default:
          return [{ number: 0, label: 'Service' }];
      }
    };

    const steps = getSteps();

    return (
      <div className="mb-8">
        <div className="flex justify-between items-start">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              {/* Conteneur de l'étape (icône + label) */}
              <div className="flex flex-col items-center flex-1">
                {/* Icône de l'étape */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                    step.number < currentStep
                      ? 'bg-spa-lavande-500 text-white'
                      : step.number === currentStep
                      ? 'bg-spa-rose-500 text-white scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.number < currentStep ? <Check className="w-5 h-5" /> : step.number}
                </div>

                {/* Label de l'étape */}
                <span
                  className={`text-xs mt-2 text-center transition-all duration-300 ${
                    step.number === currentStep
                      ? 'font-semibold text-spa-rose-600'
                      : 'text-gray-600'
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Ligne de connexion */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                    step.number < currentStep ? 'bg-spa-lavande-500' : 'bg-gray-200'
                  }`}
                  style={{ marginTop: '-24px' }} // Aligner avec le centre des icônes
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ÉTAPE 0 : Sélection du service esthétique
  const renderStep0 = () => (
    <motion.div
      key="step0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Pour quel service souhaitez-vous vous enregistrer ?
      </h2>

      <p className="text-gray-600 mb-8">
        Sélectionnez le type de soin esthétique qui vous intéresse. Selon votre choix,
        nous vous demanderons de remplir les informations appropriées.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FACIAL */}
        <div
          onClick={() => {
            setFormData({ ...formData, selectedEstheticService: 'FACIAL' });
            setErrors({});
          }}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            formData.selectedEstheticService === 'FACIAL'
              ? 'border-spa-lavande-500 bg-spa-lavande-50 shadow-lg'
              : 'border-gray-200 hover:border-spa-lavande-300 hover:shadow-md'
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Soins du visage (Facial)</h3>
          <p className="text-sm text-gray-600">
            Soins classiques pour le visage, nettoyage de peau, hydratation
          </p>
        </div>

        {/* MICRODERMABRASION */}
        <div
          onClick={() => {
            setFormData({ ...formData, selectedEstheticService: 'MICRODERMABRASION' });
            setErrors({});
          }}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            formData.selectedEstheticService === 'MICRODERMABRASION'
              ? 'border-spa-rose-500 bg-spa-rose-50 shadow-lg'
              : 'border-gray-200 hover:border-spa-rose-300 hover:shadow-md'
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Microdermabrasion</h3>
          <p className="text-sm text-gray-600">
            Exfoliation mécanique de la peau pour réduire les imperfections
          </p>
        </div>

        {/* IPL (ÉPILATION) */}
        <div
          onClick={() => {
            setFormData({ ...formData, selectedEstheticService: 'IPL' });
            setErrors({});
          }}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            formData.selectedEstheticService === 'IPL'
              ? 'border-spa-turquoise-500 bg-spa-turquoise-50 shadow-lg'
              : 'border-gray-200 hover:border-spa-turquoise-300 hover:shadow-md'
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">IPL (Épilation)</h3>
          <p className="text-sm text-gray-600">
            Épilation à la lumière intense pulsée - Traitement IPL Venus Versa
          </p>
        </div>

        {/* MANICURE / PÉDICURE */}
        <div
          onClick={() => {
            setFormData({ ...formData, selectedEstheticService: 'MANICURE_PEDICURE' });
            setErrors({});
          }}
          className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
            formData.selectedEstheticService === 'MANICURE_PEDICURE'
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
          }`}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Manicure / Pédicure</h3>
          <p className="text-sm text-gray-600">
            Soins des mains et des pieds, pose de vernis
          </p>
        </div>
      </div>

      {errors.selectedEstheticService && (
        <p className="text-red-600 text-sm mt-4">{errors.selectedEstheticService}</p>
      )}
    </motion.div>
  );

  // ÉTAPE 1 : Informations personnelles (commune à tous les services)
  const renderStep1 = () => (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations Personnelles</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          label="Nom"
          name="nom"
          value={formData.nom}
          onChange={handleInputChange}
          error={errors.nom}
          required
        />
        <InputField
          label="Prénom"
          name="prenom"
          value={formData.prenom}
          onChange={handleInputChange}
          error={errors.prenom}
          required
        />
      </div>

      <InputField
        label="Adresse"
        name="adresse"
        value={formData.adresse}
        onChange={handleInputChange}
        error={errors.adresse}
        required
        className="mt-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <InputField
          label="Ville"
          name="ville"
          value={formData.ville}
          onChange={handleInputChange}
          error={errors.ville}
          required
        />
        <InputField
          label="Code Postal"
          name="codePostal"
          value={formData.codePostal}
          onChange={handleInputChange}
          error={errors.codePostal}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <InputField
          label="Tél. Maison"
          name="telMaison"
          type="tel"
          value={formData.telMaison}
          onChange={handleInputChange}
        />
        <InputField
          label="Tél. Bureau"
          name="telBureau"
          type="tel"
          value={formData.telBureau}
          onChange={handleInputChange}
        />
        <InputField
          label="Tél. Cellulaire"
          name="telCellulaire"
          type="tel"
          value={formData.telCellulaire}
          onChange={handleInputChange}
          error={errors.telCellulaire}
          required
        />
      </div>

      <InputField
        label="Courriel"
        name="courriel"
        type="email"
        value={formData.courriel}
        onChange={handleInputChange}
        error={errors.courriel}
        required
        className="mt-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div>
          <InputField
            label="Date de Naissance"
            name="dateNaissance"
            type="date"
            value={formData.dateNaissance}
            onChange={handleInputChange}
            error={errors.dateNaissance}
            required
          />
          {age !== null && (
            <p className="text-sm text-gray-600 mt-1">Âge: {age} ans</p>
          )}
        </div>
        <InputField
          label="Occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleInputChange}
        />
      </div>

      <div className="mt-6">
        <label className="label-spa">
          Genre <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Homme"
            name="gender"
            value="HOMME"
            checked={formData.gender === 'HOMME'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Femme"
            name="gender"
            value="FEMME"
            checked={formData.gender === 'FEMME'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Autre"
            name="gender"
            value="AUTRE"
            checked={formData.gender === 'AUTRE'}
            onChange={handleInputChange}
          />
        </div>
        {errors.gender && <p className="text-red-600 text-sm mt-2">{errors.gender}</p>}
      </div>

      <div className="mt-6">
        <label className="label-spa">
          Assurance couverte <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="assuranceCouvert"
            value="OUI"
            checked={formData.assuranceCouvert === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="assuranceCouvert"
            value="NON"
            checked={formData.assuranceCouvert === 'NON'}
            onChange={handleInputChange}
          />
        </div>
        {errors.assuranceCouvert && <p className="text-red-600 text-sm mt-2">{errors.assuranceCouvert}</p>}
      </div>
    </motion.div>
  );

  // ÉTAPE 2 : Contenu différent selon le service choisi
  const renderStep2 = () => {
    // Pour FACIAL et MICRODERMABRASION : Habitudes & Soins
    if (formData.selectedEstheticService === 'FACIAL' || formData.selectedEstheticService === 'MICRODERMABRASION') {
      return (
        <motion.div
          key="step2-habitudes"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Habitudes de Vie & Soins</h2>

          <SelectField
            label="Exposition au soleil"
            name="expositionSoleil"
            value={formData.expositionSoleil}
            onChange={handleInputChange}
            options={[
              { value: 'RARE', label: 'Rare' },
              { value: 'MODEREE', label: 'Modérée' },
              { value: 'FREQUENTE', label: 'Fréquente' },
              { value: 'TRES_FREQUENTE', label: 'Très fréquente' },
            ]}
            placeholder="Sélectionnez..."
          />

          <div className="mt-6">
            <label className="label-spa">Protection solaire</label>
            <div className="flex gap-6 mt-2">
              <RadioField
                label="Toujours"
                name="protectionSolaire"
                value="TOUJOURS"
                checked={formData.protectionSolaire === 'TOUJOURS'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Souvent"
                name="protectionSolaire"
                value="SOUVENT"
                checked={formData.protectionSolaire === 'SOUVENT'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Rarement"
                name="protectionSolaire"
                value="RAREMENT"
                checked={formData.protectionSolaire === 'RAREMENT'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Jamais"
                name="protectionSolaire"
                value="JAMAIS"
                checked={formData.protectionSolaire === 'JAMAIS'}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label-spa">Buvez-vous suffisamment d'eau? (1.5L/jour minimum)</label>
            <div className="flex gap-6 mt-2">
              <RadioField
                label="Oui"
                name="suffisanceEau"
                value="OUI"
                checked={formData.suffisanceEau === 'OUI'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Non"
                name="suffisanceEau"
                value="NON"
                checked={formData.suffisanceEau === 'NON'}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label-spa">Travaillez-vous à l'extérieur?</label>
            <div className="flex gap-6 mt-2">
              <RadioField
                label="Oui"
                name="travailExterieur"
                value="OUI"
                checked={formData.travailExterieur === 'OUI'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Non"
                name="travailExterieur"
                value="NON"
                checked={formData.travailExterieur === 'NON'}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="label-spa">Prenez-vous des bains chauds fréquemment?</label>
            <div className="flex gap-6 mt-2">
              <RadioField
                label="Oui"
                name="bainChauds"
                value="OUI"
                checked={formData.bainChauds === 'OUI'}
                onChange={handleInputChange}
              />
              <RadioField
                label="Non"
                name="bainChauds"
                value="NON"
                checked={formData.bainChauds === 'NON'}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <InputField
            label="Routine de soins actuelle (produits utilisés)"
            name="routineSoins"
            value={formData.routineSoins}
            onChange={handleInputChange}
            rows={4}
            placeholder="Ex: nettoyant le matin, crème hydratante..."
            className="mt-6"
          />

          <InputField
            label="Changements récents de la peau (acné, irritations, etc.)"
            name="changementsRecents"
            value={formData.changementsRecents}
            onChange={handleInputChange}
            rows={3}
            className="mt-6"
          />

          <InputField
            label="Préférences pour les soins de la peau"
            name="preferencePeau"
            value={formData.preferencePeau}
            onChange={handleInputChange}
            rows={3}
            placeholder="Ex: produits naturels, anti-âge, hydratation intense..."
            className="mt-6"
          />

          <div className="mt-6">
        <label className="label-spa">
          Fumeur <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="fumeur"
            value="OUI"
            checked={formData.fumeur === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="fumeur"
            value="NON"
            checked={formData.fumeur === 'NON'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Occasionnellement"
            name="fumeur"
            value="OCCASIONNEL"
            checked={formData.fumeur === 'OCCASIONNEL'}
            onChange={handleInputChange}
          />
        </div>
        {errors.fumeur && <p className="text-red-600 text-sm mt-2">{errors.fumeur}</p>}
      </div>

      <SelectField
        label="Niveau de stress"
        name="niveauStress"
        value={formData.niveauStress}
        onChange={handleInputChange}
        error={errors.niveauStress}
        options={[
          { value: 'FAIBLE', label: 'Faible' },
          { value: 'MOYEN', label: 'Moyen' },
          { value: 'ELEVE', label: 'Élevé' },
          { value: 'TRES_ELEVE', label: 'Très élevé' },
        ]}
        placeholder="Sélectionnez..."
        className="mt-6"
        required
      />
        </motion.div>
      );
    }

    // Questionnaire IPL
    if (formData.selectedEstheticService === 'IPL') {
      return (
        <motion.div
          key="step2-ipl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Questionnaire IPL - Épilation à la Lumière Intense Pulsée
          </h2>

          {/* Bilan de santé */}
          <InputField
            label="Bilan de santé (antécédents médicaux, médicaments, etc.)"
            name="iplBilanSante"
            value={formData.iplBilanSante}
            onChange={handleInputChange}
            rows={4}
            placeholder="Décrivez votre état de santé général, vos antécédents médicaux pertinents, les médicaments que vous prenez..."
            className="mb-6"
          />

          {/* Questions médicales OUI/NON */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Conditions médicales
            </h3>

            <div className="space-y-4">
              <div>
                <label className="label-spa">Avez-vous des veines variqueuses?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplVeinsVarices"
                    value="true"
                    checked={formData.iplVeinsVarices === true}
                    onChange={(e) => setFormData({ ...formData, iplVeinsVarices: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplVeinsVarices"
                    value="false"
                    checked={formData.iplVeinsVarices === false}
                    onChange={(e) => setFormData({ ...formData, iplVeinsVarices: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous pris de l'Accutane (isotrétinoïne) dans les 6 derniers mois?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplAccutane"
                    value="true"
                    checked={formData.iplAccutane === true}
                    onChange={(e) => setFormData({ ...formData, iplAccutane: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplAccutane"
                    value="false"
                    checked={formData.iplAccutane === false}
                    onChange={(e) => setFormData({ ...formData, iplAccutane: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous eu des injections de sclérothérapie pour les varices?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplInjectionsVarices"
                    value="true"
                    checked={formData.iplInjectionsVarices === true}
                    onChange={(e) => setFormData({ ...formData, iplInjectionsVarices: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplInjectionsVarices"
                    value="false"
                    checked={formData.iplInjectionsVarices === false}
                    onChange={(e) => setFormData({ ...formData, iplInjectionsVarices: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Utilisez-vous de l'acide glycolique ou d'autres AHA?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplAcideGlycolique"
                    value="true"
                    checked={formData.iplAcideGlycolique === true}
                    onChange={(e) => setFormData({ ...formData, iplAcideGlycolique: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplAcideGlycolique"
                    value="false"
                    checked={formData.iplAcideGlycolique === false}
                    onChange={(e) => setFormData({ ...formData, iplAcideGlycolique: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous eu des injections de Botox récemment?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplInjectionBotox"
                    value="true"
                    checked={formData.iplInjectionBotox === true}
                    onChange={(e) => setFormData({ ...formData, iplInjectionBotox: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplInjectionBotox"
                    value="false"
                    checked={formData.iplInjectionBotox === false}
                    onChange={(e) => setFormData({ ...formData, iplInjectionBotox: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous eu un peeling chimique dans les 2 dernières semaines?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplPeelingChimique"
                    value="true"
                    checked={formData.iplPeelingChimique === true}
                    onChange={(e) => setFormData({ ...formData, iplPeelingChimique: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplPeelingChimique"
                    value="false"
                    checked={formData.iplPeelingChimique === false}
                    onChange={(e) => setFormData({ ...formData, iplPeelingChimique: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous des antécédents d'herpès simplex (feu sauvage)?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplHerpesSimplex"
                    value="true"
                    checked={formData.iplHerpesSimplex === true}
                    onChange={(e) => setFormData({ ...formData, iplHerpesSimplex: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplHerpesSimplex"
                    value="false"
                    checked={formData.iplHerpesSimplex === false}
                    onChange={(e) => setFormData({ ...formData, iplHerpesSimplex: e.target.value === 'true' })}
                  />
                </div>
              </div>

              <div>
                <label className="label-spa">Avez-vous des antécédents de cancer de la peau?</label>
                <div className="flex gap-6 mt-2">
                  <RadioField
                    label="Oui"
                    name="iplSkinCancer"
                    value="true"
                    checked={formData.iplSkinCancer === true}
                    onChange={(e) => setFormData({ ...formData, iplSkinCancer: e.target.value === 'true' })}
                  />
                  <RadioField
                    label="Non"
                    name="iplSkinCancer"
                    value="false"
                    checked={formData.iplSkinCancer === false}
                    onChange={(e) => setFormData({ ...formData, iplSkinCancer: e.target.value === 'true' })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Autres produits */}
          <InputField
            label="Autres produits ou traitements utilisés"
            name="iplAutresProduits"
            value={formData.iplAutresProduits}
            onChange={handleInputChange}
            rows={3}
            placeholder="Ex: crèmes, lotions, autres traitements dermatologiques..."
            className="mb-6"
          />

          {/* Zones à épiler */}
          <div className="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Zones à épiler <span className="text-spa-rose-500">*</span>
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sélectionnez toutes les zones que vous souhaitez traiter avec l'IPL
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                'Visage',
                'Menton',
                'Lèvre supérieure',
                'Joues',
                'Cou',
                'Aisselles',
                'Bras complets',
                'Avant-bras',
                'Mains',
                'Poitrine',
                'Abdomen',
                'Dos',
                'Maillot',
                'Maillot brésilien',
                'Maillot intégral',
                'Cuisses',
                'Jambes complètes',
                'Demi-jambes',
                'Pieds',
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
            {errors.iplZonesAEpiler && (
              <p className="text-red-600 text-sm mt-2">{errors.iplZonesAEpiler}</p>
            )}
          </div>
        </motion.div>
      );
    }

    // Questionnaire MANICURE_PEDICURE
    if (formData.selectedEstheticService === 'MANICURE_PEDICURE') {
      return (
        <motion.div
          key="step2-manicure"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Questionnaire Manicure / Pédicure
          </h2>

          <p className="text-gray-600 mb-6">
            Veuillez répondre aux questions suivantes pour nous aider à mieux vous servir.
          </p>

          <div className="space-y-6">
            {MANICURE_PEDICURE_QUESTIONS.map((q, index) => {
              if (q.type === 'yes_no') {
                return (
                  <div key={index}>
                    <label className="label-spa">{q.question}</label>
                    <div className="flex gap-6 mt-2">
                      <RadioField
                        label="Oui"
                        name={`manicure_q${index}`}
                        value="OUI"
                        checked={formData.manicurePedicureInfo?.[`q${index}`] === 'OUI'}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            manicurePedicureInfo: {
                              ...formData.manicurePedicureInfo,
                              [`q${index}`]: e.target.value
                            }
                          });
                        }}
                      />
                      <RadioField
                        label="Non"
                        name={`manicure_q${index}`}
                        value="NON"
                        checked={formData.manicurePedicureInfo?.[`q${index}`] === 'NON'}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            manicurePedicureInfo: {
                              ...formData.manicurePedicureInfo,
                              [`q${index}`]: e.target.value
                            }
                          });
                        }}
                      />
                    </div>
                  </div>
                );
              } else if (q.type === 'text') {
                return (
                  <InputField
                    key={index}
                    label={q.question}
                    name={`manicure_q${index}`}
                    value={formData.manicurePedicureInfo?.[`q${index}`] || ''}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        manicurePedicureInfo: {
                          ...formData.manicurePedicureInfo,
                          [`q${index}`]: e.target.value
                        }
                      });
                    }}
                    rows={3}
                    placeholder="Veuillez préciser..."
                  />
                );
              }
              return null;
            })}
          </div>

          {/* Informations supplémentaires */}
          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> Ces informations nous aident à adapter nos services
              à vos besoins spécifiques et à assurer votre sécurité pendant le traitement.
            </p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  const renderStep3 = () => {
    // Étape 3 : Consentement (pour MICRODERMABRASION, IPL, MANICURE_PEDICURE)
    if (formData.selectedEstheticService === 'MICRODERMABRASION') {
      return (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {MICRODERMABRASION_CONSENT.title}
          </h2>

          {/* Sections du consentement */}
          {MICRODERMABRASION_CONSENT.sections.map((section, index) => (
            <div key={index} className="mb-6">
              {section.title && (
                <h3 className="text-lg font-semibold text-spa-lavande-700 mb-3">
                  {section.title}
                </h3>
              )}
              {section.content.length > 0 && (
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {section.content.map((item, idx) => (
                    <li key={idx} className="text-sm leading-relaxed">
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {/* Contre-indications */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-3">
              {MICRODERMABRASION_CONSENT.contraindications.title}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-red-700">
              {MICRODERMABRASION_CONSENT.contraindications.items.map((item, idx) => (
                <li key={idx} className="text-sm">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Accord de consentement */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-800 mb-4 leading-relaxed">
              {MICRODERMABRASION_CONSENT.agreement.replace('__ [NOM CLIENT] __', formData.nom + ' ' + formData.prenom)}
            </p>

            {/* Checkbox de consentement */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="microdermConsentement"
                name="microdermConsentement"
                checked={formData.microdermConsentement}
                onChange={(e) => setFormData({ ...formData, microdermConsentement: e.target.checked })}
                className="mt-1 h-5 w-5 text-spa-rose-500 rounded border-gray-300 focus:ring-spa-lavande-500"
                required
              />
              <label htmlFor="microdermConsentement" className="text-gray-700 font-medium">
                Je confirme avoir lu et compris le formulaire de consentement ci-dessus.
                J'accepte les conditions et reconnais les risques associés au traitement de microdermabrasion. *
              </label>
            </div>

            {errors.microdermConsentement && (
              <p className="text-red-600 text-sm mt-2">{errors.microdermConsentement}</p>
            )}
          </div>

          {/* Informations sur les signatures */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> En cochant la case ci-dessus et en soumettant ce formulaire,
              vous confirmez votre consentement éclairé pour le traitement de microdermabrasion.
              La date de consentement sera automatiquement enregistrée.
            </p>
          </div>
        </motion.div>
      );
    }

    // Consentement IPL
    if (formData.selectedEstheticService === 'IPL') {
      return (
        <motion.div
          key="step3-ipl"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {IPL_CONSENT.title}
          </h2>

          {/* Introduction */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {IPL_CONSENT.introduction}
            </p>
          </div>

          {/* Procédures */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-spa-lavande-700 mb-3">
              Procédures et reconnaissances
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {IPL_CONSENT.procedures.map((procedure, idx) => (
                <li key={idx} className="text-sm leading-relaxed">
                  {procedure}
                </li>
              ))}
            </ul>
          </div>

          {/* Acknowledgment */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-spa-lavande-700 mb-3">
              Reconnaissances
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {IPL_CONSENT.acknowledgment.map((ack, idx) => (
                <li key={idx} className="text-sm leading-relaxed">
                  {ack}
                </li>
              ))}
            </ul>
          </div>

          {/* Statement */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-blue-900 font-medium">
              {IPL_CONSENT.statement}
            </p>
          </div>

          {/* Accord de consentement */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-800 mb-4">
              Client: <strong>{formData.nom} {formData.prenom}</strong>
            </p>

            {/* Checkbox de consentement */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="iplConsentement"
                name="iplConsentement"
                checked={formData.iplConsentement}
                onChange={(e) => setFormData({ ...formData, iplConsentement: e.target.checked })}
                className="mt-1 h-5 w-5 text-spa-rose-500 rounded border-gray-300 focus:ring-spa-lavande-500"
                required
              />
              <label htmlFor="iplConsentement" className="text-gray-700 font-medium">
                Je confirme avoir lu et compris le formulaire de consentement ci-dessus.
                Je consens à la procédure d'épilation IPL (Lumière Intense Pulsée) et accepte
                les conditions mentionnées. *
              </label>
            </div>

            {errors.iplConsentement && (
              <p className="text-red-600 text-sm mt-2">{errors.iplConsentement}</p>
            )}
          </div>

          {/* Informations sur les signatures */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> En cochant la case ci-dessus et en soumettant ce formulaire,
              vous confirmez votre consentement éclairé pour le traitement IPL.
              La date de consentement sera automatiquement enregistrée.
            </p>
          </div>
        </motion.div>
      );
    }

    // Consentement MANICURE_PEDICURE
    if (formData.selectedEstheticService === 'MANICURE_PEDICURE') {
      return (
        <motion.div
          key="step3-manicure"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {MANICURE_PEDICURE_CONSENT.title}
          </h2>

          {/* Introduction */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-700 leading-relaxed">
              {MANICURE_PEDICURE_CONSENT.introduction}
            </p>
          </div>

          {/* Sections du consentement */}
          {MANICURE_PEDICURE_CONSENT.sections.map((section, index) => (
            <div key={index} className="mb-6">
              {section.title && (
                <h3 className="text-lg font-semibold text-spa-lavande-700 mb-3">
                  {section.title}
                </h3>
              )}
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {section.content.map((item, idx) => (
                  <li key={idx} className="text-sm leading-relaxed">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Accord de consentement */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <p className="text-gray-800 mb-4 leading-relaxed">
              {MANICURE_PEDICURE_CONSENT.agreement.replace('__ [NOM CLIENT] __', formData.nom + ' ' + formData.prenom)}
            </p>

            {/* Checkbox de consentement */}
            <div className="flex items-start gap-3 mt-6">
              <input
                type="checkbox"
                id="manicurePedicureConsent"
                name="manicurePedicureConsent"
                checked={formData.manicurePedicureConsent}
                onChange={(e) => setFormData({ ...formData, manicurePedicureConsent: e.target.checked })}
                className="mt-1 h-5 w-5 text-spa-rose-500 rounded border-gray-300 focus:ring-spa-lavande-500"
                required
              />
              <label htmlFor="manicurePedicureConsent" className="text-gray-700 font-medium">
                Je confirme avoir lu et compris le formulaire de consentement ci-dessus.
                J'accepte les conditions et reconnais les risques associés aux soins de manicure/pédicure. *
              </label>
            </div>

            {errors.manicurePedicureConsent && (
              <p className="text-red-600 text-sm mt-2">{errors.manicurePedicureConsent}</p>
            )}
          </div>

          {/* Informations sur les signatures */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Note :</strong> En cochant la case ci-dessus et en soumettant ce formulaire,
              vous confirmez votre consentement éclairé pour les soins de manicure/pédicure.
              La date de consentement sera automatiquement enregistrée.
            </p>
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-2">
            Formulaire Soins Esthétiques
          </h1>
          <p className="text-gray-600">Étape {currentStep} sur {totalSteps}</p>
        </motion.div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Formulaire */}
        <div className="card-spa p-8">
          <AnimatePresence mode="wait">
            {currentStep === 0 && renderStep0()}
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </AnimatePresence>

          {/* Boutons de navigation */}
          {/* <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline">Précédent</span>
            </button>

            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="btn-primary flex items-center gap-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Suivant</span>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2 text-sm md:text-base px-4 md:px-6 py-2 md:py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                    <span className="hidden sm:inline">Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden sm:inline">Soumettre</span>
                    <span className="sm:hidden">OK</span>
                  </>
                )}
              </button>
            )}
          </div> */}

          <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
            {/* Bouton Précédent */}
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="
                btn-outline
                flex items-center gap-2
                text-sm md:text-base
                px-4 md:px-6 py-2 md:py-3
          
                /* FIX iPad */
                opacity-100
                bg-transparent
                text-primary
          
                disabled:opacity-50
                disabled:cursor-not-allowed
          
                /* Hover uniquement desktop */
                md:hover:bg-primary/10
              "
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              <span className="hidden sm:inline">Précédent</span>
            </button>
          
            {currentStep < totalSteps ? (
              /* Bouton Suivant */
              <button
                onClick={nextStep}
                className="
                  btn-primary
                  flex items-center gap-2
                  text-sm md:text-base
                  px-4 md:px-6 py-2 md:py-3
          
                  /* FIX iPad */
                  opacity-100
                  bg-primary
                  text-white
          
                  /* Hover uniquement desktop */
                  md:hover:bg-primary/90
                  md:hover:opacity-100
                "
              >
                <span className="hidden sm:inline">Suivant</span>
                <span className="sm:hidden">Suivant</span>
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
              /* Bouton Soumettre */
              <button
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                className="
                  btn-primary
                  flex items-center gap-2
                  text-sm md:text-base
                  px-4 md:px-6 py-2 md:py-3

                  /* FIX iPad */
                  opacity-100
                  bg-primary
                  text-white

                  disabled:opacity-60
                  disabled:cursor-not-allowed

                  /* Hover uniquement desktop */
                  md:hover:bg-primary/90
                "
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" />
                    <span className="hidden sm:inline">Enregistrement...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="hidden sm:inline">Soumettre</span>
                    <span className="sm:hidden">OK</span>
                  </>
                )}
              </button>
            )}
                    </div>
        </div>

        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <a
            href="/client/nouveau"
            className="text-spa-rose-600 hover:text-spa-rose-700 font-medium transition-colors"
          >
            ← Retour au choix de service
          </a>
        </motion.div>
      </div>

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
              {/* Icône d'erreur */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-10 h-10 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-3">Erreur</h3>

              {/* Message d'erreur */}
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
              </div>

              {/* Messages d'aide contextuels */}
              {(errorMessage.toLowerCase().includes('email') ||
                errorMessage.toLowerCase().includes('courriel') ||
                errorMessage.toLowerCase().includes('adresse')) &&
                errorMessage.toLowerCase().includes('existe') && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium mb-1">Cette adresse email est déjà utilisée</p>
                      <p className="text-blue-700 text-xs">
                        Un compte client existe déjà avec cette adresse email. Veuillez utiliser une adresse différente ou contacter l'établissement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(errorMessage.toLowerCase().includes('téléphone') ||
                errorMessage.toLowerCase().includes('telephone') ||
                errorMessage.toLowerCase().includes('cellulaire')) &&
                errorMessage.toLowerCase().includes('existe') && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-left">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-blue-800 text-sm font-medium mb-1">Ce numéro de téléphone est déjà enregistré</p>
                      <p className="text-blue-700 text-xs">
                        Un compte client existe déjà avec ce numéro de téléphone. Veuillez utiliser un numéro différent ou contacter l'établissement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setShowErrorModal(false);
                  setErrorMessage('');
                }}
                className="btn-primary w-full"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
  }
  
