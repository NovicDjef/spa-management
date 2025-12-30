'use client';

import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Hand, Wand2, Bell, CheckCircle2, UserCheck, Eye, FileText } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { ReceiptModal } from '@/components/receipts/ReceiptModal';

interface ClientCardProps {
  client: {
    id: string;
    nom: string;
    prenom: string;
    telCellulaire: string;
    courriel: string;
    dateNaissance: string;
    serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
    createdAt: string;
    assignedAt?: string;
    assignedBy?: {
      id: string;
      nom: string;
      prenom: string;
      role: 'ADMIN' | 'SECRETAIRE';
    } | null;
    assignedTo?: {
      id: string;
      nom: string;
      prenom: string;
      role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
    } | null;
  };
  showActions?: boolean;
  onAssign?: (clientId: string) => void;
  isNewAssignment?: boolean;
  currentUser?: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
    numeroOrdre?: string;
  };
  showTherapistActions?: boolean; // Afficher les actions pour les massothérapeutes
  disableLink?: boolean; // Désactiver le lien vers le dossier du client (pour les secrétaires)
}

export function ClientCard({
  client,
  showActions = false,
  onAssign,
  isNewAssignment = false,
  currentUser,
  showTherapistActions = false,
  disableLink = false
}: ClientCardProps) {
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Wrapper conditionnel pour le lien
  const Wrapper: any = disableLink ? 'div' : Link;
  const wrapperProps: any = disableLink ? {} : { href: `/professionnel/clients/${client.id}` };

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

  const age = client.dateNaissance ? calculateAge(client.dateNaissance) : null;
  const isAssigned = !!(client.assignedAt && client.assignedTo);

  const canSendReceipt = currentUser?.role === 'MASSOTHERAPEUTE' && client.serviceType === 'MASSOTHERAPIE';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className={`card-spa p-6 cursor-pointer relative overflow-hidden ${
        isNewAssignment ? 'ring-2 ring-orange-500 ring-offset-2' : ''
      }`}
    >
      {/* Badge pour nouvelle assignation */}
      {isNewAssignment && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-bl-xl shadow-lg flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wide">Nouveau RDV</span>
        </div>
      )}

      <Wrapper {...wrapperProps}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              client.serviceType === 'MASSOTHERAPIE'
                ? 'bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200'
                : 'bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200'
            }`}>
              {client.serviceType === 'MASSOTHERAPIE' ? (
                <Hand className={`w-6 h-6 text-spa-menthe-600`} />
              ) : (
                <Wand2 className={`w-6 h-6 text-spa-lavande-600`} />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {client.prenom} {client.nom}
              </h3>
              {age && (
                <p className="text-sm text-gray-500">{age} ans</p>
              )}
            </div>
          </div>

          <span
            className={`badge ${
              client.serviceType === 'MASSOTHERAPIE'
                ? 'badge-massotherapie'
                : 'badge-esthetique'
            }`}
          >
            {client.serviceType === 'MASSOTHERAPIE' ? 'Massothérapie' : 'Esthétique'}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Phone className="w-4 h-4 text-spa-turquoise-500" />
            <span>{client.telCellulaire}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4 text-spa-turquoise-500" />
            <span className="truncate">{client.courriel}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 text-spa-turquoise-500" />
            <span>
              Inscrit le {new Date(client.createdAt).toLocaleDateString('fr-CA')}
            </span>
          </div>
        </div>

        {/* Statut d'assignation */}
        {isAssigned && (
          <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 text-xs">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-semibold text-green-700">Déjà assigné</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>
                      À: <span className="font-medium">{client.assignedTo?.prenom} {client.assignedTo?.nom}</span>
                    </span>
                  </div>
                  {client.assignedBy && (
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        Par: <span className="font-medium">{client.assignedBy.prenom} {client.assignedBy.nom}</span>
                        <span className="text-gray-500 ml-1">
                          ({client.assignedBy.role === 'ADMIN' ? 'Admin' : 'Secrétaire'})
                        </span>
                      </span>
                    </div>
                  )}
                  {client.assignedAt && (
                    <div className="text-gray-600 mt-1">
                      Le {new Date(client.assignedAt).toLocaleDateString('fr-CA')} à{' '}
                      {new Date(client.assignedAt).toLocaleTimeString('fr-CA', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions pour Admin/Secrétaire */}
        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAssign?.(client.id);
              }}
              className="text-sm font-medium text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors"
            >
              {isAssigned ? 'Gérer l\'assignation →' : 'Assigner à un professionnel →'}
            </button>
          </div>
        )}

        {/* Actions pour Massothérapeutes */}
        {showTherapistActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Link
                href={`/professionnel/clients/${client.id}`}
                onClick={(e) => e.stopPropagation()}
                className="btn-outline text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <Eye className="w-4 h-4" />
                <span>Voir</span>
              </Link>
              <Link
                href={`/professionnel/clients/${client.id}?tab=notes`}
                onClick={(e) => e.stopPropagation()}
                className="btn-outline text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Note</span>
              </Link>
              {canSendReceipt && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowReceiptModal(true);
                  }}
                  className="btn-primary text-xs sm:text-sm py-2 flex items-center justify-center gap-1.5 col-span-2 sm:col-span-1 bg-gradient-to-r from-spa-turquoise-500 to-spa-menthe-500"
                >
                  <FileText className="w-4 h-4" />
                  <span>Reçu</span>
                </button>
              )}
            </div>
          </div>
        )}
      </Wrapper>

      {/* Modal de reçu */}
      {currentUser && canSendReceipt && (
        <ReceiptModal
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
          clientId={client.id}
          clientName={`${client.prenom} ${client.nom}`}
          therapistName={`${currentUser.prenom} ${currentUser.nom}`}
          therapistOrderNumber={currentUser.numeroOrdre}
          skipConfirmation={true}
        />
      )}
    </motion.div>
  );
}
