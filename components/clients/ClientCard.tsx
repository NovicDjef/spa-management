'use client';

import { motion } from 'framer-motion';
import { User, Phone, Mail, Calendar, Heart, Sparkles } from 'lucide-react';
import Link from 'next/link';

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
  };
  showActions?: boolean;
  onAssign?: (clientId: string) => void;
}

export function ClientCard({ client, showActions = false, onAssign }: ClientCardProps) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="card-spa p-6 cursor-pointer"
    >
      <Link href={`/professionnel/clients/${client.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              client.serviceType === 'MASSOTHERAPIE'
                ? 'bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200'
                : 'bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200'
            }`}>
              {client.serviceType === 'MASSOTHERAPIE' ? (
                <Heart className={`w-6 h-6 text-spa-menthe-600`} />
              ) : (
                <Sparkles className={`w-6 h-6 text-spa-lavande-600`} />
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

        {showActions && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAssign?.(client.id);
              }}
              className="text-sm text-spa-turquoise-600 hover:text-spa-turquoise-700 font-medium transition-colors"
            >
              Assigner à un professionnel →
            </button>
          </div>
        )}
      </Link>
    </motion.div>
  );
}
