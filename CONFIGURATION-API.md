# 🔌 Configuration des Appels API - Spa Renaissance

## 📍 URL de Base de l'API

L'application utilise une variable d'environnement pour configurer l'URL de base de l'API backend.

### Fichier `.env`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
```

**Important**: Le préfixe `NEXT_PUBLIC_` est requis pour que Next.js rende cette variable accessible côté client.

---

## 🛠️ Configuration Redux (RTK Query)

### Fichier: `lib/redux/services/api.ts`

```typescript
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,  // ← Utilise la variable d'environnement
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Client', 'Note', 'Professional', 'Assignment', 'User'],
  endpoints: (builder) => ({
    // ...
  })
});
```

### Comment ça fonctionne?

Avec `baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL`:

1. **Développement local**:
   ```
   .env → NEXT_PUBLIC_API_BASE_URL=http://localhost:5001

   Endpoint: '/auth/login'
   URL finale: http://localhost:5001/auth/login
   ```

2. **Production**:
   ```
   .env.production → NEXT_PUBLIC_API_BASE_URL=https://api.spa-renaissance.com

   Endpoint: '/auth/login'
   URL finale: https://api.spa-renaissance.com/auth/login
   ```

---

## 📋 Liste des Endpoints

Tous les endpoints utilisent des **chemins relatifs** qui sont automatiquement préfixés par `baseUrl`:

### Authentification
```typescript
login: builder.mutation({
  query: (credentials) => ({
    url: '/auth/login',  // → http://localhost:5001/auth/login
    method: 'POST',
    body: credentials,
  }),
})
```

### Clients
```typescript
getClients: builder.query({
  query: ({ search, serviceType }) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (serviceType && serviceType !== 'ALL') params.append('serviceType', serviceType);
    return `/clients?${params.toString()}`;  // → http://localhost:5001/clients?search=...
  },
})
```

### Marketing
```typescript
getMarketingContacts: builder.query({
  query: (params) => {
    const queryParams = new URLSearchParams();
    if (params.serviceType) queryParams.append('serviceType', params.serviceType);
    if (params.lastVisitMonths) queryParams.append('lastVisitMonths', params.lastVisitMonths.toString());
    return `/marketing/contacts?${queryParams.toString()}`;  // → http://localhost:5001/marketing/contacts?...
  },
})
```

---

## 🚨 Cas Spécial: Export CSV

L'export CSV n'utilise pas RTK Query car il nécessite un téléchargement de fichier.

### Fichier: `app/admin/marketing/page.tsx`

```typescript
const exportToCSV = () => {
  // Utiliser la même variable d'environnement
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001';
  const url = `${baseUrl}/marketing/contacts/export${serviceFilter ? `?serviceType=${serviceFilter}` : ''}`;

  // Fetch avec authentification
  if (token) {
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => response.blob())
    .then(blob => {
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.click();
      window.URL.revokeObjectURL(downloadUrl);
    });
  }
};
```

**Pourquoi `fetch()` directement?**
- RTK Query est conçu pour JSON, pas pour les fichiers binaires
- L'export CSV retourne un blob (fichier)
- On a besoin de déclencher un téléchargement via un lien `<a>`

---

## 🔐 Authentification

Le token JWT est automatiquement ajouté à **tous** les appels API via `prepareHeaders`:

```typescript
prepareHeaders: (headers, { getState }) => {
  const token = (getState() as any).auth?.token;
  if (token) {
    headers.set('authorization', `Bearer ${token}`);  // ← Ajouté automatiquement
  }
  headers.set('Content-Type', 'application/json');
  return headers;
}
```

### Flux d'authentification

1. **Connexion**:
   ```typescript
   const [login] = useLoginMutation();
   const result = await login({ email, password }).unwrap();
   // result.token est stocké dans Redux (state.auth.token)
   ```

2. **Appels suivants**:
   ```typescript
   const { data } = useGetClientsQuery({});
   // Le token est automatiquement ajouté dans le header
   // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 🌍 Configuration par Environnement

### Développement Local

**Fichier**: `.env.local` (git-ignoré)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5001
```

### Staging

**Fichier**: `.env.staging`

```env
NEXT_PUBLIC_API_BASE_URL=https://staging-api.spa-renaissance.com
```

### Production

**Fichier**: `.env.production`

```env
NEXT_PUBLIC_API_BASE_URL=https://api.spa-renaissance.com
```

---

## 📊 Tableau des URL Complètes

En supposant `NEXT_PUBLIC_API_BASE_URL=http://localhost:5001`:

| Endpoint Frontend | URL Backend Complète |
|------------------|---------------------|
| `/auth/login` | `http://localhost:5001/auth/login` |
| `/clients` | `http://localhost:5001/clients` |
| `/clients/assigned` | `http://localhost:5001/clients/assigned` |
| `/clients/{id}` | `http://localhost:5001/clients/{id}` |
| `/clients/{id}/notes` | `http://localhost:5001/clients/{id}/notes` |
| `/assignments` | `http://localhost:5001/assignments` |
| `/professionals` | `http://localhost:5001/professionals` |
| `/users` | `http://localhost:5001/users` |
| `/users/{id}` | `http://localhost:5001/users/{id}` |
| `/users/{id}/reset-password` | `http://localhost:5001/users/{id}/reset-password` |
| `/marketing/contacts` | `http://localhost:5001/marketing/contacts` |
| `/marketing/contacts/export` | `http://localhost:5001/marketing/contacts/export` |
| `/marketing/send-email/individual` | `http://localhost:5001/marketing/send-email/individual` |
| `/marketing/send-email/campaign` | `http://localhost:5001/marketing/send-email/campaign` |
| `/marketing/stats` | `http://localhost:5001/marketing/stats` |

---

## 🧪 Tester la Configuration

### 1. Vérifier la variable d'environnement

```typescript
// Dans n'importe quel composant client
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
// Devrait afficher: http://localhost:5001
```

### 2. Vérifier les appels réseau

1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Network
3. Se connecter à l'application
4. Vérifier que les requêtes vont bien vers `http://localhost:5001/...`

**Exemple de requête**:
```
Request URL: http://localhost:5001/auth/login
Request Method: POST
Status Code: 200 OK

Headers:
  Content-Type: application/json

Body:
  { "email": "admin@spa.com", "password": "admin123" }
```

### 3. Vérifier l'authentification

Après connexion, vérifier que le token est présent:

```
Request URL: http://localhost:5001/clients
Request Method: GET

Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json
```

---

## ⚠️ Erreurs Courantes

### 1. "Failed to fetch"

**Problème**: Le backend n'est pas démarré

**Solution**:
```bash
cd backend
npm run dev
# Devrait démarrer sur http://localhost:5001
```

### 2. "CORS Error"

**Problème**: Le backend n'autorise pas les requêtes depuis le frontend

**Solution**: Vérifier la configuration CORS dans le backend:

```typescript
// backend/server.ts
app.use(cors({
  origin: 'http://localhost:3000',  // URL du frontend Next.js
  credentials: true
}));
```

### 3. "401 Unauthorized"

**Problème**: Token JWT invalide ou expiré

**Solutions**:
- Se reconnecter
- Vérifier que le token est bien stocké dans Redux
- Vérifier la durée de validité du token dans le backend

### 4. Variable d'environnement non définie

**Problème**: `process.env.NEXT_PUBLIC_API_BASE_URL` retourne `undefined`

**Solutions**:
1. Vérifier que le fichier `.env` existe à la racine du projet
2. Vérifier le préfixe `NEXT_PUBLIC_`
3. Redémarrer le serveur Next.js après modification du `.env`:
   ```bash
   npm run dev
   ```

---

## 🔄 Changement d'Environnement

### Passer de Local à Staging

1. **Modifier `.env`**:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://staging-api.spa-renaissance.com
   ```

2. **Redémarrer Next.js**:
   ```bash
   # Arrêter avec Ctrl+C
   npm run dev
   ```

3. **Vérifier**:
   - Toutes les requêtes vont maintenant vers staging
   - Pas besoin de modifier le code!

### Build Production

```bash
# Créer le fichier .env.production
echo "NEXT_PUBLIC_API_BASE_URL=https://api.spa-renaissance.com" > .env.production

# Build
npm run build

# Start production
npm start
```

---

## 📝 Résumé

✅ **Variable d'environnement**: `NEXT_PUBLIC_API_BASE_URL` dans `.env`

✅ **Redux RTK Query**: Utilise `baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL`

✅ **Endpoints**: Chemins relatifs (`/auth/login`, `/clients`, etc.)

✅ **Export CSV**: Utilise `fetch()` avec la même variable

✅ **Authentification**: Token JWT ajouté automatiquement via `prepareHeaders`

✅ **Multi-environnements**: Change juste la variable, pas le code!

---

**Configuration validée et fonctionnelle** ✅

L'application appelle maintenant correctement le backend sur `http://localhost:5001` avec authentification JWT automatique.
