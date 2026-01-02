# Guide API - Services et Réservations

## Résumé des Changements

Votre système a été amélioré avec:

✅ **Schéma Prisma nettoyé** - Suppression des doublons, ajout des variations
✅ **18 services créés** - 10 massothérapie + 8 esthétique
✅ **18 variations** - Différentes durées et prix
✅ **7 catégories** - Organisation hiérarchique
✅ **API complète** - Endpoints pour services, catégories et variations
✅ **Réservations améliorées** - Support des variations de services

---

## Endpoints API Disponibles

### 1. Catégories de Services

```http
GET /api/services/categories?type=MASSOTHERAPIE
GET /api/services/categories?type=ESTHETIQUE
GET /api/services/categories
```

**Exemple de réponse**:
```json
{
  "success": true,
  "data": [
    {
      "id": "cat-id",
      "name": "Massothérapie",
      "serviceType": "MASSOTHERAPIE",
      "services": [
        {
          "id": "massage-therapeutique",
          "name": "Massage thérapeutique",
          "duration": 50,
          "price": 115,
          "variations": [
            { "id": "var-1", "name": "50 minutes", "duration": 50, "price": 115 },
            { "id": "var-2", "name": "80 minutes", "duration": 80, "price": 153 }
          ]
        }
      ]
    }
  ]
}
```

### 2. Liste des Services

```http
GET /api/services?type=MASSOTHERAPIE
GET /api/services?type=ESTHETIQUE
GET /api/services?categoryId=xxx
GET /api/services
```

### 3. Variations d'un Service

```http
GET /api/services/:serviceId/variations
```

### 4. Créer une Réservation Manuelle

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json
```

**Avec variation**:
```json
{
  "professionalId": "prof-123",
  "serviceVariationId": "var-2",
  "clientName": "Jean Dupont",
  "clientPhone": "514-555-1234",
  "clientEmail": "jean@email.com",
  "bookingDate": "2026-01-15",
  "startTime": "10:00",
  "endTime": "11:20",
  "specialNotes": "Première visite"
}
```

**Sans variation (service simple)**:
```json
{
  "professionalId": "prof-123",
  "serviceId": "massage-dos-nuque",
  "clientName": "Marie Tremblay",
  "clientPhone": "514-555-5678",
  "bookingDate": "2026-01-15",
  "startTime": "14:00",
  "endTime": "14:50"
}
```

---

## Flux Frontend Recommandé

### 1. Charger les Services par Type

```typescript
// Déterminer le type selon le rôle du technicien
const serviceType = professional.role === 'MASSOTHERAPEUTE'
  ? 'MASSOTHERAPIE'
  : 'ESTHETIQUE';

// Récupérer les services
const response = await fetch(`/api/services?type=${serviceType}`);
const { data: services } = await response.json();
```

### 2. Afficher le Formulaire

```jsx
<select onChange={handleServiceChange}>
  {services.map(service => (
    <option value={service.id}>{service.name}</option>
  ))}
</select>

{/* Si le service a des variations, afficher la sélection de durée */}
{selectedService.variations.length > 0 && (
  <select onChange={handleVariationChange}>
    {selectedService.variations.map(v => (
      <option value={v.id}>
        {v.name} - ${v.price}
      </option>
    ))}
  </select>
)}

{/* Afficher le prix automatiquement */}
{price && (
  <div>
    <p>Sous-total: ${price.subtotal}</p>
    <p>TPS (5%): ${price.tps}</p>
    <p>TVQ (9.975%): ${price.tvq}</p>
    <p><strong>Total: ${price.total}</strong></p>
  </div>
)}
```

### 3. Calculer le Prix

```typescript
const calculatePrice = (subtotal: number) => {
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const total = subtotal + tps + tvq;
  return { subtotal, tps, tvq, total };
};

// Quand une variation est sélectionnée
const onVariationSelect = (variationId: string) => {
  const variation = variations.find(v => v.id === variationId);
  const pricing = calculatePrice(variation.price);
  setPricing(pricing);

  // Auto-calculer l'heure de fin
  const endTime = calculateEndTime(startTime, variation.duration);
  setEndTime(endTime);
};
```

### 4. Valider les Créneaux (30 minutes)

```typescript
const isValidTimeSlot = (time: string): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  return minutes === 0 || minutes === 30;
};

// Avant soumission
if (!isValidTimeSlot(startTime) || !isValidTimeSlot(endTime)) {
  alert('Les heures doivent être sur des créneaux de 30 minutes');
  return;
}
```

### 5. Soumettre la Réservation

```typescript
const createBooking = async (formData) => {
  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(formData)
  });

  const result = await response.json();
  if (result.success) {
    console.log('Réservation créée:', result.data.bookingNumber);
  }
};
```

---

## Services Disponibles

### Massothérapie (10 services)

1. **Massage femme enceinte** - 50min: $110, 80min: $140
2. **Massage dos & nuque** - 50min: $108
3. **Massage-Reiki** - 80min: $140
4. **Massage signature** - 80min: $140
5. **Massage découverte** - 80min: $133
6. **Massage deep tissue** - 50min: $128, 80min: $153
7. **Flush massage** - 45min: $90
8. **Pressothérapie** - 30min: $45
9. **Massage sous la pluie** - 50min: $147
10. **Massage thérapeutique** - 50min: $115, 80min: $153

### Esthétique

**Soin des mains**
- Pose d'ongles américaine (réparation 5min: $5, pose 2h: $90, remplissage 1h30: $60)
- Manucure SPA (sans vernis 60min: $65, avec gel 75min: $75)

**Soin des pieds**
- Cocooning Tropique (60min: $60)
- Traitement des cors (75min: $95)
- Pédicure SPA (sans vernis 1h: $85, avec gel 1h30: $95)

**Autres**
- Épilation à la cire (30min: $35)
- Électrolyse (15min: $29, 30min: $40.80, 60min: $60.80, 120min: $116.80, 180min: $166.80)
- Traitement IPL (45min: $80)

---

## Validation et Règles

### Champs Obligatoires

- `professionalId` ✓
- `clientName` ✓
- `clientPhone` ✓
- `bookingDate` (YYYY-MM-DD) ✓
- `startTime` (HH:MM, créneaux de 30min) ✓
- `endTime` (HH:MM, créneaux de 30min) ✓
- Soit `serviceId` OU `serviceVariationId` ✓

### Calcul des Taxes (Québec)

```
Sous-total: Prix du service/variation
TPS: Sous-total × 0.05 (5%)
TVQ: Sous-total × 0.09975 (9.975%)
Total: Sous-total + TPS + TVQ
```

### Créneaux Horaires

- **Valides**: 09:00, 09:30, 10:00, 10:30, etc.
- **Invalides**: 09:15, 09:45, 10:20, etc.

---

## Gestion des Erreurs

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Les heures doivent être sur des créneaux de 30 minutes"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Service non trouvé"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Créneau non disponible",
  "reason": "Le professionnel a déjà une réservation à cette heure"
}
```

---

## Commandes Utiles

```bash
# Relancer le seed des services
npx tsx prisma/seed-services.ts

# Ouvrir Prisma Studio (visualiser la BD)
npx prisma studio

# Démarrer le serveur
npm run dev

# Compiler TypeScript
npx tsc
```

---

## Architecture de la Base de Données

```
ServiceCategory
  ├── serviceType: MASSOTHERAPIE | ESTHETIQUE
  └── services[]
        └── variations[]
              ├── name (ex: "50 minutes")
              ├── duration (ex: 50)
              └── price (ex: 115)

Booking
  ├── serviceId (si service simple)
  ├── serviceVariationId (si variation spécifique)
  ├── professionalId
  ├── paymentId (créé automatiquement)
  └── subtotal, taxTPS, taxTVQ, total
```

---

**Date de création**: 2026-01-01
**Version**: 1.0
