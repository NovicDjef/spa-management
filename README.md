# 🌸 Système de Gestion de Spa - PWA

Application mobile-first pour la gestion des dossiers clients en massothérapie et esthétique.

## 📋 Fonctionnalités

### Pour les Clients
- Enregistrement via formulaire personnalisé (Massothérapie ou Esthétique)
- Scan de QR code pour accès rapide
- Calcul automatique de l'âge
- Validation d'unicité (email, téléphone)

### Pour les Professionnels
- Connexion sécurisée
- Liste des clients avec recherche avancée (nom, téléphone, adresse)
- Ajout de notes avec traçabilité
- Historique des traitements

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 (App Router) + PWA
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS + Framer Motion
- **Authentification**: NextAuth.js

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Configurer la base de données
cp .env.example .env
# Modifier DATABASE_URL dans .env

# Migrations Prisma
npx prisma generate
npx prisma db push

# Lancer le serveur de développement
npm run dev
```

## 📱 PWA

L'application est configurée comme Progressive Web App:
- Fonctionne hors ligne
- Installable sur mobile
- Optimisée pour les performances mobiles

## 🎨 Design

Couleurs douces et apaisantes inspirées de l'univers spa:
- Rose poudré, lavande, menthe douce
- Animations fluides et intuitives
- Interface épurée et professionnelle
