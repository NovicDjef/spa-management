# Routes Backend à Créer pour le Système d'Avis

## 📋 Liste des Routes

### 1. GET /api/professionals/public (PUBLIC)
**Fichier:** `src/controllers/professionalController.ts`

**Description:** Retourne la liste des professionnels actifs pour le formulaire d'avis

**Query Parameters:**
- `serviceType` (optionnel): "MASSOTHERAPIE" | "ESTHETIQUE"

**Réponse:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "prenom": "Marie",
      "nom": "Dupont",
      "role": "MASSOTHERAPEUTE",
      "isActive": true
    }
  ]
}
```

**Code Prisma:**
```typescript
export async function getPublicProfessionals(req, res) {
  const { serviceType } = req.query;

  const where: any = {
    isActive: true,
    role: {
      in: ['MASSOTHERAPEUTE', 'ESTHETICIENNE']
    }
  };

  if (serviceType === 'MASSOTHERAPIE') {
    where.role = 'MASSOTHERAPEUTE';
  } else if (serviceType === 'ESTHETIQUE') {
    where.role = 'ESTHETICIENNE';
  }

  const professionals = await prisma.user.findMany({
    where,
    select: {
      id: true,
      prenom: true,
      nom: true,
      role: true,
      isActive: true
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  res.json({
    success: true,
    data: professionals
  });
}
```

---

### 2. POST /api/reviews (PUBLIC)
**Fichier:** `src/controllers/reviewController.ts`

**Description:** Créer un avis anonyme

**Body:**
```json
{
  "professionalId": "user_123",
  "rating": 5,
  "comment": "Excellent service!"
}
```

**Validation:**
- `professionalId`: string, requis
- `rating`: number, requis, entre 1 et 5
- `comment`: string, optionnel, max 1000 caractères

**Réponse Success:**
```json
{
  "success": true,
  "message": "Avis enregistré avec succès",
  "data": {
    "id": "review_456",
    "rating": 5,
    "createdAt": "2024-12-19T10:30:00Z"
  }
}
```

**Code Complet:**
```typescript
import { z } from 'zod';
import sanitizeHtml from 'sanitize-html';

const createReviewSchema = z.object({
  professionalId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional()
});

export async function createReview(req, res) {
  try {
    // Validation
    const data = createReviewSchema.parse(req.body);

    // Vérifier que le professionnel existe et est actif
    const professional = await prisma.user.findUnique({
      where: { id: data.professionalId },
      select: { id: true, isActive: true, role: true }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel introuvable'
      });
    }

    if (!professional.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce professionnel n\'est plus actif'
      });
    }

    if (!['MASSOTHERAPEUTE', 'ESTHETICIENNE'].includes(professional.role)) {
      return res.status(400).json({
        success: false,
        message: 'Seuls les massothérapeutes et esthéticiennes peuvent recevoir des avis'
      });
    }

    // Sanitize le commentaire
    const sanitizedComment = data.comment
      ? sanitizeHtml(data.comment, { allowedTags: [], allowedAttributes: {} })
      : null;

    // Créer l'avis
    const review = await prisma.review.create({
      data: {
        professionalId: data.professionalId,
        rating: data.rating,
        comment: sanitizedComment,
        isAnonymous: true
      },
      select: {
        id: true,
        rating: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Avis enregistré avec succès',
      data: review
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.errors
      });
    }

    console.error('Erreur création avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

**Dépendances à installer:**
```bash
npm install zod sanitize-html
npm install --save-dev @types/sanitize-html
```

---

### 3. GET /api/reviews/:professionalId (PUBLIC)
**Fichier:** `src/controllers/reviewController.ts`

**Description:** Récupérer les statistiques et avis d'un professionnel

**Réponse:**
```json
{
  "success": true,
  "data": {
    "averageRating": 4.7,
    "totalReviews": 23,
    "reviews": [
      {
        "id": "review_456",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

**Code:**
```typescript
export async function getReviewsByProfessional(req, res) {
  const { professionalId } = req.params;

  const reviews = await prisma.review.findMany({
    where: { professionalId },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  res.json({
    success: true,
    data: {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      reviews
    }
  });
}
```

---

### 4. GET /api/users (MODIFIER - Token ADMIN)
**Fichier:** `src/controllers/userController.ts`

**Description:** Modifier la route existante pour inclure les stats d'avis

**Modifications à apporter:**
```typescript
export async function getUsers(req, res) {
  // Vérification admin existante...

  const { role, search } = req.query;

  const where: any = {};
  if (role) where.role = role;
  if (search) {
    where.OR = [
      { nom: { contains: search, mode: 'insensitive' } },
      { prenom: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: {
      _count: {
        select: {
          assignedClients: true,
          notesCreated: true,
          reviewsReceived: true  // ⭐ AJOUTER
        }
      },
      reviewsReceived: {
        select: { rating: true }  // ⭐ AJOUTER
      }
    },
    orderBy: [
      { nom: 'asc' },
      { prenom: 'asc' }
    ]
  });

  // ⭐ AJOUTER: Calculer la moyenne pour chaque user
  const usersWithStats = users.map(user => {
    const reviewsCount = user.reviewsReceived.length;
    const averageRating = reviewsCount > 0
      ? user.reviewsReceived.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : null;

    return {
      id: user.id,
      email: user.email,
      telephone: user.telephone,
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      _count: {
        assignedClients: user._count.assignedClients,
        notesCreated: user._count.notesCreated,
        reviewsReceived: user._count.reviewsReceived
      },
      averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null
    };
  });

  res.json({
    success: true,
    data: usersWithStats
  });
}
```

---

### 5. GET /api/users/:id/reviews (NOUVEAU - Token ADMIN)
**Fichier:** `src/controllers/userController.ts`

**Description:** Récupérer les détails complets des avis d'un employé

**Réponse:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "nom": "Dupont",
      "prenom": "Marie"
    },
    "statistics": {
      "averageRating": 4.7,
      "totalReviews": 23,
      "ratingDistribution": {
        "5": 18,
        "4": 3,
        "3": 1,
        "2": 1,
        "1": 0
      }
    },
    "recentReviews": [
      {
        "id": "review_456",
        "rating": 5,
        "comment": "Excellent!",
        "createdAt": "2024-12-19T10:30:00Z"
      }
    ]
  }
}
```

**Code:**
```typescript
export async function getUserReviews(req, res) {
  // Vérifier admin
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Accès interdit'
    });
  }

  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      prenom: true
    }
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'Utilisateur introuvable'
    });
  }

  const reviews = await prisma.review.findMany({
    where: { professionalId: id },
    select: {
      id: true,
      rating: true,
      comment: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0;

  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0
  };

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  res.json({
    success: true,
    data: {
      user,
      statistics: {
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews,
        ratingDistribution
      },
      recentReviews: reviews
    }
  });
}
```

---

### 6. GET /api/reviews (MODIFIER - Token ADMIN)
**Fichier:** `src/controllers/reviewController.ts`

**Description:** Récupérer tous les avis avec filtres et pagination (vue admin globale)

**Query Parameters:**
- `professionalId` (optionnel): Filtrer par professionnel
- `rating` (optionnel): Filtrer par note (1-5)
- `dateFrom` (optionnel): Date de début (ISO 8601)
- `dateTo` (optionnel): Date de fin (ISO 8601)
- `hasComment` (optionnel): true/false - Filtrer avis avec/sans commentaire
- `limit` (optionnel): Nombre d'avis par page (défaut: 50)
- `offset` (optionnel): Décalage pour pagination (défaut: 0)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "review_123",
        "rating": 5,
        "comment": "Excellent service!",
        "createdAt": "2024-12-20T10:30:00Z",
        "professional": {
          "id": "user_456",
          "nom": "Dupont",
          "prenom": "Marie",
          "role": "MASSOTHERAPEUTE"
        }
      },
      {
        "id": "review_124",
        "rating": 4,
        "comment": null,
        "createdAt": "2024-12-19T15:20:00Z",
        "professional": {
          "id": "user_789",
          "nom": "Martin",
          "prenom": "Sophie",
          "role": "ESTHETICIENNE"
        }
      }
    ],
    "total": 150,
    "statistics": {
      "averageRating": 4.7,
      "totalReviews": 150,
      "ratingDistribution": {
        "5": 85,
        "4": 45,
        "3": 15,
        "2": 3,
        "1": 2
      },
      "byProfessional": {
        "user_456": {
          "count": 75,
          "average": 4.8,
          "name": "Marie Dupont"
        },
        "user_789": {
          "count": 75,
          "average": 4.6,
          "name": "Sophie Martin"
        }
      }
    }
  }
}
```

**Code Complet:**
```typescript
export async function getAllReviews(req, res) {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    const {
      professionalId,
      rating,
      dateFrom,
      dateTo,
      hasComment,
      limit = 50,
      offset = 0
    } = req.query;

    // Construction du filtre where
    const where: any = {};

    if (professionalId) {
      where.professionalId = professionalId;
    }

    if (rating) {
      where.rating = parseInt(rating as string);
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom as string);
      }
      if (dateTo) {
        where.createdAt.lte = new Date(dateTo as string);
      }
    }

    if (hasComment !== undefined) {
      if (hasComment === 'true') {
        where.comment = { not: null };
      } else if (hasComment === 'false') {
        where.comment = null;
      }
    }

    // Récupérer les avis avec pagination
    const reviews = await prisma.review.findMany({
      where,
      include: {
        professional: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    // Compter le total
    const total = await prisma.review.count({ where });

    // Calculer les statistiques globales
    const allReviews = await prisma.review.findMany({
      where: professionalId ? { professionalId } : {}, // Si filtre pro, stats pour ce pro seulement
      select: {
        rating: true,
        professionalId: true,
        professional: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    const totalReviews = allReviews.length;
    const averageRating = totalReviews > 0
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : 0;

    // Distribution des notes
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };
    allReviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    // Stats par professionnel
    const byProfessional: any = {};
    allReviews.forEach(review => {
      if (!byProfessional[review.professionalId]) {
        byProfessional[review.professionalId] = {
          count: 0,
          total: 0,
          name: `${review.professional.prenom} ${review.professional.nom}`
        };
      }
      byProfessional[review.professionalId].count++;
      byProfessional[review.professionalId].total += review.rating;
    });

    // Calculer les moyennes
    Object.keys(byProfessional).forEach(id => {
      const stats = byProfessional[id];
      stats.average = Math.round((stats.total / stats.count) * 10) / 10;
      delete stats.total;
    });

    res.json({
      success: true,
      data: {
        reviews,
        total,
        statistics: {
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution,
          byProfessional
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération tous les avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

**Modifier dans routes:**
```typescript
// src/routes/reviews.ts
// Modifier la route GET / pour accepter les query params et retourner tous les avis pour l'admin
router.get('/', authMiddleware, adminMiddleware, getAllReviews);
```

---

## 🗄️ Schéma Prisma

**Fichier:** `prisma/schema.prisma`

```prisma
// Nouveau modèle à ajouter
model Review {
  id              String   @id @default(cuid())
  rating          Int      // 1-5
  comment         String?  @db.Text

  // Relation avec le professionnel
  professionalId  String
  professional    User     @relation("ReceivedReviews", fields: [professionalId], references: [id], onDelete: Cascade)

  // Métadonnées
  isAnonymous     Boolean  @default(true)
  createdAt       DateTime @default(now())

  // Index pour performance
  @@index([professionalId])
  @@index([createdAt])
}

// Modifier le modèle User existant
model User {
  // ... tous les champs existants ...

  // ⭐ AJOUTER cette ligne:
  reviewsReceived  Review[]  @relation("ReceivedReviews")
}
```

**Commandes à exécuter:**
```bash
npx prisma migrate dev --name add_reviews_system
npx prisma generate
```

---

## 📁 Structure des Fichiers

```
src/
├── controllers/
│   ├── professionalController.ts    # NOUVEAU - Créer ce fichier
│   ├── reviewController.ts          # NOUVEAU - Créer ce fichier
│   └── userController.ts            # MODIFIER - Ajouter getUserReviews + modifier getUsers
├── routes/
│   ├── professionals.ts             # NOUVEAU - Créer ce fichier
│   ├── reviews.ts                   # NOUVEAU - Créer ce fichier
│   └── users.ts                     # MODIFIER - Ajouter route /:id/reviews
└── app.ts ou index.ts               # MODIFIER - Enregistrer les nouvelles routes
```

---

## 🛣️ Enregistrement des Routes

**Fichier:** `src/app.ts` ou `src/index.ts`

```typescript
import professionalRoutes from './routes/professionals';
import reviewRoutes from './routes/reviews';
import userRoutes from './routes/users';

// Enregistrer les routes
app.use('/api/professionals', professionalRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
```

**Fichier:** `src/routes/professionals.ts` (NOUVEAU)
```typescript
import express from 'express';
import { getPublicProfessionals } from '../controllers/professionalController';

const router = express.Router();

router.get('/public', getPublicProfessionals);

export default router;
```

**Fichier:** `src/routes/reviews.ts` (NOUVEAU)
```typescript
import express from 'express';
import { createReview, getReviewsByProfessional } from '../controllers/reviewController';

const router = express.Router();

router.post('/', createReview);
router.get('/:professionalId', getReviewsByProfessional);

export default router;
```

**Fichier:** `src/routes/users.ts` (MODIFIER)
```typescript
import express from 'express';
import { getUsers, getUserReviews } from '../controllers/userController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, getUsers);
router.get('/:id/reviews', authMiddleware, adminMiddleware, getUserReviews); // ⭐ AJOUTER

export default router;
```

---

## ✅ Checklist d'Implémentation

### Backend
- [ ] Modifier `prisma/schema.prisma` (ajouter modèle Review + relation User)
- [ ] Exécuter `npx prisma migrate dev --name add_reviews_system`
- [ ] Exécuter `npx prisma generate`
- [ ] Installer dépendances: `npm install zod sanitize-html`
- [ ] Créer `src/controllers/professionalController.ts`
- [ ] Créer `src/controllers/reviewController.ts`
- [ ] Modifier `src/controllers/userController.ts` (ajouter getUserReviews + modifier getUsers)
- [ ] Créer `src/routes/professionals.ts`
- [ ] Créer `src/routes/reviews.ts`
- [ ] Modifier `src/routes/users.ts` (ajouter route /:id/reviews)
- [ ] Modifier `src/app.ts` (enregistrer les routes)
- [ ] Tester avec Postman/Insomnia

### Frontend (✅ Déjà fait)
- [x] Redux API configuré
- [x] Composants reviews créés
- [x] Page publique /avis créée
- [x] Page admin modifiée

---

## 🧪 Tests

### Test 1: Liste professionnels
```bash
curl http://localhost:3000/api/professionals/public
```

### Test 2: Créer un avis
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "USER_ID_ICI",
    "rating": 5,
    "comment": "Test avis"
  }'
```

### Test 3: Voir avis d'un professionnel
```bash
curl http://localhost:3000/api/reviews/USER_ID_ICI
```

### Test 4: Liste employés (avec token admin)
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

### Test 5: Détails avis employé (avec token admin)
```bash
curl http://localhost:3000/api/users/USER_ID_ICI/reviews \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

---

## 📝 Notes Importantes

1. **Sécurité:**
   - Les routes publiques ne nécessitent PAS de token
   - Les routes admin nécessitent un token JWT valide et rôle ADMIN
   - Les commentaires sont sanitizés pour prévenir XSS

2. **Performance:**
   - Index sur `professionalId` et `createdAt` dans le modèle Review
   - Limite de 20 avis pour la route publique
   - Limite de 50 avis pour la route admin

3. **Validation:**
   - Utilisation de Zod pour valider les inputs
   - Rating doit être entre 1 et 5
   - Commentaire max 1000 caractères

4. **Rate Limiting (Optionnel):**
   - Recommandé: max 5 avis/heure par IP
   - Utiliser express-rate-limit

---

## 🚀 Ordre d'Implémentation Recommandé

1. ✅ Schéma Prisma + migration
2. ✅ Route GET /api/professionals/public
3. ✅ Route POST /api/reviews
4. ✅ Route GET /api/reviews/:professionalId
5. ✅ Modifier GET /api/users
6. ✅ Route GET /api/users/:id/reviews
7. ✅ Tests avec Postman
8. ✅ Tests frontend

---

# Routes Backend pour le Suivi des Assignations

## 📋 Nouvelles Routes / Modifications

### 6. POST /api/assignments (MODIFIER - Token ADMIN/SECRETAIRE)
**Fichier:** `src/controllers/assignmentController.ts`

**Description:** Modifier pour capturer qui a fait l'assignation

**Body:**
```json
{
  "clientId": "client_123",
  "professionalId": "user_456"
}
```

**Réponse Success:**
```json
{
  "success": true,
  "message": "Client assigné avec succès",
  "data": {
    "id": "assignment_789",
    "clientId": "client_123",
    "professionalId": "user_456",
    "assignedById": "user_001",
    "assignedAt": "2024-12-20T10:30:00Z"
  }
}
```

**Code Complet:**
```typescript
export async function assignClient(req, res) {
  try {
    const { clientId, professionalId } = req.body;
    const assignedById = req.user.id; // ⭐ ID de la secrétaire/admin qui fait l'assignation

    // Vérifier que le client existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true, nom: true, prenom: true, serviceType: true }
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client introuvable'
      });
    }

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
      select: { id: true, nom: true, prenom: true, role: true, isActive: true }
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel introuvable'
      });
    }

    if (!professional.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Ce professionnel est inactif'
      });
    }

    // Vérifier la correspondance service type
    const validRoles = {
      MASSOTHERAPIE: 'MASSOTHERAPEUTE',
      ESTHETIQUE: 'ESTHETICIENNE'
    };

    if (professional.role !== validRoles[client.serviceType]) {
      return res.status(400).json({
        success: false,
        message: `Un client ${client.serviceType} doit être assigné à un ${validRoles[client.serviceType]}`
      });
    }

    // Vérifier si déjà assigné
    const existingAssignment = await prisma.assignment.findFirst({
      where: { clientId },
      include: {
        assignedBy: {
          select: {
            nom: true,
            prenom: true,
            role: true
          }
        },
        professional: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: `Ce client est déjà assigné à ${existingAssignment.professional.prenom} ${existingAssignment.professional.nom} par ${existingAssignment.assignedBy.prenom} ${existingAssignment.assignedBy.nom}`,
        data: {
          existingAssignment: {
            professionalName: `${existingAssignment.professional.prenom} ${existingAssignment.professional.nom}`,
            assignedByName: `${existingAssignment.assignedBy.prenom} ${existingAssignment.assignedBy.nom}`,
            assignedByRole: existingAssignment.assignedBy.role,
            assignedAt: existingAssignment.assignedAt
          }
        }
      });
    }

    // Créer l'assignation
    const assignment = await prisma.assignment.create({
      data: {
        clientId,
        professionalId,
        assignedById,  // ⭐ NOUVEAU CHAMP
        assignedAt: new Date()
      },
      include: {
        assignedBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        },
        professional: {
          select: {
            nom: true,
            prenom: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Client assigné avec succès',
      data: assignment
    });
  } catch (error) {
    console.error('Erreur assignation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

---

### 7. GET /api/clients (MODIFIER - Token ADMIN/SECRETAIRE/PRO)
**Fichier:** `src/controllers/clientController.ts`

**Description:** Modifier pour inclure les infos de qui a assigné le client

**Query Parameters:**
- `search` (optionnel): Recherche par nom/prénom/email
- `serviceType` (optionnel): "MASSOTHERAPIE" | "ESTHETIQUE" | "ALL"

**Réponse:**
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client_123",
        "nom": "Martin",
        "prenom": "Sophie",
        "serviceType": "MASSOTHERAPIE",
        "assignedAt": "2024-12-20T10:30:00Z",
        "assignedBy": {
          "id": "user_001",
          "nom": "Tremblay",
          "prenom": "Julie",
          "role": "SECRETAIRE"
        },
        "assignedTo": {
          "id": "user_456",
          "nom": "Dupont",
          "prenom": "Marie"
        }
      }
    ]
  }
}
```

**Code Complet:**
```typescript
export async function getClients(req, res) {
  try {
    const { search, serviceType } = req.query;
    const userRole = req.user.role;
    const userId = req.user.id;

    const where: any = {};

    // Filtre par type de service
    if (serviceType && serviceType !== 'ALL') {
      where.serviceType = serviceType;
    }

    // Filtre par recherche
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { courriel: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Si professionnel, voir seulement ses clients assignés
    if (userRole === 'MASSOTHERAPEUTE' || userRole === 'ESTHETICIENNE') {
      where.assignment = {
        professionalId: userId
      };
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        assignment: {
          include: {
            assignedBy: {  // ⭐ INCLURE INFO SECRÉTAIRE
              select: {
                id: true,
                nom: true,
                prenom: true,
                role: true
              }
            },
            professional: {  // ⭐ INCLURE INFO PROFESSIONNEL
              select: {
                id: true,
                nom: true,
                prenom: true,
                role: true
              }
            }
          }
        },
        notes: {
          select: {
            id: true,
            createdAt: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transformer les données pour le frontend
    const clientsFormatted = clients.map(client => {
      const assignment = client.assignment;

      return {
        id: client.id,
        nom: client.nom,
        prenom: client.prenom,
        telCellulaire: client.telCellulaire,
        courriel: client.courriel,
        dateNaissance: client.dateNaissance,
        serviceType: client.serviceType,
        createdAt: client.createdAt,
        assignedAt: assignment?.assignedAt || null,
        assignedBy: assignment?.assignedBy ? {
          id: assignment.assignedBy.id,
          nom: assignment.assignedBy.nom,
          prenom: assignment.assignedBy.prenom,
          role: assignment.assignedBy.role
        } : null,
        assignedTo: assignment?.professional ? {
          id: assignment.professional.id,
          nom: assignment.professional.nom,
          prenom: assignment.professional.prenom,
          role: assignment.professional.role
        } : null,
        hasNoteAfterAssignment: assignment?.assignedAt
          ? client.notes.some(note => new Date(note.createdAt) > new Date(assignment.assignedAt))
          : false,
        lastVisit: client.notes.length > 0
          ? client.notes[client.notes.length - 1].createdAt
          : null,
        _count: {
          notes: client.notes.length
        }
      };
    });

    res.json({
      success: true,
      data: {
        clients: clientsFormatted
      }
    });
  } catch (error) {
    console.error('Erreur récupération clients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

---

### 8. GET /api/assignments/history (NOUVEAU - Token ADMIN/SECRETAIRE)
**Fichier:** `src/controllers/assignmentController.ts`

**Description:** Récupérer l'historique complet des assignations

**Query Parameters:**
- `limit` (optionnel): Nombre d'assignations à retourner (défaut: 50)

**Réponse:**
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": "assignment_789",
        "assignedAt": "2024-12-20T10:30:00Z",
        "client": {
          "id": "client_123",
          "nom": "Martin",
          "prenom": "Sophie",
          "serviceType": "MASSOTHERAPIE"
        },
        "professional": {
          "id": "user_456",
          "nom": "Dupont",
          "prenom": "Marie",
          "role": "MASSOTHERAPEUTE"
        },
        "assignedBy": {
          "id": "user_001",
          "nom": "Tremblay",
          "prenom": "Julie",
          "role": "SECRETAIRE"
        }
      }
    ],
    "total": 150
  }
}
```

**Code:**
```typescript
export async function getAssignmentHistory(req, res) {
  try {
    // Vérifier permissions
    if (!['ADMIN', 'SECRETAIRE'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès interdit'
      });
    }

    const limit = parseInt(req.query.limit as string) || 50;

    const assignments = await prisma.assignment.findMany({
      include: {
        client: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            serviceType: true
          }
        },
        professional: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        },
        assignedBy: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            role: true
          }
        }
      },
      orderBy: { assignedAt: 'desc' },
      take: limit
    });

    const total = await prisma.assignment.count();

    res.json({
      success: true,
      data: {
        assignments,
        total
      }
    });
  } catch (error) {
    console.error('Erreur historique assignations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur'
    });
  }
}
```

---

## 🗄️ Schéma Prisma - Modifications pour Assignations

**Fichier:** `prisma/schema.prisma`

```prisma
// Modifier le modèle Assignment existant
model Assignment {
  id              String   @id @default(cuid())

  // Relations
  clientId        String   @unique  // Un client ne peut avoir qu'une seule assignation
  client          Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  professionalId  String
  professional    User     @relation("AssignedClients", fields: [professionalId], references: [id], onDelete: Cascade)

  // ⭐ NOUVEAU: Qui a fait l'assignation
  assignedById    String
  assignedBy      User     @relation("AssignmentsCreated", fields: [assignedById], references: [id], onDelete: Restrict)

  // Métadonnées
  assignedAt      DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Index pour performance
  @@index([professionalId])
  @@index([assignedById])
  @@index([assignedAt])
}

// Modifier le modèle User existant
model User {
  // ... tous les champs existants ...

  // Relations existantes
  assignedClients   Assignment[] @relation("AssignedClients")
  reviewsReceived   Review[]     @relation("ReceivedReviews")
  notesCreated      Note[]       @relation("CreatedNotes")

  // ⭐ AJOUTER cette nouvelle relation:
  assignmentsCreated Assignment[] @relation("AssignmentsCreated")
}

// Le modèle Client doit avoir:
model Client {
  // ... tous les champs existants ...

  // Relation one-to-one avec Assignment
  assignment      Assignment?
}
```

**Commandes à exécuter:**
```bash
npx prisma migrate dev --name add_assignment_tracking
npx prisma generate
```

---

## 🛣️ Routes à Ajouter/Modifier

**Fichier:** `src/routes/assignments.ts` (MODIFIER)

```typescript
import express from 'express';
import { assignClient, getAssignmentHistory } from '../controllers/assignmentController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = express.Router();

// POST /api/assignments - Modifier pour capturer assignedById
router.post('/',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SECRETAIRE']),
  assignClient
);

// GET /api/assignments/history - NOUVEAU
router.get('/history',
  authMiddleware,
  roleMiddleware(['ADMIN', 'SECRETAIRE']),
  getAssignmentHistory
);

export default router;
```

**Fichier:** `src/routes/clients.ts` (MODIFIER)

```typescript
import express from 'express';
import { getClients } from '../controllers/clientController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// GET /api/clients - Modifier pour inclure assignedBy
router.get('/', authMiddleware, getClients);

export default router;
```

---

## ✅ Checklist d'Implémentation - Suivi Assignations

### Backend
- [ ] Modifier `prisma/schema.prisma` (ajouter assignedById + relation AssignmentsCreated)
- [ ] Exécuter `npx prisma migrate dev --name add_assignment_tracking`
- [ ] Exécuter `npx prisma generate`
- [ ] Modifier `src/controllers/assignmentController.ts` (capturer assignedById, vérifier doublon)
- [ ] Modifier `src/controllers/clientController.ts` (inclure assignedBy dans réponse)
- [ ] Ajouter fonction `getAssignmentHistory` dans assignmentController
- [ ] Modifier `src/routes/assignments.ts` (ajouter route /history)
- [ ] Tester avec Postman

### Frontend
- [ ] Modifier types Redux API (Assignment, Client)
- [ ] Ajouter badge "Déjà assigné" dans ClientCard
- [ ] Afficher info "Assigné par" dans dashboard
- [ ] Ajouter avertissement dans modal d'assignation
- [ ] Créer page historique assignations (optionnel)

---

## 🧪 Tests - Assignations

### Test 1: Créer une assignation
```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRETAIRE_TOKEN" \
  -d '{
    "clientId": "CLIENT_ID",
    "professionalId": "PRO_ID"
  }'
```

### Test 2: Tenter d'assigner un client déjà assigné (doit échouer)
```bash
curl -X POST http://localhost:3000/api/assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SECRETAIRE_TOKEN" \
  -d '{
    "clientId": "CLIENT_DEJA_ASSIGNE_ID",
    "professionalId": "PRO_ID"
  }'
```

**Réponse attendue:**
```json
{
  "success": false,
  "message": "Ce client est déjà assigné à Marie Dupont par Julie Tremblay",
  "data": {
    "existingAssignment": {
      "professionalName": "Marie Dupont",
      "assignedByName": "Julie Tremblay",
      "assignedByRole": "SECRETAIRE",
      "assignedAt": "2024-12-20T10:30:00Z"
    }
  }
}
```

### Test 3: Récupérer les clients (avec info assignation)
```bash
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer TOKEN"
```

### Test 4: Voir l'historique des assignations
```bash
curl http://localhost:3000/api/assignments/history?limit=20 \
  -H "Authorization: Bearer SECRETAIRE_TOKEN"
```

---

## 📝 Notes Importantes - Assignations

1. **Unicité:**
   - Un client ne peut être assigné qu'à UN SEUL professionnel à la fois
   - L'assignation existante doit être supprimée avant de créer une nouvelle

2. **Traçabilité:**
   - `assignedById` capture automatiquement l'ID de l'utilisateur via `req.user.id`
   - Chaque assignation garde l'historique de qui l'a créée

3. **Permissions:**
   - Seuls ADMIN et SECRETAIRE peuvent créer des assignations
   - Tous les rôles authentifiés peuvent voir les clients (filtrage selon rôle)

4. **Validation:**
   - Vérifier que le professionnel correspond au serviceType du client
   - MASSOTHERAPIE → MASSOTHERAPEUTE
   - ESTHETIQUE → ESTHETICIENNE

5. **Messages d'erreur:**
   - Messages clairs indiquant QUI a assigné le client et À QUI
   - Aide les secrétaires à coordonner et éviter conflits

---

Bon courage pour l'implémentation backend! 🎯
