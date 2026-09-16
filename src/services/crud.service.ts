import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/Supabase';
import { requireUserId } from '../lib/supabase/session';
import { deleteImage } from './storage.service';
import type { BaseEntity } from '../types/type';

/** Fragments de phrase utilisés pour composer les messages d'erreur.
 *  Exemple pour les produits : `{ one: 'du produit', many: 'des produits' }`. */
export interface EntityLabels {
    one: string;
    many: string;
}

export interface CrudService<T, CreateData, UpdateData> {
    list(): Promise<T[]>;
    getById(id: string): Promise<T>;
    create(data: CreateData): Promise<T>;
    update(id: string, data: UpdateData): Promise<T>;
    remove(id: string): Promise<void>;
}

interface CrudConfig {
    table: string;
    labels: EntityLabels;
    /** Si vrai, la colonne `image_url` est nettoyée du bucket lors des
     *  remplacements et des suppressions. */
    hasImage?: boolean;
}

const fail = (context: string, error: PostgrestError): never => {
    throw new Error(`${context} : ${error.message}`);
};

/**
 * Fabrique le CRUD d'une table.
 *
 * Les trois services (produits, interventions, témoignages) étaient auparavant
 * trois copies du même fichier ; seuls le nom de la table et les libellés
 * changeaient réellement.
 *
 * Toutes les requêtes — y compris les mises à jour et les suppressions —
 * filtrent explicitement sur `user_id`. Les RLS restent la vraie barrière
 * (cf. supabase/schema.sql), mais un filtre côté client évite qu'une policy
 * trop permissive se traduise directement par une fuite.
 */
export const createCrudService = <
    T extends BaseEntity,
    CreateData extends object,
    UpdateData extends object,
>(
    config: CrudConfig,
): CrudService<T, CreateData, UpdateData> => {
    const { table, labels, hasImage = false } = config;

    /** URL de l'image actuellement rattachée à la ligne, si la table en a une. */
    const currentImageUrl = async (id: string, userId: string): Promise<string | null> => {
        if (!hasImage) return null;
        const { data } = await supabase
            .from(table)
            .select('image_url')
            .eq('id', id)
            .eq('user_id', userId)
            .maybeSingle();
        return (data?.image_url as string | null) ?? null;
    };

    return {
        async list() {
            const userId = await requireUserId();
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) fail(`Erreur lors du chargement ${labels.many}`, error);
            return (data ?? []) as T[];
        },

        async getById(id) {
            const userId = await requireUserId();
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .single();

            if (error) fail(`Erreur lors du chargement ${labels.one}`, error);
            return data as T;
        },

        async create(payload) {
            const userId = await requireUserId();
            const { data, error } = await supabase
                .from(table)
                .insert([{ ...payload, user_id: userId }])
                .select()
                .single();

            if (error) fail(`Erreur lors de la création ${labels.one}`, error);
            return data as T;
        },

        async update(id, payload) {
            const userId = await requireUserId();
            const previousImage = await currentImageUrl(id, userId);

            const { data, error } = await supabase
                .from(table)
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .single();

            if (error) fail(`Erreur lors de la mise à jour ${labels.one}`, error);

            // L'ancienne image n'était jamais supprimée lors d'un remplacement :
            // le bucket accumulait indéfiniment des fichiers inaccessibles.
            const nextImage = (data as T & { image_url?: string | null }).image_url ?? null;
            if (hasImage && previousImage && previousImage !== nextImage) {
                await deleteImage(previousImage);
            }

            return data as T;
        },

        async remove(id) {
            const userId = await requireUserId();
            const image = await currentImageUrl(id, userId);

            // La ligne d'abord : un fichier orphelin se rattrape, une ligne qui
            // pointe vers une image supprimée est un bug visible à l'écran.
            //
            // `.select()` force PostgREST à retourner les lignes effectivement
            // supprimées. Sans lui, une suppression refusée par les politiques
            // RLS ne remonte aucune erreur : l'interface annoncerait un succès
            // alors que la ligne réapparaît au rechargement suivant.
            const { data, error } = await supabase
                .from(table)
                .delete()
                .eq('id', id)
                .eq('user_id', userId)
                .select('id');

            if (error) fail(`Erreur lors de la suppression ${labels.one}`, error);
            if (!data || data.length === 0) {
                throw new Error(
                    `Erreur lors de la suppression ${labels.one} : ligne introuvable ou accès refusé`,
                );
            }

            await deleteImage(image);
        },
    };
};
