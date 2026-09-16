/**
 * Extrait un message lisible de n'importe quelle valeur levée.
 *
 * Remplace les `catch (error: any)` disséminés dans le code : en TypeScript la
 * valeur attrapée est de type `unknown`, et c'est le seul endroit qui doit
 * savoir comment la réduire à une chaîne.
 */
export const toMessage = (error: unknown, fallback = 'Une erreur est survenue'): string => {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string' && error) return error;
    if (error && typeof error === 'object' && 'message' in error) {
        const { message } = error as { message: unknown };
        if (typeof message === 'string' && message) return message;
    }
    return fallback;
};
