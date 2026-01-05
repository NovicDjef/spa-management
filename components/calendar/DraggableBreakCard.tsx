'use client';

import React from 'react';
import { Coffee, GripVertical } from 'lucide-react';

interface Break {
  id: string;
  professionalId: string;
  dayOfWeek?: number | null;
  startTime: string;
  endTime: string;
  label?: string;
  isActive?: boolean;
}

interface DraggableBreakCardProps {
  breakItem: Break;
  position: { top: number; height: number };
  onContextMenu: (breakItem: Break, position: { x: number; y: number }) => void;
  onDragStart?: (breakItem: Break) => void;
  onDragEnd?: () => void;
}

/**
 * Carte de pause affichée dans le calendrier avec support du drag & drop
 */
export default function DraggableBreakCard({
  breakItem,
  position,
  onContextMenu,
  onDragStart,
  onDragEnd,
}: DraggableBreakCardProps) {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(breakItem, { x: e.clientX, y: e.clientY });
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    // Stocker les informations de la pause dans le dataTransfer
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('breakId', breakItem.id);
    e.dataTransfer.setData('type', 'break');
    if (onDragStart) {
      onDragStart(breakItem);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.stopPropagation();
    if (onDragEnd) {
      onDragEnd();
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className="absolute inset-0 bg-orange-500 border-l-4 border-orange-700 rounded-lg shadow-lg p-2 cursor-move hover:bg-orange-600 hover:shadow-xl transition-all group"
      onContextMenu={handleContextMenu}
      style={{
        minHeight: '40px',
      }}
    >
      {/* Grip indicator */}
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="w-4 h-4 text-white" />
      </div>

      <div className="flex flex-col h-full justify-center items-center text-white text-xs">
        {/* Icône pause */}
        <div className="flex items-center gap-2 mb-1">
          <Coffee className="w-4 h-4" />
          <span className="font-bold text-sm">
            {breakItem.label || 'PAUSE'}
          </span>
        </div>

        {/* Horaire */}
        <div className="text-white/90 text-xs font-medium">
          {breakItem.startTime} - {breakItem.endTime}
        </div>

        {/* Récurrence */}
        {breakItem.dayOfWeek === null && (
          <div className="text-white/75 text-[10px] mt-1">
            Tous les jours
          </div>
        )}
      </div>
    </div>
  );
}
