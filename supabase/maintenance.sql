-- =============================================================================
--  MBDM — requêtes de maintenance (lecture seule)
--  À exécuter dans l'éditeur SQL de Supabase quand le besoin s'en fait sentir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Fichiers orphelins du bucket « images »
--
--    Un orphelin est un fichier que plus aucune ligne ne référence. Ils
--    provenaient de deux causes, toutes deux corrigées dans le code :
--      * un remplacement d'image ne supprimait jamais l'ancienne ;
--      * `supabase-js` ne remonte aucune erreur quand les politiques du bucket
--        refusent une suppression (il renvoie `{ error: null, data: [] }`),
--        si bien que l'application croyait avoir nettoyé.
--
--    Les `.emptyFolderPlaceholder` sont créés par l'interface Supabase et
--    peuvent être ignorés.
-- -----------------------------------------------------------------------------
select
  o.name                                   as chemin,
  pg_size_pretty((o.metadata ->> 'size')::bigint) as taille,
  o.created_at,
  (storage.foldername(o.name))[1]          as proprietaire
from storage.objects o
where o.bucket_id = 'images'
  and o.name not like '%.emptyFolderPlaceholder'
  and not exists (
    select 1 from public.images i
    where i.image_url like '%' || o.name
  )
  and not exists (
    select 1 from public.achievements a
    where a.image_url like '%' || o.name
  )
order by o.created_at;


-- -----------------------------------------------------------------------------
-- 2. Cas inverse : lignes dont l'image n'existe plus dans le bucket
--    (aucune à ce jour ; requête fournie pour le suivi)
-- -----------------------------------------------------------------------------
select 'images' as source, i.id, i.title, i.image_url
from public.images i
where i.image_url is not null
  and not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'images' and i.image_url like '%' || o.name
  )
union all
select 'achievements', a.id, a.title, a.image_url
from public.achievements a
where a.image_url is not null
  and not exists (
    select 1 from storage.objects o
    where o.bucket_id = 'images' and a.image_url like '%' || o.name
  );


-- -----------------------------------------------------------------------------
-- 3. Comptes sans profil applicatif
--    `schema.sql` en installe un pour les nouveaux comptes et rattrape les
--    anciens ; cette requête vérifie qu'il n'en reste aucun.
-- -----------------------------------------------------------------------------
select u.id, u.email, u.created_at
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;


-- -----------------------------------------------------------------------------
-- 4. Contrôle de la RLS — les quatre lignes doivent afficher `true`
-- -----------------------------------------------------------------------------
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('profiles', 'images', 'testimonials', 'achievements');


-- -----------------------------------------------------------------------------
-- Suppression des orphelins
--
--   NE PAS supprimer les lignes de `storage.objects` en SQL : sur Supabase
--   hébergé, l'objet reste stocké côté S3 et seule la référence disparaît, ce
--   qui aggrave le problème au lieu de le résoudre.
--
--   Passer par Storage → images → sélectionner les fichiers → Delete.
-- -----------------------------------------------------------------------------
