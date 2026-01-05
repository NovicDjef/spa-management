# Guide d'utilisation des APIs Services

Ce guide explique comment utiliser les nouveaux hooks RTK Query pour les services, forfaits, et abonnements gym.

## 📦 Types disponibles

- `ServiceCategory` - Catégorie de services avec liste de services
- `Service` - Un service individuel
- `Package` - Un forfait contenant plusieurs services
- `GymMembership` - Abonnement gym
- `AvailableProfessional` - Professionnel disponible (simplifié pour affichage public)

## 🎣 Hooks disponibles

### 1. `useGetAllServicesQuery()`

Récupère toutes les catégories avec leurs services.

```typescript
import { useGetAllServicesQuery } from '@/lib/redux/services/api';

function ServicesPage() {
  const { data, isLoading, error } = useGetAllServicesQuery();

  if (isLoading) return <div>Chargement...</div>;
  if (error) return <div>Erreur de chargement</div>;

  return (
    <div>
      {data?.data.map((category) => (
        <div key={category.id}>
          <h2>{category.name}</h2>
          <p>{category.description}</p>
          <div>
            {category.services.map((service) => (
              <div key={service.id}>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <p>Durée: {service.duration} min</p>
                <p>Prix: {service.price} $</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Avec filtre par catégorie:**
```typescript
const { data } = useGetAllServicesQuery({ categoryName: 'Massothérapie' });
```

### 2. `useGetServiceBySlugQuery(slug)`

Récupère un service spécifique par son slug.

```typescript
import { useGetServiceBySlugQuery } from '@/lib/redux/services/api';

function ServiceDetailPage({ slug }: { slug: string }) {
  const { data, isLoading } = useGetServiceBySlugQuery(slug);

  if (isLoading) return <div>Chargement...</div>;

  const service = data?.data;

  return (
    <div>
      <h1>{service.name}</h1>
      <p>{service.description}</p>
      <p>Durée: {service.duration} minutes</p>
      <p>Prix: {service.price} $</p>
      {service.imageUrl && <img src={service.imageUrl} alt={service.name} />}
      <div>
        <h3>Catégorie: {service.category?.name}</h3>
        <p>{service.category?.description}</p>
      </div>
    </div>
  );
}
```

### 3. `useGetAllPackagesQuery()`

Récupère tous les forfaits disponibles.

```typescript
import { useGetAllPackagesQuery } from '@/lib/redux/services/api';

function PackagesPage() {
  const { data, isLoading } = useGetAllPackagesQuery();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Nos Forfaits</h1>
      {data?.data.map((pkg) => (
        <div key={pkg.id}>
          <h2>{pkg.name}</h2>
          <p>{pkg.description}</p>
          <p>Variante: {pkg.variant}</p>
          <p>Prix: {pkg.price} $</p>
          {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name} />}

          <h3>Services inclus:</h3>
          <ul>
            {pkg.services.map((svc, idx) => (
              <li key={idx}>
                {svc.serviceName} x {svc.quantity}
                {svc.isOptional && ' (Optionnel)'}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
```

### 4. `useGetPackageBySlugQuery(slug)`

Récupère un forfait spécifique par son slug.

```typescript
import { useGetPackageBySlugQuery } from '@/lib/redux/services/api';

function PackageDetailPage({ slug }: { slug: string }) {
  const { data, isLoading } = useGetPackageBySlugQuery(slug);

  if (isLoading) return <div>Chargement...</div>;

  const pkg = data?.data;

  return (
    <div>
      <h1>{pkg.name}</h1>
      <p>{pkg.description}</p>
      <p>Prix total: {pkg.price} $</p>

      <h2>Services inclus:</h2>
      {pkg.services.map((svc, idx) => (
        <div key={idx}>
          <h3>{svc.serviceName}</h3>
          <p>{svc.serviceDescription}</p>
          <p>Durée: {svc.serviceDuration} min</p>
          <p>Quantité: {svc.quantity}</p>
          {svc.extraCost && <p>Coût supplémentaire: {svc.extraCost} $</p>}
          {svc.isOptional && <span>Optionnel</span>}
        </div>
      ))}
    </div>
  );
}
```

### 5. `useGetGymMembershipsQuery()`

Récupère tous les abonnements gym.

```typescript
import { useGetGymMembershipsQuery } from '@/lib/redux/services/api';

function GymMembershipsPage() {
  const { data, isLoading } = useGetGymMembershipsQuery();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Abonnements Gym</h1>
      {data?.data.map((membership) => (
        <div key={membership.id}>
          <h2>{membership.name}</h2>
          <p>Type: {membership.type}</p>
          <p>{membership.description}</p>
          <p>Prix: {membership.price} $</p>
          <p>Durée: {membership.duration} jours</p>
        </div>
      ))}
    </div>
  );
}
```

### 6. `useGetAvailableProfessionalsQuery()`

Récupère les professionnels disponibles (optionnellement filtré par type de service).

```typescript
import { useGetAvailableProfessionalsQuery } from '@/lib/redux/services/api';

function ProfessionalsPage() {
  const { data, isLoading } = useGetAvailableProfessionalsQuery();

  if (isLoading) return <div>Chargement...</div>;

  return (
    <div>
      <h1>Nos Professionnels</h1>
      {data?.data.map((prof) => (
        <div key={prof.id}>
          <h2>{prof.name}</h2>
          <p>Spécialité: {prof.speciality}</p>
          {prof.photoUrl && <img src={prof.photoUrl} alt={prof.name} />}
        </div>
      ))}
    </div>
  );
}
```

**Avec filtre par type de service:**
```typescript
// Uniquement les massothérapeutes
const { data } = useGetAvailableProfessionalsQuery({
  serviceType: 'MASSOTHERAPIE'
});

// Uniquement les esthéticiennes
const { data } = useGetAvailableProfessionalsQuery({
  serviceType: 'ESTHETIQUE'
});
```

## 🎨 Exemple de composant complet

```typescript
'use client';

import { useGetAllServicesQuery } from '@/lib/redux/services/api';
import { Loader2 } from 'lucide-react';

export default function ServicesShowcase() {
  const { data, isLoading, error } = useGetAllServicesQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-spa-turquoise-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        Erreur lors du chargement des services
      </div>
    );
  }

  return (
    <div className="container-spa section-spa">
      <h1 className="text-3xl font-bold mb-8">Nos Services</h1>

      {data?.data.map((category) => (
        <div key={category.id} className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">{category.name}</h2>
          {category.description && (
            <p className="text-gray-600 mb-6">{category.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services.map((service) => (
              <div
                key={service.id}
                className="card-spa p-6 hover:shadow-lg transition-shadow"
              >
                {service.imageUrl && (
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                {service.description && (
                  <p className="text-gray-600 mb-4">{service.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-spa-turquoise-600 font-semibold">
                    {service.price} $
                  </span>
                  <span className="text-gray-500 text-sm">
                    {service.duration} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 📝 Notes importantes

1. **Pas d'authentification requise**: Ces endpoints sont publics
2. **Cache automatique**: RTK Query gère automatiquement le cache
3. **Invalidation**: Les tags 'Service' et 'Package' permettent l'invalidation du cache si nécessaire
4. **Type-safety**: Tous les types sont strictement typés avec TypeScript

## 🚀 Utilisation dans BookingSidebar

Pour intégrer dans la création de réservation:

```typescript
import { useGetAllServicesQuery } from '@/lib/redux/services/api';

function BookingForm() {
  const { data: servicesData } = useGetAllServicesQuery();

  return (
    <select name="service">
      {servicesData?.data.map((category) => (
        <optgroup key={category.id} label={category.name}>
          {category.services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.price}$ ({service.duration} min)
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
```
