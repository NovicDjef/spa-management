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
                <div className="space-y-6">
                  {/* Raison de consultation */}
                  {client.raisonConsultation && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Raison de consultation</h3>
                      <p className="text-gray-600 bg-spa-beige-50 p-4 rounded-xl">
                        {client.raisonConsultation}
                      </p>
                    </div>
                  )}

                  {/* Diagnostic médical */}
                  {client.diagnosticMedical && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Diagnostic médical</h3>
                      <p className="text-gray-600 bg-spa-beige-50 p-4 rounded-xl">
                        {client.diagnosticMedicalDetails || 'Non'}
                      </p>
                    </div>
                  )}

                  {/* Zones de douleur */}
                  {client.zonesDouleur && client.zonesDouleur.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Zones de douleur</h3>
                      <div className="flex flex-wrap gap-2">
                        {client.zonesDouleur.map((zone: string) => (
                          <span
                            key={zone}
                            className="px-3 py-1 bg-spa-rose-100 text-spa-rose-700 rounded-full text-sm"
                          >
                            {zone}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Informations supplémentaires */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-500">Médicaments</p>
                      <p className="font-medium text-gray-800">
                        {client.medicamentsDetails || 'Non'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Allergies</p>
                      <p className="font-medium text-gray-800">
                        {client.allergiesDetails || 'Non'}
                      </p>
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
