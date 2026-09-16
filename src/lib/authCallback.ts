/**
 * Paramètres du lien de retour envoyé par Supabase (récupération de mot de
 * passe, confirmation d'adresse…).
 *
 * Ils arrivent dans le fragment d'URL — `#access_token=…&type=recovery` — que
 * l'application utilise par ailleurs pour sa propre navigation. Deux précautions
 * en découlent :
 *
 *   - la lecture se fait à l'import du module, donc avant que supabase-js
 *     (`detectSessionInUrl`) ne nettoie le fragment ;
 *   - `isAuthCallback` permet à AuthContext de ne pas réécrire l'historique
 *     tant que le fragment contient ces paramètres, sous peine de les effacer
 *     avant que le client Supabase ait pu les lire.
 */
const params = new URLSearchParams(
    typeof window === 'undefined' ? '' : window.location.hash.replace(/^#/, ''),
);

const hasQueryCode =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code');

export const AUTH_CALLBACK = {
    /** Le fragment porte un jeton ou une erreur d'authentification. */
    isCallback:
        params.has('access_token') || params.has('error') || params.has('error_code') || hasQueryCode,
    /** `recovery`, `signup`, `invite`… selon le lien cliqué. */
    type: params.get('type'),
    /** Message d'erreur lisible, par exemple pour un lien expiré. */
    errorDescription: params.get('error_description')?.replace(/\+/g, ' ') ?? null,
} as const;

export const isRecoveryCallback = (): boolean => AUTH_CALLBACK.type === 'recovery';
