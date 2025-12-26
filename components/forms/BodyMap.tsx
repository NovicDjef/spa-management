'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { RotateCcw, RotateCw } from 'lucide-react';

interface BodyMapProps {
  selectedZones: string[];
  onZonesChange: (zones: string[]) => void;
}

// Zones du corps avec coordonnées pour vue AVANT
const BODY_ZONES_FRONT = [
  { id: 'tete', label: 'Tête', area: { cx: 50, cy: 12, rx: 8, ry: 6 } },
  { id: 'cou', label: 'Cou', area: { cx: 50, cy: 20, rx: 4, ry: 3 } },
  { id: 'epaule-gauche', label: 'Épaule G', area: { cx: 40, cy: 24, rx: 5, ry: 4 } },
  { id: 'epaule-droite', label: 'Épaule D', area: { cx: 60, cy: 24, rx: 5, ry: 4 } },
  { id: 'bras-gauche', label: 'Bras G', area: { cx: 30, cy: 32, rx: 4, ry: 7 } },
  { id: 'bras-droit', label: 'Bras D', area: { cx: 70, cy: 32, rx: 4, ry: 7 } },
  { id: 'coude-gauche', label: 'Coude G', area: { cx: 28, cy: 42, rx: 3.5, ry: 3 } },
  { id: 'coude-droit', label: 'Coude D', area: { cx: 72, cy: 42, rx: 3.5, ry: 3 } },
  { id: 'avant-bras-gauche', label: 'Avant-bras G', area: { cx: 25, cy: 53, rx: 3, ry: 8 } },
  { id: 'avant-bras-droit', label: 'Avant-bras D', area: { cx: 75, cy: 53, rx: 3, ry: 8 } },
  { id: 'main-gauche', label: 'Main G', area: { cx: 22, cy: 65, rx: 2, ry: 2 } },
  { id: 'main-droite', label: 'Main D', area: { cx: 78, cy: 65, rx: 2, ry: 2 } },
  { id: 'poitrine', label: 'Poitrine', area: { cx: 50, cy: 28, rx: 8, ry: 5 } },
  { id: 'abdomen', label: 'Abdomen', area: { cx: 50, cy: 40, rx: 7, ry: 6 } },
  { id: 'bassin', label: 'Bassin', area: { cx: 50, cy: 50, rx: 8, ry: 4 } },
  { id: 'cuisse-gauche', label: 'Cuisse G', area: { cx: 42, cy: 65, rx: 4, ry: 10 } },
  { id: 'cuisse-droite', label: 'Cuisse D', area: { cx: 58, cy: 65, rx: 4, ry: 10 } },
  { id: 'genou-gauche', label: 'Genou G', area: { cx: 42, cy: 80, rx: 3, ry: 3 } },
  { id: 'genou-droit', label: 'Genou D', area: { cx: 58, cy: 80, rx: 3, ry: 3 } },
  { id: 'mollet-gauche', label: 'Mollet G', area: { cx: 42, cy: 90, rx: 3, ry: 6 } },
  { id: 'mollet-droit', label: 'Mollet D', area: { cx: 58, cy: 90, rx: 3, ry: 6 } },
  { id: 'pied-gauche', label: 'Pied G', area: { cx: 42, cy: 98, rx: 3, ry: 2 } },
  { id: 'pied-droit', label: 'Pied D', area: { cx: 58, cy: 98, rx: 3, ry: 2 } },
];

// Zones du corps avec coordonnées pour vue ARRIÈRE
const BODY_ZONES_BACK = [
  { id: 'tete', label: 'Tête', area: { cx: 50, cy: 12, rx: 8, ry: 6 } },
  { id: 'cou', label: 'Cou', area: { cx: 50, cy: 20, rx: 4, ry: 3 } },
  { id: 'epaule-gauche', label: 'Épaule G', area: { cx: 40, cy: 24, rx: 5, ry: 4 } },
  { id: 'epaule-droite', label: 'Épaule D', area: { cx: 60, cy: 24, rx: 5, ry: 4 } },
  { id: 'dos-haut', label: 'Haut du dos', area: { cx: 50, cy: 30, rx: 8, ry: 5 } },
  { id: 'dos-milieu', label: 'Milieu du dos', area: { cx: 50, cy: 40, rx: 8, ry: 6 } },
  { id: 'dos-bas', label: 'Bas du dos', area: { cx: 50, cy: 50, rx: 8, ry: 4 } },
  { id: 'hanche-gauche', label: 'Hanche G', area: { cx: 40, cy: 55, rx: 3.5, ry: 3.5 } },
  { id: 'hanche-droite', label: 'Hanche D', area: { cx: 60, cy: 55, rx: 3.5, ry: 3.5 } },
  { id: 'fessier-gauche', label: 'Fessier G', area: { cx: 46, cy: 60, rx: 4, ry: 4 } },
  { id: 'fessier-droit', label: 'Fessier D', area: { cx: 54, cy: 60, rx: 4, ry: 4 } },
  { id: 'cuisse-gauche', label: 'Cuisse G', area: { cx: 42, cy: 70, rx: 4, ry: 10 } },
  { id: 'cuisse-droite', label: 'Cuisse D', area: { cx: 58, cy: 70, rx: 4, ry: 10 } },
  { id: 'genou-gauche', label: 'Genou G', area: { cx: 42, cy: 85, rx: 3, ry: 3 } },
  { id: 'genou-droit', label: 'Genou D', area: { cx: 58, cy: 85, rx: 3, ry: 3 } },
  { id: 'mollet-gauche', label: 'Mollet G', area: { cx: 42, cy: 93, rx: 3, ry: 5 } },
  { id: 'mollet-droit', label: 'Mollet D', area: { cx: 58, cy: 93, rx: 3, ry: 5 } },
  { id: 'pied-gauche', label: 'Pied G', area: { cx: 42, cy: 98, rx: 3, ry: 2 } },
  { id: 'pied-droit', label: 'Pied D', area: { cx: 58, cy: 98, rx: 3, ry: 2 } },
];

export function BodyMap({ selectedZones, onZonesChange }: BodyMapProps) {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [view, setView] = useState<'front' | 'back'>('front');

  const toggleZone = (zoneId: string) => {
    if (selectedZones.includes(zoneId)) {
      onZonesChange(selectedZones.filter((z) => z !== zoneId));
    } else {
      onZonesChange([...selectedZones, zoneId]);
    }
  };

  const currentZones = view === 'front' ? BODY_ZONES_FRONT : BODY_ZONES_BACK;
  const allZones = [...BODY_ZONES_FRONT, ...BODY_ZONES_BACK.filter(z => !BODY_ZONES_FRONT.find(fz => fz.id === z.id))];

  // Silhouette SVG pour la vue avant
  const FrontSilhouette = () => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Tête */}
      <circle cx="50" cy="12" r="6" fill="#f0f0f0" stroke="#ccc" />
      {/* Cou */}
      <rect x="46" y="17" width="8" height="6" fill="#f0f0f0" stroke="#ccc" />
      {/* Torse */}
      <path d="M 40 24 L 60 24 L 60 50 L 40 50 Z" fill="#f0f0f0" stroke="#ccc" />
      {/* Bras */}
      <path d="M 30 28 L 20 35 L 20 50 L 30 48 Z" fill="#f0f0f0" stroke="#ccc" />
      <path d="M 70 28 L 80 35 L 80 50 L 70 48 Z" fill="#f0f0f0" stroke="#ccc" />
      {/* Jambes */}
      <path d="M 45 50 L 45 70 L 35 70 L 35 90 L 45 90 Z" fill="#f0f0f0" stroke="#ccc" />
      <path d="M 55 50 L 55 70 L 65 70 L 65 90 L 55 90 Z" fill="#f0f0f0" stroke="#ccc" />
    </svg>
  );

  // Silhouette SVG pour la vue arrière
  const BackSilhouette = () => (
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      {/* Tête */}
      <circle cx="50" cy="12" r="6" fill="#f0f0f0" stroke="#ccc" />
      {/* Cou */}
      <rect x="46" y="17" width="8" height="6" fill="#f0f0f0" stroke="#ccc" />
      {/* Dos */}
      <path d="M 40 24 L 60 24 L 60 50 L 40 50 Z" fill="#f0f0f0" stroke="#ccc" />
      {/* Bras */}
      <path d="M 30 28 L 20 35 L 20 50 L 30 48 Z" fill="#f0f0f0" stroke="#ccc" />
      <path d="M 70 28 L 80 35 L 80 50 L 70 48 Z" fill="#f0f0f0" stroke="#ccc" />
      {/* Jambes */}
      <path d="M 45 50 L 45 70 L 35 70 L 35 90 L 45 90 Z" fill="#f0f0f0" stroke="#ccc" />
      <path d="M 55 50 L 55 70 L 65 70 L 65 90 L 55 90 Z" fill="#f0f0f0" stroke="#ccc" />
    </svg>
  );

  return (
    <div className="card-spa">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Indiquez les zones de douleur
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Cliquez sur les zones du corps où vous ressentez de la douleur ou de l'inconfort
          </p>
        </div>

        <button
          onClick={() => setView(view === 'front' ? 'back' : 'front')}
          className="flex items-center gap-2 px-4 py-2 bg-spa-menthe-100 hover:bg-spa-menthe-200 text-spa-menthe-700 rounded-lg transition-colors text-sm font-medium"
          title={view === 'front' ? 'Voir la vue arrière' : 'Voir la vue avant'}
        >
          {view === 'front' ? (
            <>
              <RotateCw className="w-4 h-4" />
              Vue arrière
            </>
          ) : (
            <>
              <RotateCcw className="w-4 h-4" />
              Vue avant
            </>
          )}
        </button>
      </div>

      {/* Carte du corps */}
      <div className="relative w-full max-w-4xl mx-auto bg-gradient-to-b from-spa-beige-50 to-spa-beige-100 rounded-2xl p-8 border-2 border-spa-beige-200">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.3 }}
            style={{ perspective: '1000px' }}
          >
            <div className="w-full h-[400px] relative">
              {view === 'front' ? <FrontSilhouette /> : <BackSilhouette />}

              {/* Zones cliquables */}
              <svg
                viewBox="0 0 100 100"
                className="absolute top-0 left-0 w-full h-full"
              >
                {currentZones.map((zone) => {
                  const isSelected = selectedZones.includes(zone.id);
                  const isHovered = hoveredZone === zone.id;

                  return (
                    <g key={`${view}-${zone.id}`}>
                      {/* Zone cliquable (invisible) */}
                      <ellipse
                        cx={zone.area.cx}
                        cy={zone.area.cy}
                        rx={zone.area.rx * 1.5}
                        ry={zone.area.ry * 1.5}
                        fill="transparent"
                        className="cursor-pointer"
                        onClick={() => toggleZone(zone.id)}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                      />

                      {/* Zone visible */}
                      <motion.ellipse
                        cx={zone.area.cx}
                        cy={zone.area.cy}
                        rx={zone.area.rx}
                        ry={zone.area.ry}
                        fill={
                          isSelected
                            ? '#e24965'
                            : isHovered
                            ? '#f4a8b4'
                            : 'rgba(194, 180, 160, 0.3)'
                        }
                        stroke={
                          isSelected
                            ? '#c41e3a'
                            : isHovered
                            ? '#e24965'
                            : '#c2b4a0'
                        }
                        strokeWidth={isSelected || isHovered ? '0.5' : '0.2'}
                        className="cursor-pointer"
                        onClick={() => toggleZone(zone.id)}
                        onMouseEnter={() => setHoveredZone(zone.id)}
                        onMouseLeave={() => setHoveredZone(null)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                      />

                      {/* Label */}
                      {(isSelected || isHovered) && (
                        <motion.text
                          x={zone.area.cx}
                          y={zone.area.cy - zone.area.ry - 1}
                          textAnchor="middle"
                          fontSize="4"
                          fill="#1e293b"
                          fontWeight="bold"
                          className="pointer-events-none"
                          initial={{ opacity: 0, y: 2 }}
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
          </motion.div>
        </AnimatePresence>

        {/* Indicateur de vue */}
        <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
          {view === 'front' ? 'Vue avant' : 'Vue arrière'}
        </div>
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
              const zone = allZones.find((z) => z.id === zoneId);
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
        <div className="flex items-center gap-4 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400/30 border border-gray-400"></div>
            <span className="text-gray-600">Non sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-spa-rose-500"></div>
            <span className="text-gray-600">Sélectionné</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-spa-rose-300"></div>
            <span className="text-gray-600">Survol</span>
          </div>
        </div>
      </div>
    </div>
  );
}
