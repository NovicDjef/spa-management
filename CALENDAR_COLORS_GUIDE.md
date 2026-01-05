# Guide des Couleurs du Calendrier

## Vue d'ensemble

Chaque action et état dans le calendrier a une couleur distincte pour faciliter l'identification visuelle.

---

## 🎨 Couleurs des États de Créneaux

### 1. Créneau Disponible
**Couleur:** Blanc / Turquoise au survol
```css
bg-white
hover:bg-spa-turquoise-50
```
**Indicateur:** Pas d'overlay
**Action:** Clic gauche → Créer réservation
**Action:** Clic droit → Menu contextuel

---

### 2. Créneau Bloqué (Journée Complète)
**Couleur:** Rouge clair avec overlay rouge
```css
bg-red-100          /* Fond */
bg-red-200/50       /* Overlay */
text-red-800        /* Texte */
```
**Indicateur:** 🚫 Icône "Ban" + texte "Bloqué"
**Raison:** Affichée si fournie (ex: "Congé", "Formation")
**Action:** Clic désactivé
**Clic droit:** Menu avec option "Débloquer"

---

### 3. Créneau Bloqué (Période Spécifique)
**Couleur:** Rouge clair avec overlay rouge
```css
bg-red-100          /* Fond */
bg-red-200/50       /* Overlay */
text-red-800        /* Texte */
```
**Indicateur:** 🚫 Icône "Ban" + texte "Bloqué"
**Raison:** Affichée si fournie (ex: "Réunion externe")
**Action:** Clic désactivé
**Clic droit:** Menu avec option "Débloquer"

---

### 4. Pause
**Couleur:** Orange avec overlay orange
```css
bg-orange-100       /* Fond */
bg-orange-200/50    /* Overlay */
text-orange-800     /* Texte */
```
**Indicateur:** ☕ Icône "Coffee" + label de la pause
**Label:** Affiché si fourni (ex: "Lunch", "Pause café")
**Action:** Clic désactivé
**Clic droit:** Menu avec option "Supprimer la pause"

---

### 5. Réservation (Booking)
**Couleur:** Dépend du statut (voir section suivante)
**Indicateur:** Carte de réservation avec nom du client
**Action:** Clic gauche → Éditer
**Clic droit:** Menu contextuel avec actions

---

## 📋 Couleurs des Statuts de Réservation

### PENDING (En attente)
**Couleur:** Jaune
```css
bg-yellow-100       /* Fond */
border-yellow-300   /* Bordure */
text-yellow-800     /* Texte */
```
**Badge:** "En attente"

---

### CONFIRMED (Confirmé)
**Couleur:** Bleu
```css
bg-blue-100         /* Fond */
border-blue-300     /* Bordure */
text-blue-800       /* Texte */
```
**Badge:** "Confirmé"

---

### ARRIVED (Arrivé)
**Couleur:** Violet
```css
bg-purple-100       /* Fond */
border-purple-300   /* Bordure */
text-purple-800     /* Texte */
```
**Badge:** "Arrivé"

---

### IN_PROGRESS (En cours)
**Couleur:** Indigo
```css
bg-indigo-100       /* Fond */
border-indigo-300   /* Bordure */
text-indigo-800     /* Texte */
```
**Badge:** "En cours"

---

### COMPLETED (Terminé)
**Couleur:** Vert
```css
bg-green-100        /* Fond */
border-green-300    /* Bordure */
text-green-800      /* Texte */
```
**Badge:** "Terminé"

---

### CANCELLED (Annulé)
**Couleur:** Rouge
```css
bg-red-100          /* Fond */
border-red-300      /* Bordure */
text-red-800        /* Texte */
```
**Badge:** "Annulé"

---

### NO_SHOW (Absent)
**Couleur:** Gris
```css
bg-gray-100         /* Fond */
border-gray-300     /* Bordure */
text-gray-800       /* Texte */
```
**Badge:** "Absent"

---

## 🎯 Couleurs des Actions du Menu Contextuel

### Nouvelle Réservation
**Couleur:** Turquoise
```css
bg-spa-turquoise-100    /* Fond icône */
text-spa-turquoise-600  /* Icône */
hover:bg-spa-turquoise-50
```
**Icône:** ➕ Plus
**Texte:** "Nouvelle réservation"

---

### Ajouter une Pause
**Couleur:** Orange
```css
bg-orange-100       /* Fond icône */
text-orange-600     /* Icône */
hover:bg-orange-50
```
**Icône:** ☕ Coffee
**Texte:** "Ajouter une pause"

---

### Bloquer la Journée
**Couleur:** Rouge
```css
bg-red-100          /* Fond icône */
text-red-600        /* Icône */
hover:bg-red-50
```
**Icône:** 🚫 Ban
**Texte:** "Bloquer la journée"

---

### Bloquer une Période
**Couleur:** Ambre
```css
bg-amber-100        /* Fond icône */
text-amber-600      /* Icône */
hover:bg-amber-50
```
**Icône:** 🕒 Clock
**Texte:** "Bloquer une période"

---

### Débloquer
**Couleur:** Vert
```css
bg-green-100        /* Fond icône */
text-green-600      /* Icône */
hover:bg-green-50
```
**Icône:** 🔓 Unlock
**Texte:** "Débloquer"
**Sous-texte:** Raison du blocage à retirer

---

### Supprimer la Pause
**Couleur:** Rouge
```css
bg-red-100          /* Fond icône */
text-red-600        /* Icône */
hover:bg-red-50
```
**Icône:** 🗑️ Trash2
**Texte:** "Supprimer la pause"

---

## 📊 Tableau Récapitulatif

| État / Action | Couleur Primaire | Fond | Icône | Cliquable |
|--------------|------------------|------|-------|-----------|
| **CRÉNEAUX** |
| Disponible | Blanc | `bg-white` | - | ✅ |
| Bloqué | Rouge | `bg-red-100` | 🚫 | ❌ |
| Pause | Orange | `bg-orange-100` | ☕ | ❌ |
| **RÉSERVATIONS** |
| Pending | Jaune | `bg-yellow-100` | - | ✅ |
| Confirmed | Bleu | `bg-blue-100` | - | ✅ |
| Arrived | Violet | `bg-purple-100` | - | ✅ |
| In Progress | Indigo | `bg-indigo-100` | - | ✅ |
| Completed | Vert | `bg-green-100` | - | ✅ |
| Cancelled | Rouge | `bg-red-100` | - | ✅ |
| No Show | Gris | `bg-gray-100` | - | ✅ |
| **ACTIONS** |
| Créer réservation | Turquoise | `bg-spa-turquoise-100` | ➕ | ✅ |
| Ajouter pause | Orange | `bg-orange-100` | ☕ | ✅ |
| Bloquer journée | Rouge | `bg-red-100` | 🚫 | ✅ |
| Bloquer période | Ambre | `bg-amber-100` | 🕒 | ✅ |
| Débloquer | Vert | `bg-green-100` | 🔓 | ✅ |
| Supprimer pause | Rouge | `bg-red-100` | 🗑️ | ✅ |

---

## 🎨 Palette de Couleurs Complète

### Turquoise (Spa Theme)
```css
bg-spa-turquoise-50    /* #f0fdfa */
bg-spa-turquoise-100   /* #ccfbf1 */
bg-spa-turquoise-500   /* #14b8a6 */
bg-spa-turquoise-600   /* #0d9488 */
```

### Rouge (Blocages, Annulations)
```css
bg-red-50     /* #fef2f2 */
bg-red-100    /* #fee2e2 */
bg-red-200    /* #fecaca */
bg-red-600    /* #dc2626 */
bg-red-800    /* #991b1b */
```

### Orange (Pauses)
```css
bg-orange-50     /* #fff7ed */
bg-orange-100    /* #ffedd5 */
bg-orange-200    /* #fed7aa */
bg-orange-600    /* #ea580c */
bg-orange-800    /* #9a3412 */
```

### Ambre (Blocages de période)
```css
bg-amber-50     /* #fffbeb */
bg-amber-100    /* #fef3c7 */
bg-amber-600    /* #d97706 */
```

### Vert (Succès, Déblocage, Terminé)
```css
bg-green-50     /* #f0fdf4 */
bg-green-100    /* #dcfce7 */
bg-green-600    /* #16a34a */
bg-green-800    /* #166534 */
```

### Jaune (En attente)
```css
bg-yellow-50     /* #fefce8 */
bg-yellow-100    /* #fef9c3 */
bg-yellow-300    /* #fde047 */
bg-yellow-800    /* #854d0e */
```

### Bleu (Confirmé)
```css
bg-blue-50     /* #eff6ff */
bg-blue-100    /* #dbeafe */
bg-blue-300    /* #93c5fd */
bg-blue-800    /* #1e40af */
```

### Violet (Arrivé)
```css
bg-purple-50     /* #faf5ff */
bg-purple-100    /* #f3e8ff */
bg-purple-300    /* #d8b4fe */
bg-purple-800    /* #6b21a8 */
```

### Indigo (En cours)
```css
bg-indigo-50     /* #eef2ff */
bg-indigo-100    /* #e0e7ff */
bg-indigo-300    /* #a5b4fc */
bg-indigo-800    /* #3730a3 */
```

### Gris (Absent, Désactivé)
```css
bg-gray-50     /* #f9fafb */
bg-gray-100    /* #f3f4f6 */
bg-gray-300    /* #d1d5db */
bg-gray-800    /* #1f2937 */
```

---

## 🔍 Identification Visuelle Rapide

### Par Couleur de Fond:
- **🔴 Rouge** = Bloqué / Annulé / Action destructive
- **🟠 Orange** = Pause / Repos
- **🟡 Jaune** = En attente / Attention requise
- **🔵 Bleu** = Confirmé / Information
- **🟢 Vert** = Succès / Terminé / Déblocage
- **🟣 Violet** = Client arrivé
- **🔷 Indigo** = En cours
- **⚫ Gris** = Absent / Inactif
- **💎 Turquoise** = Actions principales / Création
- **🟤 Ambre** = Blocage temporaire

### Par Icône:
- **➕ Plus** = Créer nouvelle réservation
- **☕ Coffee** = Pause / Repos
- **🚫 Ban** = Blocage
- **🕒 Clock** = Blocage de période
- **🔓 Unlock** = Débloquer
- **🗑️ Trash** = Supprimer

---

## 📱 Responsive et Accessibilité

### Contraste
Toutes les combinaisons de couleurs respectent les normes WCAG AA:
- Texte foncé (`text-*-800`) sur fond clair (`bg-*-100`)
- Ratio de contraste minimum: 4.5:1

### Hover States
Tous les éléments cliquables ont un état hover distinct:
```css
hover:bg-{color}-50
```

### Focus States
Les éléments interactifs ont des états focus visibles pour l'accessibilité clavier.

---

## 🎯 Exemple Visuel: Journée Type

```
┌─────────────────────────────────────────────────────┐
│ 08:00  │ 🟢 DISPONIBLE                            │
├─────────────────────────────────────────────────────┤
│ 08:30  │ 🟡 EN ATTENTE - Marie Tremblay            │
├─────────────────────────────────────────────────────┤
│ 09:00  │ 🔵 CONFIRMÉ - Jean Dupont                 │
├─────────────────────────────────────────────────────┤
│ 10:00  │ 🟣 ARRIVÉ - Sophie Martin                 │
├─────────────────────────────────────────────────────┤
│ 11:00  │ 🔷 EN COURS - Luc Gagnon                  │
├─────────────────────────────────────────────────────┤
│ 12:00  │ 🟠 PAUSE - Lunch                          │
├─────────────────────────────────────────────────────┤
│ 13:00  │ 🟢 DISPONIBLE                            │
├─────────────────────────────────────────────────────┤
│ 14:00  │ 🔴 BLOQUÉ - Formation externe            │
├─────────────────────────────────────────────────────┤
│ 15:00  │ 🔴 BLOQUÉ - Formation externe            │
├─────────────────────────────────────────────────────┤
│ 16:00  │ 🟢 TERMINÉ - Anne Leblanc                │
├─────────────────────────────────────────────────────┤
│ 17:00  │ 🔴 ANNULÉ - Pierre Roy                   │
├─────────────────────────────────────────────────────┤
│ 18:00  │ ⚫ ABSENT - Marc Ouellet                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Modification des Couleurs

Si vous souhaitez personnaliser les couleurs:

1. **Tailwind Config:** `tailwind.config.ts`
2. **Fichiers à modifier:**
   - `components/calendar/HorizontalCalendarGrid.tsx` (overlays créneaux)
   - `components/calendar/BookingCard.tsx` (couleurs statuts)
   - `components/calendar/EmptySlotContextMenu.tsx` (couleurs actions)
   - `components/calendar/BookingContextMenu.tsx` (couleurs actions réservations)

3. **Maintenir la cohérence:**
   - Rouge → Danger / Blocage
   - Orange → Pause / Attention secondaire
   - Vert → Succès / Terminé
   - Bleu → Information / Confirmé
   - Jaune → Attention / En attente

---

**Date:** 2026-01-02
**Version:** 6.0
**Status:** ✅ Documenté
