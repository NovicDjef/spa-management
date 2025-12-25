# Instructions Backend - Système de Marketing avec IA

## Vue d'ensemble

Le frontend envoie maintenant des informations complètes pour générer des messages marketing personnalisés avec ChatGPT. Voici comment le backend doit gérer ces données.

---

## 1. Données reçues du frontend

### Endpoint: `POST /api/marketing/generate-message`

**Corps de la requête:**
```json
{
  "prompt": "Proposer une réduction de 10% sur les massages pour fidéliser nos clients",
  "clientIds": ["client-id-1", "client-id-2", "client-id-3"],
  "additionalContext": "Clients inactifs depuis 3 mois",
  "serviceType": "MASSOTHERAPIE",  // ou "ESTHETIQUE" ou "MIXTE"
  "spaName": "Spa Renaissance",
  "clients": [
    {
      "id": "client-id-1",
      "nom": "Dupont",
      "prenom": "Marie",
      "courriel": "marie.dupont@example.com",
      "telCellulaire": "514-123-4567",
      "serviceType": "MASSOTHERAPIE"
    },
    {
      "id": "client-id-2",
      "nom": "Martin",
      "prenom": "Jean",
      "courriel": "jean.martin@example.com",
      "telCellulaire": "514-234-5678",
      "serviceType": "MASSOTHERAPIE"
    }
  ]
}
```

---

## 2. Génération du message avec ChatGPT

### ⚠️ IMPORTANT : Utiliser l'approche "Template avec placeholders"

**Pourquoi ?**
- 1 seul appel ChatGPT au lieu de N appels (économique)
- Tout aussi efficace pour la personnalisation
- Plus rapide

### Prompt à envoyer à ChatGPT

```javascript
const systemPrompt = `Tu es un expert en marketing pour le ${spaName}.

RÈGLES IMPORTANTES:
1. NE PAS lister tous les services du spa
2. Se concentrer UNIQUEMENT sur le service demandé dans le prompt
3. Utiliser les placeholders {prenom} et {nom} pour personnaliser le message
4. Inclure le logo du spa dans l'email HTML
5. Créer un message professionnel, élégant et persuasif
6. Le message doit être en HTML formaté

SERVICE CONCERNÉ: ${serviceType}
- Si MASSOTHERAPIE: parler uniquement de massothérapie
- Si ESTHETIQUE: parler uniquement de soins esthétiques
- Si MIXTE: mentionner les deux services de manière équilibrée

NOM DU SPA: ${spaName}

FORMAT DU MESSAGE:
- Doit commencer par "Bonjour {prenom} {nom},"
- Utiliser {prenom} et {nom} comme placeholders (ils seront remplacés pour chaque client)
- Inclure le logo en haut du message HTML
- Format HTML professionnel avec styles inline
- Terminer par la signature du ${spaName}
`;

const userPrompt = `
Génère un message marketing pour une campagne avec les détails suivants:

OBJECTIF DE LA CAMPAGNE: ${prompt}

CONTEXTE ADDITIONNEL: ${additionalContext || 'Aucun'}

TYPE DE CLIENTS: ${clients.length} clients intéressés par ${serviceType}

Crée un message HTML élégant qui:
1. Commence par "Bonjour {prenom} {nom},"
2. Présente l'offre de manière attractive
3. Inclut uniquement les services pertinents (${serviceType})
4. Encourage l'action
5. Utilise les placeholders {prenom} et {nom}
`;
```

### Exemple de code Node.js

```javascript
const { Configuration, OpenAIApi } = require('openai');

async function generateMarketingMessage(data) {
  const {
    prompt,
    additionalContext,
    serviceType,
    spaName,
    clients
  } = data;

  const openai = new OpenAIApi(new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  }));

  // Déterminer le type de service à mentionner
  let serviceDescription = '';
  if (serviceType === 'MASSOTHERAPIE') {
    serviceDescription = 'nos services de massothérapie';
  } else if (serviceType === 'ESTHETIQUE') {
    serviceDescription = 'nos soins esthétiques';
  } else {
    serviceDescription = 'nos services de massothérapie et soins esthétiques';
  }

  const systemPrompt = `Tu es un expert en marketing pour ${spaName}.

RÈGLES CRITIQUES:
1. ❌ NE PAS lister TOUS les services du spa
2. ✅ Parler UNIQUEMENT de ${serviceDescription}
3. ✅ UTILISER les placeholders {prenom} et {nom} dans le message
4. ✅ Message en HTML avec logo du spa
5. ✅ Professionnel, élégant et persuasif

Le message DOIT commencer par: "Bonjour {prenom} {nom},"
`;

  const userPrompt = `Génère un message marketing HTML pour:

OBJECTIF: ${prompt}
CONTEXTE: ${additionalContext || 'Clients fidèles'}
SERVICE: ${serviceDescription}
CLIENTS: ${clients.length} destinataires

STRUCTURE REQUISE:
1. Salutation avec placeholders: "Bonjour {prenom} {nom},"
2. Présentation de l'offre
3. Appel à l'action
4. Signature ${spaName}

FORMAT: HTML avec styles inline, logo en haut.
`;

  const completion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
  });

  const generatedMessage = completion.data.choices[0].message.content;

  // Générer aussi un sujet accrocheur
  const subjectCompletion = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Génère un sujet d'email court et accrocheur (max 60 caractères) pour cette campagne marketing de ${spaName}.`
      },
      {
        role: 'user',
        content: `Campagne: ${prompt}\nService: ${serviceType}`
      }
    ],
    temperature: 0.7,
  });

  const subject = subjectCompletion.data.choices[0].message.content.replace(/["']/g, '');

  return {
    subject,
    message: generatedMessage,
    prompt,
    clientsCount: clients.length
  };
}
```

---

## 3. Structure HTML du message généré

Le message généré par ChatGPT doit ressembler à ceci:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; padding: 20px;">

  <!-- Logo du Spa -->
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://votre-domaine.com/logo-spa-renaissance.png" alt="Spa Renaissance" style="max-width: 200px;">
  </div>

  <!-- Contenu -->
  <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

    <!-- Salutation personnalisée -->
    <p style="font-size: 16px; color: #333;">
      Bonjour {prenom} {nom},
    </p>

    <!-- Message principal -->
    <p style="font-size: 16px; color: #555; line-height: 1.6;">
      Nous avons le plaisir de vous offrir une réduction exclusive de 10% sur tous nos services de massothérapie...
    </p>

    <!-- Appel à l'action -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="tel:514-XXX-XXXX" style="background-color: #4A90A4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
        Réserver maintenant
      </a>
    </div>

    <!-- Signature -->
    <p style="font-size: 14px; color: #777; margin-top: 30px;">
      Cordialement,<br>
      L'équipe de Spa Renaissance
    </p>
  </div>

  <!-- Footer -->
  <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
    <p>Spa Renaissance | Votre adresse | Téléphone</p>
  </div>

</div>
```

### Points clés du HTML:
- ✅ Logo du spa en haut
- ✅ Placeholders `{prenom}` et `{nom}` dans la salutation
- ✅ Styles inline pour compatibilité email
- ✅ Responsive (max-width: 600px)
- ✅ Appel à l'action clair

---

## 4. Envoi des emails personnalisés

### Endpoint: `POST /api/marketing/send-ai-campaign`

**Corps de la requête:**
```json
{
  "clientIds": ["client-id-1", "client-id-2"],
  "subject": "Votre moment détente vous attend - 10% de réduction",
  "message": "<div>...HTML avec {prenom} et {nom}...</div>",
  "prompt": "Réduction de 10% sur les massages"
}
```

### Logique backend pour l'envoi

```javascript
async function sendAiCampaign(data) {
  const { clientIds, subject, message, prompt } = data;

  // Récupérer les infos complètes de tous les clients
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: {
      id: true,
      nom: true,
      prenom: true,
      courriel: true,
      telCellulaire: true
    }
  });

  const results = [];
  let totalSent = 0;
  let totalFailed = 0;

  // Envoyer un email personnalisé à chaque client
  for (const client of clients) {
    try {
      // ⭐ REMPLACER LES PLACEHOLDERS
      const personalizedMessage = message
        .replace(/{prenom}/gi, client.prenom)
        .replace(/{nom}/gi, client.nom);

      // Envoyer l'email
      await sendEmail({
        to: client.courriel,
        subject: subject,
        html: personalizedMessage
      });

      // ⭐ LOGGER DANS EmailLog
      await db.emailLog.create({
        data: {
          clientId: client.id,
          type: 'PROMO',
          email: client.courriel,
          clientName: `${client.prenom} ${client.nom}`,
          subject: subject,
          content: personalizedMessage,
          sentAt: new Date(),
          prompt: prompt  // ⭐ Sauvegarder le prompt utilisé
        }
      });

      // ⭐ METTRE À JOUR LE PROFIL CLIENT
      await db.client.update({
        where: { id: client.id },
        data: {
          promoEmailsSent: { increment: 1 },
          lastEmailSent: new Date()
        }
      });

      totalSent++;
      results.push({ success: true, email: client.courriel });

    } catch (error) {
      totalFailed++;
      results.push({ success: false, email: client.courriel, error: error.message });
    }
  }

  return {
    success: true,
    message: `Campagne envoyée: ${totalSent} réussis, ${totalFailed} échecs`,
    data: {
      totalSent,
      totalFailed,
      totalClients: clients.length,
      results
    }
  };
}
```

---

## 5. Schéma de base de données EmailLog

Si pas encore créé, ajouter cette table:

```prisma
model EmailLog {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id])
  type        String   // "PROMO", "REMINDER", etc.
  email       String
  clientName  String
  subject     String
  content     String   @db.Text
  sentAt      DateTime @default(now())
  prompt      String?  @db.Text  // ⭐ Prompt ChatGPT utilisé

  @@index([clientId])
  @@index([sentAt])
}
```

---

## 6. Exemple complet de workflow

### Génération du message

```javascript
// Route: POST /api/marketing/generate-message
app.post('/api/marketing/generate-message', async (req, res) => {
  try {
    const { prompt, clientIds, additionalContext, serviceType, spaName, clients } = req.body;

    // Générer le message avec ChatGPT
    const result = await generateMarketingMessage({
      prompt,
      additionalContext,
      serviceType,
      spaName,
      clients
    });

    res.json({
      success: true,
      message: 'Message généré avec succès',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

### Envoi de la campagne

```javascript
// Route: POST /api/marketing/send-ai-campaign
app.post('/api/marketing/send-ai-campaign', async (req, res) => {
  try {
    const { clientIds, subject, message, prompt } = req.body;

    const result = await sendAiCampaign({
      clientIds,
      subject,
      message,
      prompt
    });

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## 7. Points de vérification

✅ **Le message généré contient-il les placeholders ?**
```javascript
// Vérifier que le message contient {prenom} et {nom}
if (!generatedMessage.includes('{prenom}') || !generatedMessage.includes('{nom}')) {
  console.warn('⚠️ Le message généré ne contient pas les placeholders !');
}
```

✅ **Le type de service est-il respecté ?**
- MASSOTHERAPIE → Parler uniquement de massothérapie
- ESTHETIQUE → Parler uniquement de soins esthétiques
- MIXTE → Mentionner les deux équitablement

✅ **Le logo est-il inclus ?**
- Vérifier que le HTML contient la balise `<img>` avec le logo

✅ **Les placeholders sont-ils remplacés avant envoi ?**
```javascript
// AVANT envoi, vérifier qu'il ne reste plus de placeholders
const stillHasPlaceholders = personalizedMessage.match(/{prenom}|{nom}/gi);
if (stillHasPlaceholders) {
  throw new Error('Placeholders non remplacés !');
}
```

---

## 8. Exemples de prompts ChatGPT optimisés

### Pour MASSOTHERAPIE
```
"Tu es expert en marketing pour Spa Renaissance.

Génère un message HTML élégant pour une campagne de massothérapie.

IMPORTANT:
- Utilise {prenom} et {nom} dans la salutation
- Ne mentionne QUE les services de massothérapie
- Inclus le logo du spa en haut
- Format HTML avec styles inline

Objectif: ${prompt}
Contexte: ${additionalContext}
"
```

### Pour ESTHETIQUE
```
"Tu es expert en marketing pour Spa Renaissance.

Génère un message HTML élégant pour une campagne de soins esthétiques.

IMPORTANT:
- Utilise {prenom} et {nom} dans la salutation
- Ne mentionne QUE les soins esthétiques
- Inclus le logo du spa en haut
- Format HTML avec styles inline

Objectif: ${prompt}
Contexte: ${additionalContext}
"
```

---

## Résumé des modifications backend nécessaires

| Modification | Fichier | Action |
|-------------|---------|--------|
| Ajouter serviceType au prompt | `chatgpt.ts` | Filtrer les services mentionnés |
| Forcer les placeholders | `chatgpt.ts` | S'assurer que {prenom} et {nom} sont présents |
| Remplacer les placeholders | `marketing.controller.ts` | Avant chaque envoi d'email |
| Logger le prompt | `marketing.controller.ts` | Sauvegarder dans EmailLog |
| Inclure le logo | `chatgpt.ts` | Dans le template HTML |

---

**Note finale:** Le frontend envoie maintenant toutes les données nécessaires. Le backend doit simplement implémenter la logique de génération avec placeholders et de remplacement lors de l'envoi.
