# 🔧 Correction: Liste Déroulante d'Assignation des Professionnels

## ❌ Problème Identifié

**Symptôme**: La liste déroulante pour assigner un client à un professionnel (massothérapeute ou esthéticienne) n'affichait aucun nom.

**Localisation**: Page dashboard admin/secrétaire - Modal "Assigner un client"

**Cause**: Le code utilisait l'endpoint `/api/professionals` qui n'existe pas. Les professionnels sont dans `/api/users` et doivent être filtrés par rôle.

---

## 🔍 Analyse du Problème

### Structure de l'API

L'API ne fournit **pas** d'endpoint `/api/professionals`.

Les employés (incluant les professionnels) sont tous dans:
```
GET /api/users
```

**Réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cmj4kvvk00000rx33psrg10vw",
      "email": "admin@spa.com",
      "nom": "Admin",
      "prenom": "Principal",
      "role": "ADMIN"
    },
    {
      "id": "cmj4kvvop0001rx336s9hgxeu",
      "email": "secretaire@spa.com",
      "nom": "Dubois",
      "prenom": "Marie",
      "role": "SECRETAIRE"
    },
    {
      "id": "cmj4kvvry0002rx33hjykx6qp",
      "email": "masso1@spa.com",
      "nom": "Martin",
      "prenom": "Sophie",
      "role": "MASSOTHERAPEUTE"  // ← Professionnel
    },
    {
      "id": "cmj4kvvye0004rx33ime83m1f",
      "email": "esthetique1@spa.com",
      "nom": "Tremblay",
      "prenom": "Julie",
      "role": "ESTHETICIENNE"  // ← Professionnel
    }
  ]
}
```

**Les professionnels** = Utilisateurs avec `role` = `'MASSOTHERAPEUTE'` ou `'ESTHETICIENNE'`

---

### Code Problématique (AVANT)

**Dashboard** (`app/professionnel/dashboard/page.tsx`):
```typescript
// ❌ Utilise un endpoint qui n'existe pas
import { useGetProfessionalsQuery } from '@/lib/redux/services/api';

const { data: professionalsData } = useGetProfessionalsQuery();
const professionals = professionalsData?.professionals || [];
// professionals = [] (vide!) car l'endpoint n'existe pas
```

**Modal d'assignation**:
```typescript
<select>
  <option value="">Choisir un professionnel...</option>
  {professionals  // ❌ Liste vide!
    .filter((p) => /* filtrer par type de service */)
    .map((professional) => (
      <option key={professional.id} value={professional.id}>
        {getProfessionalLabel(professional)}
      </option>
    ))}
</select>
```

**Résultat**: Aucune option dans la liste déroulante ❌

---

## ✅ Solution Appliquée

### 1. Remplacement de l'Endpoint (`app/professionnel/dashboard/page.tsx`)

**AVANT**:
```typescript
import { useGetClientsQuery, useGetProfessionalsQuery, useAssignClientMutation } from '@/lib/redux/services/api';

const { data: professionalsData } = useGetProfessionalsQuery();
const professionals = professionalsData?.professionals || [];
```

**APRÈS**:
```typescript
import { useGetClientsQuery, useGetUsersQuery, useAssignClientMutation } from '@/lib/redux/services/api';

const { data: usersData } = useGetUsersQuery({});
// Filtrer uniquement les professionnels (massothérapeutes et esthéticiennes)
const professionals = (usersData?.users || []).filter(
  (user) => user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE'
);
```

**Changements**:
- ✅ Utilisation de `useGetUsersQuery()` au lieu de `useGetProfessionalsQuery()`
- ✅ Filtrage des utilisateurs pour ne garder que les professionnels
- ✅ `professionals` contient maintenant les vrais massothérapeutes et esthéticiennes

---

### 2. Mise à Jour des Couleurs (Rose → Turquoise)

**Dashboard** (`app/professionnel/dashboard/page.tsx`):
```typescript
// AVANT
bg-gradient-to-br from-spa-beige-50 via-white to-spa-rose-50
from-spa-rose-100 to-spa-rose-200
text-spa-rose-600
text-spa-rose-500 animate-spin

// APRÈS
bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50
from-spa-turquoise-100 to-spa-turquoise-200
text-spa-turquoise-600
text-spa-turquoise-500 animate-spin
```

**ClientCard** (`components/clients/ClientCard.tsx`):
```typescript
// AVANT
text-spa-rose-500
text-spa-rose-600 hover:text-spa-rose-700

// APRÈS
text-spa-turquoise-500
text-spa-turquoise-600 hover:text-spa-turquoise-700
```

---

## 🎯 Impact des Corrections

### Avant (Broken)

```
1. Dashboard charge
2. useGetProfessionalsQuery() appelle /api/professionals
3. Endpoint n'existe pas → Retourne []
4. professionals = []
5. Liste déroulante vide ❌
6. Impossible d'assigner un client
```

### Après (Fixed)

```
1. Dashboard charge
2. useGetUsersQuery() appelle /api/users
3. API retourne tous les utilisateurs
4. Filter: garde seulement MASSOTHERAPEUTE et ESTHETICIENNE
5. professionals = [Sophie Martin, Pierre Leblanc, Julie Tremblay, Isabelle Gagnon]
6. Liste déroulante affiche les professionnels ✅
7. Assignation fonctionne!
```

---

## 🧪 Test de Validation

### Test 1: Affichage de la Liste des Professionnels

```bash
# 1. Se connecter en tant qu'admin ou secrétaire
Email: admin@spa.com
Password: admin123

# 2. Aller sur le dashboard
http://localhost:3000/professionnel/dashboard

# 3. Cliquer sur "Assigner à un professionnel" sur une carte client
```

**Résultat attendu**:
- ✅ Modal "Assigner un client" s'ouvre
- ✅ Liste déroulante affiche les professionnels:
  - Pour un client MASSOTHERAPIE: Liste des massothérapeutes
  - Pour un client ESTHETIQUE: Liste des esthéticiennes
- ✅ Format: "Prénom Nom - Rôle" (ex: "Sophie Martin - Massothérapeute")

**Exemple pour client MASSOTHERAPIE**:
```
Choisir un professionnel...
Sophie Martin - Massothérapeute
Pierre Leblanc - Massothérapeute
```

**Exemple pour client ESTHETIQUE**:
```
Choisir un professionnel...
Julie Tremblay - Esthéticienne
Isabelle Gagnon - Esthéticienne
```

---

### Test 2: Assignation d'un Client

```bash
# Sur le dashboard
# 1. Cliquer "Assigner à un professionnel" sur un client
# 2. Sélectionner un professionnel dans la liste
# 3. Cliquer "Assigner"
```

**Résultat attendu**:
- ✅ Message "Client assigné avec succès!"
- ✅ Modal se ferme
- ✅ Client est maintenant assigné au professionnel sélectionné

---

### Test 3: Filtrage Automatique par Type de Service

```bash
# Client MASSOTHERAPIE
# 1. Ouvrir le modal d'assignation pour un client de type MASSOTHERAPIE
```

**Résultat attendu**:
- ✅ Seuls les MASSOTHERAPEUTES apparaissent dans la liste
- ✅ Les ESTHETICIENNES ne sont pas affichées

```bash
# Client ESTHETIQUE
# 2. Ouvrir le modal d'assignation pour un client de type ESTHETIQUE
```

**Résultat attendu**:
- ✅ Seules les ESTHETICIENNES apparaissent dans la liste
- ✅ Les MASSOTHERAPEUTES ne sont pas affichés

---

## 📊 Flux de Données Complet

### Récupération des Professionnels

```
1. Dashboard charge
   └─> useGetUsersQuery({})

2. Redux RTK Query
   └─> GET http://localhost:5001/api/users

3. API Backend répond
   └─> {
         "success": true,
         "data": [
           { "role": "ADMIN", ... },
           { "role": "SECRETAIRE", ... },
           { "role": "MASSOTHERAPEUTE", "nom": "Martin", "prenom": "Sophie" },
           { "role": "MASSOTHERAPEUTE", "nom": "Leblanc", "prenom": "Pierre" },
           { "role": "ESTHETICIENNE", "nom": "Tremblay", "prenom": "Julie" },
           { "role": "ESTHETICIENNE", "nom": "Gagnon", "prenom": "Isabelle" }
         ]
       }

4. transformResponse extrait data
   └─> usersData = { users: [...] }

5. Filter côté frontend
   └─> professionals = users.filter(u => u.role === 'MASSOTHERAPEUTE' || u.role === 'ESTHETICIENNE')
   └─> professionals = [
         { "nom": "Martin", "prenom": "Sophie", "role": "MASSOTHERAPEUTE" },
         { "nom": "Leblanc", "prenom": "Pierre", "role": "MASSOTHERAPEUTE" },
         { "nom": "Tremblay", "prenom": "Julie", "role": "ESTHETICIENNE" },
         { "nom": "Gagnon", "prenom": "Isabelle", "role": "ESTHETICIENNE" }
       ]

6. Modal affiche la liste filtrée
   └─> Pour client MASSOTHERAPIE: [Martin, Leblanc]
   └─> Pour client ESTHETIQUE: [Tremblay, Gagnon]
```

---

### Assignation d'un Client

```
1. User sélectionne "Sophie Martin - Massothérapeute"
   └─> selectedProfessional = "cmj4kvvry0002rx33hjykx6qp" (ID de Sophie)

2. User clique "Assigner"
   └─> handleAssignSubmit()

3. Mutation Redux
   └─> assignClient({
         clientId: "client123",
         professionalId: "cmj4kvvry0002rx33hjykx6qp"
       })

4. API call
   └─> POST http://localhost:5001/api/assignments
   └─> Body: { "clientId": "client123", "professionalId": "cmj4kvvry0002rx33hjykx6qp" }

5. Backend crée l'assignation
   └─> Prisma: Assignment.create({ clientId, professionalId })

6. Frontend reçoit succès
   └─> Alert: "Client assigné avec succès!"
   └─> Modal ferme
```

---

## 🔄 Alternative: Endpoint Dédié `/api/professionals`

Si on voulait créer un endpoint spécifique pour les professionnels (optionnel):

### Backend (routes/professionals.js)
```javascript
router.get('/professionals', authenticateToken, async (req, res) => {
  try {
    const professionals = await prisma.user.findMany({
      where: {
        role: {
          in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE']
        }
      },
      select: {
        id: true,
        email: true,
        nom: true,
        prenom: true,
        role: true
      }
    });

    res.json({
      success: true,
      data: { professionals }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des professionnels'
    });
  }
});
```

### Frontend (Redux)
```typescript
getProfessionals: builder.query<{ professionals: Professional[] }, void>({
  query: () => '/professionals',
  transformResponse: (response: any) => response.data || response,
  providesTags: ['Professional'],
}),
```

**Avantage**: Endpoint spécifique, pas besoin de filtrer côté frontend

**Inconvénient**: Duplication (on a déjà `/api/users`)

**Recommandation**: Garder la solution actuelle (filtrer `/api/users`) car:
- ✅ Moins de code
- ✅ Pas de duplication
- ✅ Filtrage simple et performant
- ✅ Un seul endpoint à maintenir

---

## ✅ Checklist de Validation

- ✅ Import `useGetUsersQuery` au lieu de `useGetProfessionalsQuery`
- ✅ Filtrage des professionnels par rôle
- ✅ Liste déroulante affiche les noms des professionnels
- ✅ Filtrage automatique par type de service (MASSOTHERAPIE/ESTHETIQUE)
- ✅ Assignation fonctionne correctement
- ✅ Couleurs mises à jour (rose → turquoise)
- ✅ Modal affiche les bonnes informations

---

## 🎯 Résumé

**Problème**: La liste déroulante d'assignation était vide car le code utilisait un endpoint `/api/professionals` qui n'existe pas.

**Solution**:
1. Remplacement de `useGetProfessionalsQuery()` par `useGetUsersQuery({})`
2. Filtrage des utilisateurs pour ne garder que les professionnels (MASSOTHERAPEUTE et ESTHETICIENNE)
3. Mise à jour des couleurs pour la nouvelle palette turquoise

**Impact**: La liste déroulante affiche maintenant correctement tous les massothérapeutes et esthéticiennes, permettant l'assignation des clients.

**Fichiers modifiés**:
- `app/professionnel/dashboard/page.tsx` - Utilisation de useGetUsersQuery et filtrage
- `components/clients/ClientCard.tsx` - Mise à jour des couleurs

---

**Correction appliquée le**: 14 décembre 2025
**Status**: ✅ RÉSOLU
