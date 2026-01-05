# Toutes les Actions Admin du Calendrier

## Vue d'ensemble

L'administrateur a maintenant accès à **toutes les actions** nécessaires pour gérer le calendrier, avec des couleurs distinctives pour chaque action.

---

## ✅ Actions Disponibles

### 1. Gestion des Réservations

#### 📅 Créer une Réservation
**Accès:** Clic gauche sur créneau vide OU Clic droit → "Nouvelle réservation"
**Couleur:** Turquoise
**Fonctionnalité:**
- ✅ Choix du client (existant ou nouveau)
- ✅ Sélection du service avec variations (45min, 50min, 80min)
- ✅ Calcul automatique de l'heure de fin (arrondie à 30 min)
- ✅ Notes spéciales
- ✅ Rappels SMS/Email
- ✅ Affichage immédiat dans le calendrier

---

#### ✏️ Modifier une Réservation
**Accès:** Clic gauche sur réservation existante
**Fonctionnalité:**
- ✅ Modifier l'heure
- ✅ Changer le service
- ✅ Modifier les notes
- ✅ Mise à jour immédiate dans le calendrier

---

#### 🎭 Changer le Statut
**Accès:** Clic droit sur réservation → Menu contextuel
**Statuts disponibles:**
- **PENDING** (En attente) → Jaune 🟡
- **CONFIRMED** (Confirmé) → Bleu 🔵
- **ARRIVED** (Arrivé) → Violet 🟣
- **IN_PROGRESS** (En cours) → Indigo 🔷
- **COMPLETED** (Terminé) → Vert 🟢
- **CANCELLED** (Annulé) → Rouge 🔴
- **NO_SHOW** (Absent) → Gris ⚫

**Fonctionnalité:**
- ✅ Changement de couleur immédiat
- ✅ Badge mis à jour
- ✅ Notification toast

---

#### 👤 Client Arrivé
**Accès:** Clic droit sur réservation → "Client arrivé"
**Fonctionnalité:**
- ✅ Change statut à ARRIVED
- ✅ Notification WebSocket au professionnel
- ✅ Changement de couleur immédiat (violet)

---

#### ❌ Annuler une Réservation
**Accès:** Clic droit sur réservation → "Marquer comme CANCELLED"
**Couleur:** Rouge 🔴
**Fonctionnalité:**
- ✅ Statut changé à CANCELLED
- ✅ Réservation reste visible mais en rouge
- ✅ Possibilité de supprimer complètement

---

#### 🗑️ Supprimer une Réservation
**Accès:** Clic droit sur réservation → "Supprimer"
**Fonctionnalité:**
- ✅ Suppression définitive
- ✅ Disparition immédiate du calendrier
- ✅ Créneau redevient disponible

---

### 2. Gestion des Blocages

#### 🚫 Bloquer une Journée Complète
**Accès:** Clic droit sur créneau vide → "Bloquer la journée"
**Couleur:** Rouge 🔴
**Formulaire:**
- Date (pré-remplie)
- Raison du blocage (ex: "Congé", "Vacances", "Jour férié")
- Professionnel concerné

**Résultat:**
- ✅ Toute la colonne du professionnel devient rouge
- ✅ Icône 🚫 sur tous les créneaux
- ✅ Raison affichée
- ✅ Impossible de créer une réservation sur cette journée
- ✅ Affichage immédiat

**Exemple:**
```
┌─────────────────────────────────┐
│  Sophie Lavoie - Massothérapeute│
├─────────────────────────────────┤
│ 07:00  🔴 🚫 Bloqué (Congé)     │
│ 08:00  🔴 🚫 Bloqué (Congé)     │
│ 09:00  🔴 🚫 Bloqué (Congé)     │
│ ...    🔴 🚫 Bloqué (Congé)     │
│ 17:00  🔴 🚫 Bloqué (Congé)     │
└─────────────────────────────────┘
```

---

#### 🕒 Bloquer une Période Spécifique
**Accès:** Clic droit sur créneau vide → "Bloquer une période"
**Couleur:** Ambre/Rouge 🔴
**Formulaire:**
- Date (pré-remplie)
- Heure de début (pré-remplie avec le créneau cliqué)
- Heure de fin
- Raison du blocage (ex: "Réunion", "Formation", "RDV médical")

**Résultat:**
- ✅ Créneaux spécifiés deviennent rouges
- ✅ Icône 🚫 sur les créneaux concernés
- ✅ Raison affichée
- ✅ Créneaux avant/après restent disponibles
- ✅ Affichage immédiat

**Exemple:**
```
┌─────────────────────────────────┐
│  Sophie Lavoie - Massothérapeute│
├─────────────────────────────────┤
│ 13:00  🟢 Disponible            │
│ 14:00  🔴 🚫 Bloqué (Formation) │
│ 15:00  🔴 🚫 Bloqué (Formation) │
│ 16:00  🔴 🚫 Bloqué (Formation) │
│ 17:00  🟢 Disponible            │
└─────────────────────────────────┘
```

---

#### 🔓 Débloquer une Journée/Période
**Accès:** Clic droit sur créneau bloqué → "Débloquer"
**Couleur:** Vert 🟢
**Fonctionnalité:**
- ✅ Détection automatique du blocage existant
- ✅ Affichage de la raison dans le menu
- ✅ Suppression du blocage en un clic
- ✅ Créneaux redeviennent verts immédiatement
- ✅ Créneaux redeviennent cliquables

**Menu affiché:**
```
┌───────────────────────────────┐
│ 📅 Nouvelle réservation       │
│ ☕ Ajouter une pause           │
│ ────────────────────────      │
│ 🔓 Débloquer                  │
│    Retirer: Congé             │ ← Raison affichée
└───────────────────────────────┘
```

---

### 3. Gestion des Pauses

#### ☕ Ajouter une Pause
**Accès:** Clic droit sur créneau vide → "Ajouter une pause"
**Couleur:** Orange 🟠
**Formulaire:**
- Professionnel (pré-rempli)
- Label de la pause (ex: "Lunch", "Pause café", "Repos")
- Heure de début (pré-remplie)
- Heure de fin
- Jours de la semaine (pour pauses récurrentes)
  - Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche

**Résultat:**
- ✅ Créneaux deviennent orange
- ✅ Icône ☕ affichée
- ✅ Label de la pause visible
- ✅ Impossible de créer une réservation sur ces créneaux
- ✅ Pause récurrente apparaît tous les jours sélectionnés
- ✅ Affichage immédiat

**Exemple:**
```
┌─────────────────────────────────┐
│  Sophie Lavoie - Massothérapeute│
├─────────────────────────────────┤
│ 11:30  🟢 Disponible            │
│ 12:00  🟠 ☕ Pause lunch        │
│ 12:30  🟠 ☕ Pause lunch        │
│ 13:00  🟢 Disponible            │
└─────────────────────────────────┘
```

---

#### 🗑️ Supprimer une Pause
**Accès:** Clic droit sur créneau en pause → "Supprimer la pause"
**Couleur:** Rouge 🔴
**Fonctionnalité:**
- ✅ Détection automatique de la pause existante
- ✅ Suppression de la pause en un clic
- ✅ Créneaux redeviennent verts immédiatement
- ✅ Si pause récurrente, supprimée pour tous les jours
- ✅ Créneaux redeviennent disponibles

**Menu affiché:**
```
┌───────────────────────────────┐
│ 📅 Nouvelle réservation       │
│ ☕ Ajouter une pause           │
│ ────────────────────────      │
│ 🗑️ Supprimer la pause        │
│    Retirer cette pause        │
└───────────────────────────────┘
```

---

#### ✏️ Modifier une Pause (Future)
**Status:** À implémenter
**Fonctionnalité prévue:**
- Modifier l'heure de début/fin
- Changer le label
- Modifier les jours récurrents

---

#### ↔️ Déplacer une Pause (Future)
**Status:** À implémenter
**Fonctionnalité prévue:**
- Drag & drop pour déplacer une pause
- Ou modal pour changer l'heure

---

## 🎨 Codes Couleur - Résumé

| Action / État | Couleur | Icône | Menu Hover |
|--------------|---------|-------|------------|
| **CRÉNEAUX** |
| Disponible | Blanc/Turquoise hover | - | `hover:bg-spa-turquoise-50` |
| Bloqué (journée) | Rouge `bg-red-100` | 🚫 | - |
| Bloqué (période) | Rouge `bg-red-100` | 🚫 | - |
| Pause | Orange `bg-orange-100` | ☕ | - |
| **RÉSERVATIONS** |
| En attente | Jaune `bg-yellow-100` | - | - |
| Confirmé | Bleu `bg-blue-100` | - | - |
| Arrivé | Violet `bg-purple-100` | - | - |
| En cours | Indigo `bg-indigo-100` | - | - |
| Terminé | Vert `bg-green-100` | - | - |
| Annulé | Rouge `bg-red-100` | - | - |
| Absent | Gris `bg-gray-100` | - | - |
| **ACTIONS MENU** |
| Créer réservation | Turquoise `bg-spa-turquoise-100` | ➕ | `hover:bg-spa-turquoise-50` |
| Ajouter pause | Orange `bg-orange-100` | ☕ | `hover:bg-orange-50` |
| Bloquer journée | Rouge `bg-red-100` | 🚫 | `hover:bg-red-50` |
| Bloquer période | Ambre `bg-amber-100` | 🕒 | `hover:bg-amber-50` |
| Débloquer | Vert `bg-green-100` | 🔓 | `hover:bg-green-50` |
| Supprimer pause | Rouge `bg-red-100` | 🗑️ | `hover:bg-red-50` |
| Supprimer réservation | Rouge `bg-red-100` | 🗑️ | `hover:bg-red-50` |

---

## 🔄 Rafraîchissement Automatique

Toutes les actions entraînent un rafraîchissement **automatique et immédiat** du calendrier grâce à:

### 1. RTK Query Cache Invalidation
Chaque mutation invalide les tags appropriés:
- `createBooking` → Invalide `['Booking', 'Client', 'Availability', 'Break']`
- `updateBooking` → Invalide `['Booking', 'Availability', 'Break']`
- `deleteBooking` → Invalide `['Booking', 'Availability', 'Break']`
- `createAvailabilityBlock` → Invalide `['Availability', 'Booking']`
- `deleteAvailabilityBlock` → Invalide `['Availability', 'Booking']`
- `createBreak` → Invalide `['Break', 'Booking']`
- `deleteBreak` → Invalide `['Break', 'Booking']`

### 2. Refetch Manuel
Callback `onSuccess()` après chaque mutation:
```typescript
onSuccess={() => {
  refetchBookings();
}}
```

### 3. WebSocket Temps Réel
Écoute des événements:
- `booking:created`
- `booking:updated`
- `booking:deleted`

**Résultat:** Le calendrier est **toujours à jour**, pas besoin de rafraîchir la page.

---

## 📱 Menus Contextuels

### Menu Créneau Vide (Disponible)
```
┌─────────────────────────────────┐
│ 📅 Nouvelle réservation         │
│ ────────────────────────────    │
│ ☕ Ajouter une pause             │
│ ────────────────────────────    │
│ 🚫 Bloquer la journée           │
│ 🕒 Bloquer une période          │
└─────────────────────────────────┘
```

### Menu Créneau Bloqué
```
┌─────────────────────────────────┐
│ 📅 Nouvelle réservation         │
│ ☕ Ajouter une pause             │
│ ────────────────────────────    │
│ 🔓 Débloquer                    │
│    Retirer: Congé               │
└─────────────────────────────────┘
```

### Menu Créneau en Pause
```
┌─────────────────────────────────┐
│ 📅 Nouvelle réservation         │
│ ☕ Ajouter une pause             │
│ ────────────────────────────    │
│ 🗑️ Supprimer la pause          │
│    Retirer cette pause          │
└─────────────────────────────────┘
```

### Menu Réservation
```
┌─────────────────────────────────┐
│ ✏️ Modifier                     │
│ ────────────────────────────    │
│ ✅ Marquer comme Confirmé       │
│ 👤 Client arrivé                │
│ 🏁 Marquer comme Terminé        │
│ ────────────────────────────    │
│ ❌ Annuler                      │
│ 🗑️ Supprimer                   │
└─────────────────────────────────┘
```

---

## ⚡ Raccourcis Clavier (Future)

| Raccourci | Action |
|-----------|--------|
| `N` | Nouvelle réservation |
| `B` | Bloquer journée |
| `P` | Ajouter pause |
| `Échap` | Fermer menu/modal |
| `Entrée` | Confirmer formulaire |

**Status:** À implémenter

---

## 🎯 Scénarios d'Utilisation

### Scénario 1: Journée de Congé
1. Admin ouvre calendrier
2. Clic droit sur n'importe quel créneau du jour
3. "Bloquer la journée" → Raison: "Congé"
4. **Résultat:** Toute la journée rouge, impossible de réserver

### Scénario 2: Formation l'Après-Midi
1. Clic droit sur 14:00
2. "Bloquer une période" → 14:00-17:00, Raison: "Formation"
3. **Résultat:** Créneaux 14:00-17:00 rouges, reste disponible

### Scénario 3: Pause Lunch Récurrente
1. Clic droit sur 12:00
2. "Ajouter une pause" → Label: "Lunch", 12:00-13:00
3. Cocher: Lundi, Mardi, Mercredi, Jeudi, Vendredi
4. **Résultat:** Pause lunch apparaît du lundi au vendredi, tous les jours

### Scénario 4: Annuler un Congé
1. Journée bloquée pour "Congé"
2. Admin change d'avis
3. Clic droit sur n'importe quel créneau rouge
4. "Débloquer" → Retirer: Congé
5. **Résultat:** Journée redevient disponible immédiatement

### Scénario 5: Client ne se Présente Pas
1. Réservation 10:00 - Jean Dupont (statut: CONFIRMED)
2. Client ne se présente pas
3. Clic droit sur réservation → "Marquer comme NO_SHOW"
4. **Résultat:** Réservation devient grise, créneau reste occupé mais identifiable

---

## ✅ Checklist Admin

- ✅ Créer réservation
- ✅ Modifier réservation
- ✅ Changer statut réservation
- ✅ Annuler réservation
- ✅ Supprimer réservation
- ✅ Bloquer journée complète
- ✅ Bloquer période spécifique
- ✅ Débloquer journée/période
- ✅ Ajouter pause
- ✅ Supprimer pause
- ✅ Identifier visuellement chaque action (couleurs)
- ✅ Rafraîchissement automatique
- ❌ Déplacer pause (à implémenter)
- ❌ Modifier pause (à implémenter)
- ❌ Raccourcis clavier (à implémenter)

---

## 📊 Permissions

| Action | ADMIN | SECRETAIRE | MASSOTHERAPEUTE | ESTHETICIENNE |
|--------|-------|------------|-----------------|---------------|
| Créer réservation | ✅ | ✅ | ❌ | ❌ |
| Modifier réservation | ✅ | ✅ | ❌ | ❌ |
| Annuler réservation | ✅ | ✅ | ❌ | ❌ |
| Bloquer journée | ✅ | ✅ | ❌ | ❌ |
| Débloquer journée | ✅ | ✅ | ❌ | ❌ |
| Ajouter pause | ✅ | ✅ | ❌ | ❌ |
| Supprimer pause | ✅ | ✅ | ❌ | ❌ |
| Voir calendrier complet | ✅ | ✅ | ❌ | ❌ |
| Voir son calendrier | ✅ | ✅ | ✅ | ✅ |
| Changer statut | ✅ | ✅ | ✅ (ses rdv) | ✅ (ses rdv) |

---

**Date:** 2026-01-02
**Version:** 8.0
**Status:** ✅ Complet et Fonctionnel
**Build:** ✅ Réussi sans erreurs
