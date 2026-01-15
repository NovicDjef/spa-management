'use client';

import React from 'react';

/**
 * Légende des couleurs par statut de réservation
 */
export default function StatusLegend() {
  const statuses = [
    { color: 'bg-yellow-500', label: 'En attente', status: 'PENDING' },
    { color: 'bg-blue-500', label: 'Confirmé', status: 'CONFIRMED' },
    { color: 'bg-purple-500', label: 'Client arrivé', status: 'CLIENT_ARRIVED' },
    { color: 'bg-green-500', label: 'En cours', status: 'IN_PROGRESS' },
    { color: 'bg-gray-500', label: 'Terminé', status: 'COMPLETED' },
    { color: 'bg-orange-500', label: 'Absent', status: 'NO_SHOW' },
    { color: 'bg-red-500', label: 'Annulé', status: 'CANCELLED' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Légende des statuts</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statuses.map((status) => (
          <div key={status.status} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${status.color} flex-shrink-0`}></div>
            <span className="text-xs text-gray-700">{status.label}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-3 italic">
        💡 Survolez une réservation avec la souris pour voir les détails complets
      </p>
    </div>
  );
}
