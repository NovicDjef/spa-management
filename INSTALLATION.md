# 🌸 Guide d'Installation - Système de Gestion de Spa

## 📋 Table des matières

1. [Prérequis](#prérequis)
2. [Installation](#installation)
3. [Configuration de la base de données](#configuration-de-la-base-de-données)
4. [Lancement de l'application](#lancement-de-lapplication)
5. [Déploiement](#déploiement)
6. [Structure du projet](#structure-du-projet)
7. [Fonctionnalités](#fonctionnalités)
8. [API Endpoints](#api-endpoints)
9. [Personnalisation](#personnalisation)

---

## 🎯 Prérequis

Avant de commencer, assurez-vous d'avoir installé:

- **Node.js** (version 18.x ou supérieure) - [Télécharger](https://nodejs.org/)
- **npm** ou **yarn** (gestionnaire de paquets)
- **PostgreSQL** (version 14 ou supérieure) - [Télécharger](https://www.postgresql.org/download/)
- **Git** - [Télécharger](https://git-scm.com/)

---

## 📦 Installation

### 1. Cloner ou extraire le projet

```bash
cd spa-management
```

### 2. Installer les dépendances

```bash
npm install
```

Cela installera toutes les dépendances nécessaires:
- Next.js 14 (framework React)
- Prisma (ORM pour la base de données)
- Framer Motion (animations)
- Tailwind CSS (styling)
- NextAuth.js (authentification)
- Et bien d'autres...

---

## 🗄️ Configuration de la base de données

### 1. Créer une base de données PostgreSQL

Ouvrez votre terminal PostgreSQL ou utilisez pgAdmin:

```sql
CREATE DATABASE spa_management;
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet:

```bash
cp .env.example .env
```

Modifiez le fichier `.env` avec vos informations:

```env
# Database
DATABASE_URL="postgresql://votre_utilisateur:votre_mot_de_passe@localhost:5432/spa_management?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generer-un-secret-securise-ici"

# App
NODE_ENV="development"
```

**Note**: Pour générer un `NEXTAUTH_SECRET` sécurisé:
```bash
openssl rand -base64 32
```

### 3. Initialiser la base de données avec Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer les tables dans la base de données
npx prisma db push

# (Optionnel) Ouvrir Prisma Studio pour visualiser vos données
npx prisma studio
```

---

## 🚀 Lancement de l'application

### Mode développement

```bash
npm run dev
```

L'application sera accessible sur: **http://localhost:3000**

### Mode production

```bash
# Build l'application
npm run build

# Lancer en production
npm start
```

---

## 🌐 Déploiement

### Déploiement sur Vercel (Recommandé)

1. **Créer un compte sur [Vercel](https://vercel.com)**

2. **Installer Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Déployer**
   ```bash
   vercel
   ```

4. **Configurer la base de données**
   - Utilisez un service comme [Supabase](https://supabase.com/) ou [Neon](https://neon.tech/) pour PostgreSQL
   - Ajoutez la `DATABASE_URL` dans les variables d'environnement Vercel

5. **Configurer les variables d'environnement sur Vercel**
   - Allez dans Settings > Environment Variables
   - Ajoutez `DATABASE_URL`, `NEXTAUTH_URL`, et `NEXTAUTH_SECRET`

### Déploiement sur un serveur VPS (DigitalOcean, AWS, etc.)

1. **Installer Node.js et PostgreSQL sur le serveur**

2. **Cloner le projet**
   ```bash
   git clone votre-repo.git
   cd spa-management
   ```

3. **Installer les dépendances et build**
   ```bash
   npm install
   npm run build
   ```

4. **Configurer PM2 pour garder l'app en vie**
   ```bash
   npm install -g pm2
   pm2 start npm --name "spa-management" -- start
   pm2 save
   pm2 startup
   ```

5. **Configurer Nginx comme reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 📁 Structure du projet

```
spa-management/
├── prisma/
│   └── schema.prisma          # Schéma de la base de données
├── public/
│   ├── manifest.json          # Manifest PWA
│   └── icons/                 # Icônes de l'application
├── src/
│   ├── app/
│   │   ├── api/              # API Routes
│   │   │   └── clients/      # Endpoints clients
│   │   ├── client/           # Pages clients
│   │   │   ├── nouveau/      # Formulaires d'enregistrement
│   │   │   └── confirmation/ # Page de confirmation
│   │   ├── professionnel/    # Pages professionnels
│   │   │   ├── connexion/    # Login
│   │   │   └── dashboard/    # Dashboard + liste clients
│   │   ├── globals.css       # Styles globaux
│   │   ├── layout.tsx        # Layout principal
│   │   └── page.tsx          # Page d'accueil
│   └── components/
│       └── forms/            # Composants de formulaire
├── .env.example              # Exemple de variables d'environnement
├── next.config.js            # Configuration Next.js + PWA
├── package.json              # Dépendances
├── tailwind.config.js        # Configuration Tailwind
└── tsconfig.json             # Configuration TypeScript
```

---

## ✨ Fonctionnalités

### Pour les Clients

✅ **Formulaire d'enregistrement intuitif**
- Sélection du type de service (Massothérapie ou Esthétique)
- Formulaire multi-étapes avec validation
- Calcul automatique de l'âge
- Carte corporelle interactive pour les zones de douleur
- Validation d'unicité (email et téléphone)

✅ **PWA (Progressive Web App)**
- Installation sur mobile
- Fonctionne hors ligne
- Expérience native

### Pour les Professionnels

✅ **Authentification sécurisée**
- Login avec email et mot de passe
- Sessions sécurisées avec NextAuth

✅ **Dashboard complet**
- Liste de tous les clients
- Recherche par nom, téléphone ou adresse
- Filtrage par type de service
- Vue détaillée du dossier client

✅ **Gestion des notes**
- Ajout de notes après chaque séance
- Traçabilité (qui a ajouté quelle note et quand)
- Historique complet des traitements

---

## 🔌 API Endpoints

### Clients

**POST** `/api/clients`
- Créer un nouveau client
- Body: Données du formulaire
- Retour: Client créé avec ID

**GET** `/api/clients`
- Récupérer tous les clients
- Query params: 
  - `search` (optionnel): Recherche par nom, téléphone, adresse
  - `serviceType` (optionnel): Filtrer par MASSOTHERAPIE ou ESTHETIQUE

**GET** `/api/clients/[id]`
- Récupérer un client spécifique
- Params: `id` du client

### Notes

**POST** `/api/clients/[id]/notes`
- Ajouter une note au dossier d'un client
- Body: `{ content: string, createdBy: string }`

**GET** `/api/clients/[id]/notes`
- Récupérer toutes les notes d'un client

### Traitements

**POST** `/api/clients/[id]/traitements`
- Ajouter un traitement
- Body: `{ date, soin, remarque, prescription }`

---

## 🎨 Personnalisation

### Couleurs

Les couleurs sont définies dans `tailwind.config.js`:

```javascript
colors: {
  spa: {
    rose: { ... },      // Couleur principale
    lavande: { ... },   // Couleur secondaire
    menthe: { ... },    // Couleur accent
    beige: { ... },     // Couleur neutre
  }
}
```

### Logo et Icônes

Remplacez les icônes dans `public/icons/` avec vos propres icônes:
- Tailles requises: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512

### Textes et Traductions

Tous les textes sont en français et peuvent être modifiés directement dans les composants.

---

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev                    # Lancer en mode dev

# Production
npm run build                  # Build pour production
npm start                      # Lancer en production

# Prisma
npx prisma studio              # Interface visuelle de la DB
npx prisma generate            # Générer le client Prisma
npx prisma db push             # Pousser le schéma vers la DB
npx prisma migrate dev         # Créer une migration

# Lint
npm run lint                   # Vérifier le code
```

---

## 🔒 Sécurité

- ✅ Les mots de passe sont hashés avec bcrypt
- ✅ Sessions sécurisées avec NextAuth
- ✅ Validation côté serveur et client
- ✅ Protection CSRF
- ✅ Unicité des emails et téléphones
- ✅ Données confidentielles conformes aux normes

---

## 🐛 Dépannage

### Erreur de connexion à la base de données

Vérifiez:
1. PostgreSQL est bien lancé
2. La `DATABASE_URL` dans `.env` est correcte
3. La base de données existe

### L'application ne démarre pas

```bash
# Nettoyer et réinstaller
rm -rf node_modules .next
npm install
npm run dev
```

### Problèmes avec Prisma

```bash
# Réinitialiser Prisma
npx prisma generate
npx prisma db push
```

---

## 📞 Support

Pour toute question ou problème:
1. Vérifiez la documentation
2. Consultez les logs: `npm run dev` (mode développement)
3. Vérifiez la console du navigateur (F12)

---

## 📝 Licence

Ce projet est sous licence MIT. Vous êtes libre de l'utiliser et de le modifier selon vos besoins.

---

## 🎉 Prochaines étapes

Une fois l'application installée et fonctionnelle:

1. **Créer des comptes professionnels**
   - Utilisez Prisma Studio pour ajouter des utilisateurs avec le rôle MASSOTHERAPEUTE ou ESTHETICIENNE

2. **Tester le flux complet**
   - Créer un dossier client
   - Se connecter en tant que professionnel
   - Rechercher le client
   - Ajouter une note

3. **Personnaliser**
   - Ajustez les couleurs selon votre marque
   - Ajoutez votre logo
   - Personnalisez les textes

4. **Déployer en production**
   - Suivez le guide de déploiement ci-dessus
   - Configurez un nom de domaine
   - Activez HTTPS

Bon développement! 🚀
