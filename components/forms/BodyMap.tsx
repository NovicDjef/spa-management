'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface BodyMapProps {
  selectedZones: string[];
  onZonesChange: (zones: string[]) => void;
}

const BODY_ZONES = [
  { id: 'tete', label: 'Tête', x: 50, y: 10 },
  { id: 'cou', label: 'Cou', x: 50, y: 18 },
  { id: 'epaule-gauche', label: 'Épaule G', x: 30, y: 25 },
  { id: 'epaule-droite', label: 'Épaule D', x: 70, y: 25 },
  { id: 'bras-gauche', label: 'Bras G', x: 20, y: 35 },
  { id: 'bras-droit', label: 'Bras D', x: 80, y: 35 },
  { id: 'dos-haut', label: 'Haut du dos', x: 50, y: 30 },
  { id: 'dos-milieu', label: 'Milieu du dos', x: 50, y: 40 },
  { id: 'dos-bas', label: 'Bas du dos', x: 50, y: 50 },
  { id: 'poitrine', label: 'Poitrine', x: 50, y: 35 },
  { id: 'abdomen', label: 'Abdomen', x: 50, y: 45 },
  { id: 'hanche-gauche', label: 'Hanche G', x: 40, y: 55 },
  { id: 'hanche-droite', label: 'Hanche D', x: 60, y: 55 },
  { id: 'cuisse-gauche', label: 'Cuisse G', x: 40, y: 65 },
  { id: 'cuisse-droite', label: 'Cuisse D', x: 60, y: 65 },
  { id: 'genou-gauche', label: 'Genou G', x: 40, y: 75 },
  { id: 'genou-droit', label: 'Genou D', x: 60, y: 75 },
  { id: 'mollet-gauche', label: 'Mollet G', x: 40, y: 85 },
  { id: 'mollet-droit', label: 'Mollet D', x: 60, y: 85 },
  { id: 'pied-gauche', label: 'Pied G', x: 40, y: 95 },
  { id: 'pied-droit', label: 'Pied D', x: 60, y: 95 },
];

export function BodyMap({ selectedZones, onZonesChange }: BodyMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      onZonesChange(selectedZones.filter((z) => z !== zoneId));
    } else {
      onZonesChange([...selectedZones, zoneId]);
    }
  };

  return (
    <div className="card-spa">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Indiquez les zones de douleur
      </h3>
      <p className="text-sm text-gray-600 mb-6">
        Cliquez sur les zones du corps où vous ressentez de la douleur ou de l'inconfort
      </p>

      {/* Carte du corps */}
      <div className="relative w-full max-w-md mx-auto bg-gradient-to-b from-spa-beige-50 to-spa-beige-100 rounded-2xl p-8 border-2 border-spa-beige-200">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-auto"
          style={{ minHeight: '400px' }}
        >
          {/* Corps simplifié */}
          <g className="body-outline" stroke="#d7cdbf" strokeWidth="0.5" fill="none">
            {/* Tête */}
            <circle cx="50" cy="10" r="5" />
            {/* Cou */}
            <line x1="50" y1="15" x2="50" y2="20" />
            {/* Épaules */}
            <line x1="35" y1="22" x2="65" y2="22" />
            {/* Bras */}
            <line x1="35" y1="22" x2="25" y2="45" />
            <line x1="65" y1="22" x2="75" y2="45" />
            {/* Corps */}
            <line x1="45" y1="22" x2="45" y2="55" />
            <line x1="55" y1="22" x2="55" y2="55" />
            {/* Hanches */}
            <line x1="45" y1="55" x2="40" y2="58" />
            <line x1="55" y1="55" x2="60" y2="58" />
            {/* Jambes */}
            <line x1="40" y1="58" x2="40" y2="95" />
            <line x1="60" y1="58" x2="60" y2="95" />
          </g>

          {/* Zones cliquables */}
          {BODY_ZONES.map((zone) => {
            const isSelected = selectedZones.includes(zone.id);
            const isHovered = hoveredZone === zone.id;

            return (
              <g key={zone.id}>
                <motion.circle
                  cx={zone.x}
                  cy={zone.y}
                  r={isSelected || isHovered ? 4 : 3}
                  fill={isSelected ? '#e24965' : isHovered ? '#f4a8b4' : '#c2b4a0'}
                  className="cursor-pointer"
                  onClick={() => toggleZone(zone.id)}
                  onMouseEnter={() => setHoveredZone(zone.id)}
                  onMouseLeave={() => setHoveredZone(null)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                />
                {(isSelected || isHovered) && (
                  <motion.text
                    x={zone.x}
                    y={zone.y - 6}
                    textAnchor="middle"
                    fontSize="3"
                    fill="#693da7"
                    fontWeight="bold"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {zone.label}
                  </motion.text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Zones sélectionnées */}
      {selectedZones.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          <p className="text-sm font-medium text-gray-700 mb-3">
            Zones sélectionnées ({selectedZones.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedZones.map((zoneId) => {
              const zone = BODY_ZONES.find((z) => z.id === zoneId);
              return (
                <motion.button
                  key={zoneId}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={() => toggleZone(zoneId)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-spa-rose-100 text-spa-rose-700 rounded-full text-sm hover:bg-spa-rose-200 transition-colors"
                >
                  {zone?.label}
                  <span className="text-spa-rose-500">✕</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Légende */}
      <div className="mt-6 p-4 bg-spa-beige-50 rounded-xl">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span className="text-gray-600">Non sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-spa-rose-500"></div>
            <span className="text-gray-600">Sélectionné</span>
          </div>
        </div>
      </div>
    </div>
  );
}
