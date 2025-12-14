# 🔍 Débogage: Assignation des Professionnels

## 📋 Modifications Appliquées

J'ai ajouté des **logs de débogage détaillés** pour diagnostiquer pourquoi la liste des professionnels est vide.

### Fichier Modifié
`app/professionnel/dashboard/page.tsx`

---

## 🧪 Comment Tester

### Étape 1: Ouvrir la Console du Navigateur

```bash
# 1. Ouvrir Chrome DevTools
- Windows/Linux: F12 ou Ctrl+Shift+I
- Mac: Cmd+Option+I

# 2. Aller dans l'onglet "Console"
```

### Étape 2: Se Connecter et Accéder au Dashboard

```bash
# Se connecter en tant qu'admin ou secrétaire
Email: admin@spa.com
Password: admin123

# Aller sur le dashboard
http://192.168.1.86:3000/professionnel/dashboard
```

### Étape 3: Vérifier les Logs au Chargement

**Dans la console, vous devriez voir**:

```javascript
usersData: { users: [...] }
usersData?.users: [
  { id: "...", nom: "Admin", prenom: "Principal", role: "ADMIN" },
  { id: "...", nom: "Dubois", prenom: "Marie", role: "SECRETAIRE" },
  { id: "...", nom: "Martin", prenom: "Sophie", role: "MASSOTHERAPEUTE" },  // ← Professionnel
  { id: "...", nom: "Leblanc", prenom: "Pierre", role: "MASSOTHERAPEUTE" }, // ← Professionnel
  { id: "...", nom: "Tremblay", prenom: "Julie", role: "ESTHETICIENNE" },   // ← Professionnel
  { id: "...", nom: "Gagnon", prenom: "Isabelle", role: "ESTHETICIENNE" }  // ← Professionnel
]
professionals: [
  { id: "...", nom: "Martin", prenom: "Sophie", role: "MASSOTHERAPEUTE" },
  { id: "...", nom: "Leblanc", prenom: "Pierre", role: "MASSOTHERAPEUTE" },
  { id: "...", nom: "Tremblay", prenom: "Julie", role: "ESTHETICIENNE" },
  { id: "...", nom: "Gagnon", prenom: "Isabelle", role: "ESTHETICIENNE" }
]
```

---

## 🔍 Diagnostics Possibles

### Cas 1: `usersData` est `undefined`

**Console montre**:
```javascript
usersData: undefined
usersData?.users: undefined
professionals: []
```

**Problème**: L'API `/api/users` ne répond pas ou retourne une erreur.

**Solutions**:
1. Vérifier que le backend est démarré: `http://localhost:5001/api/users`
2. Vérifier le token d'authentification dans Redux
3. Regarder l'onglet "Network" dans DevTools pour voir la requête

---

### Cas 2: `usersData.users` est vide

**Console montre**:
```javascript
usersData: { users: [] }
usersData?.users: []
professionals: []
```

**Problème**: Aucun utilisateur dans la base de données.

**Solution**: Créer des utilisateurs massothérapeutes/esthéticiennes via la page "Gérer les Employés"

---

### Cas 3: Aucun professionnel (seulement admin/secrétaire)

**Console montre**:
```javascript
usersData: { users: [
  { role: "ADMIN" },
  { role: "SECRETAIRE" }
] }
professionals: []
```

**Problème**: Aucun utilisateur avec rôle MASSOTHERAPEUTE ou ESTHETICIENNE.

**Solution**: Créer des employés avec ces rôles.

---

### Cas 4: Tout fonctionne mais la liste est vide

**Console montre**:
```javascript
usersData: { users: [...] }  // ✅ OK
professionals: [...]  // ✅ OK avec des données
```

**Mais la liste déroulante est vide**.

**Problème**: Filtrage dans le modal ou problème de rendu.

**Vérifier dans la console** lors de l'ouverture du modal:
```javascript
Filtrage Sophie Martin (MASSOTHERAPEUTE): true
Option ajoutée: Sophie Martin - Massothérapeute cmj4kvvry0002rx33hjykx6qp
Filtrage Pierre Leblanc (MASSOTHERAPEUTE): true
Option ajoutée: Pierre Leblanc - Massothérapeute cmj4kvvv60003rx33t6evbbdl
```

---

## 🧪 Test de l'Assignation

### Étape 1: Ouvrir le Modal

```bash
# Sur le dashboard
# 1. Cliquer sur "Assigner à un professionnel" sur une carte client
```

**Console devrait afficher**:
```javascript
Filtrage Sophie Martin (MASSOTHERAPEUTE): true
Option ajoutée: Sophie Martin - Massothérapeute cmj4kvvry0002rx33hjykx6qp
...
```

---

### Étape 2: Sélectionner un Professionnel

```bash
# Dans le modal
# 1. Sélectionner un professionnel dans la liste déroulante
```

**Console devrait afficher**:
```javascript
Professional sélectionné: cmj4kvvry0002rx33hjykx6qp
```

---

### Étape 3: Cliquer sur "Assigner"

```bash
# Dans le modal
# 1. Cliquer sur le bouton "Assigner"
```

**Console devrait afficher**:
```javascript
Début de l'assignation: {
  clientId: "client123",
  clientNom: "Jean Dupont",
  professionalId: "cmj4kvvry0002rx33hjykx6qp"
}
```

**Si succès**:
```javascript
Assignation réussie: {
  success: true,
  message: "Client assigné avec succès",
  data: { assignment: {...} }
}
```

**Alert**: "Client assigné avec succès!"

**Si erreur**:
```javascript
Erreur lors de l'assignation: {
  status: 400,
  data: { message: "Client déjà assigné à ce professionnel" }
}
```

**Alert**: "Une erreur est survenue lors de l'assignation: Client déjà assigné à ce professionnel"

---

## 🔧 Améliorations Ajoutées

### 1. Indicateur de Chargement

Si les utilisateurs ne sont pas encore chargés, la liste déroulante affiche:
```
[🔄 Chargement...]
```

### 2. Message d'Erreur Explicite

Si aucun professionnel n'est trouvé:
```
⚠️ Aucun professionnel trouvé. Vérifiez que des utilisateurs avec le rôle MASSOTHERAPEUTE ou ESTHETICIENNE existent.
```

### 3. Logs Détaillés

Tous les logs importants sont affichés dans la console pour faciliter le débogage.

---

## 🔌 Vérifier l'API Backend

### Test Manuel de l'Endpoint

```bash
# 1. Obtenir un token d'authentification
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@spa.com",
    "password": "admin123"
  }'

# Réponse:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

# 2. Récupérer la liste des utilisateurs
curl http://localhost:5001/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Réponse attendue:
{
  "success": true,
  "data": [
    {
      "id": "cmj4kvvry0002rx33hjykx6qp",
      "email": "masso1@spa.com",
      "nom": "Martin",
      "prenom": "Sophie",
      "role": "MASSOTHERAPEUTE",
      "_count": {
        "assignedClients": 2,
        "notesCreated": 5
      }
    },
    ...
  ]
}
```

---

## 🔄 Tester l'Assignation via API

```bash
# POST /api/assignments
curl -X POST http://localhost:5001/api/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": "client123",
    "professionalId": "cmj4kvvry0002rx33hjykx6qp"
  }'

# Réponse attendue (succès):
{
  "success": true,
  "message": "Client assigné avec succès",
  "data": {
    "assignment": {
      "id": "assignment123",
      "clientId": "client123",
      "professionalId": "cmj4kvvry0002rx33hjykx6qp",
      "createdAt": "2025-12-14T..."
    }
  }
}

# Réponse attendue (erreur - déjà assigné):
{
  "success": false,
  "message": "Client déjà assigné à ce professionnel"
}
```

---

## 📊 Structure Redux State

Après le chargement, Redux devrait contenir:

```javascript
state.api.queries['getUsers({})'] = {
  status: 'fulfilled',
  data: {
    users: [
      { id: "...", role: "ADMIN", ... },
      { id: "...", role: "SECRETAIRE", ... },
      { id: "...", role: "MASSOTHERAPEUTE", nom: "Martin", prenom: "Sophie" },
      { id: "...", role: "MASSOTHERAPEUTE", nom: "Leblanc", prenom: "Pierre" },
      { id: "...", role: "ESTHETICIENNE", nom: "Tremblay", prenom: "Julie" },
      { id: "...", role: "ESTHETICIENNE", nom: "Gagnon", prenom: "Isabelle" }
    ]
  }
}
```

**Vérifier dans Redux DevTools**:
1. Installer l'extension Redux DevTools
2. Ouvrir DevTools → Redux
3. Chercher `api.queries.getUsers({})`

---

## ✅ Checklist de Débogage

1. ✅ **Backend démarré**: `http://localhost:5001/api/users` retourne des données
2. ✅ **Token valide**: Vérifier dans Redux State (`state.auth.token`)
3. ✅ **Utilisateurs chargés**: Console affiche `usersData: { users: [...] }`
4. ✅ **Professionnels filtrés**: Console affiche `professionals: [...]` avec des données
5. ✅ **Modal s'ouvre**: Modal "Assigner un client" s'affiche
6. ✅ **Liste remplie**: Options visibles dans la liste déroulante
7. ✅ **Sélection fonctionne**: Console affiche l'ID du professionnel sélectionné
8. ✅ **Assignation réussit**: Alert de succès et client assigné

---

## 🎯 Prochaines Étapes

Si après ces vérifications la liste est **toujours vide**:

1. **Partagez les logs de la console** quand vous ouvrez le dashboard
2. **Partagez la réponse** de `http://localhost:5001/api/users` (via Postman/curl)
3. **Vérifiez l'onglet Network** dans DevTools pour voir les requêtes

Avec ces informations, je pourrai diagnostiquer le problème exact.

---

**Document créé le**: 14 décembre 2025
**Objectif**: Déboguer la liste vide des professionnels dans le modal d'assignation
