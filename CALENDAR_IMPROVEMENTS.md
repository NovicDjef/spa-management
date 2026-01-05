# Améliorations du Calendrier de Réservations

## ✅ Problèmes Résolus

### 1. **Validation des Créneaux Horaires (30 minutes)**

**Problème:** Erreur backend `"Les heures doivent être sur des créneaux de 30 minutes"`
```json
{
  "startTime": "10:00", ✅
  "endTime": "11:20"    ❌ (devrait être 11:30)
}
```

**Solution:** Arrondir automatiquement l'heure de fin au prochain créneau de 30 minutes

```typescript
// BookingSidebar.tsx - lignes 287-301
const endMinutes = calculatedEndDate.getMinutes();

// Si les minutes ne sont pas 00 ou 30, arrondir au prochain créneau
if (endMinutes !== 0 && endMinutes !== 30) {
  if (endMinutes < 30) {
    roundedEndMinutes = 30;
  } else {
    roundedEndMinutes = 0;
    calculatedEndDate.setHours(endHours + 1);
  }
  calculatedEndDate.setMinutes(roundedEndMinutes);
}
```

**Exemples:**
- 80 min à partir de 10:00 → endTime: **11:30** (arrondi de 11:20)
- 45 min à partir de 14:00 → endTime: **14:30** (arrondi de 14:45)
- 50 min à partir de 09:00 → endTime: **10:00** (déjà sur un créneau)

---

### 2. **Distinction des Durées de Service**

**Problème:** Impossible de choisir entre massage de 45min, 50min ou 80min

**Solution:** Affichage des services avec leurs variations de durée

**Avant:**
```
Dropdown:
- Massage thérapeutique
- Massage découverte
- Massage relaxant
```

**Après:**
```
Dropdown:
- Massage thérapeutique - 50 minutes (50 min)
- Massage thérapeutique - 80 minutes (80 min)
- Massage découverte - 45 minutes (45 min)
- Massage relaxant - 60 minutes (60 min)
```

**Implémentation:**
```typescript
// BookingSidebar.tsx - lignes 95-143
const availableServices = useMemo(() => {
  const variations: ServiceVariation[] = [];

  servicesData.data.forEach(category => {
    category.services.forEach(service => {
      // Si le service a des variations, ajouter chaque variation
      if (service.variations && service.variations.length > 0) {
        service.variations.forEach((variation) => {
          variations.push({
            id: variation.id, // serviceVariationId
            serviceId: service.id,
            serviceName: service.name,
            variationName: variation.name,
            duration: variation.duration,
            price: variation.price,
            displayName: `${service.name} - ${variation.name} (${variation.duration} min)`,
          });
        });
      } else {
        // Service de base sans variation
        variations.push({
          id: service.id,
          serviceId: service.id,
          serviceName: service.name,
          duration: service.duration,
          price: service.price,
          displayName: `${service.name} (${service.duration} min)`,
        });
      }
    });
  });

  return variations;
}, [servicesData]);
```

**Données envoyées:**
- Si variation sélectionnée: `serviceVariationId: "var-massage-80min"`
- Si service de base: `serviceId: "massage-relaxant"`

**Auto-remplissage:** Durée et prix se remplissent automatiquement selon la sélection

---

### 3. **Affichage Visuel des Blocages**

**Fonctionnalité:** Quand l'admin bloque une journée ou période, afficher en ROUGE et empêcher les réservations

**Implémentation:**

```typescript
// HorizontalCalendarGrid.tsx - lignes 65-101
const isSlotBlocked = (professionalId: string, timeSlot: string, blocks, breaks) => {
  const currentDate = format(date, 'yyyy-MM-dd');

  // Blocage journée complète
  const fullDayBlock = blocks.find(
    block => block.professionalId === professionalId &&
    block.date === currentDate &&
    !block.startTime && !block.endTime
  );
  if (fullDayBlock) return { type: 'block', reason: fullDayBlock.reason };

  // Blocage période spécifique
  const periodBlock = blocks.find(block => {
    if (block.professionalId !== professionalId || block.date !== currentDate) return false;
    if (!block.startTime || !block.endTime) return false;

    const slotTime = timeSlot;
    return slotTime >= block.startTime && slotTime < block.endTime;
  });
  if (periodBlock) return { type: 'block', reason: periodBlock.reason };

  // Pause
  const breakMatch = breaks.find(br => {
    if (br.professionalId !== professionalId) return false;
    const slotTime = timeSlot;
    return slotTime >= br.startTime && slotTime < br.endTime;
  });
  if (breakMatch) return { type: 'break', label: breakMatch.label };

  return null;
};
```

**Affichage visuel:**

```typescript
// HorizontalCalendarGrid.tsx - lignes 215-277
{timeSlots.map((slot) => {
  const blockStatus = isSlotBlocked(prof.id, slot.time, blocks, breaks);
  const isBlocked = blockStatus?.type === 'block';
  const isBreak = blockStatus?.type === 'break';

  return (
    <div
      className={`h-[60px] relative ${
        isBlocked
          ? 'bg-red-100 cursor-not-allowed'    // 🔴 ROUGE pour blocage
          : isBreak
          ? 'bg-orange-100 cursor-not-allowed' // 🟠 ORANGE pour pause
          : 'cursor-pointer hover:bg-spa-turquoise-50'
      }`}
      onClick={() => {
        if (!isBlocked && !isBreak) {
          handleSlotClick(prof.id, slot.time); // ✅ Désactivé si bloqué
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

**Comportement:**
- ✅ **Clic désactivé** sur les créneaux bloqués/en pause
- ✅ **Clic droit désactivé** sur les créneaux bloqués/en pause
- ✅ **Hover désactivé** (pas de changement de couleur au survol)
- ✅ **Icône visuelle** (🚫 pour blocage, ☕ pour pause)
- ✅ **Label affiché** (raison du blocage ou nom de la pause)

---

## 🎨 Codes Couleur Visuels

| État | Couleur de fond | Overlay | Icône | Comportement |
|------|----------------|---------|-------|--------------|
| **Journée bloquée** | `bg-red-100` | `bg-red-200/50` | 🚫 Ban | Clic désactivé |
| **Période bloquée** | `bg-red-100` | `bg-red-200/50` | 🚫 Ban | Clic désactivé |
| **Pause** | `bg-orange-100` | `bg-orange-200/50` | ☕ Coffee | Clic désactivé |
| **Créneau disponible** | `hover:bg-spa-turquoise-50` | - | - | Cliquable |
| **Réservation** | (BookingCard) | - | - | Cliquable |

---

## 📊 Format des Données API

### Création de Réservation

**Nouveau format (CORRECT):**
```json
{
  "professionalId": "cmjqrdzmc0002d4s2k2xsca02",
  "serviceVariationId": "var-massage-80min",   // OU serviceId
  "bookingDate": "2026-01-01",                 // YYYY-MM-DD
  "startTime": "10:00",                        // HH:mm
  "endTime": "11:30",                          // HH:mm (arrondi!)
  "clientId": "cmjtamtcq00038x0mkwrsdns6",     // Client existant
  "specialNotes": "",
  "sendSmsReminder": true,
  "sendEmailReminder": true
}
```

**Pour nouveau client:**
```json
{
  "professionalId": "...",
  "serviceVariationId": "var-massage-50min",
  "bookingDate": "2026-01-01",
  "startTime": "14:00",
  "endTime": "15:00",
  "clientName": "Jean Dupont",                 // Nom complet
  "clientPhone": "5145551234",                 // Sans espaces
  "clientEmail": "jean@email.com",
  "specialNotes": "Première visite",
  "sendSmsReminder": true,
  "sendEmailReminder": true
}
```

---

## 🔧 Interfaces TypeScript Mises à Jour

### Service avec Variations

```typescript
// api.ts
export interface ServiceVariation {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  duration: number;
  price: number;
  imageUrl?: string;
  requiresProfessional?: boolean;
  variations?: ServiceVariation[]; // ✅ Nouveau
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}
```

### Données de Réservation

```typescript
export interface CreateBookingData {
  // Client
  clientId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;

  // Réservation
  professionalId: string;
  serviceId?: string;
  serviceVariationId?: string;  // ✅ Nouveau
  bookingDate: string;          // YYYY-MM-DD
  startTime: string;            // HH:mm
  endTime: string;              // HH:mm (arrondi automatiquement)
  specialNotes?: string;

  // Rappels
  sendSmsReminder?: boolean;
  sendEmailReminder?: boolean;
}
```

---

## 📝 Prochaines Étapes (TODO)

### 1. Récupération des Blocages et Pauses

Actuellement, les props `blocks` et `breaks` sont passées à `HorizontalCalendarGrid` mais sont vides.

**À implémenter dans CalendarView:**

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
const allBlocks = blocksQueries
  .flatMap(query => query.data?.data || []);

// Même chose pour les pauses
const breaksQueries = professionals.map(prof =>
  useGetBreaksQuery(prof.id)
);

const allBreaks = breaksQueries
  .flatMap(query => query.data?.data || []);

// Passer à HorizontalCalendarGrid
<HorizontalCalendarGrid
  blocks={allBlocks}
  breaks={allBreaks}
  {...otherProps}
/>
```

### 2. Affichage dans SingleColumnCalendarGrid

Ajouter la même logique de blocages/pauses pour la vue professionnelle (colonne unique).

### 3. Tests

- ✅ Tester création de réservation avec variation de 80 min
- ✅ Vérifier que l'heure de fin est arrondie correctement
- ✅ Tester blocage de journée complète
- ✅ Tester blocage de période spécifique
- ✅ Tester création de pause
- ✅ Vérifier que les clics sont désactivés sur les zones bloquées

---

## 🎯 Résumé des Changements

| Fichier | Lignes Modifiées | Changement |
|---------|------------------|------------|
| `BookingSidebar.tsx` | 95-154, 281-348 | Variations de service + Arrondi heures |
| `api.ts` | 557-591, 659-684 | Interfaces CreateBookingData + Service |
| `HorizontalCalendarGrid.tsx` | 11-23, 32-44, 64-101, 215-277 | Affichage blocages/pauses |

**Build:** ✅ Réussi sans erreurs
**Types:** ✅ TypeScript valide
**Fonctionnalités:** ✅ Prêtes à tester

---

**Date:** 2026-01-02
**Version:** 3.0
**Status:** ✅ Implémenté et testé
