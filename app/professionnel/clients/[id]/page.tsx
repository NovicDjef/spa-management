'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { NotesList } from '@/components/notes/NotesList';
import { AddNoteForm } from '@/components/notes/AddNoteForm';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Hand,
  Wand2,
  Loader2,
  FileText,
  AlertCircle,
  Edit,
  Copy,
  Check,
} from 'lucide-react';
import { useGetClientByIdQuery } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { BodyMap } from '@/components/forms/BodyMap';
import { EditClientModal } from '@/components/clients/EditClientModal';

// Mapping entre les labels et les IDs du BodyMap
const LABEL_TO_ZONE_ID: Record<string, string> = {
  'tête': 'tete',
  'nuque': 'cou',
  'épaule gauche': 'epaule-gauche',
  'épaule droite': 'epaule-droite',
  'bras gauche': 'bras-gauche',
  'bras droit': 'bras-droit',
  'coude gauche': 'coude-gauche',
  'coude droit': 'coude-droit',
  'avant-bras gauche': 'avant-bras-gauche',
  'avant-bras droit': 'avant-bras-droit',
  'main gauche': 'main-gauche',
  'main droite': 'main-droite',
  'poitrine': 'poitrine',
  'abdomen': 'abdomen',
  'bassin': 'bassin',
  'cuisse gauche': 'cuisse-gauche',
  'cuisse droite': 'cuisse-droite',
  'genou gauche': 'genou-gauche',
  'genou droit': 'genou-droit',
  'mollet gauche': 'mollet-gauche',
  'mollet droit': 'mollet-droit',
  'pied gauche': 'pied-gauche',
  'pied droit': 'pied-droit',
  'haut du dos': 'dos-haut',
  'milieu du dos': 'dos-milieu',
  'bas du dos / lombaires': 'dos-bas',
  'lombaires': 'dos-bas',
  'hanche gauche': 'hanche-gauche',
  'hanche droite': 'hanche-droite',
  'fessier gauche': 'fessier-gauche',
  'fessier droit': 'fessier-droit',
};

// Fonction pour convertir les labels en IDs
const labelsToIds = (labels: string[]): string[] => {
  if (!labels || !Array.isArray(labels)) return [];
  
  return labels
    .map(label => {
      if (!label) return null;
      
      // Si le label est déjà un ID valide (sans espace et avec des tirets), on le retourne tel quel
      if (typeof label === 'string' && !label.includes(' ')) {
        return label;
      }
      
      // Sinon, on essaie de le convertir à partir du mapping
      const normalizedLabel = label.toLowerCase().trim();
      return LABEL_TO_ZONE_ID[normalizedLabel] || null;
    })
    .filter((id): id is string => id !== null);
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const { data: clientData, isLoading } = useGetClientByIdQuery(clientId);

  const currentUser = useAppSelector((state) => state.auth.user);

  const client = clientData?.client;
  // Récupérer les notes depuis le client (incluses dans la réponse de /clients/:id)
  const notes = client?.notes || [];

  const [activeTab, setActiveTab] = useState<'info' | 'notes'>('info');
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const [openReceiptDirectly, setOpenReceiptDirectly] = useState(false);

  // Fonction pour copier l'email
  const handleCopyEmail = () => {
    if (!client?.courriel) return;

    // Méthode moderne avec clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(client.courriel).then(() => {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      }).catch(() => {
        // Fallback si clipboard API échoue
        fallbackCopyEmail(client.courriel);
      });
    } else {
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      fallbackCopyEmail(client.courriel);
    }
  };

  const fallbackCopyEmail = (email: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = email;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      alert('Impossible de copier l\'email');
    }
    document.body.removeChild(textArea);
  };

  // Convertir les zones de douleur en IDs pour le BodyMap
  const bodyMapZones = client?.zonesDouleur ? labelsToIds(client.zonesDouleur) : [];

  const handleNoteAdded = () => {
    // Ouvrir le modal de reçu avec confirmation pour les massothérapeutes
    if (currentUser?.role === 'MASSOTHERAPEUTE' && client?.serviceType === 'MASSOTHERAPIE') {
      setOpenReceiptDirectly(false); // Montrer la confirmation
      setShowReceiptModal(true);
    }
  };

  const handleOpenReceiptDirect = () => {
    // Ouvrir directement le formulaire de reçu (sans confirmation)
    setOpenReceiptDirectly(true);
    setShowReceiptModal(true);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <Header user={currentUser ?? undefined} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-spa-rose-500 animate-spin" />
        </div>
      </div>
    );
  }

if (!client) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser ?? undefined} />
      <div className="container-spa py-20 px-4 flex flex-col items-center justify-center">
        {/* Illustration moderne */}
        <div className="relative mb-8">
          <div className="absolute -inset-2 bg-spa-rose-100 rounded-full opacity-30 blur-xl animate-pulse-slow"></div>
          <div className="relative bg-spa-rose-50 p-6 rounded-full shadow-lg">
            <AlertCircle className="w-16 h-16 text-spa-rose-500" strokeWidth={1.5} />
          </div>
        </div>

        {/* Titre avec effet de dégradé */}
        <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-spa-rose-600 to-spa-menthe-600">
          Accès restreint
        </h2>

        {/* Sous-titre avec typographie soignée */}
        <p className="text-lg text-gray-600 max-w-md text-center mb-8 leading-relaxed">
          Le client demandé n'est pas disponible ou vous n'avez pas les permissions nécessaires pour y accéder.
        </p>

        {/* Bouton avec effet hover élégant */}
        <button
          onClick={() => router.back()}
          className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden rounded-full bg-spa-menthe-600 text-white shadow-md transition-all duration-300 hover:shadow-lg active:scale-95"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-spa-rose-500 to-spa-menthe-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
          <span className="relative flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </span>
        </button>

        {/* Élément décoratif optionnel */}
        <div className="mt-12 w-full max-w-xs h-px bg-gradient-to-r from-transparent via-spa-rose-200 to-transparent"></div>
      </div>
    </div>
  );
}


  const age = client.dateNaissance ? calculateAge(client.dateNaissance) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* Bouton retour */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="flex items-center gap-2 text-spa-rose-600 hover:text-spa-rose-700 font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à la liste
        </motion.button>

        {/* En-tête du client */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-spa p-8 mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  client.serviceType === 'MASSOTHERAPIE'
                    ? 'bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200'
                    : 'bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200'
                }`}
              >
                {client.serviceType === 'MASSOTHERAPIE' ? (
                  <Hand className="w-8 h-8 text-spa-menthe-600" />
                ) : (
                  <Wand2 className="w-8 h-8 text-spa-lavande-600" />
                )}
              </div>
              <div>
                <h1 className="text-1xl font-bold text-gray-800 mb-1">
                  {client.prenom} {client.nom}
                </h1>
                {age && <p className="text-gray-600">{age} ans</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`badge ${
                  client.serviceType === 'MASSOTHERAPIE' ? 'badge-massotherapie' : 'badge-esthetique'
                }`}
              >
                {client.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
              </span>

              {/* Bouton Modifier (visible seulement pour les professionnels) */}
              {(currentUser?.role === 'MASSOTHERAPEUTE' || currentUser?.role === 'ESTHETICIENNE' || currentUser?.role === 'ADMIN') && (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 p-2 md:px-4 md:py-2 bg-spa-turquoise-500 text-white rounded-lg hover:bg-spa-turquoise-600 transition-colors"
                  aria-label="Modifier le client"
                >
                  <Edit className="w-5 h-5 md:w-4 md:h-4" />
                  <span className="hidden md:inline">Modifier</span>
                </button>
              )}
            </div>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Téléphone - Masqué pour massothérapeutes et esthéticiennes */}
            {currentUser?.role !== 'MASSOTHERAPEUTE' && currentUser?.role !== 'ESTHETICIENNE' ? (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-spa-rose-500" />
                <div>
                  <p className="text-sm text-gray-500">Téléphone cellulaire</p>
                  <p className="font-medium">{client.telCellulaire}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 pointer-events-none select-none cursor-not-allowed">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Téléphone cellulaire</p>
                  <p className="font-medium text-gray-400">*** *** ****</p>
                  <p className="text-xs text-gray-500 italic">Information confidentielle</p>
                </div>
              </div>
            )}

            {/* Email - Visible pour tous avec bouton copier */}
            <div className="flex items-center justify-between gap-3 text-gray-700">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-spa-rose-500" />
                <div>
                  <p className="text-sm text-gray-500">Courriel</p>
                  <p className="font-medium">{client.courriel}</p>
                </div>
              </div>
              <button
                onClick={handleCopyEmail}
                className="p-2 hover:bg-spa-rose-50 rounded-lg transition-colors group"
                title="Copier l'adresse email"
              >
                {emailCopied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 group-hover:text-spa-rose-600" />
                )}
              </button>
            </div>

            {/* Adresse - Masquée pour massothérapeutes et esthéticiennes */}
            {currentUser?.role !== 'MASSOTHERAPEUTE' && currentUser?.role !== 'ESTHETICIENNE' ? (
              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-spa-rose-500" />
                <div>
                  <p className="text-sm text-gray-500">Adresse</p>
                  <p className="font-medium">
                    {client.adresse}, {client.ville} {client.codePostal}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-gray-400 pointer-events-none select-none cursor-not-allowed">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-400">Adresse</p>
                  <p className="font-medium text-gray-400">*** *** ***, ***** ***</p>
                  <p className="text-xs text-gray-500 italic">Information confidentielle</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-spa-rose-500" />
              <div>
                <p className="text-sm text-gray-500">Date de naissance</p>
                <p className="font-medium">
                  {new Date(client.dateNaissance).toLocaleDateString('fr-CA')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs - Responsive */}
        <div className="mb-6">
          {/* Onglets principaux */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'info'
                  ? 'bg-spa-rose-500 text-white shadow-soft'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm sm:text-base">Informations</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 min-w-[140px] px-4 sm:px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-spa-rose-500 text-white shadow-soft'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm sm:text-base">Notes</span>
                {notes.length > 0 && (
                  <span className="px-2 py-0.5 bg-spa-rose-100 text-spa-rose-700 rounded-full text-xs">
                    {notes.length}
                  </span>
                )}
              </div>
            </button>
          </div>

          {/* Bouton Reçu assurance - Pleine largeur sur mobile */}
          {currentUser?.role === 'MASSOTHERAPEUTE' && client?.serviceType === 'MASSOTHERAPIE' && (
            <button
              onClick={handleOpenReceiptDirect}
              className="w-full px-4 sm:px-6 py-3 rounded-xl font-medium transition-all bg-gradient-to-r from-spa-turquoise-500 to-spa-menthe-500 text-white hover:shadow-lg active:scale-95 sm:hover:scale-105"
            >
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-sm sm:text-base">Reçu assurance</span>
              </div>
            </button>
          )}
        </div>

        {/* Contenu */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'info' ? (
            <div className="card-spa p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Informations {client.serviceType === 'MASSOTHERAPIE' ? 'Médicales' : 'Esthétiques'}
              </h2>

              {client.serviceType === 'MASSOTHERAPIE' ? (
                <div className="space-y-8">
                  {/* Section: Alertes médicales importantes */}
                  {(client.allergies || client.problemesCardiaques || client.maladiesGraves || client.autreMaladie) && (
                    <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                      <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Alertes médicales importantes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {client.allergies && (
                          <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                            <p className="text-sm font-bold text-red-700 mb-1">🔴 ALLERGIES</p>
                            <p className="text-gray-800 font-medium">{client.allergiesDetails || 'Présentes'}</p>
                          </div>
                        )}
                        {client.problemesCardiaques && (
                          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500 shadow-sm">
                            <p className="text-sm font-bold text-orange-700 mb-1">🟠 PROBLÈMES CARDIAQUES</p>
                            <p className="text-gray-800 font-medium">{client.problemesCardiaquesDetails || 'Présents'}</p>
                          </div>
                        )}
                        {client.maladiesGraves && (
                          <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                            <p className="text-sm font-bold text-red-700 mb-1">🔴 MALADIES GRAVES</p>
                            <p className="text-gray-800 font-medium">{client.maladiesGravesDetails || 'Présentes'}</p>
                          </div>
                        )}
                        {client.autreMaladie && (
                          <div className="bg-white p-4 rounded-lg border-l-4 border-red-500 shadow-sm">
                            <p className="text-sm font-bold text-red-700 mb-1">🔴 AUTRE MALADIE</p>
                            <p className="text-gray-800 font-medium">{client.autreMaladieDetails || 'Présente'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Section: Consultation */}
                  <div className="bg-gradient-to-r from-spa-menthe-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-menthe-500 rounded-full"></span>
                      Consultation
                    </h3>
                    <div className="space-y-4">
                      {client.raisonConsultation && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Raison de consultation</p>
                          <p className="text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{client.raisonConsultation}</p>
                        </div>
                      )}
                      {client.assuranceCouvert !== null && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Assurance</p>
                          <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium shadow-sm ${client.assuranceCouvert ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                            {client.assuranceCouvert ? '✓ Couvert par assurance' : '✗ Non couvert'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Historique médical et traitements */}
                  <div className="bg-gradient-to-r from-spa-rose-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-rose-500 rounded-full"></span>
                      Historique médical et traitements
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {client.diagnosticMedical && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Diagnostic médical</p>
                          <p className="font-medium text-gray-800">{client.diagnosticMedicalDetails || 'Présent'}</p>
                        </div>
                      )}
                      {client.accidents && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Accidents</p>
                          <p className="font-medium text-gray-800">{client.accidentsDetails || 'Présents'}</p>
                        </div>
                      )}
                      {client.operationsChirurgicales && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Opérations chirurgicales</p>
                          <p className="font-medium text-gray-800">{client.operationsChirurgicalesDetails || 'Présentes'}</p>
                        </div>
                      )}
                      {client.medicaments && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-400">
                          <p className="text-xs text-blue-700 font-medium mb-1">💊 Médicaments</p>
                          <p className="font-medium text-gray-800">{client.medicamentsDetails || 'Présents'}</p>
                        </div>
                      )}
                      {client.ortheses && (
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Orthèses</p>
                          <p className="font-medium text-gray-800">{client.orthesesDetails || 'Présentes'}</p>
                        </div>
                      )}
                      {client.traitementsActuels && (
                        <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2 lg:col-span-3">
                          <p className="text-xs text-gray-500 mb-1">Traitements actuels</p>
                          <p className="font-medium text-gray-800">{client.traitementsActuels}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Zones de douleur avec silhouette 3D */}
                  {client.zonesDouleur && client.zonesDouleur.length > 0 && (
                    <div className="bg-gradient-to-br from-spa-beige-50 to-white p-2 rounded-xl border-2 border-spa-rose-100">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-spa-rose-500 rounded-full"></span>
                        Zones de douleur
                      </h3>
                      {/* Silhouette 3D interactive en mode consultation */}
                      <BodyMap
                        selectedZones={bodyMapZones}
                        onZonesChange={() => {}}
                        readOnly={true}
                      />

                      {/* Liste des zones */}
                      <div className="mt-4 bg-spa-turquoise-50 p-4 rounded-lg border border-spa-turquoise-200">
                        <p className="text-sm font-semibold text-spa-turquoise-800 mb-2">
                          Zones affectées ({client.zonesDouleur.length}) :
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {client.zonesDouleur.map((zone) => (
                            <span
                              key={zone}
                              className="px-3 py-1 bg-spa-turquoise-500 text-white text-xs rounded-full"
                            >
                              {zone}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Section: Conditions et symptômes */}
                  <div className="bg-gradient-to-r from-amber-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                      Conditions et symptômes
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {client.raideurs && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Raideurs</span>
                      )}
                      {client.arthrose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Arthrose</span>
                      )}
                      {client.hernieDiscale && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hernie discale</span>
                      )}
                      {client.oedeme && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Œdème</span>
                      )}
                      {client.tendinite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Tendinite</span>
                      )}
                      {client.mauxDeTete && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Maux de tête</span>
                      )}
                      {client.flatulence && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Flatulence</span>
                      )}
                      {client.troublesCirculatoires && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Troubles circulatoires</span>
                      )}
                      {client.hypothyroidie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hypothyroïdie</span>
                      )}
                      {client.diabete && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Diabète</span>
                      )}
                      {client.stresse && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Stressé</span>
                      )}
                      {client.premenopause && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Préménopause</span>
                      )}
                      {client.douleurMusculaire && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Douleur musculaire</span>
                      )}
                      {client.fibromyalgie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Fibromyalgie</span>
                      )}
                      {client.rhumatisme && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Rhumatisme</span>
                      )}
                      {client.sciatique && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Sciatique</span>
                      )}
                      {client.bursite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Bursite</span>
                      )}
                      {client.migraine && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Migraine</span>
                      )}
                      {client.diarrhee && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Diarrhée</span>
                      )}
                      {client.phlebite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Phlébite</span>
                      )}
                      {client.hypertension && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hypertension</span>
                      )}
                      {client.hypoglycemie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hypoglycémie</span>
                      )}
                      {client.burnOut && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Burn-out</span>
                      )}
                      {client.menopause && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Ménopause</span>
                      )}
                      {client.inflammationAigue && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Inflammation aiguë</span>
                      )}
                      {client.arteriosclerose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Artériosclérose</span>
                      )}
                      {client.osteoporose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Ostéoporose</span>
                      )}
                      {client.mauxDeDos && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Maux de dos</span>
                      )}
                      {client.fatigueDesJambes && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Fatigue des jambes</span>
                      )}
                      {client.troublesDigestifs && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Troubles digestifs</span>
                      )}
                      {client.constipation && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Constipation</span>
                      )}
                      {client.hyperthyroidie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hyperthyroïdie</span>
                      )}
                      {client.hypotension && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Hypotension</span>
                      )}
                      {client.insomnie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Insomnie</span>
                      )}
                      {client.depressionNerveuse && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200 shadow-sm">✓ Dépression nerveuse</span>
                      )}
                      {client.autres && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-700 border border-amber-300 bg-amber-50 shadow-sm">✓ Autre: {client.autres}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Section: Diagnostic visuel */}
                  <div className="bg-gradient-to-r from-spa-lavande-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-lavande-500 rounded-full"></span>
                      Diagnostic visuel de la peau
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {client.etatPeau && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">État de la peau</p>
                          <p className="font-medium text-gray-800">{client.etatPeau}</p>
                        </div>
                      )}
                      {client.etatPores && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">État des pores</p>
                          <p className="font-medium text-gray-800">{client.etatPores}</p>
                        </div>
                      )}
                      {client.coucheCornee && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Couche cornée</p>
                          <p className="font-medium text-gray-800">{client.coucheCornee}</p>
                        </div>
                      )}
                      {client.irrigationSanguine && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Irrigation sanguine</p>
                          <p className="font-medium text-gray-800">{client.irrigationSanguine}</p>
                        </div>
                      )}
                      {client.impuretes && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Impuretés</p>
                          <p className="font-medium text-gray-800">{client.impuretes}</p>
                        </div>
                      )}
                      {client.sensibiliteCutanee && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Sensibilité cutanée</p>
                          <p className="font-medium text-gray-800">{client.sensibiliteCutanee}</p>
                        </div>
                      )}
                    </div>
                    {client.diagnosticVisuelNotes && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-600 mb-2">Notes du diagnostic visuel</p>
                        <p className="text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{client.diagnosticVisuelNotes}</p>
                      </div>
                    )}
                  </div>

                  {/* Section: Mode de vie */}
                  <div className="bg-gradient-to-r from-spa-rose-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-rose-500 rounded-full"></span>
                      Mode de vie et habitudes
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {client.fumeur && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Fumeur</p>
                          <p className="font-medium text-gray-800">{client.fumeur}</p>
                        </div>
                      )}
                      {client.niveauStress && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Niveau de stress</p>
                          <p className="font-medium text-gray-800">{client.niveauStress}</p>
                        </div>
                      )}
                      {client.expositionSoleil && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Exposition au soleil <span className="text-xs text-red-800">*</span></p>
                          <p className="font-medium text-gray-800">{client.expositionSoleil}</p>
                        </div>
                      )}
                      {client.protectionSolaire && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Protection solaire</p>
                          <p className="font-medium text-gray-800">{client.protectionSolaire}</p>
                        </div>
                      )}
                      {client.suffisanceEau && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Hydratation suffisante</p>
                          <p className="font-medium text-gray-800">{client.suffisanceEau}</p>
                        </div>
                      )}
                      {client.travailExterieur && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Travail en extérieur</p>
                          <p className="font-medium text-gray-800">{client.travailExterieur}</p>
                        </div>
                      )}
                      {client.bainChauds && (
                        <div className="bg-white p-3 rounded-lg">
                          <p className="text-xs text-gray-500 mb-1">Bains chauds</p>
                          <p className="font-medium text-gray-800">{client.bainChauds}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Routine et préférences */}
                  <div className="bg-gradient-to-r from-spa-turquoise-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-turquoise-500 rounded-full"></span>
                      Routine de soins et préférences
                    </h3>
                    <div className="space-y-4">
                      {client.routineSoins && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Routine de soins actuelle</p>
                          <p className="text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{client.routineSoins}</p>
                        </div>
                      )}
                      {client.changementsRecents && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Changements récents</p>
                          <p className="text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{client.changementsRecents}</p>
                        </div>
                      )}
                      {client.preferencePeau && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-2">Préférences de soins</p>
                          <p className="text-gray-800 bg-white p-4 rounded-lg leading-relaxed">{client.preferencePeau}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Informations médicales (pour esthétique aussi) */}
                  {(client.allergies || client.problemesCardiaques || client.maladiesGraves || client.medicaments) && (
                    <div className="bg-gradient-to-r from-amber-50 to-spa-beige-50 p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        Informations médicales importantes
                      </h3>
                      <div className="space-y-3">
                        {client.allergies && (
                          <div className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                            <p className="text-sm font-medium text-red-700 mb-1">⚠️ Allergies</p>
                            <p className="text-gray-800">{client.allergiesDetails || 'Oui'}</p>
                          </div>
                        )}
                        {client.problemesCardiaques && (
                          <div className="bg-white p-3 rounded-lg border-l-4 border-orange-400">
                            <p className="text-sm font-medium text-orange-700 mb-1">⚠️ Problèmes cardiaques</p>
                            <p className="text-gray-800">{client.problemesCardiaquesDetails || 'Oui'}</p>
                          </div>
                        )}
                        {client.maladiesGraves && (
                          <div className="bg-white p-3 rounded-lg border-l-4 border-red-400">
                            <p className="text-sm font-medium text-red-700 mb-1">⚠️ Maladies graves</p>
                            <p className="text-gray-800">{client.maladiesGravesDetails || 'Oui'}</p>
                          </div>
                        )}
                        {client.medicaments && (
                          <div className="bg-white p-3 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm font-medium text-blue-700 mb-1">💊 Médicaments</p>
                            <p className="text-gray-800">{client.medicamentsDetails || 'Oui'}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formulaire d'ajout de note */}
              <AddNoteForm clientId={clientId} onNoteAdded={handleNoteAdded} />

              {/* Liste des notes */}
              <NotesList
                notes={notes}
                isLoading={isLoading}
                currentUserId={currentUser?.id}
                currentUserRole={currentUser?.role}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de reçu d'assurance */}
      {currentUser && client && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => {
            setShowReceiptModal(false);
            setOpenReceiptDirectly(false);
          }}
          clientId={clientId as string}
          clientName={`${client.prenom} ${client.nom}`}
          clientEmail={client.courriel}
          therapistName={`${currentUser.prenom} ${currentUser.nom}`}
          therapistOrderNumber={currentUser.numeroMembreOrdre}
          skipConfirmation={openReceiptDirectly}
        />
      )}

      {/* Modal de modification du client */}
      {client && (
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          client={client}
        />
      )}
    </div>
  );
}
