-- =============================================================================
--  MBDM — schéma complet (tables, RLS, storage, trigger de profil)
--  À exécuter dans l'éditeur SQL de Supabase. Idempotent : ré-exécutable.
--
--  ⚠️  La section 3 (RLS) est la seule chose qui protège vos données.
--      Sans elle, n'importe qui disposant de la clé anon — qui est publique
--      par conception, elle est incluse dans le bundle JavaScript — peut lire,
--      modifier et supprimer toutes les lignes de toutes les tables.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Extensions
-- -----------------------------------------------------------------------------
create extension if not exists "uuid-ossp" with schema extensions;


-- -----------------------------------------------------------------------------
-- 2. Tables
-- -----------------------------------------------------------------------------

-- Profil applicatif, en 1-1 avec auth.users.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  name       text not null default '',
  theme      text not null default 'light' check (theme in ('light', 'dark')),
  created_at timestamptz not null default now()
);

-- Produits. NB : la table s'appelle « images » pour des raisons historiques —
-- c'est bien la table des produits, à ne pas confondre avec le bucket de
-- stockage « images ». Voir PRODUCTS_TABLE dans src/services/products.service.ts.
create table if not exists public.images (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  description text not null default '',
  type        text not null default 'electrique'
              check (type in ('electrique', 'thermique', 'climatisation', 'ventilation', 'froid')),
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

create table if not exists public.testimonials (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  client_name text not null,
  message     text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

-- Interventions / réalisations.
create table if not exists public.achievements (
  id          uuid primary key default extensions.uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  title       text not null,
  description text not null default '',
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz
);

-- Les listes sont toujours filtrées par propriétaire puis triées par date.
create index if not exists images_user_created_idx
  on public.images (user_id, created_at desc);
create index if not exists testimonials_user_created_idx
  on public.testimonials (user_id, created_at desc);
create index if not exists achievements_user_created_idx
  on public.achievements (user_id, created_at desc);


-- -----------------------------------------------------------------------------
-- 2 bis. Mise à niveau des tables DÉJÀ EXISTANTES
--
--   `create table if not exists` ne touche pas une table qui existe déjà : sur
--   un projet en place, les contraintes de la section 2 ne sont jamais posées.
--   Un test d'intégration l'a montré — un produit de type « inexistant » était
--   accepté par la base alors que le CHECK était censé le refuser.
--
--   Ce bloc rattrape l'existant. Il est idempotent et ne touche à aucune donnée.
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
  target text;
  fk_name text;
  orphan_count bigint;
begin
  -- Colonnes éventuellement absentes sur un schéma ancien.
  alter table public.images       add column if not exists type text;
  alter table public.images       add column if not exists updated_at timestamptz;
  alter table public.achievements add column if not exists updated_at timestamptz;
  alter table public.testimonials add column if not exists updated_at timestamptz;
  alter table public.profiles     add column if not exists theme text;
  alter table public.profiles     add column if not exists name text;

  -- Valeurs par défaut, posées avant les contraintes qui s'y appuient.
  update public.images   set type  = 'electrique' where type  is null;
  update public.profiles set theme = 'light'      where theme is null;
  update public.profiles set name  = ''           where name  is null;

  alter table public.images   alter column type  set default 'electrique';
  alter table public.profiles alter column theme set default 'light';
  alter table public.profiles alter column name  set default '';

  -- CHECK sur le type de produit.
  if not exists (select 1 from pg_constraint where conname = 'images_type_check') then
    alter table public.images add constraint images_type_check
      check (type in ('electrique', 'thermique', 'climatisation', 'ventilation', 'froid'));
  end if;

  -- CHECK sur le thème.
  if not exists (select 1 from pg_constraint where conname = 'profiles_theme_check') then
    alter table public.profiles add constraint profiles_theme_check
      check (theme in ('light', 'dark'));
  end if;

  -- `user_id` obligatoire : sans lui, une ligne échappe à toute politique RLS.
  -- Aucune donnée n'est supprimée ici : si des lignes orphelines existent, la
  -- contrainte est laissée de côté et un avertissement est émis, à toi de
  -- décider quoi en faire (elles sont listées par supabase/maintenance.sql).
  foreach t in array array['images', 'testimonials', 'achievements'] loop
    execute format('select count(*) from public.%I where user_id is null', t) into orphan_count;
    if orphan_count > 0 then
      raise warning '%: % ligne(s) sans user_id — NOT NULL non appliqué, ces lignes resteront invisibles sous RLS', t, orphan_count;
    else
      execute format('alter table public.%I alter column user_id set not null', t);
    end if;
  end loop;

  -- Clés étrangères vers auth.users, reconstruites en ON DELETE CASCADE.
  --
  -- Les contraintes d'origine n'avaient pas de CASCADE : supprimer un compte
  -- échouait sur une violation de clé étrangère dès qu'il possédait une ligne.
  -- On repère les contraintes existantes par leur cible plutôt que par leur
  -- nom, qui peut différer d'un projet à l'autre.
  for target, fk_name in
    select c.conrelid::regclass::text, c.conname
    from pg_constraint c
    where c.contype = 'f'
      and c.confrelid = 'auth.users'::regclass
      and c.conrelid in ('public.images'::regclass, 'public.testimonials'::regclass,
                         'public.achievements'::regclass, 'public.profiles'::regclass)
  loop
    execute format('alter table %s drop constraint %I', target, fk_name);
  end loop;

  begin
    alter table public.images add constraint images_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
    alter table public.testimonials add constraint testimonials_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
    alter table public.achievements add constraint achievements_user_id_fkey
      foreign key (user_id) references auth.users (id) on delete cascade;
    alter table public.profiles add constraint profiles_id_fkey
      foreign key (id) references auth.users (id) on delete cascade;
  exception when foreign_key_violation then
    raise warning 'Clés étrangères non reposées : des lignes référencent un compte supprimé. Voir la requête 2 de supabase/maintenance.sql.';
  end;
end
$$;


-- -----------------------------------------------------------------------------
-- 3. Row Level Security  ← LA PARTIE QUI MANQUAIT
-- -----------------------------------------------------------------------------

-- 3a. Faire table rase des politiques existantes.
--
--     Indispensable, et pas seulement par souci de propreté : les politiques
--     PERMISSIVES se combinent par OU. Une ancienne règle large — un
--     `using (true)` oublié, par exemple — continuerait d'autoriser tout le
--     monde, quelles que soient les politiques strictes ajoutées ensuite. Se
--     contenter d'ajouter des règles ne ferme donc rien du tout.
--
--     Les politiques du storage ne sont supprimées que si leur définition
--     mentionne le bucket « images », afin de ne pas toucher aux autres buckets.
do $$
declare
  pol record;
begin
  for pol in
    select tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'images', 'testimonials', 'achievements')
  loop
    raise notice 'Politique supprimée : %.% -> %', 'public', pol.tablename, pol.policyname;
    execute format('drop policy %I on public.%I', pol.policyname, pol.tablename);
  end loop;

  for pol in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (coalesce(qual, '') || ' ' || coalesce(with_check, '')) like '%images%'
  loop
    raise notice 'Politique storage supprimée : %', pol.policyname;
    execute format('drop policy %I on storage.objects', pol.policyname);
  end loop;
end
$$;

-- 3b. Activation et politiques canoniques.
alter table public.profiles     enable row level security;
alter table public.images       enable row level security;
alter table public.testimonials enable row level security;
alter table public.achievements enable row level security;

-- Le profil est strictement privé : jamais de lecture publique.
drop policy if exists "profiles_owner_all" on public.profiles;
create policy "profiles_owner_all" on public.profiles
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Contenu : le propriétaire connecté gère ses propres lignes.
drop policy if exists "images_owner_all" on public.images;
create policy "images_owner_all" on public.images
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "testimonials_owner_all" on public.testimonials;
create policy "testimonials_owner_all" on public.testimonials
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "achievements_owner_all" on public.achievements;
create policy "achievements_owner_all" on public.achievements
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 3 bis. Lecture publique pour le site vitrine — OPTIONNEL
--
--   À n'activer QUE si le site vitrine lit ces tables sans authentification.
--   La lecture seule est ouverte ; l'écriture reste réservée au propriétaire
--   grâce aux policies ci-dessus. `profiles` n'est JAMAIS concerné.
--
--   Si le site vitrine ne lit pas directement Supabase, laissez ce bloc commenté.
-- -----------------------------------------------------------------------------
-- drop policy if exists "images_public_read" on public.images;
-- create policy "images_public_read" on public.images
--   for select to anon using (true);
--
-- drop policy if exists "testimonials_public_read" on public.testimonials;
-- create policy "testimonials_public_read" on public.testimonials
--   for select to anon using (true);
--
-- drop policy if exists "achievements_public_read" on public.achievements;
-- create policy "achievements_public_read" on public.achievements
--   for select to anon using (true);


-- -----------------------------------------------------------------------------
-- 4. Création automatique du profil à l'inscription
--
--    Remplace l'ancien rollback côté client, qui appelait supabase.auth.admin
--    depuis le navigateur — un appel qui échoue toujours, car l'API admin exige
--    la clé service_role (qui ne doit jamais quitter le serveur).
--    Ici le profil est créé dans la même transaction que l'utilisateur :
--    plus aucun compte orphelin possible.
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Rattrape les comptes déjà créés sans profil (séquelles de l'ancien code).
insert into public.profiles (id, name)
select u.id, coalesce(u.raw_user_meta_data ->> 'name', '')
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;


-- -----------------------------------------------------------------------------
-- 5. Storage — bucket « images »
--    Créez d'abord le bucket dans Storage → Buckets (nom exact : images).
--    Les fichiers sont rangés sous <user_id>/<uuid>.<ext>, donc le premier
--    segment du chemin identifie le propriétaire.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

drop policy if exists "images_public_read" on storage.objects;
create policy "images_public_read" on storage.objects
  for select to public
  using (bucket_id = 'images');

drop policy if exists "images_owner_insert" on storage.objects;
create policy "images_owner_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "images_owner_update" on storage.objects;
create policy "images_owner_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "images_owner_delete" on storage.objects;
create policy "images_owner_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- -----------------------------------------------------------------------------
-- 5 bis. Fermer le listing anonyme du bucket — OPTIONNEL
--
--   Constat : avec la politique `images_public_read` ci-dessus, n'importe qui
--   peut appeler `storage.list()` et obtenir l'inventaire du bucket — noms de
--   dossiers (les UUID des comptes), noms de fichiers, tailles et dates. Le
--   contenu lui-même était déjà public, seule la liste fuite.
--
--   Ce qui suit réserve le SELECT au propriétaire. Le téléchargement direct
--   via /storage/v1/object/public/... n'est en principe pas concerné : sur un
--   bucket `public = true`, Supabase le sert sans consulter la RLS.
--
--   ⚠️  « en principe » : ce point n'a pas été vérifié de bout en bout sur ce
--   projet. Si le site vitrine affiche ces images, procéder ainsi :
--     1. exécuter le bloc ci-dessous ;
--     2. ouvrir une image du site dans une fenêtre de navigation privée ;
--     3. si elle s'affiche encore, c'est bon ; sinon rejouer schema.sql tel
--        quel, ce bloc redevenant commenté, pour revenir en arrière.
-- -----------------------------------------------------------------------------
-- drop policy if exists "images_public_read" on storage.objects;
-- create policy "images_owner_read" on storage.objects
--   for select to authenticated
--   using (
--     bucket_id = 'images'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );


-- -----------------------------------------------------------------------------
-- 6. Vérification — à exécuter après coup
-- -----------------------------------------------------------------------------

-- 6a. Les quatre lignes doivent afficher rowsecurity = true.
-- select tablename, rowsecurity
-- from pg_tables
-- where schemaname = 'public'
--   and tablename in ('profiles', 'images', 'testimonials', 'achievements');

-- 6b. Politiques réellement en place.
--
--     À relire attentivement : `profiles` avait déjà la RLS active avant ce
--     script, donc au moins une politique préexistante s'y trouve sous un autre
--     nom. Les politiques permissives se cumulent par OU — une ancienne règle
--     trop large annulerait le cloisonnement posé ici. Supprimer celles qui
--     font doublon avec `profiles_owner_all`.
-- select tablename, policyname, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'public'
-- order by tablename, policyname;

-- 6c. Politiques du bucket de stockage.
-- select policyname, roles, cmd, qual, with_check
-- from pg_policies
-- where schemaname = 'storage' and tablename = 'objects'
-- order by policyname;


-- -----------------------------------------------------------------------------
-- 7. Suppression de son propre compte
--
--    Le bouton « Supprimer mon compte » ne faisait rien : la suppression d'un
--    utilisateur passe par l'API admin, inaccessible depuis le navigateur.
--    Cette fonction `security definer` la rend possible pour l'utilisateur
--    connecté, et lui seul. Les `on delete cascade` des tables se chargent du
--    reste de ses données.
-- -----------------------------------------------------------------------------
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non connecté';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated;
