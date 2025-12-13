# Intégration Redux et Système de Permissions

## ✅ Intégration Redux Complétée

### Configuration de Base

**Store Redux** (`lib/redux/store.ts`)
- Redux Toolkit configuré avec RTK Query
- API middleware intégré
- Auth slice pour la gestion de l'authentification
- Persistence automatique dans localStorage

**Provider** (`lib/redux/StoreProvider.tsx`)
- Wrapper Redux pour l'application
- Intégré dans `app/layout.tsx`
- Utilise useRef pour éviter la recréation du store

**Hooks Typés** (`lib/redux/hooks.ts`)
- `useAppDispatch` - Pour dispatcher des actions
- `useAppSelector` - Pour accéder à l'état Redux
- `useAppStore` - Pour accéder au store complet

### API Service (lib/redux/services/api.ts)

Toutes les routes API sont configurées avec auto-génération des hooks:

#### 🔐 Authentication
```typescript
useLoginMutation()
// POST /api/auth/login
// Sauvegarde automatique dans Redux + localStorage
```

#### 👥 Clients
```typescript
useCreateClientMutation()
// POST /api/clients (PUBLIC)
// Crée un nouveau dossier client

useGetClientsQuery({ search?, serviceType? })
// GET /api/clients
// Liste des clients (ADMIN/SECRETAIRE)

useGetAssignedClientsQuery()
// GET /api/clients/assigned
// Clients assignés au professionnel connecté

useGetClientByIdQuery(clientId)
// GET /api/clients/:id
// Détails d'un client
```

#### 📝 Notes
```typescript
useGetNotesQuery(clientId)
// GET /api/clients/:clientId/notes
// Liste des notes d'un client

useAddNoteMutation()
// POST /api/clients/:clientId/notes
// Ajoute une note (invalidation automatique du cache)
```

#### 🔗 Assignations
```typescript
useAssignClientMutation()
// POST /api/assignments
// Assigne un client à un professionnel (ADMIN/SECRETAIRE)

useGetProfessionalsQuery()
// GET /api/professionals
// Liste des professionnels (ADMIN/SECRETAIRE)
```

### Pages Intégrées avec Redux

#### ✅ Page de Connexion (`app/professionnel/connexion/page.tsx`)
- Utilise `useLoginMutation()`
- Redirection automatique basée sur le rôle
- Affiche les comptes de test
- Gestion des erreurs avec messages clairs

#### ✅ Formulaires Client
**Massothérapie** (`app/client/nouveau/massotherapie/page.tsx`)
**Esthétique** (`app/client/nouveau/esthetique/page.tsx`)
- Utilisent `useCreateClientMutation()`
- Suppression des fetch manuels
- Gestion d'état de chargement automatique

#### ✅ Dashboard Secrétaire (`app/professionnel/dashboard/page.tsx`)
- `useGetClientsQuery()` - Liste de tous les clients
- `useGetProfessionalsQuery()` - Liste des professionnels
- `useAssignClientMutation()` - Assignation de clients
- Accès à l'utilisateur via `useAppSelector()`
- Permissions vérifiées pour l'assignation

#### ✅ Page Clients Professionnel (`app/professionnel/clients/page.tsx`)
- `useGetAssignedClientsQuery()` - Clients assignés
- Affichage conditionnel basé sur le rôle

#### ✅ Détail Client (`app/professionnel/clients/[id]/page.tsx`)
- `useGetClientByIdQuery()` - Infos du client
- `useGetNotesQuery()` - Notes du client
- Rafraîchissement automatique

#### ✅ Composant AddNoteForm (`components/notes/AddNoteForm.tsx`)
- `useAddNoteMutation()`
- Invalidation automatique du cache des notes

#### ✅ Header (`components/layout/Header.tsx`)
- Utilise Redux pour l'utilisateur connecté
- Action `logout()` pour déconnexion
- Lien conditionnel basé sur le rôle

---

## 🔒 Système de Permissions

### Fichier de Permissions (`lib/permissions.ts`)

#### Permissions Définies

```typescript
PERMISSIONS = {
  // Clients
  VIEW_ALL_CLIENTS: ['ADMIN', 'SECRETAIRE'],
  VIEW_ASSIGNED_CLIENTS: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  CREATE_CLIENT: ['PUBLIC'],

  // Assignations
  ASSIGN_CLIENTS: ['ADMIN', 'SECRETAIRE'],
  VIEW_ASSIGNMENTS: ['ADMIN', 'SECRETAIRE'],

  // Notes
  ADD_NOTE: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  VIEW_NOTES: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  EDIT_OWN_NOTE: ['ADMIN'],
  DELETE_NOTE: ['ADMIN'],

  // Professionnels
  VIEW_PROFESSIONALS: ['ADMIN', 'SECRETAIRE'],
  MANAGE_PROFESSIONALS: ['ADMIN'],

  // Administration
  FULL_ACCESS: ['ADMIN'],
}
```

#### Fonctions Utilitaires

```typescript
// Vérifier une permission
hasPermission(userRole, 'ASSIGN_CLIENTS')

// Vérifier si admin
isAdmin(userRole)

// Vérifier si admin ou secrétaire
isAdminOrSecretary(userRole)

// Vérifier si professionnel
isProfessional(userRole)

// Vérifier si peut voir un client
canViewClient(userRole, isAssigned)

// Vérifier si peut ajouter une note
canAddNote(userRole, isAssigned)

// Vérifier si peut éditer une note
canEditNote(userRole, noteAuthorId, userId)

// Obtenir le label du rôle en français
getRoleLabel(role)

// Obtenir la couleur du rôle
getRoleColor(role)
```

### Composant ProtectedRoute (`components/auth/ProtectedRoute.tsx`)

Composant pour protéger les routes:

```tsx
<ProtectedRoute requiredPermission="VIEW_ALL_CLIENTS">
  <DashboardPage />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['ADMIN', 'SECRETAIRE']}>
  <AssignmentsPage />
</ProtectedRoute>
```

---

## 🎯 Flux Complet de l'Application

### 1. Création de Dossier Client (PUBLIC)

```
Client remplit formulaire
  ↓
useCreateClientMutation()
  ↓
POST /api/clients
  ↓
Dossier créé dans la base de données
  ↓
Confirmation affichée au client
```

### 2. Connexion Employé

```
Employé entre ses identifiants
  ↓
useLoginMutation()
  ↓
POST /api/auth/login
  ↓
Redux: setCredentials({ user, token })
  ↓
localStorage: sauvegarde user + token
  ↓
Redirection basée sur rôle:
  - ADMIN/SECRETAIRE → /professionnel/dashboard
  - MASSOTHERAPEUTE/ESTHETICIENNE → /professionnel/clients
```

### 3. Assignation de Client (ADMIN/SECRETAIRE)

```
Secrétaire/Admin voit liste clients
  ↓
useGetClientsQuery()
  ↓
GET /api/clients
  ↓
Clique sur "Assigner"
  ↓
Sélectionne professionnel
  ↓
useAssignClientMutation()
  ↓
POST /api/assignments
  ↓
Client assigné au professionnel
  ↓
Cache invalidé automatiquement
```

### 4. Consultation et Ajout de Note (PROFESSIONNEL)

```
Professionnel voit ses clients
  ↓
useGetAssignedClientsQuery()
  ↓
GET /api/clients/assigned
  ↓
Clique sur un client
  ↓
useGetClientByIdQuery() + useGetNotesQuery()
  ↓
GET /api/clients/:id + GET /api/clients/:id/notes
  ↓
Ajoute une note
  ↓
useAddNoteMutation()
  ↓
POST /api/clients/:clientId/notes
  ↓
Note ajoutée avec auteur + date
  ↓
Cache des notes invalidé automatiquement
  ↓
Liste des notes mise à jour
```

### 5. Déconnexion

```
Utilisateur clique "Déconnexion"
  ↓
dispatch(logout())
  ↓
Redux: réinitialise auth state
  ↓
localStorage: supprime user + token
  ↓
Redirection vers /professionnel/connexion
```

---

## 🔐 Comptes de Test

| Rôle              | Email               | Mot de passe  | Accès                           |
|-------------------|---------------------|---------------|---------------------------------|
| Admin             | admin@spa.com       | admin123      | Tout                            |
| Secrétaire        | secretaire@spa.com  | secretaire123 | Tous les clients + assignations |
| Massothérapeute 1 | masso1@spa.com      | masso123      | 2 clients assignés              |
| Massothérapeute 2 | masso2@spa.com      | masso123      | 1 client assigné                |
| Esthéticienne 1   | esthetique1@spa.com | esthetique123 | 1 client assigné                |
| Esthéticienne 2   | esthetique2@spa.com | esthetique123 | 1 client assigné                |

---

## 📊 Matrice des Permissions

| Action                    | CLIENT | ESTHETICIENNE | MASSOTHERAPEUTE | SECRETAIRE | ADMIN |
|---------------------------|--------|---------------|-----------------|------------|-------|
| Créer son dossier         | ✅     | ❌            | ❌              | ❌         | ❌    |
| Voir tous les clients     | ❌     | ❌            | ❌              | ✅         | ✅    |
| Voir clients assignés     | ❌     | ✅            | ✅              | ✅         | ✅    |
| Assigner des clients      | ❌     | ❌            | ❌              | ✅         | ✅    |
| Ajouter des notes         | ❌     | ✅*           | ✅*             | ✅         | ✅    |
| Voir les notes            | ❌     | ✅*           | ✅*             | ✅         | ✅    |
| Éditer/Supprimer notes    | ❌     | ❌            | ❌              | ❌         | ✅    |
| Voir liste professionnels | ❌     | ❌            | ❌              | ✅         | ✅    |
| Gérer professionnels      | ❌     | ❌            | ❌              | ❌         | ✅    |

*Uniquement pour les clients qui leur sont assignés

---

## 🚀 Avantages de l'Intégration

### Cache Automatique
- Les données sont mises en cache par RTK Query
- Réutilisation automatique lors de navigations
- Réduction des appels API

### Invalidation Intelligente
- Ajout de note → invalidation du cache des notes
- Assignation → invalidation du cache des clients
- Mise à jour automatique de l'UI

### État Centralisé
- Utilisateur connecté accessible partout
- Pas besoin de passer props à travers les composants
- Source unique de vérité

### Moins de Code
- Plus besoin de gérer `isLoading`, `setIsLoading` manuellement
- Plus besoin de `useEffect` pour charger les données
- Hooks auto-générés pour chaque endpoint

### Type Safety
- Tous les hooks sont typés avec TypeScript
- Autocomplétion dans l'IDE
- Détection d'erreurs à la compilation

### Sécurité
- Token JWT automatiquement ajouté aux requêtes
- Vérification de permissions avant affichage
- Redirection automatique si non autorisé

---

## 📝 Notes pour le Backend

Pour que tout fonctionne, le backend doit:

1. **Implémenter toutes les routes API** mentionnées dans ce document
2. **Retourner les structures de données** attendues par Redux
3. **Vérifier les permissions côté serveur** (ne jamais faire confiance au frontend)
4. **Gérer les tokens JWT** pour l'authentification
5. **Implémenter les relations** entre clients, professionnels et assignations

Référez-vous au fichier `GUIDE-BACKEND.md` pour les détails d'implémentation.

---

## ✨ Prochaines Étapes

1. Implémenter le backend selon `GUIDE-BACKEND.md`
2. Tester l'intégration complète avec le backend
3. Ajouter des tests unitaires pour les hooks Redux
4. Ajouter des tests d'intégration pour le flux complet
5. Optimiser les requêtes avec des options de cache avancées
6. Ajouter des notifications toast pour les succès/erreurs
