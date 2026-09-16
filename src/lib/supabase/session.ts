import { supabase } from './Supabase';

/** Message renvoyé par supabase-js quand aucune session n'est stockée. */
const NO_SESSION = /auth session missing/i;

/**
 * Identifiant de l'utilisateur courant, ou une erreur explicite.
 *
 * Module séparé pour être utilisable à la fois par `crud.service` et
 * `storage.service` sans créer d'import circulaire entre les deux.
 */
export const requireUserId = async (): Promise<string> => {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error) {
        // `getUser()` renvoie une erreur, et non `user: null`, quand il n'y a
        // simplement pas de session : on la traduit en message compréhensible.
        if (NO_SESSION.test(error.message)) throw new Error('Utilisateur non connecté');
        throw new Error(`Session invalide : ${error.message}`);
    }
    if (!user) throw new Error('Utilisateur non connecté');

    return user.id;
};
