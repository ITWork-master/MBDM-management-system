# 🚀 MBDM — Gestion de contenu du site vitrine

Application web de back-office pour gérer le contenu du site vitrine MBDM :
produits, témoignages clients et interventions. Construite avec React, TypeScript
et Supabase.

## 📋 Sommaire

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [Configuration Supabase](#-configuration-supabase)
- [Base de données](#-base-de-données)
- [Scripts](#-scripts)
- [Sécurité](#-sécurité)
- [Déploiement](#-déploiement)

## ✨ Fonctionnalités

### 🎯 Tableau de bord
Navigation par cartes vers les quatre sections, en responsive.

### 📦 Produits
Création, modification et suppression, classés en cinq types (électrique,
thermique, climatisation, ventilation, froid). Recherche plein texte et filtre
par type. Image carrée avec recadrage et rotation avant envoi.

### 💬 Témoignages
Nom du client et message, présentés sous forme de cartes citations.

### 🏆 Interventions
Titre, description et image au format 4:3, avec recherche.

### 🔐 Authentification
Inscription, connexion, changement de mot de passe, suppression de compte.
Chaque utilisateur ne voit que ses propres données, garanti par les politiques
RLS de PostgreSQL.

### 🎨 Thème
Bascule clair (`cupcake`) / sombre, prévisualisable avant validation et
mémorisée dans le profil.

## 🛠 Technologies

| | |
|---|---|
| Frontend | React 19, TypeScript 5.8 |
| Styles | Tailwind CSS 4, daisyUI 5 |
| Backend | Supabase (PostgreSQL + Auth + Storage) |
| Build | Vite 7 |
| Icônes | Lucide React |
| Notifications | Sonner |
| Recadrage | react-easy-crop |

## 📁 Structure du projet

```
supabase/
└── schema.sql              # Tables, RLS, storage, triggers — à exécuter en premier
src/
├── components/
│   ├── auth/               # Login, Register
│   ├── dashboard/          # Tableau de bord
│   ├── entities/           # Briques partagées par les pages de contenu
│   │   ├── EntityCard.tsx      # Carte produit / intervention
│   │   ├── EntityFormModal.tsx # Enveloppe de formulaire
│   │   └── ImageField.tsx      # Champ fichier + aperçu
│   ├── tools/              # Composants génériques (Modal, Navbar, ConfirmDialog…)
│   ├── Products.tsx
│   ├── Achievements.tsx
│   ├── Testimonials.tsx
│   ├── TestimonialCard.tsx
│   └── Settings.tsx
├── context/
│   ├── AuthContext.tsx     # Provider : session, profil, navigation
│   └── useAuth.ts          # Contexte et hook de consommation
├── hooks/
│   ├── useCrud.ts          # État et opérations d'une liste d'entités
│   ├── useProducts.ts      # ─┐
│   ├── useAchievements.ts  #  ├─ déclinaisons de useCrud
│   ├── useTestimonials.ts  # ─┘
│   └── useImagePicker.ts   # Sélection, validation et recadrage d'image
├── lib/
│   ├── supabase/Supabase.ts
│   ├── image.ts            # Recadrage canvas, validation des fichiers
│   ├── theme.ts            # Application du thème au document
│   └── errors.ts           # Normalisation des erreurs
├── services/
│   ├── crud.service.ts     # Fabrique de CRUD, partagée par les trois tables
│   ├── storage.service.ts  # Envoi et suppression des images
│   ├── auth.service.ts     # Session, profil, mot de passe, compte
│   ├── products.service.ts
│   ├── achievements.service.ts
│   └── testimonials.service.ts
├── types/type.ts
└── App.tsx
```

## 🚀 Installation

### Prérequis
- Node.js 20+ et pnpm
- Un projet Supabase

### Étapes

```bash
git clone <votre-repo>
cd MBDM-management-system
pnpm install
cp .env.example .env    # puis renseigner les deux variables
pnpm dev
```

L'application démarre sur http://localhost:5173.

### Variables d'environnement

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | URL du projet Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clé `anon` (publique) du projet |

Ces deux valeurs sont **publiques par conception** : Vite les intègre au bundle
JavaScript, donc n'importe qui peut les lire. La sécurité ne repose pas sur leur
confidentialité mais sur les politiques RLS. Ne jamais placer la clé
`service_role` dans ce fichier : elle contourne toutes les politiques.

`.env` n'est pas versionné. Seul `.env.example` l'est.

## 🗄 Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Ouvrir **SQL Editor** et exécuter l'intégralité de
   [`supabase/schema.sql`](supabase/schema.sql). Le script est idempotent : il
   crée les tables, active la RLS, pose les politiques, crée le bucket `images`
   et installe le trigger de création de profil.
3. Vérifier que la RLS est bien active :

   ```sql
   select tablename, rowsecurity
   from pg_tables
   where schemaname = 'public'
     and tablename in ('profiles', 'images', 'testimonials', 'achievements');
   ```

   Les quatre lignes doivent afficher `rowsecurity = true`.

4. Si le site vitrine lit directement ces tables sans authentification,
   décommenter la section « 3 bis » du script, qui ouvre la **lecture seule**
   au rôle `anon`. L'écriture reste réservée au propriétaire. `profiles` n'est
   jamais concerné.

## 📊 Base de données

Le schéma de référence est `supabase/schema.sql`. En résumé :

| Table | Rôle | Colonnes propres |
|---|---|---|
| `profiles` | Profil applicatif, 1-1 avec `auth.users` | `name`, `theme` |
| `images` | **Produits** (nom historique) | `title`, `description`, `type`, `image_url` |
| `testimonials` | Témoignages | `client_name`, `message` |
| `achievements` | Interventions | `title`, `description`, `image_url` |

Toutes les tables de contenu portent `id`, `user_id`, `created_at`, `updated_at`.

> ⚠️ La table `images` contient les **produits**, pas des fichiers. Le bucket de
> stockage porte lui aussi le nom `images`. Voir `PRODUCTS_TABLE` dans
> `src/services/products.service.ts` et `IMAGE_BUCKET` dans
> `src/services/storage.service.ts`.

Le bucket range les fichiers sous `<user_id>/<uuid>.<ext>` : le premier segment
du chemin sert aux politiques RLS du storage à identifier le propriétaire.

## 📜 Scripts

| Commande | Effet |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Vérification des types puis build de production |
| `pnpm typecheck` | Vérification des types seule |
| `pnpm lint` | ESLint |
| `pnpm preview` | Sert le build de production localement |

## 🔒 Sécurité

- Authentification par Supabase Auth.
- **Row Level Security activée sur les quatre tables**, avec des politiques qui
  restreignent chaque ligne à son propriétaire (`auth.uid() = user_id`). C'est
  la seule barrière réelle : la clé `anon` étant publique, une table sans RLS
  est lisible et modifiable par n'importe qui sur Internet.
- Les requêtes du client filtrent également sur `user_id`, y compris pour les
  mises à jour et les suppressions — une défense en profondeur, pas un
  substitut aux politiques.
- Les uploads sont validés côté client (type MIME et taille, 5 Mo maximum) et
  cloisonnés par utilisateur côté storage.
- Aucune clé `service_role` ni aucun appel à l'API admin de Supabase ne figure
  dans le code client. La suppression de compte passe par la fonction
  `delete_own_account`, en `security definer`, qui n'agit que sur l'appelant.

## 🚀 Déploiement

```bash
pnpm build
```

Déployer le dossier `dist/` (Netlify, Vercel, Cloudflare Pages…) et définir
`VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables
d'environnement du site.

Servir impérativement en HTTPS : `crypto.randomUUID()`, utilisé pour nommer les
fichiers envoyés, n'est disponible qu'en contexte sécurisé.

## 📄 Licence

Aucune licence n'est définie pour l'instant ; le projet est privé.
