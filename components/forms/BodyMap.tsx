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
  { id: 'tete', label: 'Tête', path: 'M 50 5 Q 50 2 47 2 Q 45 2 45 5 Q 45 8 50 8 Q 55 8 55 5 Q 55 2 53 2 Q 50 2 50 5 Z', area: { cx: 50, cy: 6, rx: 5, ry: 3 } },
  { id: 'cou', label: 'Cou', path: 'M 47 8 L 47 12 L 53 12 L 53 8 Z', area: { cx: 50, cy: 10, rx: 3, ry: 2 } },
  { id: 'epaule-gauche', label: 'Épaule G', path: 'M 40 12 L 30 15 L 30 20 L 40 18 Z', area: { cx: 35, cy: 16, rx: 5, ry: 4 } },
  { id: 'epaule-droite', label: 'Épaule D', path: 'M 60 12 L 70 15 L 70 20 L 60 18 Z', area: { cx: 65, cy: 16, rx: 5, ry: 4 } },
  { id: 'bras-gauche', label: 'Bras G', path: 'M 30 20 L 20 25 L 20 50 L 30 48 Z', area: { cx: 25, cy: 35, rx: 5, ry: 15 } },
  { id: 'bras-droit', label: 'Bras D', path: 'M 70 20 L 80 25 L 80 50 L 70 48 Z', area: { cx: 75, cy: 35, rx: 5, ry: 15 } },
  { id: 'poitrine', label: 'Poitrine', path: 'M 45 18 L 45 32 L 55 32 L 55 18 Z', area: { cx: 50, cy: 25, rx: 5, ry: 7 } },
  { id: 'abdomen', label: 'Abdomen', path: 'M 45 32 L 45 48 L 55 48 L 55 32 Z', area: { cx: 50, cy: 40, rx: 5, ry: 8 } },
  { id: 'hanche-gauche', label: 'Hanche G', path: 'M 45 48 L 40 50 L 40 55 L 45 53 Z', area: { cx: 42.5, cy: 51.5, rx: 2.5, ry: 2.5 } },
  { id: 'hanche-droite', label: 'Hanche D', path: 'M 55 48 L 60 50 L 60 55 L 55 53 Z', area: { cx: 57.5, cy: 51.5, rx: 2.5, ry: 2.5 } },
  { id: 'cuisse-gauche', label: 'Cuisse G', path: 'M 40 55 L 38 58 L 38 75 L 40 73 Z', area: { cx: 39, cy: 65, rx: 1, ry: 10 } },
  { id: 'cuisse-droite', label: 'Cuisse D', path: 'M 60 55 L 62 58 L 62 75 L 60 73 Z', area: { cx: 61, cy: 65, rx: 1, ry: 10 } },
  { id: 'genou-gauche', label: 'Genou G', path: 'M 38 75 L 37 78 L 37 82 L 38 80 Z', area: { cx: 37.5, cy: 78.5, rx: 0.5, ry: 2 } },
  { id: 'genou-droit', label: 'Genou D', path: 'M 62 75 L 63 78 L 63 82 L 62 80 Z', area: { cx: 62.5, cy: 78.5, rx: 0.5, ry: 2 } },
  { id: 'mollet-gauche', label: 'Mollet G', path: 'M 37 82 L 36 85 L 36 92 L 37 90 Z', area: { cx: 36.5, cy: 87, rx: 0.5, ry: 5 } },
  { id: 'mollet-droit', label: 'Mollet D', path: 'M 63 82 L 64 85 L 64 92 L 63 90 Z', area: { cx: 63.5, cy: 87, rx: 0.5, ry: 5 } },
  { id: 'pied-gauche', label: 'Pied G', path: 'M 36 92 L 35 95 L 38 95 L 37 92 Z', area: { cx: 36.5, cy: 93.5, rx: 1.5, ry: 1.5 } },
  { id: 'pied-droit', label: 'Pied D', path: 'M 64 92 L 63 95 L 66 95 L 65 92 Z', area: { cx: 64.5, cy: 93.5, rx: 1.5, ry: 1.5 } },
];

// Zones du corps avec coordonnées pour vue ARRIÈRE
const BODY_ZONES_BACK = [
  { id: 'tete', label: 'Tête', path: 'M 50 5 Q 50 2 47 2 Q 45 2 45 5 Q 45 8 50 8 Q 55 8 55 5 Q 55 2 53 2 Q 50 2 50 5 Z', area: { cx: 50, cy: 6, rx: 5, ry: 3 } },
  { id: 'cou', label: 'Cou', path: 'M 47 8 L 47 12 L 53 12 L 53 8 Z', area: { cx: 50, cy: 10, rx: 3, ry: 2 } },
  { id: 'epaule-gauche', label: 'Épaule G', path: 'M 40 12 L 30 15 L 30 20 L 40 18 Z', area: { cx: 35, cy: 16, rx: 5, ry: 4 } },
  { id: 'epaule-droite', label: 'Épaule D', path: 'M 60 12 L 70 15 L 70 20 L 60 18 Z', area: { cx: 65, cy: 16, rx: 5, ry: 4 } },
  { id: 'bras-gauche', label: 'Bras G', path: 'M 30 20 L 20 25 L 20 50 L 30 48 Z', area: { cx: 25, cy: 35, rx: 5, ry: 15 } },
  { id: 'bras-droit', label: 'Bras D', path: 'M 70 20 L 80 25 L 80 50 L 70 48 Z', area: { cx: 75, cy: 35, rx: 5, ry: 15 } },
  { id: 'dos-haut', label: 'Haut du dos', path: 'M 45 18 L 45 28 L 55 28 L 55 18 Z', area: { cx: 50, cy: 23, rx: 5, ry: 5 } },
  { id: 'dos-milieu', label: 'Milieu du dos', path: 'M 45 28 L 45 40 L 55 40 L 55 28 Z', area: { cx: 50, cy: 34, rx: 5, ry: 6 } },
  { id: 'dos-bas', label: 'Bas du dos', path: 'M 45 40 L 45 48 L 55 48 L 55 40 Z', area: { cx: 50, cy: 44, rx: 5, ry: 4 } },
  { id: 'hanche-gauche', label: 'Hanche G', path: 'M 45 48 L 40 50 L 40 55 L 45 53 Z', area: { cx: 42.5, cy: 51.5, rx: 2.5, ry: 2.5 } },
  { id: 'hanche-droite', label: 'Hanche D', path: 'M 55 48 L 60 50 L 60 55 L 55 53 Z', area: { cx: 57.5, cy: 51.5, rx: 2.5, ry: 2.5 } },
  { id: 'cuisse-gauche', label: 'Cuisse G', path: 'M 40 55 L 38 58 L 38 75 L 40 73 Z', area: { cx: 39, cy: 65, rx: 1, ry: 10 } },
  { id: 'cuisse-droite', label: 'Cuisse D', path: 'M 60 55 L 62 58 L 62 75 L 60 73 Z', area: { cx: 61, cy: 65, rx: 1, ry: 10 } },
  { id: 'genou-gauche', label: 'Genou G', path: 'M 38 75 L 37 78 L 37 82 L 38 80 Z', area: { cx: 37.5, cy: 78.5, rx: 0.5, ry: 2 } },
  { id: 'genou-droit', label: 'Genou D', path: 'M 62 75 L 63 78 L 63 82 L 62 80 Z', area: { cx: 62.5, cy: 78.5, rx: 0.5, ry: 2 } },
  { id: 'mollet-gauche', label: 'Mollet G', path: 'M 37 82 L 36 85 L 36 92 L 37 90 Z', area: { cx: 36.5, cy: 87, rx: 0.5, ry: 5 } },
  { id: 'mollet-droit', label: 'Mollet D', path: 'M 63 82 L 64 85 L 64 92 L 63 90 Z', area: { cx: 63.5, cy: 87, rx: 0.5, ry: 5 } },
  { id: 'pied-gauche', label: 'Pied G', path: 'M 36 92 L 35 95 L 38 95 L 37 92 Z', area: { cx: 36.5, cy: 93.5, rx: 1.5, ry: 1.5 } },
  { id: 'pied-droit', label: 'Pied D', path: 'M 64 92 L 63 95 L 66 95 L 65 92 Z', area: { cx: 64.5, cy: 93.5, rx: 1.5, ry: 1.5 } },
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

  // Fonction pour afficher l'image du corps humain (AGRANDIE)
  const renderBodySilhouette = (isBack: boolean) => {
    const imagePath = isBack ? '/human-arrier.png' : '/human-avant.png';

    return (
      <image
        href={imagePath}
        x="-50"
        y="-50"
        width="200"
        height="200"
        preserveAspectRatio="xMidYMid meet"
        opacity="0.95"
        className="body-silhouette-image"
      />
    );
  };

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
        
        {/* Bouton pour changer de vue */}
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
            <svg
              viewBox="0 0 100 100"
              className="w-full h-auto"
              style={{ minHeight: '400px', maxHeight: '1200px' }}
            >
              {/* Silhouette du corps */}
              {renderBodySilhouette(view === 'back')}

              {/* Zones cliquables */}
              {currentZones.map((zone) => {
                const isSelected = selectedZones.includes(zone.id);
                const isHovered = hoveredZone === zone.id;

                return (
                  <g key={`${view}-${zone.id}`}>
                    {/* Zone cliquable (ellipse invisible plus grande pour faciliter le clic) */}
                    <ellipse
                      cx={zone.area.cx}
                      cy={zone.area.cy}
                      rx={zone.area.rx * 2}
                      ry={zone.area.ry * 2}
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
                      rx={zone.area.rx * 1.2}
                      ry={zone.area.ry * 1.2}
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
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    />
                    
                    {/* Label */}
                    {(isSelected || isHovered) && (
                      <motion.text
                        x={zone.area.cx}
                        y={zone.area.cy - zone.area.ry - 1}
                        textAnchor="middle"
                        fontSize="4.5"
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
