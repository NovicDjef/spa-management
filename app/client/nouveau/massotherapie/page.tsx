'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, SelectField, CheckboxField, RadioField } from '@/components/forms/FormFields';
import { BodyMap } from '@/components/forms/BodyMap';
import { ChevronLeft, ChevronRight, Check, Loader2, X, AlertCircle } from 'lucide-react';
import { useCreateClientMutation } from '@/lib/redux/services/api';
import { extractErrorMessage } from '@/lib/utils/errorHandler';

interface FormData {
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
  gender?: 'HOMME' | 'FEMME';
  assuranceCouvert: string;

  // Informations médicales
  raisonConsultation: string;
  diagnosticMedical: string;
  diagnosticMedicalDetails: string;
  medicaments: string;
  medicamentsDetails: string;
  accidents: string;
  accidentsDetails: string;
  operationsChirurgicales: string;
  operationsChirurgicalesDetails: string;
  traitementsActuels: string;
  problemesCardiaques: boolean;
  problemesCardiaquesDetails: string;
  maladiesGraves: boolean;
  maladiesGravesDetails: string;
  ortheses: boolean;
  orthesesDetails: string;
  allergies: boolean;
  allergiesDetails: string;
  autreMaladie: boolean;
  autreMaladieDetails: string;

  // Conditions médicales
  raideurs: boolean;
  arthrose: boolean;
  hernieDiscale: boolean;
  oedeme: boolean;
  tendinite: boolean;
  mauxDeTete: boolean;
  flatulence: boolean;
  troublesCirculatoires: boolean;
  hypothyroidie: boolean;
  diabete: boolean;
  stresse: boolean;
  premenopause: boolean;
  douleurMusculaire: boolean;
  fibromyalgie: boolean;
  rhumatisme: boolean;
  sciatique: boolean;
  bursite: boolean;
  migraine: boolean;
  diarrhee: boolean;
  phlebite: boolean;
  hypertension: boolean;
  hypoglycemie: boolean;
  burnOut: boolean;
  menopause: boolean;
  inflammationAigue: boolean;
  arteriosclerose: boolean;
  osteoporose: boolean;
  mauxDeDos: boolean;
  fatigueDesJambes: boolean;
  troublesDigestifs: boolean;
  constipation: boolean;
  hyperthyroidie: boolean;
  hypotension: boolean;
  insomnie: boolean;
  depressionNerveuse: boolean;
  autres: string;
  onZonesChange: (zones: string[]) => void;
  // Zones de douleur
  zonesDouleur: string[];
}

const initialFormData: FormData = {
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
  gender: 'HOMME',
  assuranceCouvert: '',
  raisonConsultation: '',
  diagnosticMedical: '',
  diagnosticMedicalDetails: '',
  medicaments: '',
  medicamentsDetails: '',
  accidents: '',
  accidentsDetails: '',
  operationsChirurgicales: '',
  operationsChirurgicalesDetails: '',
  autreMaladieDetails: '',
  traitementsActuels: '',
  problemesCardiaques: false,
  problemesCardiaquesDetails: '',
  maladiesGraves: false,
  maladiesGravesDetails: '',
  ortheses: false,
  orthesesDetails: '',
  allergies: false,
  allergiesDetails: '',
  raideurs: false,
  arthrose: false,
  hernieDiscale: false,
  oedeme: false,
  tendinite: false,
  mauxDeTete: false,
  flatulence: false,
  troublesCirculatoires: false,
  hypothyroidie: false,
  diabete: false,
  stresse: false,
  premenopause: false,
  douleurMusculaire: false,
  fibromyalgie: false,
  rhumatisme: false,
  sciatique: false,
  bursite: false,
  migraine: false,
  diarrhee: false,
  phlebite: false,
  hypertension: false,
  hypoglycemie: false,
  burnOut: false,
  menopause: false,
  inflammationAigue: false,
  arteriosclerose: false,
  osteoporose: false,
  mauxDeDos: false,
  fatigueDesJambes: false,
  troublesDigestifs: false,
  constipation: false,
  hyperthyroidie: false,
  hypotension: false,
  insomnie: false,
  depressionNerveuse: false,
  autreMaladie: false,
  autres: '',
  zonesDouleur: [],
  onZonesChange: () => {},
};

export default function MassotherapieFormPage() {
  const router = useRouter();
  const [createClient, { isLoading }] = useCreateClientMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [age, setAge] = useState<number | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalSteps = 4;

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
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Calculer l'âge si le champ modifié est la date de naissance
    if (name === 'dateNaissance') {
      const calculatedAge = calculateAge(value);
      setAge(calculatedAge);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

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

    if (step === 2) {
      if (!formData.raisonConsultation) newErrors.raisonConsultation = 'La raison de consultation est requise';
      if (!formData.diagnosticMedical) newErrors.diagnosticMedical = 'Ce champ est requis';
      if (formData.diagnosticMedical === 'OUI' && !formData.diagnosticMedicalDetails) {
        newErrors.diagnosticMedicalDetails = 'Veuillez préciser le diagnostic';
      }
      if (!formData.medicaments) newErrors.medicaments = 'Ce champ est requis';
      if (formData.medicaments === 'OUI' && !formData.medicamentsDetails) {
        newErrors.medicamentsDetails = 'Veuillez préciser les médicaments';
      }
      if (!formData.accidents) newErrors.accidents = 'Ce champ est requis';
      if (!formData.operationsChirurgicales) newErrors.operationsChirurgicales = 'Ce champ est requis';
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
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    // Préparer les données pour l'API
    const dataToSubmit = {
      ...formData,
      serviceType: 'MASSOTHERAPIE' as const,
      // Champs requis par le backend mais non utilisés pour la massothérapie
      fumeur: 'NON' as const,
      expositionSoleil: 'RARE' as const,
      protectionSolaire: 'TOUJOURS' as const,
      suffisanceEau: 'OUI' as const,
      travailExterieur: 'NON' as const,
      bainChauds: 'NON' as const,
      // Convertir les champs booléens en chaînes pour l'API
      allergies: formData.allergies ? 'OUI' : 'NON',
      problemesCardiaques: formData.problemesCardiaques ? 'OUI' : 'NON',
      maladiesGraves: formData.maladiesGraves ? 'OUI' : 'NON',
      ortheses: formData.ortheses ? 'OUI' : 'NON',
      autreMaladie: formData.autreMaladie ? 'OUI' : 'NON',
      raideurs: formData.raideurs ? 'OUI' : 'NON',
      arthrose: formData.arthrose ? 'OUI' : 'NON',
      hernieDiscale: formData.hernieDiscale ? 'OUI' : 'NON',
      oedeme: formData.oedeme ? 'OUI' : 'NON',
      tendinite: formData.tendinite ? 'OUI' : 'NON',
      mauxDeTete: formData.mauxDeTete ? 'OUI' : 'NON',
      flatulence: formData.flatulence ? 'OUI' : 'NON',
      troublesCirculatoires: formData.troublesCirculatoires ? 'OUI' : 'NON',
      hypothyroidie: formData.hypothyroidie ? 'OUI' : 'NON',
      diabete: formData.diabete ? 'OUI' : 'NON',
      stresse: formData.stresse ? 'OUI' : 'NON',
      premenopause: formData.premenopause ? 'OUI' : 'NON',
      douleurMusculaire: formData.douleurMusculaire ? 'OUI' : 'NON',
      fibromyalgie: formData.fibromyalgie ? 'OUI' : 'NON',
      rhumatisme: formData.rhumatisme ? 'OUI' : 'NON',
      sciatique: formData.sciatique ? 'OUI' : 'NON',
      bursite: formData.bursite ? 'OUI' : 'NON',
      migraine: formData.migraine ? 'OUI' : 'NON',
      diarrhee: formData.diarrhee ? 'OUI' : 'NON',
      phlebite: formData.phlebite ? 'OUI' : 'NON',
      hypertension: formData.hypertension ? 'OUI' : 'NON',
      hypoglycemie: formData.hypoglycemie ? 'OUI' : 'NON',
      burnOut: formData.burnOut ? 'OUI' : 'NON',
      menopause: formData.menopause ? 'OUI' : 'NON',
      inflammationAigue: formData.inflammationAigue ? 'OUI' : 'NON',
      arteriosclerose: formData.arteriosclerose ? 'OUI' : 'NON',
      osteoporose: formData.osteoporose ? 'OUI' : 'NON',
      mauxDeDos: formData.mauxDeDos ? 'OUI' : 'NON',
      fatigueDesJambes: formData.fatigueDesJambes ? 'OUI' : 'NON',
      troublesDigestifs: formData.troublesDigestifs ? 'OUI' : 'NON',
      constipation: formData.constipation ? 'OUI' : 'NON',
      hyperthyroidie: formData.hyperthyroidie ? 'OUI' : 'NON',
      hypotension: formData.hypotension ? 'OUI' : 'NON',
      insomnie: formData.insomnie ? 'OUI' : 'NON',
      depressionNerveuse: formData.depressionNerveuse ? 'OUI' : 'NON',
    };

    try {
       await createClient(dataToSubmit as any).unwrap();

       console.log('Client créé avec succès');
       console.log("dataToSubmit", dataToSubmit);
      router.push('/client/confirmation');
    } catch (error: any) {
 
      const errorMsg = extractErrorMessage(error, 'Une erreur est survenue lors de l\'enregistrement');
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: 'Personnel' },
      { number: 2, label: 'Médical' },
      { number: 3, label: 'Conditions' },
      { number: 4, label: 'Zones' },
    ];

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
                      ? 'bg-spa-menthe-500 text-white'
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
                    step.number < currentStep ? 'bg-spa-menthe-500' : 'bg-gray-200'
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
          {/* <RadioField
            label="Autre"
            name="gender"
            value="AUTRE"
            checked={formData.gender === 'AUTRE'}
            onChange={handleInputChange}
          /> */}
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

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations Médicales</h2>

      <InputField
        label="Raison de consultation"
        name="raisonConsultation"
        value={formData.raisonConsultation}
        onChange={handleInputChange}
        error={errors.raisonConsultation}
        rows={3}
        required
      />

      <div className="mt-6">
        <label className="label-spa">
          Avez-vous reçu un diagnostic médical? <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="diagnosticMedical"
            value="OUI"
            checked={formData.diagnosticMedical === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="diagnosticMedical"
            value="NON"
            checked={formData.diagnosticMedical === 'NON'}
            onChange={handleInputChange}
          />
        </div>
        {errors.diagnosticMedical && <p className="text-red-600 text-sm mt-2">{errors.diagnosticMedical}</p>}
      </div>

      {formData.diagnosticMedical === 'OUI' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField
            label="Veuillez préciser le diagnostic"
            name="diagnosticMedicalDetails"
            value={formData.diagnosticMedicalDetails}
            onChange={handleInputChange}
            error={errors.diagnosticMedicalDetails}
            rows={3}
            className="mt-4"
            required
          />
        </motion.div>
      )}

      <div className="mt-6">
        <label className="label-spa">
          Prenez-vous des médicaments? <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="medicaments"
            value="OUI"
            checked={formData.medicaments === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="medicaments"
            value="NON"
            checked={formData.medicaments === 'NON'}
            onChange={handleInputChange}
          />
        </div>
        {errors.medicaments && <p className="text-red-600 text-sm mt-2">{errors.medicaments}</p>}
      </div>

      {formData.medicaments === 'OUI' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField
            label="Veuillez préciser les médicaments"
            name="medicamentsDetails"
            value={formData.medicamentsDetails}
            onChange={handleInputChange}
            error={errors.medicamentsDetails}
            rows={3}
            className="mt-4"
            required
          />
        </motion.div>
      )}

      <div className="mt-6">
        <label className="label-spa">
          Avez-vous eu des accidents? <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="accidents"
            value="OUI"
            checked={formData.accidents === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="accidents"
            value="NON"
            checked={formData.accidents === 'NON'}
            onChange={handleInputChange}
          />
        </div>
        {errors.accidents && <p className="text-red-600 text-sm mt-2">{errors.accidents}</p>}
      </div>

      {formData.accidents === 'OUI' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField
            label="Veuillez préciser"
            name="accidentsDetails"
            value={formData.accidentsDetails}
            onChange={handleInputChange}
            rows={3}
            className="mt-4"
          />
        </motion.div>
      )}

      <div className="mt-6">
        <label className="label-spa">
          Avez-vous eu des opérations chirurgicales? <span className="text-spa-rose-500">*</span>
        </label>
        <div className="flex gap-6 mt-2">
          <RadioField
            label="Oui"
            name="operationsChirurgicales"
            value="OUI"
            checked={formData.operationsChirurgicales === 'OUI'}
            onChange={handleInputChange}
          />
          <RadioField
            label="Non"
            name="operationsChirurgicales"
            value="NON"
            checked={formData.operationsChirurgicales === 'NON'}
            onChange={handleInputChange}
          />
        </div>
        {errors.operationsChirurgicales && <p className="text-red-600 text-sm mt-2">{errors.operationsChirurgicales}</p>}
      </div>

      {formData.operationsChirurgicales === 'OUI' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <InputField
            label="Veuillez préciser"
            name="operationsChirurgicalesDetails"
            value={formData.operationsChirurgicalesDetails}
            onChange={handleInputChange}
            rows={3}
            className="mt-4"
          />
        </motion.div>
      )}

      <InputField
        label="Traitements actuels (physiothérapie, chiropratique, etc.)"
        name="traitementsActuels"
        value={formData.traitementsActuels}
        onChange={handleInputChange}
        rows={3}
        className="mt-6"
      />

      <div className="mt-6">
        <label className="label-spa">
           Autres informations à signaler ? (facultatif)
        </label>

      <div className="mt-6 space-y-4">
        <CheckboxField
          label="Problèmes cardiaques"
          name="problemesCardiaques"
          checked={formData.problemesCardiaques}
          onChange={handleInputChange}
        />
        {formData.problemesCardiaques && (
          <InputField
            label="Précisez"
            name="problemesCardiaquesDetails"
            value={formData.problemesCardiaquesDetails}
            onChange={handleInputChange}
            rows={2}
            className="ml-8"
          />
        )}

        <CheckboxField
          label="Maladies graves (cancer, etc.)"
          name="maladiesGraves"
          checked={formData.maladiesGraves}
          onChange={handleInputChange}
        />
        {formData.maladiesGraves && (
          <InputField
            label="Précisez"
            name="maladiesGravesDetails"
            value={formData.maladiesGravesDetails}
            onChange={handleInputChange}
            rows={2}
            className="ml-8"
          />
        )}

        <CheckboxField
          label="Orthèses ou prothèses"
          name="ortheses"
          checked={formData.ortheses}
          onChange={handleInputChange}
        />
        {formData.ortheses && (
          <InputField
            label="Précisez"
            name="orthesesDetails"
            value={formData.orthesesDetails}
            onChange={handleInputChange}
            rows={2}
            className="ml-8"
          />
        )}

        <CheckboxField
          label="Allergies"
          name="allergies"
          checked={formData.allergies}
          onChange={handleInputChange}
        />
        {formData.allergies && (
          <InputField
            label="Précisez"
            name="allergiesDetails"
            value={formData.allergiesDetails}
            onChange={handleInputChange}
            rows={2}
            className="ml-8"
          />
        )}
         <CheckboxField
          label="Autre"
          name="autreMaladie"
          checked={formData.autreMaladie}
          onChange={handleInputChange}
        />
        {formData.autreMaladie && (
          <InputField
            label="Précisez"
            name="autreMaladieDetails"
            value={formData.autreMaladieDetails}
            onChange={handleInputChange}
            rows={2}
            className="ml-8"
          />
        )}
      </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Conditions Médicales</h2>
      <p className="text-gray-600 mb-6">Cochez toutes les conditions qui s'appliquent à vous</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CheckboxField label="Raideurs" name="raideurs" checked={formData.raideurs} onChange={handleInputChange} />
        <CheckboxField label="Arthrose" name="arthrose" checked={formData.arthrose} onChange={handleInputChange} />
        <CheckboxField label="Hernie discale" name="hernieDiscale" checked={formData.hernieDiscale} onChange={handleInputChange} />
        <CheckboxField label="Œdème" name="oedeme" checked={formData.oedeme} onChange={handleInputChange} />
        <CheckboxField label="Tendinite" name="tendinite" checked={formData.tendinite} onChange={handleInputChange} />
        <CheckboxField label="Maux de tête" name="mauxDeTete" checked={formData.mauxDeTete} onChange={handleInputChange} />
        <CheckboxField label="Flatulence" name="flatulence" checked={formData.flatulence} onChange={handleInputChange} />
        <CheckboxField label="Troubles circulatoires" name="troublesCirculatoires" checked={formData.troublesCirculatoires} onChange={handleInputChange} />
        <CheckboxField label="Hypothyroïdie" name="hypothyroidie" checked={formData.hypothyroidie} onChange={handleInputChange} />
        <CheckboxField label="Diabète" name="diabete" checked={formData.diabete} onChange={handleInputChange} />
        <CheckboxField label="Stress" name="stresse" checked={formData.stresse} onChange={handleInputChange} />
        <CheckboxField label="Préménopause" name="premenopause" checked={formData.premenopause} onChange={handleInputChange} />
        <CheckboxField label="Douleur musculaire" name="douleurMusculaire" checked={formData.douleurMusculaire} onChange={handleInputChange} />
        <CheckboxField label="Fibromyalgie" name="fibromyalgie" checked={formData.fibromyalgie} onChange={handleInputChange} />
        <CheckboxField label="Rhumatisme" name="rhumatisme" checked={formData.rhumatisme} onChange={handleInputChange} />
        <CheckboxField label="Sciatique" name="sciatique" checked={formData.sciatique} onChange={handleInputChange} />
        <CheckboxField label="Bursite" name="bursite" checked={formData.bursite} onChange={handleInputChange} />
        <CheckboxField label="Migraine" name="migraine" checked={formData.migraine} onChange={handleInputChange} />
        <CheckboxField label="Diarrhée" name="diarrhee" checked={formData.diarrhee} onChange={handleInputChange} />
        <CheckboxField label="Phlébite" name="phlebite" checked={formData.phlebite} onChange={handleInputChange} />
        <CheckboxField label="Hypertension" name="hypertension" checked={formData.hypertension} onChange={handleInputChange} />
        <CheckboxField label="Hypoglycémie" name="hypoglycemie" checked={formData.hypoglycemie} onChange={handleInputChange} />
        <CheckboxField label="Burn-out" name="burnOut" checked={formData.burnOut} onChange={handleInputChange} />
        <CheckboxField label="Ménopause" name="menopause" checked={formData.menopause} onChange={handleInputChange} />
        <CheckboxField label="Inflammation aiguë" name="inflammationAigue" checked={formData.inflammationAigue} onChange={handleInputChange} />
        <CheckboxField label="Artériosclérose" name="arteriosclerose" checked={formData.arteriosclerose} onChange={handleInputChange} />
        <CheckboxField label="Ostéoporose" name="osteoporose" checked={formData.osteoporose} onChange={handleInputChange} />
        <CheckboxField label="Maux de dos" name="mauxDeDos" checked={formData.mauxDeDos} onChange={handleInputChange} />
        <CheckboxField label="Fatigue des jambes" name="fatigueDesJambes" checked={formData.fatigueDesJambes} onChange={handleInputChange} />
        <CheckboxField label="Troubles digestifs" name="troublesDigestifs" checked={formData.troublesDigestifs} onChange={handleInputChange} />
        <CheckboxField label="Constipation" name="constipation" checked={formData.constipation} onChange={handleInputChange} />
        <CheckboxField label="Hyperthyroïdie" name="hyperthyroidie" checked={formData.hyperthyroidie} onChange={handleInputChange} />
        <CheckboxField label="Hypotension" name="hypotension" checked={formData.hypotension} onChange={handleInputChange} />
        <CheckboxField label="Insomnie" name="insomnie" checked={formData.insomnie} onChange={handleInputChange} />
        <CheckboxField label="Dépression nerveuse" name="depressionNerveuse" checked={formData.depressionNerveuse} onChange={handleInputChange} />
      </div>

      <InputField
        label="Autres conditions (veuillez préciser)"
        name="autres"
        value={formData.autres}
        onChange={handleInputChange}
        rows={3}
        className="mt-6"
      />
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      key="step4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Zones de Douleur</h2>

      <BodyMap
        selectedZones={formData.zonesDouleur}
        onZonesChange={(zones) => setFormData((prev) => ({ ...prev, zonesDouleur: zones }))}
      />
    </motion.div>
  );

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
            Formulaire Massothérapie
          </h1>
          <p className="text-gray-600">Étape {currentStep} sur {totalSteps}</p>
        </motion.div>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Formulaire */}
        <div className="card-spa p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
          </AnimatePresence>

          {/* Boutons de navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Précédent
            </button>

            {currentStep < totalSteps ? (
              <button onClick={nextStep} className="btn-primary flex items-center gap-2">
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Soumettre
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
