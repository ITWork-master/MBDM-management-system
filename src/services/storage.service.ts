import { supabase } from '../lib/supabase/Supabase';
import { requireUserId } from '../lib/supabase/session';
import { EXTENSION_BY_MIME, validateImageFile } from '../lib/image';
import { toMessage } from '../lib/errors';

/** Bucket de stockage des images — à ne pas confondre avec la TABLE `images`,
 *  qui contient les produits (cf. PRODUCTS_TABLE dans products.service.ts). */
export const IMAGE_BUCKET = 'images';

const PUBLIC_URL_MARKER = `/storage/v1/object/public/${IMAGE_BUCKET}/`;

/** `crypto.randomUUID` n'existe qu'en contexte sécurisé (https ou localhost). */
const randomId = (): string =>
    typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Envoie un fichier dans le bucket et renvoie son URL publique.
 *
 * Le fichier est rangé sous `<user_id>/<uuid>.<ext>` : le premier segment sert
 * aux politiques RLS du storage pour identifier le propriétaire.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const invalid = validateImageFile(file);
    if (invalid) throw new Error(invalid);

    const userId = await requireUserId();

    // L'extension vient du type MIME vérifié, pas du nom fourni par le client.
    const extension = EXTENSION_BY_MIME[file.type] ?? 'jpg';
    const path = `${userId}/${randomId()}.${extension}`;

    const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
        throw new Error(`Erreur lors de l'envoi de l'image : ${uploadError.message}`);
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);

    return publicUrl;
};

/** Chemin interne au bucket à partir d'une URL publique, ou `null` si l'URL
 *  ne pointe pas vers ce bucket. */
const storagePathFromUrl = (imageUrl: string): string | null => {
    try {
        const { pathname } = new URL(imageUrl);
        const index = pathname.indexOf(PUBLIC_URL_MARKER);
        if (index === -1) return null;
        return decodeURIComponent(pathname.slice(index + PUBLIC_URL_MARKER.length)) || null;
    } catch {
        return null;
    }
};

/**
 * Supprime une image du bucket, au mieux.
 *
 * Ne lève jamais : un fichier orphelin est un désagrément, alors qu'échouer ici
 * ferait remonter une erreur sur une suppression de ligne déjà réussie. Les
 * deux services divergeaient auparavant sur ce point — l'un relançait
 * l'exception, l'autre lançait la promesse sans l'attendre.
 */
export const deleteImage = async (imageUrl: string | null | undefined): Promise<void> => {
    if (!imageUrl) return;

    const path = storagePathFromUrl(imageUrl);
    if (!path) return;

    try {
        const { data, error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
        if (error) {
            console.warn(`Image non supprimée du stockage (${path}) : ${error.message}`);
        } else if (!data || data.length === 0) {
            // Piège de supabase-js : un refus des politiques du bucket ne
            // remonte aucune erreur, seulement une liste de suppressions vide.
            console.warn(
                `Image non supprimée du stockage (${path}) : fichier absent ou permission refusée.`,
            );
        }
    } catch (error) {
        console.warn(`Image non supprimée du stockage (${path}) :`, toMessage(error));
    }
};
