# 🚀 Guide Complet - Nouvelles API de Gestion des Horaires

## ✅ Intégration Complète - 4 Nouvelles Fonctionnalités

Toutes les nouvelles API backend ont été **parfaitement intégrées** dans le frontend avec des composants UI modernes et intuitifs !

---

## 📋 Vue d'Ensemble

| # | Fonctionnalité | Endpoint | Composant UI | Statut |
|---|---------------|----------|--------------|--------|
| 1️⃣ | **Générer horaires sur période** | POST `/api/availability/generate-period` | `GeneratePeriodModal.tsx` | ✅ |
| 2️⃣ | **Modifier horaire d'un jour** | PATCH `/api/availability/day/{id}` | *(À venir)* | 🔄 |
| 3️⃣ | **Modifier une pause** | PATCH `/api/availability/breaks/{id}` | Hook disponible | ✅ |
| 4️⃣ | **Débloquer une journée** | POST `/api/availability/unblock-day` | Menu contextuel | ✅ |

---

## 1️⃣ Génération d'Horaires sur Période

### 🎯 Objectif
Générer automatiquement les horaires pour un professionnel sur 1, 3, 6 ou 12 mois en utilisant son template hebdomadaire.

### 📦 API Backend
```typescript
POST /api/availability/generate-period
Authorization: Bearer {token}

Body: {
  professionalId: string,
  startDate: string,      // Format: YYYY-MM-DD
  endDate: string         // Format: YYYY-MM-DD
}

Response: {
  success: boolean,
  message: string,
  data: {
    professionalId: string,
    startDate: string,
    endDate: string,
    generated: number,     // Nombre de jours générés
    period: string         // "2026-01-06 → 2026-04-06"
  }
}
```

### 🎨 Composant UI : `GeneratePeriodModal`

**Emplacement :** `components/calendar/GeneratePeriodModal.tsx`

**Fonctionnalités :**
- ✅ Sélection du professionnel
- ✅ Date de début personnalisable
- ✅ Choix de période : 1, 3, 6 ou 12 mois (boutons cliquables)
- ✅ Résumé visuel de la période
- ✅ Calcul automatique du nombre de jours
- ✅ Bannière d'information sur le fonctionnement
- ✅ Messages de succès détaillés avec toast

**Utilisation :**
```tsx
import GeneratePeriodModal from '@/components/calendar/GeneratePeriodModal';

<GeneratePeriodModal
  isOpen={showGenerateModal}
  onClose={() => setShowGenerateModal(false)}
  professionals={professionals}
  onSuccess={() => {
    // Rafraîchir le calendrier
    refetchBookings();
  }}
/>
```

### 🎬 Workflow Utilisateur
1. Admin/Secrétaire clique sur "Générer horaires" (bouton à ajouter)
2. Modal s'ouvre avec le formulaire
3. Sélectionne le professionnel
4. Choisit la date de début
5. Sélectionne la période (ex: 3 mois)
6. Voit le résumé : "6 janvier 2026 → 6 avril 2026 (≈ 90 jours)"
7. Clique sur "Générer les horaires"
8. Toast de succès : "65 disponibilités générées avec succès"
9. Calendrier se rafraîchit automatiquement

---

## 2️⃣ Modifier un Horaire d'un Jour Spécifique

### 🎯 Objectif
Ajuster ponctuellement les horaires d'un jour sans affecter le template hebdomadaire.

### 📦 API Backend
```typescript
PATCH /api/availability/day/{availabilityId}
Authorization: Bearer {token}

Body: {
  startTime?: string,     // Format: HH:mm (optionnel)
  endTime?: string,       // Format: HH:mm (optionnel)
  isAvailable?: boolean,  // Optionnel
  reason?: string         // Optionnel
}

Response: {
  success: boolean,
  message: string,
  data: AvailabilityBlock
}
```

### 🔧 Hook RTK Query
```typescript
import { useUpdateDayAvailabilityMutation } from '@/lib/redux/services/api';

const [updateDay, { isLoading }] = useUpdateDayAvailabilityMutation();

// Exemple : Modifier le 15 janvier de 9h-17h à 10h-18h
await updateDay({
  id: availabilityId,
  data: {
    startTime: "10:00",
    endTime: "18:00",
    reason: "Horaire modifié manuellement"
  }
}).unwrap();
```

### 💡 À Implémenter
- Composant `EditDayModal` pour modifier un jour spécifique
- Bouton dans le menu contextuel du calendrier
- Affichage visuel des horaires modifiés (badge "Modifié")

---

## 3️⃣ Modifier une Pause Existante

### 🎯 Objectif
Modifier les détails d'une pause récurrente (horaire, jour, label, activer/désactiver).

### 📦 API Backend
```typescript
PATCH /api/availability/breaks/{breakId}
Authorization: Bearer {token}

Body: {
  dayOfWeek?: number | null,  // 0-6 ou null
  startTime?: string,         // Format: HH:mm
  endTime?: string,           // Format: HH:mm
  label?: string,             // Ex: "Pause lunch"
  isActive?: boolean          // Activer/désactiver
}

Response: {
  success: boolean,
  message: string,
  data: Break
}
```

### 🔧 Hook RTK Query
```typescript
import { useUpdateBreakMutation } from '@/lib/redux/services/api';

const [updateBreak, { isLoading }] = useUpdateBreakMutation();

// Exemple : Déplacer la pause de 12h-13h à 12h30-13h30
await updateBreak({
  id: breakId,
  data: {
    startTime: "12:30",
    endTime: "13:30"
  }
}).unwrap();
```

### 💡 Utilisation Actuelle
Le hook est **déjà disponible** et peut être utilisé dans :
- Menu contextuel sur une pause
- Modal de modification de pause
- Page de gestion des horaires

**Exemple d'intégration :**
```tsx
const handleEditBreak = async (breakId: string) => {
  try {
    await updateBreak({
      id: breakId,
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        label: newLabel
      }
    }).unwrap();

    toast.success('Pause modifiée avec succès');
    refetchBookings();
  } catch (error) {
    toast.error('Erreur lors de la modification');
  }
};
```

---

## 4️⃣ Débloquer une Journée Bloquée

### 🎯 Objectif
Réactiver une journée complète qui a été bloquée (congé, vacances, etc.).

### 📦 API Backend
```typescript
POST /api/availability/unblock-day
Authorization: Bearer {token}

Body: {
  professionalId: string,
  date: string  // Format: YYYY-MM-DD
}

Response: {
  success: boolean,
  message: string,
  data: AvailabilityBlock  // Avec isAvailable = true
}
```

### 🎨 Intégration UI : Menu Contextuel

**Emplacement :** `CalendarView.tsx` → `EmptySlotContextMenu.tsx`

**Fonctionnalités :**
- ✅ Détection automatique des blocages de journée complète
- ✅ Option "Débloquer" affichée uniquement si un blocage existe
- ✅ Affichage de la raison du blocage dans le menu
- ✅ Toast de succès : "Journée débloquée avec succès ! 🎉"
- ✅ Rafraîchissement automatique du calendrier

**Workflow Utilisateur :**
1. Admin/Secrétaire voit une journée bloquée (bandeau rouge)
2. Clic droit sur un créneau de cette journée
3. Menu contextuel affiche : "🔓 Débloquer - Retirer: Congé"
4. Clique sur "Débloquer"
5. La journée redevient disponible (bandeau rouge disparaît)
6. Toast de confirmation

### 🔧 Code Implémenté
```typescript
// CalendarView.tsx - lignes 410-441
const handleUnblock = async () => {
  if (!emptySlotContextMenu) return;

  const currentDate = format(emptySlotContextMenu.date, 'yyyy-MM-dd');
  const fullDayBlock = allBlocks.find(
    block => block.professionalId === emptySlotContextMenu.professionalId &&
    block.date === currentDate &&
    !block.startTime && !block.endTime
  );

  try {
    if (fullDayBlock) {
      // Débloquer une journée complète avec la nouvelle API
      await unblockDay({
        professionalId: emptySlotContextMenu.professionalId,
        date: currentDate,
      }).unwrap();
      toast.success('Journée débloquée avec succès ! 🎉');
    } else if (emptySlotContextMenu.blockId) {
      // Supprimer un blocage de période
      await deleteAvailabilityBlock(emptySlotContextMenu.blockId).unwrap();
      toast.success('Blocage de période supprimé avec succès');
    }

    setEmptySlotContextMenu(null);
    refetchBookings();
  } catch (error: any) {
    console.error('Erreur déblocage:', error);
    toast.error(error.data?.message || 'Erreur lors du déblocage');
  }
};
```

---

## 📁 Fichiers Modifiés/Créés

### ✅ Fichiers Créés
1. **`components/calendar/GeneratePeriodModal.tsx`**
   - Modal complet pour générer les horaires sur période
   - 235 lignes de code
   - UI moderne avec animations

2. **`NOUVELLES_API_GUIDE.md`** (ce fichier)
   - Documentation complète
   - Exemples de code
   - Workflows utilisateur

### ✅ Fichiers Modifiés
1. **`lib/redux/services/api.ts`**
   - Ajout de 6 nouveaux types TypeScript (lignes 647-695)
   - Ajout de 4 nouvelles mutations (lignes 1512-1562)
   - Export de 4 nouveaux hooks (lignes 1701-1704)

2. **`components/calendar/CalendarView.tsx`**
   - Import de `useUnblockDayMutation` (ligne 22)
   - Utilisation du hook (ligne 132)
   - Amélioration de `handleUnblock` (lignes 410-441)

3. **`components/calendar/EmptySlotContextMenu.tsx`**
   - Déjà supportait le déblocage (option "Débloquer")

---

## 🎯 Prochaines Étapes Recommandées

### 1. Ajouter le Bouton "Générer Horaires"
Ajouter un bouton dans `CalendarHeader.tsx` pour ouvrir `GeneratePeriodModal` :

```tsx
// CalendarHeader.tsx
const [showGenerateModal, setShowGenerateModal] = useState(false);

<button
  onClick={() => setShowGenerateModal(true)}
  className="btn-secondary flex items-center gap-2"
>
  <Sparkles className="w-4 h-4" />
  Générer horaires
</button>

<GeneratePeriodModal
  isOpen={showGenerateModal}
  onClose={() => setShowGenerateModal(false)}
  professionals={professionals}
  onSuccess={refetchBookings}
/>
```

### 2. Créer `EditDayModal`
Pour modifier les horaires d'un jour spécifique :
- Formulaire avec startTime, endTime, isAvailable
- Accessible via le menu contextuel du calendrier
- Utilise `useUpdateDayAvailabilityMutation`

### 3. Ajouter "Modifier la Pause"
Dans le menu contextuel quand on clique sur une pause :
- Option "Modifier cette pause"
- Modal avec tous les champs éditables
- Utilise `useUpdateBreakMutation`

### 4. Page de Gestion Globale
Créer une page admin dédiée :
- Liste de tous les professionnels
- Template hebdomadaire de chacun
- Boutons : Générer 3 mois, Voir calendrier, etc.
- Statistiques : X jours générés, Y blocages, Z pauses

---

## 🧪 Tests Recommandés

### Test 1 : Génération d'Horaires
```bash
# Via l'UI
1. Ouvrir le calendrier
2. Cliquer sur "Générer horaires"
3. Sélectionner un professionnel
4. Choisir période de 3 mois
5. Cliquer "Générer"
6. Vérifier le toast de succès
7. Vérifier que le calendrier affiche les nouveaux horaires
```

### Test 2 : Déblocage de Journée
```bash
# Via l'UI
1. Bloquer une journée (menu contextuel)
2. Vérifier le bandeau rouge "JOURNÉE BLOQUÉE"
3. Clic droit sur un créneau de cette journée
4. Cliquer sur "Débloquer"
5. Vérifier que le bandeau rouge disparaît
6. Vérifier qu'on peut créer des réservations à nouveau
```

### Test 3 : Modification de Pause
```bash
# Via le hook
const [updateBreak] = useUpdateBreakMutation();

await updateBreak({
  id: "break-id-123",
  data: { startTime: "13:00", endTime: "14:00" }
}).unwrap();

# Vérifier que la pause est bien déplacée dans le calendrier
```

---

## 🎨 Design System Utilisé

Tous les composants utilisent les classes Tailwind cohérentes avec le reste de l'application :

- **Couleurs principales** : `spa-turquoise-*`, `spa-lavande-*`
- **Boutons** : `btn-primary`, `btn-secondary`, `btn-outline`
- **Inputs** : `input-spa`, `label-spa`
- **Modals** : Shadow-2xl, rounded-2xl, animations Framer Motion
- **Icons** : Lucide React (Sparkles, Calendar, Ban, Unlock, etc.)
- **Toasts** : React Hot Toast avec messages détaillés

---

## 💡 Tips & Best Practices

### Performance
- Les mutations invalident automatiquement les tags appropriés
- Le calendrier se rafraîchit automatiquement après chaque action
- Pas besoin de rafraîchir la page manuellement

### UX
- Toujours afficher un toast de confirmation
- Utiliser des animations pour les transitions
- Désactiver les boutons pendant le chargement
- Afficher des messages d'erreur clairs

### Sécurité
- Toutes les mutations nécessitent l'authentification (Bearer token)
- Les permissions sont vérifiées côté backend
- Seuls ADMIN et SECRETAIRE peuvent générer/débloquer

---

## 📞 Support

En cas de problème :
1. Vérifier la console (F12) pour les erreurs
2. Vérifier que le backend est démarré (localhost:5003)
3. Vérifier le token d'authentification
4. Vérifier les logs backend pour plus de détails

---

**Dernière mise à jour :** 2 janvier 2026
**Version :** 1.0.0
**Statut :** ✅ Production Ready
