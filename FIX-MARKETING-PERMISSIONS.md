# 🔧 Correction: Permissions Marketing

## ❌ Problème Identifié

**Erreur**: `TypeError: can't access property "includes", allowedRoles is undefined`

**Localisation**: Page `/admin/marketing` - Vérification des permissions

**Cause**: La page marketing utilisait la permission `'VIEW_CLIENTS'` qui n'existait pas dans le fichier de permissions.

---

## 🔍 Analyse du Problème

### Code Problématique

**Page Marketing** (`app/admin/marketing/page.tsx`):
```typescript
useEffect(() => {
  if (isMounted && (!currentUser || !hasPermission(currentUser.role, 'VIEW_CLIENTS'))) {
    router.push('/professionnel/connexion');
  }
}, [currentUser, router, isMounted]);
```

**Fonction hasPermission** (`lib/permissions.ts`):
```typescript
export function hasPermission(userRole: Role | string | undefined | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!userRole) return false;

  const allowedRoles = PERMISSIONS[permission];  // ❌ undefined si permission n'existe pas
  return allowedRoles.includes(userRole as any); // ❌ Erreur: can't access property "includes"
}
```

### Permissions Disponibles (Avant)

```typescript
export const PERMISSIONS = {
  VIEW_ALL_CLIENTS: ['ADMIN', 'SECRETAIRE'],
  VIEW_ASSIGNED_CLIENTS: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  // ...
  // ❌ PAS de VIEW_CLIENTS !
} as const;
```

**Problème**: La permission `'VIEW_CLIENTS'` n'existe pas → `PERMISSIONS['VIEW_CLIENTS']` retourne `undefined` → Erreur lors de l'appel à `.includes()`

---

## ✅ Solution Appliquée

### 1. Ajout des Permissions Marketing (`lib/permissions.ts`)

**AVANT**:
```typescript
export const PERMISSIONS = {
  // ... autres permissions
  CREATE_USER: ['ADMIN'],
  VIEW_USERS: ['ADMIN'],
  EDIT_USER: ['ADMIN'],
  DELETE_USER: ['ADMIN'],
  RESET_PASSWORD: ['ADMIN'],

  FULL_ACCESS: ['ADMIN'],
} as const;
```

**APRÈS**:
```typescript
export const PERMISSIONS = {
  // ... autres permissions
  CREATE_USER: ['ADMIN'],
  VIEW_USERS: ['ADMIN'],
  EDIT_USER: ['ADMIN'],
  DELETE_USER: ['ADMIN'],
  RESET_PASSWORD: ['ADMIN'],

  // Permissions marketing (ADMIN uniquement)
  VIEW_MARKETING: ['ADMIN'],
  SEND_MARKETING_EMAIL: ['ADMIN'],
  EXPORT_CLIENT_DATA: ['ADMIN'],

  FULL_ACCESS: ['ADMIN'],
} as const;
```

**Nouvelles permissions ajoutées**:
- ✅ `VIEW_MARKETING`: Voir la page des campagnes marketing
- ✅ `SEND_MARKETING_EMAIL`: Envoyer des emails marketing
- ✅ `EXPORT_CLIENT_DATA`: Exporter les données clients en CSV

---

### 2. Mise à Jour de la Page Marketing (`app/admin/marketing/page.tsx`)

**AVANT**:
```typescript
useEffect(() => {
  if (isMounted && (!currentUser || !hasPermission(currentUser.role, 'VIEW_CLIENTS'))) {
    router.push('/professionnel/connexion');
  }
}, [currentUser, router, isMounted]);
```

**APRÈS**:
```typescript
useEffect(() => {
  if (isMounted && (!currentUser || !hasPermission(currentUser.role, 'VIEW_MARKETING'))) {
    router.push('/professionnel/connexion');
  }
}, [currentUser, router, isMounted]);
```

**Changement**:
- ✅ Utilisation de `'VIEW_MARKETING'` qui existe maintenant
- ✅ Permission spécifique au marketing (plus sémantique)

---

### 3. Correction de la Couleur SECRETAIRE

**AVANT**:
```typescript
export function getRoleColor(role: Role | string): string {
  switch (role) {
    case 'ADMIN':
      return 'gray-800';
    case 'SECRETAIRE':
      return 'spa-rose-500';  // ❌ Ancienne palette
    // ...
  }
}
```

**APRÈS**:
```typescript
export function getRoleColor(role: Role | string): string {
  switch (role) {
    case 'ADMIN':
      return 'gray-800';
    case 'SECRETAIRE':
      return 'spa-turquoise-500';  // ✅ Nouvelle palette
    // ...
  }
}
```

---

## 🎯 Impact des Corrections

### Avant (Broken)

```
1. Page marketing charge
2. useEffect vérifie hasPermission(userRole, 'VIEW_CLIENTS')
3. PERMISSIONS['VIEW_CLIENTS'] retourne undefined
4. allowedRoles.includes() lance une erreur
5. Page crash ❌
```

### Après (Fixed)

```
1. Page marketing charge
2. useEffect vérifie hasPermission(userRole, 'VIEW_MARKETING')
3. PERMISSIONS['VIEW_MARKETING'] retourne ['ADMIN']
4. allowedRoles.includes('ADMIN') retourne true
5. Page s'affiche correctement ✅
```

---

## 🧪 Test de Validation

### Test 1: Accès Admin à la Page Marketing

```bash
# 1. Se connecter en tant qu'admin
Email: admin@spa.com
Password: admin123

# 2. Aller sur "Campagnes Marketing"
http://localhost:3000/admin/marketing
```

**Résultat attendu**:
- ✅ Pas d'erreur "can't access property includes"
- ✅ Page marketing s'affiche correctement
- ✅ Aucune erreur dans la console

### Test 2: Accès Non-Admin (Massothérapeute)

```bash
# 1. Se connecter en tant que massothérapeute
Email: masso1@spa.com
Password: masso123

# 2. Essayer d'accéder à la page marketing
http://localhost:3000/admin/marketing
```

**Résultat attendu**:
- ✅ Redirection automatique vers `/professionnel/connexion`
- ✅ Pas d'accès à la page marketing (réservée à l'admin)

### Test 3: Badge de Rôle Secrétaire

```bash
# Sur la page de gestion des employés
# Vérifier la couleur du badge "Secrétaire"
```

**Résultat attendu**:
- ✅ Badge affiché en turquoise (`spa-turquoise-500`)
- ✅ Pas en rose

---

## 📊 Permissions Marketing Complètes

### VIEW_MARKETING
- **Qui**: Admin uniquement
- **Permet**: Accéder à la page des campagnes marketing
- **Usage**: Vérification d'accès à `/admin/marketing`

### SEND_MARKETING_EMAIL
- **Qui**: Admin uniquement
- **Permet**: Envoyer des emails marketing individuels ou en campagne
- **Usage**: Bouton "Envoyer email" sur la page marketing

### EXPORT_CLIENT_DATA
- **Qui**: Admin uniquement
- **Permet**: Exporter les données clients en CSV
- **Usage**: Bouton "Exporter CSV" sur la page marketing

---

## 🔒 Sécurité

Ces permissions marketing sont **exclusives à l'admin** car:
1. ✅ **Données sensibles**: Emails et téléphones de tous les clients
2. ✅ **RGPD/Privacy**: Export de données personnelles
3. ✅ **Communication**: Envoi d'emails en masse
4. ✅ **Réputation**: Une mauvaise utilisation pourrait nuire à l'image de l'entreprise

Seul l'admin a le niveau d'autorisation nécessaire pour gérer les campagnes marketing.

---

## 📝 Pattern de Vérification des Permissions

### Dans les Pages

```typescript
import { hasPermission } from '@/lib/permissions';

export default function MyPage() {
  const currentUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (isMounted && (!currentUser || !hasPermission(currentUser.role, 'PERMISSION_NAME'))) {
      router.push('/professionnel/connexion');
    }
  }, [currentUser, router, isMounted]);

  // Reste du code...
}
```

### Dans les Composants

```typescript
{hasPermission(currentUser?.role, 'PERMISSION_NAME') && (
  <button>Action Protégée</button>
)}
```

### Backend (API)

```typescript
// Middleware de vérification des permissions
const checkPermission = (permission: string) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission refusée'
      });
    }
    next();
  };
};

// Utilisation
router.get('/marketing/contacts',
  authenticateToken,
  checkPermission('VIEW_MARKETING'),
  getMarketingContacts
);
```

---

## ✅ Checklist de Validation

- ✅ Permission `VIEW_MARKETING` ajoutée
- ✅ Permission `SEND_MARKETING_EMAIL` ajoutée
- ✅ Permission `EXPORT_CLIENT_DATA` ajoutée
- ✅ Page marketing utilise `VIEW_MARKETING`
- ✅ Couleur SECRETAIRE mise à jour (turquoise)
- ✅ Pas d'erreur "includes is undefined"
- ✅ Admin peut accéder à la page marketing
- ✅ Non-admin sont redirigés

---

## 🎯 Résumé

**Problème**: La page marketing utilisait la permission `'VIEW_CLIENTS'` qui n'existait pas, causant une erreur `allowedRoles is undefined`.

**Solution**:
1. Ajout de 3 permissions marketing dans `lib/permissions.ts`
2. Mise à jour de la page marketing pour utiliser `'VIEW_MARKETING'`
3. Correction de la couleur du rôle SECRETAIRE (rose → turquoise)

**Impact**: La page marketing fonctionne maintenant correctement avec une vérification de permissions appropriée.

**Fichiers modifiés**:
- `lib/permissions.ts` - Ajout des permissions marketing et correction couleur
- `app/admin/marketing/page.tsx` - Utilisation de la bonne permission

---

**Correction appliquée le**: 14 décembre 2025
**Status**: ✅ RÉSOLU
