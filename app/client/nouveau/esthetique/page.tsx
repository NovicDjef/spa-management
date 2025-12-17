'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField, SelectField, CheckboxField, RadioField } from '@/components/forms/FormFields';
import { ChevronLeft, ChevronRight, Check, Loader2 } from 'lucide-react';
import { useCreateClientMutation } from '@/lib/redux/services/api';

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
  gender: string;
  assuranceCouvert: string;

  // Informations esthétique
  etatPeau: string;
  etatPores: string;
  coucheCornee: string;
  irrigationSanguine: string;
  impuretes: string;
  sensibiliteCutanee: string;
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
  diagnosticVisuelNotes: string;
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
  gender: '',
  assuranceCouvert: '',
  etatPeau: '',
  etatPores: '',
  coucheCornee: '',
  irrigationSanguine: '',
  impuretes: '',
  sensibiliteCutanee: '',
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
  diagnosticVisuelNotes: '',
};

export default function EsthetiqueFormPage() {
  const router = useRouter();
  const [createClient, { isLoading }] = useCreateClientMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

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
      if (!formData.etatPeau) newErrors.etatPeau = 'L\'état de la peau est requis';
      if (!formData.fumeur) newErrors.fumeur = 'Ce champ est requis';
      if (!formData.niveauStress) newErrors.niveauStress = 'Le niveau de stress est requis';
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

    const dataToSubmit = {
  ...formData,
  serviceType: 'ESTHETIQUE' as const,  // Ajoutez 'as const' pour forcer le type littéral
};

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

      alert(error.data?.message || 'Une erreur est survenue lors de l\'enregistrement');
    }
  };

  const renderProgressBar = () => {
    const steps = [
      { number: 1, label: 'Personnel' },
      { number: 2, label: 'Diagnostic Peau' },
      { number: 3, label: 'Habitudes & Soins' },
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
        <InputField
          label="Date de Naissance"
          name="dateNaissance"
          type="date"
          value={formData.dateNaissance}
          onChange={handleInputChange}
          error={errors.dateNaissance}
          required
        />
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

  const renderStep2 = () => (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Diagnostic de la Peau</h2>

      <SelectField
        label="État de la peau"
        name="etatPeau"
        value={formData.etatPeau}
        onChange={handleInputChange}
        error={errors.etatPeau}
        options={[
          { value: 'NORMALE', label: 'Normale' },
          { value: 'SECHE', label: 'Sèche' },
          { value: 'GRASSE', label: 'Grasse' },
          { value: 'MIXTE', label: 'Mixte' },
          { value: 'SENSIBLE', label: 'Sensible' },
        ]}
        placeholder="Sélectionnez..."
        required
      />

      <SelectField
        label="État des pores"
        name="etatPores"
        value={formData.etatPores}
        onChange={handleInputChange}
        options={[
          { value: 'FINS', label: 'Fins' },
          { value: 'DILATES', label: 'Dilatés' },
          { value: 'OBSTRUES', label: 'Obstrués' },
        ]}
        placeholder="Sélectionnez..."
        className="mt-6"
      />

      <SelectField
        label="Couche cornée"
        name="coucheCornee"
        value={formData.coucheCornee}
        onChange={handleInputChange}
        options={[
          { value: 'FINE', label: 'Fine' },
          { value: 'EPAISSE', label: 'Épaisse' },
          { value: 'DESQUAMATION', label: 'Desquamation' },
        ]}
        placeholder="Sélectionnez..."
        className="mt-6"
      />

      <SelectField
        label="Irrigation sanguine"
        name="irrigationSanguine"
        value={formData.irrigationSanguine}
        onChange={handleInputChange}
        options={[
          { value: 'NORMALE', label: 'Normale' },
          { value: 'FAIBLE', label: 'Faible' },
          { value: 'FORTE', label: 'Forte (couperose)' },
        ]}
        placeholder="Sélectionnez..."
        className="mt-6"
      />

      <SelectField
        label="Impuretés"
        name="impuretes"
        value={formData.impuretes}
        onChange={handleInputChange}
        options={[
          { value: 'AUCUNE', label: 'Aucune' },
          { value: 'LEGERES', label: 'Légères' },
          { value: 'MODEREES', label: 'Modérées' },
          { value: 'IMPORTANTES', label: 'Importantes' },
        ]}
        placeholder="Sélectionnez..."
        className="mt-6"
      />

      <SelectField
        label="Sensibilité cutanée"
        name="sensibiliteCutanee"
        value={formData.sensibiliteCutanee}
        onChange={handleInputChange}
        options={[
          { value: 'AUCUNE', label: 'Aucune' },
          { value: 'LEGERE', label: 'Légère' },
          { value: 'MOYENNE', label: 'Moyenne' },
          { value: 'FORTE', label: 'Forte' },
        ]}
        placeholder="Sélectionnez..."
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

  const renderStep3 = () => (
    <motion.div
      key="step3"
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

      <InputField
        label="Notes du diagnostic visuel (à remplir par l'esthéticienne)"
        name="diagnosticVisuelNotes"
        value={formData.diagnosticVisuelNotes}
        onChange={handleInputChange}
        rows={4}
        className="mt-6"
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
            Formulaire Soins Esthétiques
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
    </div>
  );
}
