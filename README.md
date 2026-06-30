# MaSanteYa API

> Backend API robuste pour l'application de santé mobile MaSanteYa (Ghana & Guinée)

[![Node.js](https://img.shields.io/badge/Node.js-20-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

## 🚀 Stack Technologique

- **Runtime**: Node.js 20 LTS + TypeScript 5 (strict mode)
- **Framework**: Express.js 4 + express-async-errors
- **Base de données**: PostgreSQL 15 (Supabase free tier)
- **ORM**: Prisma 5
- **Cache**: Upstash Redis (free tier)
- **Auth**: JWT (access 15min + refresh 7j) + bcryptjs
- **Temps réel**: Socket.io 4
- **Fichiers**: Supabase Storage
- **Email**: Resend (free tier)
- **SMS/OTP**: Africa's Talking
- **Validation**: Zod 3
- **Logging**: Winston + Morgan
- **Rate limiting**: express-rate-limit + Redis
- **Sécurité**: Helmet, CORS, HPP
- **Tests**: Vitest + Supertest
- **Déploiement**: Railway.app (free tier)

## 📋 Fonctionnalités

✅ **Authentification complète**
- Inscription avec vérification email + SMS
- Login avec rate limiting et protection brute-force
- JWT tokens (access + refresh) avec rotation
- Réinitialisation de mot de passe sécurisée

✅ **Télémédecine**
- Recherche de médecins par spécialité/ville/pays
- Planification de consultations vidéo
- Chat temps réel avec Socket.io
- Système de notation et avis

✅ **Monitoring de santé**
- Enregistrement de signes vitaux (BPM, tension, glucose, SpO2, temp, poids)
- Alertes automatiques (NORMAL/WARNING/CRITICAL)
- Historique et statistiques
- Notifications temps réel

✅ **Dossier médical**
- Stockage de documents (consultations, résultats, ordonnances)
- Upload de fichiers sécurisé
- Partage avec médecins
- Tags et recherche

✅ **Gestion de médicaments**
- Suivi des traitements
- Rappels automatiques (push + SMS)
- Historique de prise
- Gestion des stocks

✅ **Pharmacies**
- Recherche géographique (Haversine)
- Disponibilité en temps réel
- Pharmacies de garde
- Filtres NHIS

✅ **Livraison**
- Commande de médicaments
- Tracking en temps réel (Socket.io)
- Statuts de livraison

✅ **Assurance**
- Intégration NHIS (Ghana) / NSIA (Guinée)
- Vérification de couverture
- Historique de remboursements

## 🛠️ Installation

### Prérequis

- Node.js 20+
- npm 10+
- Compte Supabase (gratuit)
- Compte Upstash Redis (gratuit)
- Compte Resend (gratuit)
- Compte Africa's Talking (sandbox gratuit)

### Setup

```bash
# Cloner le repository
git clone <repo-url>
cd masanteya-api

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos credentials

# Générer le client Prisma
npx prisma generate

# Créer les tables en base de données
npx prisma migrate dev --name init

# Seeder les données de test (optionnel)
npm run db:seed

# Démarrer le serveur en dev
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

### Comptes de test (après seed)

- **Patient Ghana**: `patient.gh@test.com` / `Password123!`
- **Patient Guinée**: `patient.gn@test.com` / `Password123!`
- **Médecin Ghana**: `doctor.gh@test.com` / `Password123!`
- **Médecin Guinée**: `doctor.gn@test.com` / `Password123!`

## 🔧 Configuration

### Supabase (PostgreSQL + Storage)

1. Créer un projet sur https://supabase.com
2. Récupérer `DATABASE_URL` dans Settings > Database
3. Récupérer `SUPABASE_URL` et `SUPABASE_SERVICE_KEY` dans Settings > API
4. Créer un bucket `masanteya-files` dans Storage

### Upstash Redis

1. Créer une base sur https://upstash.com
2. Récupérer REST URL et token
3. Ajouter dans `.env`

### Resend (Emails)

1. S'inscrire sur https://resend.com
2. Récupérer l'API key
3. Vérifier votre domaine (ou utiliser sandbox)

### Africa's Talking (SMS)

1. S'inscrire sur https://africastalking.com
2. Récupérer API key et username
3. Utiliser mode sandbox pour dev

## 📚 Documentation API

### Endpoints disponibles

**Base URL**: `/api/v1`

#### Auth
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `POST /auth/refresh` - Renouveler access token
- `POST /auth/logout` - Déconnexion
- `POST /auth/verify-email` - Vérifier email
- `POST /auth/verify-phone` - Vérifier téléphone
- `POST /auth/forgot-password` - Demander reset
- `POST /auth/reset-password` - Nouveau mot de passe
- `POST /auth/resend-otp` - Renvoyer code OTP

#### Users
- `GET /users/me` - Profil actuel
- `PATCH /users/me` - Mettre à jour profil
- `POST /users/me/avatar` - Upload photo

#### Doctors
- `GET /doctors` - Liste des médecins
- `GET /doctors/:id` - Détail médecin
- `GET /doctors/:id/availability` - Créneaux disponibles

#### Consultations
- `POST /consultations` - Réserver
- `GET /consultations` - Mes consultations
- `GET /consultations/:id` - Détail
- `PATCH /consultations/:id/start` - Démarrer
- `PATCH /consultations/:id/end` - Terminer
- `POST /consultations/:id/review` - Évaluer

#### Vitals
- `POST /vitals` - Enregistrer mesure
- `GET /vitals` - Historique
- `GET /vitals/latest` - Dernières valeurs
- `GET /vitals/stats` - Statistiques

#### Records
- `GET /records` - Liste dossiers
- `POST /records` - Créer
- `GET /records/:id` - Détail
- `PATCH /records/:id` - Modifier
- `POST /records/:id/share` - Partager

#### Medications
- `GET /medications` - Mes médicaments
- `POST /medications` - Ajouter
- `POST /medications/:id/intake` - Marquer prise

#### Delivery
- `GET /delivery/pharmacies` - Pharmacies partenaires
- `POST /delivery/orders` - Commander
- `GET /delivery/orders/:id` - Suivi

#### Insurance
- `GET /insurance` - Mes assurances
- `POST /insurance` - Lier assurance

#### PharmFind
- `GET /pharmfind/search?lat=&lng=&medication=&country=&radius=` - Recherche géographique

## 🧪 Tests

```bash
# Exécuter tous les tests
npm test

# Tests en mode watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🚢 Déploiement

### Railway (Recommandé - Free Tier)

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login
railway login

# Créer projet
railway init

# Ajouter les variables d'environnement dans le dashboard Railway

# Déployer
railway up
```

### Via GitHub Actions (CI/CD)

1. Push votre code sur GitHub
2. Ajouter les secrets dans Settings > Secrets:
   - `RAILWAY_TOKEN`
   - Toutes les variables d'environnement
3. Push sur `main` déclenche automatiquement le déploiement

## 📁 Structure du Projet

```
masanteya-api/
├── src/
│   ├── app.ts                 # Factory Express app
│   ├── server.ts              # Point d'entrée HTTP + Socket.io
│   ├── config/                # Configuration (env, DB, Redis, Socket, logger)
│   ├── shared/
│   │   ├── middleware/        # Auth, RBAC, rate limiting, validation, errors
│   │   ├── utils/             # JWT, hash, OTP, response, pagination
│   │   ├── services/          # Email, SMS, storage, cache, notifications
│   │   └── types/             # Types TypeScript
│   ├── modules/               # Modules fonctionnels (auth, users, doctors, etc.)
│   └── jobs/                  # Tâches cron (rappels médicaments, alertes)
├── prisma/
│   ├── schema.prisma          # Schéma de base de données
│   ├── migrations/            # Migrations
│   └── seed.ts                # Données de test
├── tests/                     # Tests Vitest
├── .env.example               # Template variables d'environnement
├── Dockerfile                 # Image Docker
├── railway.json               # Config Railway
└── package.json
```

## 🔒 Sécurité

- ✅ JWT avec tokens courte durée (15min access, 7j refresh)
- ✅ Hash de mots de passe avec bcrypt (12 rounds)
- ✅ Rate limiting sur tous les endpoints
- ✅ Tracking des tentatives de connexion (Redis)
- ✅ Blacklist de tokens au logout
- ✅ Helmet.js pour headers HTTP sécurisés
- ✅ CORS configuré pour origines spécifiques
- ✅ Validation d'entrée avec Zod
- ✅ Protection contre injection SQL (Prisma)
- ✅ OTP avec expiration et usage unique
- ✅ RBAC (Role-Based Access Control)

## 📊 Monitoring

- Health check: `GET /health`
- Logs Winston (fichiers en production)
- Railway metrics dashboard
- Better Uptime (free tier) pour uptime monitoring

## 🤝 Contribution

Pour contribuer:

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

MIT © MaSanteYa Team

## 📞 Support

Pour toute question ou problème:
- Ouvrir une issue sur GitHub
- Email: support@masanteya.app

## 🗺️ Roadmap

- [ ] Implémenter tous les modules (users, doctors, consultations, vitals, records, medications, delivery, insurance, pharmfind)
- [ ] Ajouter tests unitaires complets
- [ ] Intégration paiement mobile (MTN Mobile Money, Orange Money)
- [ ] App mobile React Native (Expo)
- [ ] Dashboard admin web (Next.js)
- [ ] Notifications push (Expo Push Notifications)
- [ ] Géolocalisation avancée
- [ ] ML pour alertes prédictives
- [ ] Multilangue (EN, FR, Twi, Fula)

---

**Made with ❤️ for Ghana & Guinea**
