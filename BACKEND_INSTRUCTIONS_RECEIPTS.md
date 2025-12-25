# Instructions Backend - Système de Reçus d'Assurance

## Vue d'ensemble

Le système permet aux massothérapeutes d'envoyer automatiquement des reçus pour assurances aux clients après un traitement, **SANS** que le thérapeute puisse voir l'email du client.

---

## 1. Modifications de la base de données

### Ajouter le champ `numeroOrdre` à la table User

```prisma
model User {
  id           String   @id @default(cuid())
  email        String   @unique
  telephone    String
  nom          String
  prenom       String
  password     String
  role         Role     @default(MASSOTHERAPEUTE)
  isActive     Boolean  @default(true)
  numeroOrdre  String?  // ⭐ NOUVEAU CHAMP - Numéro d'ordre professionnel
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // Relations existantes...
}
```

### Créer la table des reçus (optionnel - pour historique)

```prisma
model Receipt {
  id              String   @id @default(cuid())
  clientId        String
  client          Client   @relation(fields: [clientId], references: [id])
  therapistId     String
  therapist       User     @relation(fields: [therapistId], references: [id])
  massageType     String   // Type de massage (THERAPEUTIQUE, SUEDOIS, etc.)
  duration        Int      // Durée en minutes
  price           Float    // Prix en CAD
  receiptNumber   String   @unique // Numéro unique du reçu
  sentAt          DateTime @default(now())

  @@index([clientId])
  @@index([therapistId])
  @@index([sentAt])
}
```

---

## 2. Endpoint d'envoi de reçu

### Route: `POST /api/receipts/send`

**Corps de la requête (depuis le frontend):**
```json
{
  "clientId": "client-id-123",
  "therapistId": "therapist-id-456",
  "massageType": "THERAPEUTIQUE",
  "duration": 50,
  "price": 85.00
}
```

**Implémentation Backend:**

```javascript
// receipts.controller.ts
import { generateReceiptPDF } from './receiptGenerator';
import { sendEmail } from '../lib/email';

async function sendReceipt(req, res) {
  try {
    const { clientId, therapistId, massageType, duration, price } = req.body;

    // 1. Récupérer les informations du client (avec EMAIL)
    const client = await db.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        courriel: true,  // ⭐ EMAIL récupéré côté backend seulement
        telCellulaire: true,
        adresse: true,
        ville: true,
        codePostal: true,
      },
    });

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé',
      });
    }

    // 2. Récupérer les informations du thérapeute
    const therapist = await db.user.findUnique({
      where: { id: therapistId },
      select: {
        id: true,
        nom: true,
        prenom: true,
        numeroOrdre: true,
        telephone: true,
      },
    });

    if (!therapist) {
      return res.status(404).json({
        success: false,
        message: 'Thérapeute non trouvé',
      });
    }

    // 3. Générer un numéro de reçu unique
    const receiptNumber = `SPA-${Date.now()}-${therapist.id.slice(0, 6)}`;

    // 4. Créer les données du reçu
    const receiptData = {
      // Informations entreprise
      spaName: 'Spa Renaissance',
      spaAddress: 'Votre adresse',
      spaCity: 'Votre ville',
      spaPostalCode: 'Code postal',
      spaPhone: 'Votre téléphone',

      // Informations client
      clientName: `${client.prenom} ${client.nom}`,
      clientAddress: client.adresse,
      clientCity: client.ville,
      clientPostalCode: client.codePostal,

      // Informations thérapeute
      therapistName: `${therapist.prenom} ${therapist.nom}`,
      therapistOrderNumber: therapist.numeroOrdre || 'N/A',

      // Détails du traitement
      massageType: formatMassageType(massageType),
      duration: duration,
      date: new Date().toLocaleDateString('fr-CA'),

      // Facturation
      price: price,
      tps: price * 0.05,     // TPS 5%
      tvq: price * 0.09975,  // TVQ 9.975%
      total: price * 1.14975,

      // Numéro de reçu
      receiptNumber: receiptNumber,
    };

    // 5. Générer le PDF ou HTML du reçu
    const receiptHTML = generateReceiptHTML(receiptData);

    // OU générer un PDF
    // const receiptPDF = await generateReceiptPDF(receiptData);

    // 6. Envoyer l'email AU CLIENT (sans exposer l'email au frontend)
    await sendEmail({
      to: client.courriel,  // ⭐ Email envoyé côté backend
      subject: `Reçu d'assurance - ${receiptData.spaName}`,
      html: receiptHTML,
      // attachments: [
      //   {
      //     filename: `recu-${receiptNumber}.pdf`,
      //     content: receiptPDF,
      //   },
      // ],
    });

    // 7. (Optionnel) Enregistrer dans la base de données
    await db.receipt.create({
      data: {
        clientId,
        therapistId,
        massageType,
        duration,
        price,
        receiptNumber,
      },
    });

    // 8. Retourner succès (SANS l'email du client)
    return res.json({
      success: true,
      message: 'Reçu envoyé au client avec succès',
      data: {
        receiptNumber,
        sentTo: `${client.prenom} ${client.nom}`, // Nom seulement, pas l'email
      },
    });

  } catch (error) {
    console.error('Erreur envoi reçu:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du reçu',
    });
  }
}

// Formater le type de massage pour affichage
function formatMassageType(type) {
  const types = {
    THERAPEUTIQUE: 'Massage thérapeutique',
    SUEDOIS: 'Massage suédois',
    SPORTIF: 'Massage sportif',
    DETENTE: 'Massage détente',
    PIERRES_CHAUDES: 'Massage pierres chaudes',
    CALIFORNIEN: 'Massage californien',
    SHIATSU: 'Massage shiatsu',
    PRENATAL: 'Massage prénatal',
  };
  return types[type] || type;
}
```

---

## 3. Template HTML du reçu

```javascript
function generateReceiptHTML(data) {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .receipt-container {
      max-width: 800px;
      margin: 0 auto;
      background-color: white;
      padding: 40px;
      border: 2px solid #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #333;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      color: #4A90A4;
      margin-bottom: 10px;
    }
    .company-info {
      font-size: 14px;
      color: #666;
    }
    .receipt-number {
      text-align: right;
      font-size: 12px;
      color: #666;
      margin-bottom: 20px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-weight: bold;
      font-size: 14px;
      color: #333;
      border-bottom: 1px solid #ddd;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
      font-size: 14px;
    }
    .info-label {
      font-weight: 500;
      color: #666;
    }
    .info-value {
      color: #333;
    }
    .treatment-section {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .total-section {
      margin-top: 30px;
      border-top: 2px solid #333;
      padding-top: 15px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 16px;
    }
    .total-row.final {
      font-weight: bold;
      font-size: 20px;
      color: #4A90A4;
      border-top: 2px solid #333;
      padding-top: 15px;
      margin-top: 10px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    @media print {
      body {
        background-color: white;
        padding: 0;
      }
      .receipt-container {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-container">
    <!-- En-tête -->
    <div class="header">
      <div class="logo">${data.spaName}</div>
      <div class="company-info">
        ${data.spaAddress}<br>
        ${data.spaCity}, ${data.spaPostalCode}<br>
        Tél: ${data.spaPhone}
      </div>
    </div>

    <!-- Numéro de reçu -->
    <div class="receipt-number">
      <strong>Reçu N°:</strong> ${data.receiptNumber}<br>
      <strong>Date:</strong> ${data.date}
    </div>

    <!-- Informations client -->
    <div class="section">
      <div class="section-title">INFORMATION DU CLIENT</div>
      <div class="info-row">
        <span class="info-label">Nom:</span>
        <span class="info-value">${data.clientName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Adresse:</span>
        <span class="info-value">${data.clientAddress}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Ville:</span>
        <span class="info-value">${data.clientCity}, ${data.clientPostalCode}</span>
      </div>
    </div>

    <!-- Informations thérapeute -->
    <div class="section">
      <div class="section-title">INFORMATION DU THÉRAPEUTE</div>
      <div class="info-row">
        <span class="info-label">Nom:</span>
        <span class="info-value">${data.therapistName}</span>
      </div>
      <div class="info-row">
        <span class="info-label">N° d'ordre professionnel:</span>
        <span class="info-value">${data.therapistOrderNumber}</span>
      </div>
    </div>

    <!-- Détails du traitement -->
    <div class="treatment-section">
      <div class="section-title">DÉTAILS DU TRAITEMENT</div>
      <div class="info-row">
        <span class="info-label">Type de massage:</span>
        <span class="info-value">${data.massageType}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Durée:</span>
        <span class="info-value">${data.duration} minutes</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date du traitement:</span>
        <span class="info-value">${data.date}</span>
      </div>
    </div>

    <!-- Facturation -->
    <div class="total-section">
      <div class="total-row">
        <span>Sous-total:</span>
        <span>${data.price.toFixed(2)} $ CAD</span>
      </div>
      <div class="total-row">
        <span>TPS (5%):</span>
        <span>${data.tps.toFixed(2)} $ CAD</span>
      </div>
      <div class="total-row">
        <span>TVQ (9.975%):</span>
        <span>${data.tvq.toFixed(2)} $ CAD</span>
      </div>
      <div class="total-row final">
        <span>TOTAL:</span>
        <span>${data.total.toFixed(2)} $ CAD</span>
      </div>
    </div>

    <!-- Pied de page -->
    <div class="footer">
      <p>
        <strong>Ce reçu est valide pour soumission à votre assurance.</strong><br>
        Conservez-le précieusement pour vos dossiers.
      </p>
      <p>
        Pour toute question, contactez-nous au ${data.spaPhone}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
```

---

## 4. Sécurité et confidentialité

### Points critiques à respecter

✅ **L'email du client NE DOIT JAMAIS être exposé au frontend**
```javascript
// ❌ MAUVAIS - Exposer l'email
return res.json({
  clientEmail: client.courriel  // NE PAS FAIRE ÇA
});

// ✅ BON - Ne retourner que le nom
return res.json({
  sentTo: `${client.prenom} ${client.nom}`
});
```

✅ **Le backend gère tout l'envoi d'email**
```javascript
// Frontend envoie:
{
  clientId: "...",
  therapistId: "...",
  // ... autres données
}

// Backend récupère l'email côté serveur:
const client = await db.client.findUnique({
  where: { id: clientId },
  select: { courriel: true }  // Récupéré uniquement côté serveur
});

await sendEmail({
  to: client.courriel,  // Jamais exposé au frontend
  // ...
});
```

✅ **Vérifier les permissions**
```javascript
// Seuls les massothérapeutes peuvent envoyer des reçus
if (req.user.role !== 'MASSOTHERAPEUTE') {
  return res.status(403).json({
    success: false,
    message: 'Accès refusé'
  });
}

// Vérifier que le client est assigné au thérapeute
const assignment = await db.assignment.findFirst({
  where: {
    clientId: clientId,
    professionalId: therapistId
  }
});

if (!assignment) {
  return res.status(403).json({
    success: false,
    message: 'Vous n\'êtes pas assigné à ce client'
  });
}
```

---

## 5. Modification de la création d'utilisateur

### Ajouter le champ `numeroOrdre` lors de la création

```javascript
// users.controller.ts - Fonction de création d'utilisateur

async function createUser(req, res) {
  const { email, telephone, nom, prenom, role, numeroOrdre } = req.body;

  // Validation
  if (role === 'MASSOTHERAPEUTE' && !numeroOrdre) {
    return res.status(400).json({
      success: false,
      message: 'Le numéro d\'ordre est obligatoire pour les massothérapeutes'
    });
  }

  const user = await db.user.create({
    data: {
      email,
      telephone,
      nom,
      prenom,
      role,
      numeroOrdre,  // ⭐ Nouveau champ
      password: hashedPassword,
    },
  });

  return res.json({
    success: true,
    data: user,
  });
}
```

---

## 6. Routes à ajouter

```javascript
// routes/receipts.routes.ts

import express from 'express';
import { sendReceipt } from '../controllers/receipts.controller';
import { authMiddleware } from '../middleware/auth';
import { roleMiddleware } from '../middleware/role';

const router = express.Router();

// Envoyer un reçu (Massothérapeutes uniquement)
router.post(
  '/send',
  authMiddleware,
  roleMiddleware(['MASSOTHERAPEUTE']),
  sendReceipt
);

export default router;
```

---

## 7. Workflow complet

1. **Massothérapeute ajoute une note** au dossier client
2. **Modal s'ouvre automatiquement** : "Envoyer le reçu ?"
3. Massothérapeute **remplit le formulaire** :
   - Type de massage (liste déroulante)
   - Durée (50 min, 80 min, etc.)
   - Prix (auto-complété selon la durée)
4. Massothérapeute clique sur **"Envoyer le reçu"**
5. **Frontend envoie** : clientId, therapistId, massageType, duration, price
6. **Backend** :
   - Récupère l'email du client (côté serveur uniquement)
   - Récupère le numéro d'ordre du thérapeute
   - Génère le HTML du reçu
   - Envoie par email au client
   - Retourne succès (sans exposer l'email)
7. **Client reçoit l'email** avec le reçu pour son assurance
8. **Massothérapeute ne voit JAMAIS** l'email du client

---

## Résumé des modifications backend nécessaires

| Modification | Fichier | Action |
|-------------|---------|--------|
| Ajouter `numeroOrdre` au modèle User | `prisma/schema.prisma` | Nouveau champ optionnel String |
| Créer table Receipt (optionnel) | `prisma/schema.prisma` | Table pour historique |
| Créer contrôleur de reçu | `receipts.controller.ts` | Fonction `sendReceipt` |
| Créer générateur HTML | `receiptGenerator.ts` | Fonction `generateReceiptHTML` |
| Ajouter route | `receipts.routes.ts` | POST /receipts/send |
| Modifier création user | `users.controller.ts` | Ajouter `numeroOrdre` dans le body |

---

**Note finale:** Le système garantit que les massothérapeutes ne peuvent JAMAIS voir les emails, téléphones ou adresses des clients, tout en leur permettant d'envoyer des reçus professionnels pour les assurances.
