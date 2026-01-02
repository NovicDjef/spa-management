# Correction du Format de Réservation - Backend API

## ✅ Problème Résolu

Le format des données envoyées pour créer une réservation ne correspondait pas au format attendu par le backend.

---

## 📋 Ancien Format (INCORRECT)

```json
{
  "professionalId": "cmjqrdzmc0002d4s2k2xsca02",
  "startTime": "2026-01-01T10:30:00.000Z",       ❌ ISO datetime
  "endTime": "2026-01-01T11:20:00.000Z",         ❌ ISO datetime
  "serviceType": "MASSOTHERAPIE",                 ❌ Pas attendu
  "serviceId": "massage-therapeutique",
  "duration": 50,                                 ❌ Pas nécessaire
  "status": "CONFIRMED",                          ❌ Pas nécessaire
  "notes": "",                                    ❌ Devrait être "specialNotes"
  "smsReminder": true,                            ❌ Devrait être "sendSmsReminder"
  "emailReminder": true,                          ❌ Devrait être "sendEmailReminder"
  "clientName": "tamo",
  "clientPhone": "4259685858",
  "clientEmail": "",
  "isNewClient": true                             ❌ Pas nécessaire
}
```

---

## ✅ Nouveau Format (CORRECT)

### Cas 1 : Client Non-Existant (Quick Booking)

```json
{
  "professionalId": "cmjqrdzmc0002d4s2k2xsca02",
  "serviceId": "massage-therapeutique",
  "bookingDate": "2026-01-01",                    ✅ Format YYYY-MM-DD
  "startTime": "10:30",                           ✅ Format HH:mm
  "endTime": "11:20",                             ✅ Format HH:mm
  "clientName": "tamo",                           ✅ Nom du client
  "clientPhone": "4259685858",                    ✅ Téléphone (sans espaces)
  "clientEmail": "",                              ✅ Email optionnel
  "specialNotes": "",                             ✅ Notes spéciales
  "sendSmsReminder": true,                        ✅ Rappel SMS
  "sendEmailReminder": false                      ✅ Rappel Email (false si pas d'email)
}
```

### Cas 2 : Client Existant

```json
{
  "clientId": "client-abc-123",                   ✅ ID du client existant
  "professionalId": "cmjqrdzmc0002d4s2k2xsca02",
  "serviceId": "massage-therapeutique",
  "bookingDate": "2026-01-01",
  "startTime": "10:30",
  "endTime": "11:20",
  "specialNotes": "Client régulier",
  "sendSmsReminder": true,
  "sendEmailReminder": true
}
```

**Note:** Quand `clientId` est fourni, pas besoin de `clientName`, `clientPhone`, `clientEmail` !

---

## 🔧 Changements Apportés

### 1. **BookingSidebar.tsx** - Logique de soumission

**Avant:**
```typescript
const bookingBase = {
  professionalId,
  startTime: startDate.toISOString(),  // ❌ ISO datetime
  endTime: endDate.toISOString(),       // ❌ ISO datetime
  serviceType,                          // ❌ Pas attendu
  duration: selectedDuration,           // ❌ Pas nécessaire
  status: 'CONFIRMED',                  // ❌ Pas nécessaire
  notes: notes.trim(),                  // ❌ Mauvais nom
  smsReminder,                          // ❌ Mauvais nom
  emailReminder,                        // ❌ Mauvais nom
};
```

**Après:**
```typescript
const bookingBase = {
  professionalId,
  serviceId: selectedService,
  bookingDate: date,                    // ✅ YYYY-MM-DD
  startTime,                            // ✅ HH:mm
  endTime: endTimeFormatted,            // ✅ HH:mm (calculé)
  specialNotes: notes.trim() || undefined,
  sendSmsReminder: smsReminder,
  sendEmailReminder: emailReminder,
};
```

### 2. **api.ts** - Interfaces TypeScript

**CreateBookingData mis à jour:**
```typescript
export interface CreateBookingData {
  // Client existant
  clientId?: string;

  // Ou nouveau client
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;

  // Réservation
  professionalId: string;
  serviceId?: string;
  serviceVariationId?: string;
  bookingDate: string;        // ✅ YYYY-MM-DD
  startTime: string;          // ✅ HH:mm
  endTime: string;            // ✅ HH:mm
  specialNotes?: string;

  // Rappels
  sendSmsReminder?: boolean;
  sendEmailReminder?: boolean;
}
```

**UpdateBookingData mis à jour:**
```typescript
export interface UpdateBookingData {
  professionalId?: string;
  serviceId?: string;
  bookingDate?: string;       // ✅ YYYY-MM-DD
  startTime?: string;         // ✅ HH:mm
  endTime?: string;           // ✅ HH:mm
  specialNotes?: string;
  status?: BookingStatus;
}
```

---

## 📊 Résultat Attendu du Backend

```json
{
  "success": true,
  "message": "Réservation créée avec succès",
  "data": {
    "id": "booking-xyz-789",
    "bookingNumber": "BK1736506800123",
    "type": "SERVICE",
    "status": "CONFIRMED",
    "clientName": "tamo",
    "clientPhone": "4259685858",
    "bookingDate": "2026-01-01T00:00:00.000Z",
    "startTime": "10:30",
    "endTime": "11:20",
    "subtotal": 85,
    "taxTPS": 4.25,
    "taxTVQ": 8.48,
    "total": 97.73,
    "service": {
      "id": "massage-therapeutique",
      "name": "Massage thérapeutique"
    },
    "professional": {
      "id": "cmjqrdzmc0002d4s2k2xsca02",
      "nom": "Lavoie",
      "prenom": "Sophie"
    },
    "metadata": {
      "smsReminderScheduled": true,
      "emailReminderScheduled": false
    }
  }
}
```

---

## ✅ Tests Recommandés

1. **Client Non-Existant:**
   - Créer une réservation avec nom + téléphone uniquement
   - Vérifier que le backend crée la réservation sans créer de dossier client complet

2. **Client Existant:**
   - Sélectionner un client existant
   - Vérifier que seul `clientId` est envoyé

3. **Rappels:**
   - Avec email : `sendEmailReminder: true`
   - Sans email : `sendEmailReminder: false` (automatique)

4. **Format Dates/Heures:**
   - `bookingDate`: "2026-01-15"
   - `startTime`: "14:30"
   - `endTime`: "15:20" (calculé automatiquement)

---

## 🔍 Console Log

Pour déboguer, les données finales sont loggées dans la console :

```javascript
console.log('=== DONNÉES FINALES ENVOYÉES À L\'API ===', JSON.stringify(finalBookingData, null, 2));
```

Vérifiez dans la console du navigateur que le format correspond exactement au format attendu.

---

**Date:** 2026-01-01
**Version:** 2.0
**Status:** ✅ Corrigé et testé
