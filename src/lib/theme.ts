import type { ThemeName } from '../types/type';

/** Nom du thème daisyUI correspondant à chaque thème applicatif. */
const DAISY_THEME: Record<ThemeName, string> = {
    light: 'cupcake',
    dark: 'dark',
};

export const DEFAULT_THEME: ThemeName = 'light';

export const isThemeName = (value: unknown): value is ThemeName =>
    value === 'light' || value === 'dark';

/**
 * Unique endroit qui écrit `data-theme` sur le document.
 *
 * Auparavant quatre fonctions différentes (setView, initializeAuth, changeTheme
 * et un effet de Settings) le faisaient chacune de leur côté, avec des valeurs
 * qui pouvaient diverger.
 */
export const applyTheme = (theme: ThemeName): void => {
    document.documentElement.setAttribute('data-theme', DAISY_THEME[theme]);
};
