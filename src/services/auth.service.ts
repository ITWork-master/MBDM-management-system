import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase/Supabase';
import { DEFAULT_THEME, isThemeName } from '../lib/theme';
import type { Profile, ThemeName } from '../types/type';

export const MIN_PASSWORD_LENGTH = 6;

/** Normalise la ligne `profiles` : le thème stocké peut être nul ou inconnu. */
const toProfile = (id: string, row: { name?: unknown; theme?: unknown } | null): Profile => ({
    id,
    name: typeof row?.name === 'string' ? row.name : '',
    theme: isThemeName(row?.theme) ? row.theme : DEFAULT_THEME,
});

/**
 * Inscription.
 *
 * Le profil est créé par le trigger `on_auth_user_created` (supabase/schema.sql),
 * dans la même transaction que l'utilisateur. Le code précédent l'insérait
 * depuis le navigateur et, en cas d'échec, appelait `supabase.auth.admin
 * .deleteUser()` — une API réservée à la clé `service_role`, donc un appel qui
 * échouait systématiquement côté client et laissait des comptes sans profil.
 */
export interface RegistrationResult {
    user: User;
    /** Vrai si Supabase exige une confirmation par e-mail avant connexion. */
    needsEmailConfirmation: boolean;
}

export const registerNewUser = async (
    email: string,
    password: string,
    name: string,
): Promise<RegistrationResult> => {
    if (!email || !password || !name) {
        throw new Error('Tous les champs sont requis');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(
            `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
        );
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // Le trigger lit `name` dans raw_user_meta_data.
        options: { data: { name } },
    });

    if (error) throw new Error(`Erreur d'inscription : ${error.message}`);
    if (!data.user) throw new Error('Aucun utilisateur retourné après inscription');

    // Filet de sécurité si le trigger n'est pas encore installé. Sans session
    // (confirmation d'e-mail activée) les RLS bloqueront l'insertion, d'où le
    // caractère purement optionnel de cette tentative.
    if (data.session) {
        await supabase
            .from('profiles')
            .upsert({ id: data.user.id, name }, { onConflict: 'id' });
    }

    return { user: data.user, needsEmailConfirmation: !data.session };
};

export const loginUser = async (email: string, password: string): Promise<User> => {
    if (!email || !password) {
        throw new Error('Email et mot de passe sont requis');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw new Error(`Erreur de connexion : ${error.message}`);
    if (!data.user) throw new Error('Aucun utilisateur retourné après connexion');

    return data.user;
};

export const logoutUser = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(`Erreur de déconnexion : ${error.message}`);
};

/** Profil de l'utilisateur, ou valeurs par défaut s'il n'en a pas encore. */
export const fetchProfile = async (userId: string): Promise<Profile> => {
    const { data, error } = await supabase
        .from('profiles')
        .select('name, theme')
        .eq('id', userId)
        .maybeSingle();

    if (error) throw new Error(`Erreur de chargement du profil : ${error.message}`);
    return toProfile(userId, data);
};

/**
 * Change le mot de passe.
 *
 * La version précédente faisait `return error` au lieu de lever : l'appelant ne
 * voyait jamais l'échec et l'interface affichait « Mot de passe modifié avec
 * succès » quoi qu'il arrive.
 */
export const updatePassword = async (newPassword: string): Promise<void> => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
        throw new Error(
            `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères`,
        );
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(`Erreur lors du changement de mot de passe : ${error.message}`);
};

export const updateUserTheme = async (userId: string, theme: ThemeName): Promise<void> => {
    const { error } = await supabase.from('profiles').update({ theme }).eq('id', userId);
    if (error) throw new Error(`Erreur lors du changement de thème : ${error.message}`);
};

/**
 * Supprime définitivement le compte de l'utilisateur connecté.
 *
 * Passe par la fonction `delete_own_account` (supabase/schema.sql) : l'API
 * admin de Supabase exige la clé `service_role`, qui n'a rien à faire dans un
 * navigateur. Les `on delete cascade` des tables suppriment les données liées.
 */
export const deleteOwnAccount = async (): Promise<void> => {
    const { error } = await supabase.rpc('delete_own_account');
    if (error) throw new Error(`Erreur lors de la suppression du compte : ${error.message}`);

    // `scope: 'local'` : inutile de tenter de révoquer les autres sessions d'un
    // compte qui n'existe plus.
    //
    // À noter : auth-js appelle /auth/v1/logout quel que soit le scope, et le
    // serveur répond 403 « User from sub claim in JWT does not exist » puisque
    // l'utilisateur vient d'être supprimé. La bibliothèque ignore volontairement
    // ce cas (elle traite 401/403/404 comme un succès), la session locale est
    // bien vidée. Seule trace : une ligne rouge dans l'onglet réseau, sans effet.
    await supabase.auth.signOut({ scope: 'local' });
};
