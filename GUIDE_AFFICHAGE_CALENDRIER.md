# 🔧 Guide de Débogage - Affichage du Calendrier

## ✅ Corrections Appliquées

### 1. **Style des Réservations - VERT VISIBLE**
Toutes les réservations s'affichent maintenant avec :
- ✅ Fond **vert vif** (bg-green-500)
- ✅ Bordure gauche **vert foncé** (border-green-700)
- ✅ Texte **blanc** pour contraste maximal
- ✅ Ombre portée pour relief visuel
- ✅ Effet hover pour interactivité

**Fichiers modifiés :**
- `components/calendar/BookingCard.tsx` - Carte de réservation simplifiée
- `components/calendar/HorizontalCalendarGrid.tsx` - Grille horizontale (secrétaire/admin)
- `components/calendar/SingleColumnCalendarGrid.tsx` - Vue mobile (techniciens)

### 2. **Amélioration des Blocages et Pauses**
- 🔴 **Blocages** : Fond rouge vif (bg-red-500/80) avec texte blanc "BLOQUÉ"
- 🟠 **Pauses** : Fond orange vif (bg-orange-500/80) avec texte blanc "PAUSE"

### 3. **Logs de Diagnostic Améliorés**
Ajout de logs détaillés dans la console pour diagnostiquer les problèmes :

```javascript
// Dans CalendarView.tsx (ligne 107-118)
console.log('📊 Réservations récupérées:', { ... });

// Dans HorizontalCalendarGrid.tsx (lignes 308-325)
console.error('❌ Position null pour booking:', { ... });
console.log('✅ Booking affiché:', { ... });
```

### 4. **Correction du Fuseau Horaire**
Problème du `new Date('yyyy-MM-dd')` qui créait une date UTC au lieu de locale.

**Avant :**
```javascript
const startDate = new Date(date); // ❌ Créait minuit UTC
```

**Après :**
```javascript
const [year, month, day] = date.split('-').map(Number);
const startDate = new Date(year, month - 1, day, hours, minutes, 0, 0); // ✅ Temps local
```

### 5. **Filtrage des Pauses par Jour de Semaine**
Ajout de la vérification du `dayOfWeek` pour afficher les pauses uniquement les jours appropriés.

---

## 🔍 Comment Diagnostiquer si Rien ne s'Affiche

### Étape 1 : Ouvrir la Console du Navigateur
1. Ouvrir le calendrier
2. Appuyer sur **F12** (ou Cmd+Option+I sur Mac)
3. Aller dans l'onglet **Console**

### Étape 2 : Vérifier les Logs
Cherchez ces messages :

#### ✅ **Cas Normal** (réservations présentes)
```
📊 Réservations récupérées: {
  date: "2026-01-02",
  count: 3,
  bookings: [...]
}

✅ Booking affiché: {
  id: "xxx",
  client: "Jean Dupont",
  position: { top: 120, height: 60 },
  ...
}
```

#### ❌ **Problème 1** : Aucune réservation récupérée
```
📊 Réservations récupérées: {
  date: "2026-01-02",
  count: 0,  // ❌ PROBLÈME ICI
  bookings: []
}
```

**Solution** : Le backend ne retourne pas de réservations
- Vérifier que l'API backend fonctionne : `http://localhost:5003/api`
- Vérifier les filtres de date
- Vérifier les permissions utilisateur

#### ❌ **Problème 2** : Position null
```
❌ Position null pour booking: {
  id: "xxx",
  startTime: "Invalid Date",  // ❌ PROBLÈME ICI
  ...
}
```

**Solution** : Format de date invalide
- Les dates doivent être au format ISO : `"2026-01-02T10:00:00.000Z"`
- Vérifier le backend pour s'assurer qu'il retourne des dates ISO

#### ❌ **Problème 3** : Réservations hors vue
Si position.top est très grande ou négative :
```
✅ Booking affiché: {
  position: { top: -200, height: 60 }  // ❌ Hors de vue !
}
```

**Solution** : Problème de calcul de position
- Vérifier que `startTime` et `endTime` sont le même jour que `selectedDate`
- Vérifier les heures de début/fin du calendrier (7h-20h par défaut)

### Étape 3 : Vérifier l'API Backend

```bash
# Test manuel de l'API
curl http://localhost:5003/api/bookings?startDate=2026-01-02&endDate=2026-01-02 \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

La réponse doit contenir :
```json
{
  "bookings": [
    {
      "id": "xxx",
      "startTime": "2026-01-02T10:00:00.000Z",  // ✅ Format ISO
      "endTime": "2026-01-02T11:00:00.000Z",    // ✅ Format ISO
      "professionalId": "xxx",
      "client": { ... },
      "service": { ... }
    }
  ]
}
```

### Étape 4 : Vérifier le Rôle Utilisateur

#### Pour la **Secrétaire/Admin** :
- Doit voir TOUTES les réservations de TOUS les professionnels
- Vue : `HorizontalCalendarGrid` (grille horizontale)

#### Pour les **Techniciens** (Massothérapeute/Esthéticienne) :
- Doit voir UNIQUEMENT ses propres réservations
- Vue : `SingleColumnCalendarGrid` (colonne unique)
- Si aucune réservation : Message "Aucune réservation aujourd'hui"

---

## 🎨 Apparence Visuelle Attendue

### Réservations (VERT)
```
┌─────────────────────────────────────┐
│ 👤 Jean Dupont                      │ ← Nom en blanc gras
│    Massage thérapeutique             │ ← Service en blanc
│ 🕐 10:00 - 11:00                    │ ← Horaire en blanc gras
└─────────────────────────────────────┘
   ↑ Fond VERT (bg-green-500)
   ↑ Bordure gauche VERT FONCÉ (4px)
```

### Blocages (ROUGE)
```
┌─────────────────────────────────────┐
│         🚫 BLOQUÉ                   │ ← Texte blanc gras
└─────────────────────────────────────┘
   ↑ Fond ROUGE (bg-red-500/80)
```

### Pauses (ORANGE)
```
┌─────────────────────────────────────┐
│         ☕ PAUSE                     │ ← Texte blanc gras
└─────────────────────────────────────┘
   ↑ Fond ORANGE (bg-orange-500/80)
```

---

## 🚀 Test Rapide

1. **Créer une réservation manuelle** :
   - Ouvrir le calendrier
   - Clic droit sur un créneau vide
   - "Créer une réservation"
   - Remplir le formulaire
   - Sauvegarder

2. **Vérifier l'affichage** :
   - La réservation doit apparaître **IMMÉDIATEMENT**
   - En **VERT VIF**
   - Avec le nom du client visible
   - À l'heure correcte

3. **Si rien ne s'affiche** :
   - Ouvrir la console (F12)
   - Chercher les logs "📊 Réservations récupérées"
   - Vérifier le `count` (doit être > 0)
   - Chercher les logs "✅ Booking affiché"

---

## 📞 Points de Vérification

- [ ] Les réservations s'affichent en VERT ?
- [ ] Le nom du client est visible en blanc ?
- [ ] L'heure est correcte et visible ?
- [ ] Les pauses s'affichent en ORANGE ?
- [ ] Les blocages s'affichent en ROUGE ?
- [ ] La console affiche "✅ Booking affiché" ?
- [ ] Le backend retourne des dates au format ISO ?
- [ ] Les techniciens voient LEURS réservations ?
- [ ] La secrétaire voit TOUTES les réservations ?

---

## 🐛 Si le Problème Persiste

1. **Vider le cache du navigateur** : Ctrl+Shift+R (ou Cmd+Shift+R sur Mac)
2. **Redémarrer le serveur de développement** :
   ```bash
   npm run dev
   ```
3. **Vérifier le backend** :
   ```bash
   # Vérifier que l'API est accessible
   curl http://localhost:5003/api/health
   ```
4. **Partager les logs de la console** pour diagnostic approfondi

---

Dernière mise à jour : 2 janvier 2026
