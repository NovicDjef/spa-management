# Endpoint Backend : Générer les horaires sur une période

## 🎯 Endpoint à créer

**POST** `/api/availability/generate-period`

## 📝 Code Backend (Node.js/Express + Prisma)

```javascript
// Dans votre fichier de routes availability (ex: routes/availability.js)

/**
 * POST /api/availability/generate-period
 * Génère automatiquement les horaires pour un professionnel sur une période
 * à partir de ses templates hebdomadaires
 */
router.post('/generate-period', authenticateToken, async (req, res) => {
  try {
    const { professionalId, startDate, endDate } = req.body;

    // Validation des paramètres
    if (!professionalId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants (professionalId, startDate, endDate requis)',
      });
    }

    // Vérifier que le professionnel existe
    const professional = await prisma.user.findUnique({
      where: { id: professionalId },
    });

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professionnel non trouvé',
      });
    }

    // Récupérer les templates hebdomadaires du professionnel
    const templates = await prisma.availabilityTemplate.findMany({
      where: {
        professionalId: professionalId,
      },
    });

    if (templates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun template hebdomadaire trouvé. Veuillez d\'abord créer des templates d\'horaires.',
      });
    }

    // Générer les disponibilités pour chaque jour de la période
    const start = new Date(startDate);
    const end = new Date(endDate);
    const availabilities = [];
    let created = 0;
    let skipped = 0;

    // Parcourir chaque jour de la période
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayOfWeek = date.getDay(); // 0=Dimanche, 1=Lundi, ..., 6=Samedi
      const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

      // Trouver le template pour ce jour de la semaine
      const template = templates.find(t => t.dayOfWeek === dayOfWeek);

      if (!template) {
        // Pas de template pour ce jour = on skip (jour de congé)
        skipped++;
        continue;
      }

      // Vérifier si une availability existe déjà pour ce jour
      const existing = await prisma.availabilityBlock.findFirst({
        where: {
          professionalId: professionalId,
          date: dateStr,
        },
      });

      if (existing) {
        // Déjà existant = on skip pour éviter les doublons
        skipped++;
        continue;
      }

      // Créer la disponibilité basée sur le template
      const availability = await prisma.availabilityBlock.create({
        data: {
          professionalId: professionalId,
          date: dateStr,
          startTime: template.startTime,
          endTime: template.endTime,
          // Note: Pas de 'reason' car c'est une disponibilité, pas un blocage
        },
      });

      availabilities.push(availability);
      created++;
    }

    res.json({
      success: true,
      message: `${created} horaires générés avec succès, ${skipped} jours ignorés (pas de template ou déjà existant)`,
      data: {
        created,
        skipped,
        period: `${startDate} → ${endDate}`,
        availabilities: availabilities.slice(0, 10), // Limiter à 10 pour la réponse (éviter trop de données)
        total: availabilities.length,
      },
    });
  } catch (error) {
    console.error('❌ Erreur génération période:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la génération des horaires',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
});
```

## 📊 Schéma Prisma requis

Assurez-vous que votre schéma Prisma a le modèle `AvailabilityTemplate` :

```prisma
model AvailabilityTemplate {
  id             String   @id @default(cuid())
  professionalId String
  dayOfWeek      Int      // 0-6 (0=Dimanche, 1=Lundi, etc.)
  startTime      String   // Format HH:mm
  endTime        String   // Format HH:mm
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  professional   User     @relation(fields: [professionalId], references: [id], onDelete: Cascade)

  @@unique([professionalId, dayOfWeek])
  @@index([professionalId])
}
```

## 🔑 Points importants

1. **Templates hebdomadaires** : L'utilisateur doit d'abord créer des templates pour chaque jour de la semaine
2. **Évite les doublons** : Vérifie si une availability existe déjà avant de créer
3. **Ignore les jours sans template** : Si pas de template pour un jour (ex: dimanche), ce jour est skippé
4. **Performance** : Pour de longues périodes (ex: 12 mois), optimiser avec des transactions batch

## 🧪 Test avec Postman

**URL** : `POST http://localhost:5003/api/availability/generate-period`

**Headers** :
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body** :
```json
{
  "professionalId": "cmjyj4xfi0001fwda5o35qe27",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31"
}
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "87 horaires générés avec succès, 3 jours ignorés",
  "data": {
    "created": 87,
    "skipped": 3,
    "period": "2026-01-01 → 2026-03-31",
    "total": 87
  }
}
```

## 📝 Étape suivante : Créer les templates

Si vous n'avez pas encore d'endpoint pour créer les templates, voici le code :

```javascript
// POST /api/availability/templates
router.post('/templates', authenticateToken, async (req, res) => {
  try {
    const { professionalId, dayOfWeek, startTime, endTime } = req.body;

    // Validation
    if (!professionalId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Paramètres manquants',
      });
    }

    // Créer ou mettre à jour le template
    const template = await prisma.availabilityTemplate.upsert({
      where: {
        professionalId_dayOfWeek: {
          professionalId,
          dayOfWeek,
        },
      },
      update: {
        startTime,
        endTime,
      },
      create: {
        professionalId,
        dayOfWeek,
        startTime,
        endTime,
      },
    });

    res.json({
      success: true,
      message: 'Template créé/mis à jour avec succès',
      data: template,
    });
  } catch (error) {
    console.error('Erreur création template:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
```

## ✅ Checklist

- [ ] Créer le modèle `AvailabilityTemplate` dans Prisma
- [ ] Exécuter `npx prisma migrate dev` pour créer la table
- [ ] Créer l'endpoint `POST /api/availability/templates`
- [ ] Créer l'endpoint `POST /api/availability/generate-period`
- [ ] Créer une interface pour définir les templates hebdomadaires
- [ ] Tester avec Postman
- [ ] Tester depuis l'interface frontend

Une fois ces endpoints créés, la fonctionnalité "Générer horaire" fonctionnera parfaitement ! 🎉
