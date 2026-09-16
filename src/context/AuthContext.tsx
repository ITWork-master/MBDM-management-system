// src/context/AuthContext.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase/Supabase';
import {
    fetchProfile,
    loginUser,
    logoutUser,
    registerNewUser,
    updatePassword,
    updateUserTheme,
} from '../services/auth.service';
import { applyTheme, DEFAULT_THEME } from '../lib/theme';
import { toMessage } from '../lib/errors';
import { AuthContext } from './useAuth';
import { APP_VIEWS, PUBLIC_VIEWS } from '../types/type';
import type { AppView, ThemeName } from '../types/type';

const isAppView = (value: unknown): value is AppView =>
    APP_VIEWS.includes(value as AppView);

/** Vue demandée par le fragment d'URL, si elle est reconnue. */
const viewFromHash = (): AppView | null => {
    const hash = window.location.hash.replace(/^#/, '');
    return isAppView(hash) ? hash : null;
};

interface HistoryEntry {
    view?: unknown;
    depth?: unknown;
}

const historyDepth = (): number => {
    const { depth } = (window.history.state ?? {}) as HistoryEntry;
    return typeof depth === 'number' ? depth : 0;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userName, setUserName] = useState<string | null>(null);
    const [userTheme, setUserTheme] = useState<ThemeName>(DEFAULT_THEME);
    const [error, setError] = useState<string | null>(null);
    const [initializing, setInitializing] = useState(true);
    const [pending, setPending] = useState(false);
    const [currentView, setCurrentView] = useState<AppView>(() => viewFromHash() ?? 'login');
    const [canGoBack, setCanGoBack] = useState(false);

    // Reflet synchrone de `currentView`, pour comparer sans dépendre du rendu.
    const currentViewRef = useRef<AppView>(currentView);

    const clearError = useCallback(() => setError(null), []);

    // -- Navigation ---------------------------------------------------------
    //
    // L'état de navigation vit dans `window.history`, et nulle part ailleurs.
    // La version précédente maintenait en parallèle un tableau `viewHistory`
    // déclaré au niveau du module : il survivait aux démontages, grossissait
    // indéfiniment, et `goBack()` le dépilait *puis* appelait
    // `window.history.back()`, ce qui déclenchait `popstate` et le dépilait une
    // seconde fois — d'où deux vues sautées à chaque retour.

    const navigate = useCallback((view: AppView, replace: boolean) => {
        if (currentViewRef.current === view && !replace) return;

        const depth = replace ? 0 : historyDepth() + 1;
        const entry = { view, depth };
        const url = `#${view}`;

        if (replace) window.history.replaceState(entry, '', url);
        else window.history.pushState(entry, '', url);

        currentViewRef.current = view;
        setCurrentView(view);
        setCanGoBack(depth > 0);
        setError(null);
    }, []);

    const setView = useCallback((view: AppView) => navigate(view, false), [navigate]);
    const replaceView = useCallback((view: AppView) => navigate(view, true), [navigate]);

    const goBack = useCallback(() => {
        if (historyDepth() > 0) window.history.back();
        else replaceView('dashboard');
    }, [replaceView]);

    // Ancre l'entrée d'historique initiale, pour que `popstate` ait un état à lire.
    useEffect(() => {
        if (!window.history.state) {
            window.history.replaceState(
                { view: currentViewRef.current, depth: 0 },
                '',
                `#${currentViewRef.current}`,
            );
        }
    }, []);

    useEffect(() => {
        const handlePopState = (event: PopStateEvent) => {
            const state = (event.state ?? {}) as HistoryEntry;
            const view = isAppView(state.view) ? state.view : (viewFromHash() ?? 'login');

            currentViewRef.current = view;
            setCurrentView(view);
            setCanGoBack(typeof state.depth === 'number' && state.depth > 0);
            setError(null);
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // -- Session ------------------------------------------------------------

    useEffect(() => {
        let active = true;

        // Conserve la référence précédente quand l'utilisateur est le même, pour
        // qu'un simple rafraîchissement de jeton ne relance pas les effets.
        const applySession = (next: User | null) =>
            setUser((previous) => (previous?.id === next?.id ? previous : next));

        supabase.auth
            .getSession()
            .then(({ data, error: sessionError }) => {
                if (!active) return;
                if (sessionError) setError(toMessage(sessionError, 'Session illisible'));
                applySession(data.session?.user ?? null);
            })
            .finally(() => {
                if (active) setInitializing(false);
            });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            if (!active) return;
            // Ne jamais appeler d'autre méthode Supabase ici : le client
            // sérialise ses appels et se bloquerait. Le profil est chargé par
            // l'effet ci-dessous, en réaction au changement d'utilisateur.
            applySession(session?.user ?? null);
            setInitializing(false);
        });

        return () => {
            active = false;
            subscription.unsubscribe();
        };
    }, []);

    // -- Profil (nom et thème) ----------------------------------------------

    useEffect(() => {
        if (!user) {
            setUserName(null);
            setUserTheme(DEFAULT_THEME);
            return;
        }

        let active = true;
        fetchProfile(user.id)
            .then((profile) => {
                if (!active) return;
                setUserName(profile.name || null);
                setUserTheme(profile.theme);
            })
            .catch((cause) => {
                if (!active) return;
                setError(toMessage(cause, 'Erreur de chargement du profil'));
            });

        return () => {
            active = false;
        };
    }, [user]);

    // Unique application du thème au document.
    useEffect(() => {
        applyTheme(userTheme);
    }, [userTheme]);

    // -- Garde d'accès ------------------------------------------------------
    //
    // Remplace `ProtectedRoutes.tsx`, qui était un fichier vide. Couvre d'un
    // seul tenant la redirection après connexion, celle après déconnexion, et
    // l'accès direct à `#settings` sans session.

    useEffect(() => {
        if (initializing) return;

        const isPublicView = PUBLIC_VIEWS.includes(currentView);
        if (!user && !isPublicView) replaceView('login');
        else if (user && isPublicView) replaceView('dashboard');
    }, [initializing, user, currentView, replaceView]);

    // -- Actions ------------------------------------------------------------

    const run = useCallback(
        async <T,>(action: () => Promise<T>, fallbackMessage: string): Promise<T | null> => {
            setPending(true);
            setError(null);
            try {
                return await action();
            } catch (cause) {
                const message = toMessage(cause, fallbackMessage);
                setError(message);
                toast.error(message);
                return null;
            } finally {
                setPending(false);
            }
        },
        [],
    );

    const login = useCallback(
        async (email: string, password: string) => {
            // La redirection est assurée par la garde d'accès, une fois que
            // `onAuthStateChange` a publié la nouvelle session.
            await run(() => loginUser(email, password), 'Erreur de connexion');
        },
        [run],
    );

    const register = useCallback(
        async (email: string, password: string, name: string) => {
            const result = await run(
                () => registerNewUser(email, password, name),
                "Erreur d'inscription",
            );
            if (!result) return;

            if (result.needsEmailConfirmation) {
                toast.success('Inscription réussie. Confirmez votre adresse e-mail pour vous connecter.');
                replaceView('login');
            } else {
                toast.success('Inscription réussie.');
            }
        },
        [run, replaceView],
    );

    const logout = useCallback(async () => {
        await run(logoutUser, 'Erreur de déconnexion');
    }, [run]);

    const changePassword = useCallback(
        async (newPassword: string) => {
            const result = await run(
                async () => {
                    await updatePassword(newPassword);
                    return true as const;
                },
                'Erreur lors du changement de mot de passe',
            );

            if (result) toast.success('Mot de passe modifié.');
            return result === true;
        },
        [run],
    );

    const changeTheme = useCallback(
        async (theme: ThemeName) => {
            if (!user) {
                setError('Utilisateur non connecté');
                return;
            }

            const result = await run(async () => {
                await updateUserTheme(user.id, theme);
                return true as const;
            }, 'Erreur lors du changement de thème');

            if (result) {
                setUserTheme(theme);
                toast.success('Thème appliqué.');
            }
        },
        [run, user],
    );

    return (
        <AuthContext.Provider
            value={{
                user,
                userName,
                userTheme,
                error,
                initializing,
                pending,
                currentView,
                canGoBack,
                login,
                register,
                logout,
                changePassword,
                changeTheme,
                setView,
                goBack,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
