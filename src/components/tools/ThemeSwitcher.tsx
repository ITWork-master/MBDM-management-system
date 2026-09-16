import React from 'react';
import type { ThemeName } from '../../types/type';

interface ThemeSwitcherProps {
    value: ThemeName;
    onChange: (theme: ThemeName) => void;
}

/**
 * Interrupteur clair / sombre, entièrement contrôlé par son parent.
 *
 * La version précédente gardait une copie du thème dans un état local
 * initialisé une seule fois, et son effet de synchronisation dépendait de
 * `[setThemeValue]` — une fonction de mise à jour d'état, donc stable, si bien
 * que l'effet ne se rejouait jamais. Quand le profil arrivait après le premier
 * rendu, l'interrupteur affichait l'inverse du thème réellement appliqué.
 */
const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ value, onChange }) => (
    <label className="flex cursor-pointer gap-2" title="Basculer entre le thème clair et sombre">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>

        <input
            type="checkbox"
            className="toggle theme-controller"
            checked={value === 'dark'}
            onChange={(event) => onChange(event.target.checked ? 'dark' : 'light')}
            aria-label="Thème sombre"
        />

        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
    </label>
);

export default ThemeSwitcher;
