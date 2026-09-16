import { createContext, useContext } from 'react';
import type { AppView, AuthState, ThemeName } from '../types/type';

export interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (newPassword: string) => Promise<boolean>;
    /** Envoie le lien de réinitialisation à l'adresse indiquée. */
    sendPasswordReset: (email: string) => Promise<boolean>;
    /** L'utilisateur est arrivé par un lien de récupération et doit choisir un
     *  nouveau mot de passe avant d'accéder au reste de l'application. */
    isRecovering: boolean;
    completePasswordRecovery: (newPassword: string) => Promise<boolean>;
    cancelPasswordRecovery: () => Promise<void>;
    changeTheme: (theme: ThemeName) => Promise<void>;
    setView: (view: AppView) => void;
    goBack: () => void;
    canGoBack: boolean;
    currentView: AppView;
    /** Résolution de la session au démarrage : affiche l'écran de chargement. */
    initializing: boolean;
    /** Une action d'authentification est en cours. */
    pending: boolean;
    clearError: () => void;
}

/** Séparé de `AuthContext.tsx` pour que ce fichier-là n'exporte qu'un
 *  composant, condition du rafraîchissement à chaud de Vite. */
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
