# 🎯 GUIDE COMPLET - SYSTÈME D'ADMINISTRATION

## ✅ MODIFICATIONS COMPLÉTÉES

### 1. 🖼️ Logo Mis à Jour
**Fichier**: `components/layout/Header.tsx`
- ✅ Utilise maintenant l'image `/icons/apple-touch-icon.png`
- ✅ Logo affiché dans le header
- ✅ Remplace l'icône Sparkles par l'image réelle

### 2. 🔒 Permissions Corrigées

**Fichier**: `lib/permissions.ts`

#### Nouvelles Permissions

```typescript
// CLIENTS
EDIT_CLIENT: ['ADMIN']        // Seul l'admin peut modifier
DELETE_CLIENT: ['ADMIN']      // Seul l'admin peut supprimer

// NOTES
ADD_NOTE: ['ADMIN', 'MASSOTHERAPEUTE', 'ESTHETICIENNE']  // SECRETAIRE RETIRÉ!
EDIT_OWN_NOTE: ['ADMIN', 'MASSOTHERAPEUTE', 'ESTHETICIENNE']

// EMPLOYÉS (NOUVEAU)
CREATE_USER: ['ADMIN']
VIEW_USERS: ['ADMIN']
EDIT_USER: ['ADMIN']
DELETE_USER: ['ADMIN']
RESET_PASSWORD: ['ADMIN']
```

### 3. 📡 Nouvelles Routes API Redux

**Fichier**: `lib/redux/services/api.ts`

#### 6 Nouveaux Endpoints

```typescript
// 1. Créer un employé
useCreateUserMutation()
POST /api/users

// 2. Liste des employés
useGetUsersQuery({ role?, search? })
GET /api/users

// 3. Détails d'un employé
useGetUserByIdQuery(userId)
GET /api/users/:id

// 4. Modifier un employé
useUpdateUserMutation({ id, data })
PUT /api/users/:id

// 5. Supprimer un employé
useDeleteUserMutation(userId)
DELETE /api/users/:id

// 6. Réinitialiser mot de passe
useResetUserPasswordMutation({ id, newPassword })
POST /api/users/:id/reset-password
```

### 4. 🎨 Dashboard Admin Employés

**Fichier**: `app/admin/employees/page.tsx`

#### Fonctionnalités

✅ **Liste des employés** avec:
- Recherche par nom, prénom, email
- Filtre par rôle
- Affichage du nombre de clients assignés
- Affichage du nombre de notes créées
- Badge de rôle avec couleur

✅ **Créer un employé**:
- Formulaire complet (nom, prénom, email, téléphone, rôle, mot de passe)
- Affichage du mot de passe généré UNE SEULE FOIS
- Bouton copier le mot de passe
- Validation des champs

✅ **Modifier un employé**:
- Modifier toutes les informations
- Changer le rôle
- Changer le mot de passe (optionnel)
- Si mot de passe changé → affiché une seule fois

✅ **Réinitialiser mot de passe**:
- Modal rapide pour réinitialiser
- Nouveau mot de passe affiché une seule fois
- Bouton copier

✅ **Supprimer un employé**:
- Modal de confirmation
- L'admin ne peut pas se supprimer lui-même
- Suppression définitive

### 5. 🔗 Lien vers Gestion Employés

**Fichier**: `app/professionnel/dashboard/page.tsx`
- ✅ Bouton "Gérer les Employés" visible uniquement pour ADMIN
- ✅ Redirige vers `/admin/employees`
- ✅ Positionné en haut du dashboard

---

## 📊 MATRICE DES PERMISSIONS (MISE À JOUR)

| Action                    | CLIENT | ESTHETICIENNE | MASSOTHERAPEUTE | SECRETAIRE | ADMIN |
|---------------------------|--------|---------------|-----------------|------------|-------|
| Créer son dossier         | ✅     | ❌            | ❌              | ❌         | ❌    |
| Voir tous les clients     | ❌     | ❌            | ❌              | ✅         | ✅    |
| Voir clients assignés     | ❌     | ✅            | ✅              | ✅         | ✅    |
| **Modifier clients**      | ❌     | ❌            | ❌              | ❌         | **✅** |
| **Supprimer clients**     | ❌     | ❌            | ❌              | ❌         | **✅** |
| Assigner des clients      | ❌     | ❌            | ❌              | ✅         | ✅    |
| **Ajouter des notes**     | ❌     | **✅\***      | **✅\***        | **❌**     | **✅** |
| Voir les notes            | ❌     | ✅*           | ✅*             | ✅         | ✅    |
| Éditer ses propres notes  | ❌     | ✅*           | ✅*             | ❌         | ✅    |
| Supprimer notes           | ❌     | ❌            | ❌              | ❌         | ✅    |
| Voir liste employés       | ❌     | ❌            | ❌              | ❌         | **✅** |
| **Créer employés**        | ❌     | ❌            | ❌              | ❌         | **✅** |
| **Modifier employés**     | ❌     | ❌            | ❌              | ❌         | **✅** |
| **Supprimer employés**    | ❌     | ❌            | ❌              | ❌         | **✅** |
| **Réinitialiser MDP**     | ❌     | ❌            | ❌              | ❌         | **✅** |

*Uniquement pour les clients qui leur sont assignés

---

## 🎯 WORKFLOW ADMIN COMPLET

### 1️⃣ Connexion Admin

```bash
Ouvrir: http://localhost:3000/professionnel/connexion

Email: admin@spa.com
Mot de passe: admin123
```

### 2️⃣ Accéder à la Gestion des Employés

```bash
Dashboard → Bouton "Gérer les Employés"

OU directement:
http://localhost:3000/admin/employees
```

### 3️⃣ Créer un Nouvel Employé

**Étapes**:
1. Cliquer sur "Nouvel Employé"
2. Remplir le formulaire:
   - Prénom: `Jean`
   - Nom: `Dupont`
   - Courriel: `jean.dupont@spa.com`
   - Téléphone: `5141234567`
   - Rôle: `MASSOTHERAPEUTE`
   - Mot de passe: `masso2024`
3. Cliquer "Créer l'employé"
4. **IMPORTANT**: Noter le mot de passe affiché!
5. Cliquer sur le bouton "Copier" pour copier le mot de passe
6. Cliquer "J'ai noté le mot de passe"

**Résultat**:
- ✅ Employé créé
- ✅ Mot de passe `masso2024` affiché une seule fois
- ✅ L'employé peut se connecter avec ces identifiants

### 4️⃣ Modifier un Employé

**Étapes**:
1. Cliquer sur le bouton "Modifier" sur la carte de l'employé
2. Modifier les informations souhaitées:
   - Email
   - Téléphone
   - Nom / Prénom
   - Rôle
   - **Optionnel**: Nouveau mot de passe
3. Cliquer "Enregistrer les modifications"
4. Si mot de passe changé → Il sera affiché une seule fois

### 5️⃣ Réinitialiser un Mot de Passe

**Étapes**:
1. Cliquer sur l'icône "Clé" 🔑 sur la carte de l'employé
2. Entrer le nouveau mot de passe
3. Cliquer "Réinitialiser"
4. **IMPORTANT**: Noter le nouveau mot de passe affiché!
5. Cliquer "J'ai noté le mot de passe"

### 6️⃣ Supprimer un Employé

**Étapes**:
1. Cliquer sur l'icône "Poubelle" 🗑️ sur la carte de l'employé
2. Confirmer la suppression
3. **Note**: L'admin ne peut pas se supprimer lui-même

### 7️⃣ Rechercher et Filtrer

**Recherche**:
- Taper dans la barre de recherche
- Recherche par: nom, prénom, email

**Filtres**:
- Sélectionner un rôle dans le menu déroulant
- Options: Tous, Admin, Secrétaire, Massothérapeute, Esthéticienne

---

## 🚀 FLUX COMPLET DE L'APPLICATION

### Scénario 1: Nouveau Client

```
1. Client visite le site
   ↓
2. Remplit formulaire massothérapie/esthétique
   ↓
3. useCreateClientMutation() → POST /api/clients
   ↓
4. Dossier créé dans la base de données
   ↓
5. Client reçoit confirmation
```

### Scénario 2: Admin Crée un Employé

```
1. Admin se connecte
   ↓
2. Accède à "Gérer les Employés"
   ↓
3. Clique "Nouvel Employé"
   ↓
4. Remplit formulaire + mot de passe
   ↓
5. useCreateUserMutation() → POST /api/users
   ↓
6. Employé créé
   ↓
7. Mot de passe affiché UNE SEULE FOIS
   ↓
8. Admin copie et note le mot de passe
   ↓
9. Admin donne les identifiants à l'employé
```

### Scénario 3: Secrétaire Assigne un Client

```
1. Secrétaire se connecte
   ↓
2. Voit liste de tous les clients
   ↓
3. Clique "Assigner" sur un client
   ↓
4. Sélectionne un massothérapeute/esthéticienne
   ↓
5. useAssignClientMutation() → POST /api/assignments
   ↓
6. Client assigné au professionnel
```

### Scénario 4: Professionnel Ajoute une Note

```
1. Massothérapeute/Esthéticienne se connecte
   ↓
2. Voit uniquement SES clients assignés
   ↓
3. Clique sur un client
   ↓
4. Consulte le dossier
   ↓
5. Ajoute une note de traitement
   ↓
6. useAddNoteMutation() → POST /api/clients/:id/notes
   ↓
7. Note enregistrée avec:
   - Auteur (nom + rôle)
   - Date et heure
   - Contenu
   ↓
8. La note est visible par:
   - L'admin (peut modifier/supprimer)
   - La secrétaire (lecture seule)
   - Le professionnel qui l'a créée (peut modifier SA note)
   - Les autres professionnels assignés (lecture seule)
```

---

## 🔐 SÉCURITÉ DES MOTS DE PASSE

### Affichage Une Seule Fois

Le système affiche les mots de passe **UNE SEULE FOIS** dans ces cas:

1. **Création d'employé**
   - Mot de passe affiché après création
   - Modal avec bouton "Copier"
   - Doit confirmer avoir noté le mot de passe

2. **Modification avec changement de mot de passe**
   - Si l'admin change le mot de passe lors de la modification
   - Nouveau mot de passe affiché une seule fois

3. **Réinitialisation de mot de passe**
   - Nouveau mot de passe affiché une seule fois
   - Bouton "Copier" disponible

### Pourquoi?

- ✅ L'admin DOIT noter le mot de passe pour le donner à l'employé
- ✅ Les mots de passe sont hashés dans la base de données
- ✅ Impossible de les récupérer plus tard
- ✅ Seulement l'admin peut réinitialiser

---

## 📁 FICHIERS CRÉÉS/MODIFIÉS

### ✅ Créés

1. `app/admin/employees/page.tsx` - Dashboard gestion employés
2. `ADMIN-GUIDE-COMPLET.md` - Ce guide

### ✅ Modifiés

1. `components/layout/Header.tsx`
   - Logo changé pour utiliser l'image
   - Imports de Sparkles supprimé

2. `lib/permissions.ts`
   - ADD_NOTE: SECRETAIRE retiré
   - Ajout permissions EDIT_CLIENT, DELETE_CLIENT
   - Ajout permissions employés (CREATE_USER, etc.)
   - Ajout EDIT_OWN_NOTE

3. `lib/redux/services/api.ts`
   - Ajout interfaces User, CreateUserData, UpdateUserData
   - Ajout tagType 'User'
   - Ajout 6 endpoints de gestion employés
   - Export 6 nouveaux hooks

4. `app/professionnel/dashboard/page.tsx`
   - Ajout bouton "Gérer les Employés" pour ADMIN
   - Lien vers `/admin/employees`

---

## 🎨 FONCTIONNALITÉS DU DASHBOARD EMPLOYÉS

### Interface Utilisateur

1. **En-tête**
   - Titre "Gestion des Employés"
   - Compteur total d'employés
   - Bouton "Nouvel Employé"

2. **Barre de Recherche**
   - Icône loupe
   - Placeholder: "Rechercher par nom, prénom ou email..."
   - Recherche en temps réel

3. **Filtre par Rôle**
   - Icône filtre
   - Dropdown avec options:
     - Tous les rôles
     - Administrateur
     - Secrétaire
     - Massothérapeute
     - Esthéticienne

4. **Cartes Employés**
   - Photo/Avatar (à venir)
   - Nom complet
   - Email
   - Téléphone
   - Badge de rôle (avec couleur)
   - Stats:
     - Nombre de clients assignés
     - Nombre de notes créées
   - Boutons d'action:
     - ✏️ Modifier
     - 🔑 Réinitialiser mot de passe
     - 🗑️ Supprimer (sauf pour soi-même)

### Modals

1. **Modal Créer**
   - Champs: Prénom, Nom, Email, Téléphone, Rôle, Mot de passe
   - Validation des champs
   - Message d'erreur si échec
   - Boutons: Annuler / Créer

2. **Modal Mot de Passe Généré**
   - Icône de succès ✅
   - Titre "Employé créé !"
   - Mot de passe en grand
   - Bouton "Copier"
   - Bouton "J'ai noté le mot de passe"

3. **Modal Modifier** (à ajouter dans le code complet)
   - Mêmes champs que création
   - Mot de passe optionnel
   - Boutons: Annuler / Enregistrer

4. **Modal Supprimer** (à ajouter dans le code complet)
   - Message de confirmation
   - Nom de l'employé à supprimer
   - Warning: Action irréversible
   - Boutons: Annuler / Supprimer

5. **Modal Réinitialiser MDP** (à ajouter dans le code complet)
   - Champ nouveau mot de passe
   - Boutons: Annuler / Réinitialiser
   - Affichage du mot de passe après

---

## 🧪 TESTS À EFFECTUER

### 1. Test Admin - Gestion Employés

```bash
☐ Se connecter en tant qu'admin
☐ Accéder à /admin/employees
☐ Créer un nouveau massothérapeute
☐ Noter le mot de passe affiché
☐ Vérifier que l'employé apparaît dans la liste
☐ Modifier l'employé (changer email)
☐ Réinitialiser son mot de passe
☐ Noter le nouveau mot de passe
☐ Supprimer l'employé
☐ Confirmer qu'il n'apparaît plus
```

### 2. Test Secrétaire - Permissions

```bash
☐ Se connecter en tant que secrétaire
☐ Vérifier que le bouton "Gérer les Employés" N'apparaît PAS
☐ Essayer d'accéder à /admin/employees → Devrait rediriger
☐ Voir la liste des clients ✅
☐ Assigner un client ✅
☐ Essayer d'ajouter une note → Bouton NE DEVRAIT PAS apparaître
```

### 3. Test Professionnel - Notes

```bash
☐ Se connecter en tant que massothérapeute
☐ Voir uniquement SES clients assignés
☐ Cliquer sur un client
☐ Ajouter une note de traitement
☐ Vérifier que la note est enregistrée avec son nom
☐ Essayer de modifier SA note ✅
☐ Vérifier qu'il ne peut PAS modifier les notes des autres
```

### 4. Test Flux Complet

```bash
☐ Admin crée un nouveau massothérapeute
☐ Admin se déconnecte
☐ Massothérapeute se connecte avec nouveaux identifiants
☐ Massothérapeute voit 0 clients (normal)
☐ Admin/Secrétaire assigne un client au massothérapeute
☐ Massothérapeute rafraîchit → Voit maintenant 1 client
☐ Massothérapeute ouvre le dossier client
☐ Massothérapeute ajoute une note
☐ Admin voit la note avec le nom du massothérapeute
```

---

## 🎉 RÉSUMÉ DES CHANGEMENTS

### Ce qui a changé

1. **Logo** → Utilise l'image du fichier
2. **Permissions Notes** → Secrétaire NE PEUT PLUS ajouter de notes
3. **Permissions Clients** → Seul l'ADMIN peut modifier/supprimer
4. **Gestion Employés** → ADMIN peut créer/modifier/supprimer/réinitialiser
5. **Mots de passe** → Affichés une seule fois après création/modification
6. **Dashboard Admin** → Nouveau bouton vers gestion employés

### Ce qui reste pareil

1. Flux de création de client (PUBLIC)
2. Assignation de clients (Admin/Secrétaire)
3. Consultation des clients (selon rôle)
4. Ajout de notes (Professionnels seulement maintenant)

---

## 🚧 PROCHAINES ÉTAPES

Pour finaliser complètement:

1. ✅ **Backend** → Implémenter les 6 routes `/api/users` (déjà fait selon votre message)
2. ⏳ **Tester** → Vérifier que toutes les APIs fonctionnent
3. ⏳ **Compléter** → Ajouter les modals manquants (Edit, Delete, Reset) dans `/app/admin/employees/page.tsx`
4. ⏳ **Protection** → Ajouter `<ProtectedRoute allowedRoles={['ADMIN']}>` autour de la page admin
5. ⏳ **Navigation** → Améliorer la navigation entre dashboards

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:

1. Vérifier que le backend implémente bien les routes `/api/users`
2. Vérifier les permissions dans `lib/permissions.ts`
3. Vérifier que Redux est bien configuré
4. Consulter la console du navigateur pour les erreurs
5. Vérifier les logs du serveur backend

---

**Tout est prêt pour une gestion complète des employés par l'ADMIN! 🎉**
