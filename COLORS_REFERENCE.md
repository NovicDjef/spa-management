# Référence Rapide des Couleurs - Calendrier

## 🎨 Statuts de Réservation

| Statut | Badge | Couleur | Exemple Visuel |
|--------|-------|---------|----------------|
| **PENDING** | En attente | Jaune 🟡 | `bg-yellow-100` `border-yellow-300` |
| **CONFIRMED** | Confirmé | Bleu 🔵 | `bg-blue-100` `border-blue-300` |
| **ARRIVED** | Arrivé | Violet 🟣 | `bg-purple-100` `border-purple-300` |
| **IN_PROGRESS** | En cours | Indigo 🔷 | `bg-indigo-100` `border-indigo-300` |
| **COMPLETED** | Terminé | Vert 🟢 | `bg-green-100` `border-green-300` |
| **NO_SHOW** | Absent | Gris ⚫ | `bg-gray-100` `border-gray-300` |
| **CANCELLED** | Annulé | Rouge 🔴 | `bg-red-100` `border-red-300` |

---

## 📍 États de Créneaux

| État | Couleur | Classes Tailwind |
|------|---------|------------------|
| **Disponible** | Blanc | `bg-white` `hover:bg-spa-turquoise-50` |
| **Bloqué** | Rouge 🔴 | `bg-red-100` overlay: `bg-red-200/50` |
| **Pause** | Orange 🟠 | `bg-orange-100` overlay: `bg-orange-200/50` |

---

## 🎯 Actions Menu Contextuel

| Action | Couleur | Icône | Classes |
|--------|---------|-------|---------|
| **Nouvelle réservation** | Turquoise 💎 | ➕ Plus | `bg-spa-turquoise-100` `text-spa-turquoise-600` |
| **Ajouter pause** | Orange 🟠 | ☕ Coffee | `bg-orange-100` `text-orange-600` |
| **Bloquer journée** | Rouge 🔴 | 🚫 Ban | `bg-red-100` `text-red-600` |
| **Bloquer période** | Ambre 🟤 | 🕒 Clock | `bg-amber-100` `text-amber-600` |
| **Débloquer** | Vert 🟢 | 🔓 Unlock | `bg-green-100` `text-green-600` |
| **Supprimer pause** | Rouge 🔴 | 🗑️ Trash2 | `bg-red-100` `text-red-600` |

---

## 📊 Guide Visuel Rapide

```
STATUTS DE RÉSERVATION:
🟡 Jaune    = En attente (PENDING)
🔵 Bleu     = Confirmé (CONFIRMED)
🟣 Violet   = Client arrivé (ARRIVED)
🔷 Indigo   = En cours (IN_PROGRESS)
🟢 Vert     = Terminé (COMPLETED)
⚫ Gris     = Client absent (NO_SHOW)
🔴 Rouge    = Annulé (CANCELLED)

ÉTATS DE CRÉNEAUX:
⚪ Blanc    = Disponible (cliquable)
🔴 Rouge    = Bloqué (non cliquable)
🟠 Orange   = Pause (non cliquable)

ACTIONS:
💎 Turquoise = Actions principales (créer)
🟢 Vert      = Actions positives (débloquer)
🔴 Rouge     = Actions destructives (supprimer, bloquer)
🟠 Orange    = Pauses
🟤 Ambre     = Blocages temporaires
```

---

## 🔍 Identification Rapide

**Si c'est JAUNE** → Client n'a pas encore confirmé
**Si c'est BLEU** → Réservation confirmée, tout va bien
**Si c'est VIOLET** → Client est arrivé, prêt pour le service
**Si c'est INDIGO** → Service en cours
**Si c'est VERT** → Service terminé avec succès
**Si c'est GRIS** → Client ne s'est pas présenté
**Si c'est ROUGE** → Annulé ou bloqué

---

## 💻 Code Reference

### Statuts de Réservation
```typescript
// lib/utils/calendar.ts
export function getStatusColor(status: BookingStatus) {
  const colors = {
    PENDING: { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-800' },
    CONFIRMED: { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-800' },
    ARRIVED: { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-800' },
    IN_PROGRESS: { bg: 'bg-indigo-100', border: 'border-indigo-300', text: 'text-indigo-800' },
    COMPLETED: { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-800' },
    NO_SHOW: { bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-800' },
    CANCELLED: { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800' },
  };
  return colors[status];
}
```

### Labels Français
```typescript
export function getStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmé',
    ARRIVED: 'Arrivé',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    NO_SHOW: 'Absent',
    CANCELLED: 'Annulé',
  };
  return labels[status];
}
```

---

**Date:** 2026-01-02
**Version:** 1.0
**Fichiers:** `lib/utils/calendar.ts`, `components/calendar/BookingCard.tsx`
