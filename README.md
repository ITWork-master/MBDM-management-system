# 🚀 Application de Gestion de Contenu - Site Vitrine

Une application web moderne pour gérer le contenu de votre site vitrine, construite avec React, TypeScript et Supabase.

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies Utilisées](#-technologies-utilisées)
- [Structure du Projet](#-structure-du-projet)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Base de Données](#-base-de-données)
- [Développement](#-développement)
- [Déploiement](#-déploiement)

## ✨ Fonctionnalités

### 🎯 Tableau de Bord
- Interface intuitive avec navigation par cartes
- Accès rapide à toutes les sections de gestion
- Design responsive et moderne

### 📦 Gestion des Produits
- ✅ Ajouter, modifier et supprimer des produits
- 📸 Upload d'images vers Supabase Storage
- 📝 Gestion des titres et descriptions
- 🗂️ Organisation automatique par date

### 💬 Gestion des Témoignages
- 👥 Ajout de témoignages clients
- 💾 Stockage des noms et messages
- 📊 Affichage sous forme de cartes citations

### 🏆 Gestion des Exploits
- 🎖️ Création de réalisations et succès
- 🖼️ Support des images illustratives
- 📈 Suivi des accomplissements

### 🔐 Authentification Sécurisée
- 🔒 Connexion et inscription
- 🛡️ Protection des routes
- 👤 Données utilisateur isolées

## 🛠 Technologies Utilisées

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: React Hooks + Context API

## 📁 Structure du Projet

```
src/
├── components/
│   ├── auth/           # Composants d'authentification
│   ├── dashboard/      # Tableau de bord principal
│   ├── tools/          # Composants réutilisables
│   ├── Products.tsx    # Gestion des produits
│   ├── Testimonials.tsx # Gestion des témoignages
│   └── Achievements.tsx # Gestion des exploits
├── context/
│   └── AuthContext.tsx # Gestion d'état global
├── hooks/
│   ├── useProducts.ts     # Hook produits
│   ├── useTestimonials.ts # Hook témoignages
│   └── useAchievements.ts # Hook exploits
├── services/
│   ├── products.service.ts     # Service produits
│   ├── testimonials.service.ts # Service témoignages
│   └── achievements.service.ts # Service exploits
├── lib/
│   └── supabase.ts     # Configuration Supabase
└── App.tsx             # Composant principal
```

## 🚀 Installation

### Prérequis
- Node.js 16+ et npm
- Compte Supabase

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <votre-repo>
cd site-vitrine-cms
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

4. **Remplir les variables d'environnement**
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

## ⚙️ Configuration Supabase

### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme dans les paramètres

### 2. Configurer la Base de Données

Exécutez ces requêtes SQL dans l'éditeur SQL de Supabase :

```sql
-- Table des produits
create table public.images (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  title text null,
  description text null,
  image_url text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null,
  constraint images_pkey primary key (id),
  constraint images_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

-- Table des témoignages
create table public.testimonials (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  client_name text null,
  message text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null,
  constraint testimonials_pkey primary key (id),
  constraint testimonials_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;

-- Table des exploits
create table public.achievements (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid null,
  title text null,
  description text null,
  image_url text null,
  created_at timestamp without time zone null default now(),
  updated_at timestamp without time zone null,
  constraint achievements_pkey primary key (id),
  constraint achievements_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
```

### 3. Configurer le Storage

1. Allez dans **Storage** → **Buckets**
2. Créez un bucket nommé `images`
3. Configurez les politiques RLS :

```sql
-- Politique pour permettre aux utilisateurs de lire leurs images
CREATE POLICY "Users can view their own images" ON storage.objects
FOR SELECT USING (auth.uid() = owner);

-- Politique pour permettre aux utilisateurs d'uploader leurs images
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (auth.uid() = owner);

-- Politique pour permettre aux utilisateurs de supprimer leurs images
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (auth.uid() = owner);
```

## 🎯 Utilisation

### Démarrage en développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

### Construction pour la production

```bash
npm run build
```

### Preview de la build

```bash
npm run preview
```

## 📊 Base de Données

### Schéma des Tables

#### `images` (Produits)
- `id` - Identifiant unique
- `user_id` - Référence à l'utilisateur
- `title` - Titre du produit
- `description` - Description du produit
- `image_url` - URL de l'image
- `created_at` - Date de création
- `updated_at` - Date de modification

#### `testimonials` (Témoignages)
- `id` - Identifiant unique
- `user_id` - Référence à l'utilisateur
- `client_name` - Nom du client
- `message` - Contenu du témoignage
- `created_at` - Date de création
- `updated_at` - Date de modification

#### `achievements` (Exploits)
- `id` - Identifiant unique
- `user_id` - Référence à l'utilisateur
- `title` - Titre de l'exploit
- `description` - Description de l'exploit
- `image_url` - URL de l'image
- `created_at` - Date de création
- `updated_at` - Date de modification

## 🔧 Développement

### Ajouter une nouvelle fonctionnalité

1. **Créer le service**
```typescript
// services/ma-nouvelle-feature.service.ts
export const maNouvelleFeatureService = {
  // Implémenter les méthodes CRUD
};
```

2. **Créer le hook**
```typescript
// hooks/useMaNouvelleFeature.ts
export const useMaNouvelleFeature = () => {
  // Gestion d'état et méthodes
};
```

3. **Créer le composant**
```typescript
// components/MaNouvelleFeature.tsx
const MaNouvelleFeature: React.FC = () => {
  // Interface utilisateur
};
```

### Styles et Design

Le projet utilise Tailwind CSS avec une configuration personnalisée :

- Design system cohérent
- Composants réutilisables
- Responsive design
- États de chargement et erreurs

## 🚀 Déploiement

### Déploiement sur Vercel

1. **Installer Vercel CLI**
```bash
npm i -g vercel
```

2. **Déployer**
```bash
vercel
```

3. **Configurer les variables d'environnement** dans les paramètres du projet Vercel

### Déploiement sur Netlify

1. **Construire le projet**
```bash
npm run build
```

2. **Déployer le dossier `dist`** sur Netlify

3. **Configurer les variables d'environnement** dans les paramètres du site Netlify

## 🔒 Sécurité

- Authentification via Supabase Auth
- Row Level Security (RLS) activé sur toutes les tables
- Validation des données côté client et serveur
- Protection contre les injections SQL
- Gestion sécurisée des uploads d'images

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour toute question ou problème :

1. Vérifiez la documentation Supabase
2. Consultez les issues GitHub
3. Contactez l'équipe de développement

---

**Développé avec ❤️ pour simplifier la gestion de contenu des sites vitrines**