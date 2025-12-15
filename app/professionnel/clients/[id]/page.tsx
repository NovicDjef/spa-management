'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { NotesList } from '@/components/notes/NotesList';
import { AddNoteForm } from '@/components/notes/AddNoteForm';
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
} from 'lucide-react';
import { useGetClientByIdQuery } from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';

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
        <Header user={currentUser} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-spa-rose-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <Header user={currentUser} />
        <div className="container-spa py-20 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Client non trouvé</h2>
          <p className="text-gray-600 mb-6">Le client demandé n'existe pas ou vous n'y avez pas accès.</p>
          <button onClick={() => router.back()} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  const age = client.dateNaissance ? calculateAge(client.dateNaissance) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser} />

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

            <span
              className={`badge ${
                client.serviceType === 'MASSOTHERAPIE' ? 'badge-massotherapie' : 'badge-esthetique'
              }`}
            >
              {client.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
            </span>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-spa-rose-500" />
              <div>
                <p className="text-sm text-gray-500">Téléphone cellulaire</p>
                <p className="font-medium">{client.telCellulaire}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-spa-rose-500" />
              <div>
                <p className="text-sm text-gray-500">Courriel</p>
                <p className="font-medium">{client.courriel}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-spa-rose-500" />
              <div>
                <p className="text-sm text-gray-500">Adresse</p>
                <p className="font-medium">
                  {client.adresse}, {client.ville} {client.codePostal}
                </p>
              </div>
            </div>
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'info'
                ? 'bg-spa-rose-500 text-white shadow-soft'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Informations médicales</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'notes'
                ? 'bg-spa-rose-500 text-white shadow-soft'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Notes de traitement</span>
              {notes.length > 0 && (
                <span className="px-2 py-0.5 bg-spa-rose-100 text-spa-rose-700 rounded-full text-xs">
                  {notes.length}
                </span>
              )}
            </div>
          </button>
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
                  {/* Section: Consultation */}
                  <div className="bg-gradient-to-r from-spa-menthe-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-menthe-500 rounded-full"></span>
                      Consultation
                    </h3>
                    <div className="space-y-4">
                      {client.raisonConsultation && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Raison de consultation</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.raisonConsultation}</p>
                        </div>
                      )}
                      {client.assuranceCouvert !== null && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Assurance</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${client.assuranceCouvert ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {client.assuranceCouvert ? 'Couvert par assurance' : 'Non couvert'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Historique médical */}
                  <div className="bg-gradient-to-r from-spa-rose-50 to-spa-beige-50 p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-spa-rose-500 rounded-full"></span>
                      Historique médical
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {client.diagnosticMedical && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Diagnostic médical</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.diagnosticMedicalDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.accidents && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Accidents</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.accidentsDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.operationsChirurgicales && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Opérations chirurgicales</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.operationsChirurgicalesDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.traitementsActuels && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Traitements actuels</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.traitementsActuels}</p>
                        </div>
                      )}
                      {client.medicaments && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Médicaments</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.medicamentsDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.allergies && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Allergies</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.allergiesDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.ortheses && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Orthèses</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.orthesesDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.problemesCardiaques && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Problèmes cardiaques</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.problemesCardiaquesDetails || 'Oui'}</p>
                        </div>
                      )}
                      {client.maladiesGraves && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Maladies graves</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg">{client.maladiesGravesDetails || 'Oui'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section: Zones de douleur */}
                  {client.zonesDouleur && client.zonesDouleur.length > 0 && (
                    <div className="bg-gradient-to-r from-spa-lavande-50 to-spa-beige-50 p-6 rounded-xl">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 bg-spa-lavande-500 rounded-full"></span>
                        Zones de douleur
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {client.zonesDouleur.map((zone: string) => (
                          <span
                            key={zone}
                            className="px-4 py-2 bg-spa-rose-100 text-spa-rose-700 rounded-full text-sm font-medium"
                          >
                            {zone}
                          </span>
                        ))}
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
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Raideurs</span>
                      )}
                      {client.arthrose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Arthrose</span>
                      )}
                      {client.hernieDiscale && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hernie discale</span>
                      )}
                      {client.oedeme && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Œdème</span>
                      )}
                      {client.tendinite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Tendinite</span>
                      )}
                      {client.mauxDeTete && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Maux de tête</span>
                      )}
                      {client.flatulence && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Flatulence</span>
                      )}
                      {client.troublesCirculatoires && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Troubles circulatoires</span>
                      )}
                      {client.hypothyroidie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hypothyroïdie</span>
                      )}
                      {client.diabete && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Diabète</span>
                      )}
                      {client.stresse && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Stressé</span>
                      )}
                      {client.premenopause && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Préménopause</span>
                      )}
                      {client.douleurMusculaire && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Douleur musculaire</span>
                      )}
                      {client.fibromyalgie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Fibromyalgie</span>
                      )}
                      {client.rhumatisme && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Rhumatisme</span>
                      )}
                      {client.sciatique && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Sciatique</span>
                      )}
                      {client.bursite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Bursite</span>
                      )}
                      {client.migraine && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Migraine</span>
                      )}
                      {client.diarrhee && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Diarrhée</span>
                      )}
                      {client.phlebite && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Phlébite</span>
                      )}
                      {client.hypertension && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hypertension</span>
                      )}
                      {client.hypoglycemie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hypoglycémie</span>
                      )}
                      {client.burnOut && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Burn-out</span>
                      )}
                      {client.menopause && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Ménopause</span>
                      )}
                      {client.inflammationAigue && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Inflammation aiguë</span>
                      )}
                      {client.arteriosclerose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Artériosclérose</span>
                      )}
                      {client.osteoporose && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Ostéoporose</span>
                      )}
                      {client.mauxDeDos && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Maux de dos</span>
                      )}
                      {client.fatigueDesJambes && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Fatigue des jambes</span>
                      )}
                      {client.troublesDigestifs && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Troubles digestifs</span>
                      )}
                      {client.constipation && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Constipation</span>
                      )}
                      {client.hyperthyroidie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hyperthyroïdie</span>
                      )}
                      {client.hypotension && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Hypotension</span>
                      )}
                      {client.insomnie && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Insomnie</span>
                      )}
                      {client.depressionNerveuse && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ Dépression nerveuse</span>
                      )}
                      {client.autres && (
                        <span className="px-3 py-2 bg-white rounded-lg text-sm text-gray-700 border border-gray-200">✓ {client.autres}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* État de la peau */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">État de la peau</p>
                      <p className="font-medium text-gray-800">{client.etatPeau || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sensibilité cutanée</p>
                      <p className="font-medium text-gray-800">{client.sensibiliteCutanee || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fumeur</p>
                      <p className="font-medium text-gray-800">{client.fumeur || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveau de stress</p>
                      <p className="font-medium text-gray-800">{client.niveauStress || '-'}</p>
                    </div>
                  </div>

                  {/* Routine de soins */}
                  {client.routineSoins && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Routine de soins</h3>
                      <p className="text-gray-600 bg-spa-beige-50 p-4 rounded-xl">
                        {client.routineSoins}
                      </p>
                    </div>
                  )}

                  {/* Préférences */}
                  {client.preferencePeau && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Préférences</h3>
                      <p className="text-gray-600 bg-spa-beige-50 p-4 rounded-xl">
                        {client.preferencePeau}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Formulaire d'ajout de note */}
              <AddNoteForm clientId={clientId} />

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
    </div>
  );
}
