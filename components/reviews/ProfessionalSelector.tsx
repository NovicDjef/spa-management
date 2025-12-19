'use client';

import { useGetPublicProfessionalsQuery } from '@/lib/redux/services/api';
import { Loader2 } from 'lucide-react';

interface ProfessionalSelectorProps {
  value: string;
  onChange: (id: string) => void;
  serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE';
}

export function ProfessionalSelector({
  value,
  onChange,
  serviceType,
}: ProfessionalSelectorProps) {
  const { data, isLoading } = useGetPublicProfessionalsQuery(
    serviceType ? { serviceType } : undefined
  );

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 bg-spa-beige-50 rounded-xl">
        <Loader2 className="w-5 h-5 animate-spin text-spa-turquoise-500" />
        <span className="text-gray-600">Chargement des professionnels...</span>
      </div>
    );
  }

  const professionals = data?.professionals || [];

  // Grouper par rôle
  const massotherapeutes = professionals.filter(
    (p) => p.role === 'MASSOTHERAPEUTE'
  );
  const estheticiennes = professionals.filter(
    (p) => p.role === 'ESTHETICIENNE'
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="input-spa"
      required
    >
      <option value="">Sélectionnez un professionnel</option>

      {massotherapeutes.length > 0 && (
        <optgroup label="Massothérapeutes">
          {massotherapeutes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </optgroup>
      )}

      {estheticiennes.length > 0 && (
        <optgroup label="Esthéticiennes">
          {estheticiennes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.prenom} {p.nom}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
