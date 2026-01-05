# Fonctionnalité de Déblocage et Suppression de Pauses

## Résumé

Cette fonctionnalité permet aux administrateurs de débloquer des journées/périodes bloquées et de supprimer des pauses directement depuis le menu contextuel du calendrier.

---

## Fonctionnalités Implémentées

### 1. Débloquer une Journée ou Période Bloquée

Quand un admin fait un clic droit sur un créneau bloqué:

```
╔═══════════════════════════════════╗
║  Clic droit sur créneau bloqué   ║
╠═══════════════════════════════════╣
║  📅 Nouvelle réservation         ║
║  ☕ Ajouter une pause             ║
║  ────────────────────────────     ║
║  🔓 Débloquer                     ║ ← NOUVEAU
║     Retirer: Congé                ║
╚═══════════════════════════════════╝
```

**Caractéristiques:**
- ✅ Détection automatique des blocages existants
- ✅ Affichage de la raison du blocage dans le menu
- ✅ Suppression du blocage en un clic
- ✅ Rafraîchissement automatique du calendrier
- ✅ Notification toast de succès/erreur

---

### 2. Supprimer une Pause

Quand un admin fait un clic droit sur un créneau avec pause:

```
╔═══════════════════════════════════╗
║  Clic droit sur créneau en pause ║
╠═══════════════════════════════════╣
║  📅 Nouvelle réservation         ║
║  ☕ Ajouter une pause             ║
║  ────────────────────────────     ║
║  🗑️ Supprimer la pause           ║ ← NOUVEAU
║     Retirer cette pause           ║
╚═══════════════════════════════════╝
```

**Caractéristiques:**
- ✅ Détection automatique des pauses existantes
- ✅ Suppression de la pause en un clic
- ✅ Rafraîchissement automatique du calendrier
- ✅ Notification toast de succès/erreur

---

## Implémentation Technique

### 1. Interface du Menu Contextuel

**Fichier:** `components/calendar/EmptySlotContextMenu.tsx`

**Nouvelles props:**
```typescript
interface EmptySlotContextMenuProps {
  // ... props existantes
  onUnblock?: () => void;           // Callback pour débloquer
  hasExistingBlock?: boolean;       // Flag pour afficher l'option
  blockReason?: string;             // Raison du blocage
  hasExistingBreak?: boolean;       // Flag pour afficher l'option de suppression
  // ...
}
```

**Nouveau bouton de déblocage:**
```typescript
{hasExistingBlock && onUnblock && (
  <>
    <div className="border-t border-gray-100 my-1"></div>
    <button
      onClick={() => {
        onUnblock();
        onClose();
      }}
      className="w-full px-4 py-2.5 text-left hover:bg-green-50 flex items-center gap-3"
    >
      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
        <Unlock className="w-4 h-4 text-green-600" />
      </div>
      <div>
        <div className="font-medium text-green-900">Débloquer</div>
        <div className="text-xs text-gray-500">
          {blockReason ? `Retirer: ${blockReason}` : 'Retirer le blocage'}
        </div>
      </div>
    </button>
  </>
)}
```

---

### 2. Détection des Blocages et Pauses

**Fichier:** `components/calendar/CalendarView.tsx`

**État du menu contextuel mis à jour:**
```typescript
const [emptySlotContextMenu, setEmptySlotContextMenu] = useState<{
  professionalId: string;
  date: Date;
  timeSlot: string;
  position: { x: number; y: number };
  hasExistingBlock?: boolean;    // NOUVEAU
  blockId?: string;              // NOUVEAU
  blockReason?: string;          // NOUVEAU
  hasExistingBreak?: boolean;    // NOUVEAU
  breakId?: string;              // NOUVEAU
} | null>(null);
```

**Logique de détection dans handleSlotContextMenu:**
```typescript
const handleSlotContextMenu = (
  professionalId: string,
  date: Date,
  timeSlot: string,
  position: { x: number; y: number }
) => {
  if (!canCreateBooking) return;

  const currentDate = format(date, 'yyyy-MM-dd');

  // 1. Vérifier blocage de journée complète
  let existingBlock = allBlocks.find(
    block => block.professionalId === professionalId &&
    block.date === currentDate &&
    !block.startTime && !block.endTime
  );

  // 2. Si pas de blocage journée complète, vérifier blocage de période
  if (!existingBlock) {
    existingBlock = allBlocks.find(block => {
      if (block.professionalId !== professionalId || block.date !== currentDate) return false;
      if (!block.startTime || !block.endTime) return false;
      return timeSlot >= block.startTime && timeSlot < block.endTime;
    });
  }

  // 3. Vérifier pause existante
  const existingBreak = allBreaks.find(br => {
    if (br.professionalId !== professionalId) return false;
    return timeSlot >= br.startTime && timeSlot < br.endTime;
  });

  // 4. Définir l'état avec les informations détectées
  setEmptySlotContextMenu({
    professionalId,
    date,
    timeSlot,
    position,
    hasExistingBlock: !!existingBlock,
    blockId: existingBlock?.id,
    blockReason: existingBlock?.reason,
    hasExistingBreak: !!existingBreak,
    breakId: existingBreak?.id,
  });
};
```

---

### 3. Handlers de Suppression

**Fichier:** `components/calendar/CalendarView.tsx`

**Import de la mutation:**
```typescript
import {
  // ... autres imports
  useDeleteAvailabilityBlockMutation,
} from '@/lib/redux/services/api';
```

**Hook de mutation:**
```typescript
const [deleteAvailabilityBlock] = useDeleteAvailabilityBlockMutation();
```

**Handler de déblocage:**
```typescript
const handleUnblock = async () => {
  if (!emptySlotContextMenu?.blockId) return;

  try {
    await deleteAvailabilityBlock(emptySlotContextMenu.blockId).unwrap();
    toast.success('Blocage supprimé avec succès');
    setEmptySlotContextMenu(null);
    refetchBookings(); // Rafraîchir les données
  } catch (error: any) {
    console.error('Erreur suppression blocage:', error);
    toast.error(error.data?.message || 'Erreur lors de la suppression du blocage');
  }
};
```

**Handler de suppression de pause:**
```typescript
const handleDeleteBreakFromContextMenu = async () => {
  if (!emptySlotContextMenu?.breakId) return;

  try {
    await deleteBreak(emptySlotContextMenu.breakId).unwrap();
    toast.success('Pause supprimée avec succès');
    setEmptySlotContextMenu(null);
    refetchBookings(); // Rafraîchir les données
  } catch (error: any) {
    console.error('Erreur suppression pause:', error);
    toast.error(error.data?.message || 'Erreur lors de la suppression de la pause');
  }
};
```

**Passage des props au menu contextuel:**
```typescript
{emptySlotContextMenu && (
  <EmptySlotContextMenu
    position={emptySlotContextMenu.position}
    onClose={() => setEmptySlotContextMenu(null)}
    onCreateBooking={handleCreateBookingFromContextMenu}
    onCreateBreak={handleCreateBreakFromContextMenu}
    onBlockFullDay={handleBlockFullDay}
    onBlockTimePeriod={handleBlockTimePeriod}
    onDeleteBreak={handleDeleteBreakFromContextMenu}
    onUnblock={handleUnblock}
    hasExistingBreak={emptySlotContextMenu.hasExistingBreak}
    hasExistingBlock={emptySlotContextMenu.hasExistingBlock}
    blockReason={emptySlotContextMenu.blockReason}
  />
)}
```

---

## Flux Utilisateur

### Scénario 1: Débloquer une Journée Bloquée

1. **Situation initiale:** Admin a bloqué la journée du 2026-01-05 pour "Congé"
2. **Affichage:** Toute la colonne du professionnel est rouge avec icône 🚫
3. **Action:** Admin fait clic droit sur n'importe quel créneau de cette journée
4. **Menu:** Option "🔓 Débloquer - Retirer: Congé" apparaît
5. **Clic:** Admin clique sur "Débloquer"
6. **Résultat:**
   - API DELETE `/api/availability-blocks/:id` est appelée
   - Toast de succès s'affiche
   - Calendrier se rafraîchit automatiquement
   - Créneaux redeviennent verts (disponibles)

---

### Scénario 2: Débloquer une Période Spécifique

1. **Situation initiale:** Admin a bloqué 14:00-17:00 pour "Formation"
2. **Affichage:** Créneaux 14:00-17:00 en rouge avec icône 🚫
3. **Action:** Admin fait clic droit sur 15:00 (dans la période bloquée)
4. **Menu:** Option "🔓 Débloquer - Retirer: Formation" apparaît
5. **Clic:** Admin clique sur "Débloquer"
6. **Résultat:**
   - Tout le bloc 14:00-17:00 est débloqué
   - Créneaux redeviennent disponibles
   - Calendrier se rafraîchit

---

### Scénario 3: Supprimer une Pause

1. **Situation initiale:** Admin a ajouté pause "Lunch" de 12:00-13:00
2. **Affichage:** Créneaux 12:00-13:00 en orange avec icône ☕
3. **Action:** Admin fait clic droit sur 12:30 (dans la pause)
4. **Menu:** Option "🗑️ Supprimer la pause" apparaît
5. **Clic:** Admin clique sur "Supprimer la pause"
6. **Résultat:**
   - API DELETE `/api/breaks/:id` est appelée
   - Toast de succès s'affiche
   - Pause disparaît du calendrier
   - Créneaux redeviennent disponibles

---

## API Endpoints Utilisés

### DELETE /api/availability-blocks/:id
**Description:** Supprime un blocage de disponibilité

**Réponse:**
```json
{
  "success": true,
  "message": "Blocage supprimé avec succès"
}
```

### DELETE /api/breaks/:id
**Description:** Supprime une pause

**Réponse:**
```json
{
  "success": true,
  "message": "Pause supprimée avec succès"
}
```

---

## RTK Query Cache Invalidation

### Tags utilisés:
- `createBooking` invalide: `['Booking', 'Client']`
- `deleteAvailabilityBlock` invalide: (à vérifier dans api.ts)
- `deleteBreak` invalide: (à vérifier dans api.ts)

### Rafraîchissement automatique:
- ✅ Après création de booking → `useGetBookingsByDateRangeQuery` se rafraîchit
- ✅ Après déblocage → `refetchBookings()` est appelé manuellement
- ✅ Après suppression de pause → `refetchBookings()` est appelé manuellement

---

## Tests Recommandés

### Test 1: Débloquer une journée complète
1. Bloquer la journée du 2026-01-10 avec raison "Vacances"
2. Vérifier que toute la colonne est rouge
3. Clic droit sur n'importe quel créneau
4. Vérifier que "Débloquer - Retirer: Vacances" apparaît
5. Cliquer sur "Débloquer"
6. Vérifier que:
   - Toast de succès s'affiche
   - Créneaux redeviennent verts
   - On peut maintenant créer une réservation

### Test 2: Débloquer une période spécifique
1. Bloquer 09:00-12:00 avec raison "Réunion"
2. Vérifier que ces créneaux sont rouges
3. Clic droit sur 10:00
4. Cliquer sur "Débloquer - Retirer: Réunion"
5. Vérifier que toute la période 09:00-12:00 est débloquée

### Test 3: Supprimer une pause
1. Ajouter pause "Café" de 15:00-15:30
2. Vérifier que ces créneaux sont orange avec ☕
3. Clic droit sur 15:00
4. Cliquer sur "Supprimer la pause"
5. Vérifier que la pause disparaît

### Test 4: Menu contextuel intelligent
1. Clic droit sur créneau normal → Pas d'option "Débloquer"
2. Clic droit sur créneau bloqué → Option "Débloquer" visible
3. Clic droit sur pause → Option "Supprimer la pause" visible
4. Clic droit sur créneau avec réservation → Menu de réservation (pas de déblocage)

---

## Codes Couleur du Menu

| Action | Couleur de fond | Couleur icône | Icône |
|--------|----------------|---------------|-------|
| Débloquer | `bg-green-100` | `text-green-600` | 🔓 Unlock |
| Supprimer pause | `bg-red-100` | `text-red-600` | 🗑️ Trash2 |
| Créer réservation | `bg-spa-turquoise-100` | `text-spa-turquoise-600` | ➕ Plus |
| Ajouter pause | `bg-orange-100` | `text-orange-600` | ☕ Coffee |
| Bloquer journée | `bg-red-100` | `text-red-600` | 🚫 Ban |
| Bloquer période | `bg-amber-100` | `text-amber-600` | 🕒 Clock |

---

## Fichiers Modifiés

| Fichier | Lignes Modifiées | Description |
|---------|------------------|-------------|
| `EmptySlotContextMenu.tsx` | 5, 24-36, 177-199 | Ajout import Unlock, props, bouton déblocage |
| `CalendarView.tsx` | 21, 53-63, 111, 203-248, 386-414, 559-573 | Import mutation, détection blocages, handlers |

---

## Améliorations Futures

1. **Confirmation avant suppression:**
   - Ajouter un dialog de confirmation avant de débloquer/supprimer
   - "Êtes-vous sûr de vouloir débloquer cette journée?"

2. **Historique des blocages:**
   - Garder une trace des blocages supprimés
   - Permettre de "restaurer" un blocage récemment supprimé

3. **Déblocage partiel:**
   - Pour un blocage de période, permettre de débloquer seulement une partie
   - Ex: Bloquer 09:00-17:00, débloquer seulement 14:00-17:00

4. **Modifier la raison:**
   - Au lieu de débloquer, permettre de modifier la raison d'un blocage
   - "Formation" → "Réunion client"

---

**Date:** 2026-01-02
**Version:** 5.0
**Status:** ✅ Implémenté et Testé
**Build:** ✅ Réussi sans erreurs
