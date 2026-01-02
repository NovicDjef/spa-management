# Affichage des Blocages et Pauses - Calendrier

## ✅ Problème Résolu

**Erreur rencontrée:**
```json
{
  "success": false,
  "message": "Jour bloqué: conge"
}
```

**Cause:** L'utilisateur ne voyait pas que le jour était bloqué avant d'essayer de créer une réservation.

**Solution:** Affichage visuel en temps réel des blocages et pauses sur le calendrier.

---

## 🎨 Affichage Visuel

### 🔴 Journée Bloquée (Congé)

Quand un admin bloque une **journée complète**:

```
╔═══════════════════════════════════╗
║  Sophie Lavoie - Massothérapeute  ║
╠═══════════════════════════════════╣
║ 07:00  ┃                          ║
║        ┃  🚫 Bloqué               ║ ← FOND ROUGE
║ 07:30  ┃  (Congé)                 ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 08:00  ┃                          ║
║        ┃  🚫 Bloqué               ║ ← Toute la journée
║ 08:30  ┃  (Congé)                 ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║  ...   ┃  ...                     ║
╚═══════════════════════════════════╝
```

**Caractéristiques:**
- ✅ Fond rouge vif (`bg-red-100`)
- ✅ Overlay avec icône 🚫 et texte "Bloqué"
- ✅ Raison affichée si fournie ("Congé", "Formation", etc.)
- ✅ **Clic désactivé** → Impossible de créer une réservation
- ✅ **Clic droit désactivé** → Pas de menu contextuel

---

### 🟠 Période Bloquée (Formation, RDV médical)

Quand un admin bloque une **période spécifique** (ex: 14:00 - 17:00):

```
╔═══════════════════════════════════╗
║  Sophie Lavoie - Massothérapeute  ║
╠═══════════════════════════════════╣
║ 13:30  ┃  [Disponible]            ║ ← Cliquable
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 14:00  ┃  🚫 Bloqué               ║ ← Début blocage
║        ┃  (Formation externe)     ║   FOND ROUGE
║ 14:30  ┃                          ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 15:00  ┃  🚫 Bloqué               ║
║        ┃  (Formation externe)     ║
║ 15:30  ┃                          ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 16:00  ┃  🚫 Bloqué               ║
║        ┃  (Formation externe)     ║
║ 16:30  ┃                          ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 17:00  ┃  [Disponible]            ║ ← Fin blocage
╚═══════════════════════════════════╝
```

---

### ☕ Pause (Lunch, Café)

Quand un admin ajoute une **pause**:

```
╔═══════════════════════════════════╗
║  Sophie Lavoie - Massothérapeute  ║
╠═══════════════════════════════════╣
║ 11:30  ┃  [Disponible]            ║ ← Cliquable
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 12:00  ┃  ☕ Pause lunch          ║ ← FOND ORANGE
║        ┃                          ║
║ 12:30  ┃                          ║
║━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━━║
║ 13:00  ┃  [Disponible]            ║ ← Fin pause
╚═══════════════════════════════════╝
```

**Caractéristiques:**
- ✅ Fond orange (`bg-orange-100`)
- ✅ Overlay avec icône ☕ et label de la pause
- ✅ **Clic désactivé** → Impossible de créer une réservation
- ✅ **Clic droit désactivé** → Pas de menu contextuel

---

## 🔧 Implémentation Technique

### 1. Récupération des Données (CalendarView.tsx)

```typescript
// Récupérer les blocages pour tous les professionnels affichés
const blocksQueries = professionals.map(prof =>
  useGetAvailabilityBlocksQuery({
    professionalId: prof.id,
    startDate: format(selectedDate, 'yyyy-MM-dd'),
    endDate: format(selectedDate, 'yyyy-MM-dd'),
  })
);

// Merger tous les blocages
const allBlocks = useMemo(() => {
  return blocksQueries
    .filter(query => query.data?.data)
    .flatMap(query => query.data!.data);
}, [blocksQueries]);

// Récupérer les pauses
const breaksQueries = professionals.map(prof =>
  useGetBreaksQuery(prof.id)
);

// Merger toutes les pauses
const allBreaks = useMemo(() => {
  return breaksQueries
    .filter(query => query.data?.data)
    .flatMap(query => query.data!.data);
}, [breaksQueries]);
```

### 2. Passage aux Composants

```typescript
<HorizontalCalendarGrid
  date={selectedDate}
  professionals={professionals}
  bookings={filteredBookings}
  blocks={allBlocks}        // ✅ Blocages
  breaks={allBreaks}        // ✅ Pauses
  onBookingEdit={handleBookingEdit}
  onBookingContextMenu={handleBookingContextMenu}
  onSlotClick={handleSlotClick}
  onSlotContextMenu={handleSlotContextMenu}
/>
```

### 3. Vérification des Blocages (HorizontalCalendarGrid.tsx)

```typescript
const isSlotBlocked = (professionalId, timeSlot, blocks, breaks) => {
  const currentDate = format(date, 'yyyy-MM-dd');

  // Vérifier blocage de journée complète
  const fullDayBlock = blocks.find(
    block => block.professionalId === professionalId &&
    block.date === currentDate &&
    !block.startTime && !block.endTime
  );
  if (fullDayBlock) return { type: 'block', reason: fullDayBlock.reason };

  // Vérifier blocage de période spécifique
  const periodBlock = blocks.find(block => {
    if (block.professionalId !== professionalId || block.date !== currentDate) return false;
    if (!block.startTime || !block.endTime) return false;

    return timeSlot >= block.startTime && timeSlot < block.endTime;
  });
  if (periodBlock) return { type: 'block', reason: periodBlock.reason };

  // Vérifier pause
  const breakMatch = breaks.find(br => {
    if (br.professionalId !== professionalId) return false;
    return timeSlot >= br.startTime && timeSlot < br.endTime;
  });
  if (breakMatch) return { type: 'break', label: breakMatch.label };

  return null;
};
```

### 4. Affichage Visuel avec Overlays

```typescript
{timeSlots.map((slot) => {
  const blockStatus = isSlotBlocked(prof.id, slot.time, blocks, breaks);
  const isBlocked = blockStatus?.type === 'block';
  const isBreak = blockStatus?.type === 'break';

  return (
    <div
      className={`h-[60px] relative ${
        isBlocked ? 'bg-red-100 cursor-not-allowed' :
        isBreak ? 'bg-orange-100 cursor-not-allowed' :
        'cursor-pointer hover:bg-spa-turquoise-50'
      }`}
      onClick={() => {
        if (!isBlocked && !isBreak) {
          handleSlotClick(prof.id, slot.time);
        }
      }}
    >
      {/* Overlay ROUGE pour blocage */}
      {isBlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-200/50">
          <div className="flex items-center gap-1 text-xs text-red-800 font-medium">
            <Ban className="w-3 h-3" />
            <span>Bloqué</span>
          </div>
        </div>
      )}

      {/* Overlay ORANGE pour pause */}
      {isBreak && (
        <div className="absolute inset-0 flex items-center justify-center bg-orange-200/50">
          <div className="flex items-center gap-1 text-xs text-orange-800 font-medium">
            <Coffee className="w-3 h-3" />
            <span>{blockStatus.label || 'Pause'}</span>
          </div>
        </div>
      )}
    </div>
  );
})}
```

---

## 📊 Résultat Attendu

### Avant
```
Tentative de création → Erreur backend:
{"success": false, "message": "Jour bloqué: conge"}
```

### Après
```
Calendrier affiche visuellement:
🔴 Toute la colonne du professionnel en rouge
🚫 Icône "Bloqué" avec raison "Congé"
❌ Clic désactivé sur toute la journée
✅ Impossible de créer une réservation par erreur
```

---

## ✅ Tests Recommandés

1. **Bloquer une journée complète:**
   - Clic droit sur un créneau → "Bloquer la journée"
   - Entrer la raison: "Congé"
   - **Résultat:** Toute la colonne devient rouge avec icône 🚫

2. **Bloquer une période (14:00 - 17:00):**
   - Clic droit sur 14:00 → "Bloquer une période"
   - Sélectionner 14:00 - 17:00, raison: "Formation"
   - **Résultat:** Créneaux de 14:00 à 17:00 en rouge uniquement

3. **Ajouter une pause (12:00 - 13:00):**
   - Clic droit sur 12:00 → "Ajouter une pause"
   - Label: "Pause lunch"
   - **Résultat:** Créneaux de 12:00 à 13:00 en orange avec ☕

4. **Essayer de créer une réservation sur un créneau bloqué:**
   - Cliquer sur un créneau rouge
   - **Résultat:** Rien ne se passe (clic ignoré)

---

## 🎯 Avantages

✅ **Prévention des erreurs** - L'utilisateur voit immédiatement que le créneau est bloqué
✅ **Clarté visuelle** - Codes couleur clairs (rouge = bloqué, orange = pause)
✅ **Informations contextuelles** - Raison du blocage affichée directement
✅ **Expérience améliorée** - Pas de tentative de création suivie d'une erreur
✅ **Temps réel** - Les blocages/pauses s'affichent dès leur création

---

**Date:** 2026-01-02
**Version:** 4.0
**Status:** ✅ Implémenté et Prêt
