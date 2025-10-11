// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, AppView } from '../types/type';
import { supabase } from '../lib/supabase/Supabase';
import { loginUser, logoutUser, registerNewUser, updatePassword, updateUserTheme } from '../services/supabase.service';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (newPassword: string) => Promise<void>;
    changeTheme: (theme: string) => Promise<void>;
    setView: (view: AppView, addToHistory?: boolean) => void;
    currentView: AppView;
    setLoading: (loading: boolean) => void;
    loading: boolean;
    clearError: () => void;
    goBack: () => void;
    canGoBack: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Historique des vues
const viewHistory: AppView[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        userName: null,
        userTheme: 'light',
        error: null,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<AppView>('login');
    const [canGoBack, setCanGoBack] = useState<boolean>(false);

    // Fonction utilitaire pour mettre à jour l'état
    const updateAuthState = (updates: Partial<AuthState>) => {
        setAuthState(prev => ({ ...prev, ...updates }));
    };

    // Fonction pour gérer les erreurs de manière cohérente
    const handleError = (error: any, defaultMessage: string) => {
        const errorMessage = error?.message || defaultMessage;
        updateAuthState({ error: errorMessage });
        console.error(defaultMessage, error);
    };

    // Fonction pour effacer les erreurs
    const clearError = () => {
        updateAuthState({ error: null });
    };

    // Fonction pour naviguer vers une vue
    const setView = (view: AppView, addToHistory: boolean = true) => {
        clearError();

        if (addToHistory && view !== currentView) {
            viewHistory.push(currentView);
            setCanGoBack(viewHistory.length > 0);

            // Mettre à jour l'URL dans l'historique du navigateur
            window.history.pushState({ view }, '', `#${view}`);
        }

        if (authState.userTheme === 'light') {
            document.documentElement.setAttribute('data-theme', "cupcake");
        } else {
            document.documentElement.setAttribute('data-theme', "dark");
        }

        setLoading(true);
        setTimeout(() => {
            setCurrentView(view);
            setLoading(false);
        }, 500);
    };

    // Fonction pour retourner en arrière
    const goBack = () => {
        if (viewHistory.length > 0) {
            const previousView = viewHistory.pop() as AppView;
            setCanGoBack(viewHistory.length > 0);

            // Revenir à l'état précédent dans l'historique du navigateur
            window.history.back();

            setView(previousView, false);
        } else {
            // Si pas d'historique, aller à la vue par défaut
            setView('login', false);
        }
    };

    // Gestionnaire d'événement pour le bouton retour du navigateur
    const handlePopState = (event: PopStateEvent) => {
        if (viewHistory.length > 0) {
            const previousView = viewHistory.pop() as AppView;
            setCanGoBack(viewHistory.length > 0);

            setLoading(true);
            setTimeout(() => {
                setCurrentView(previousView);
                setLoading(false);
            }, 500);
        } else if (currentView !== 'login') {
            // Si on est pas sur la vue login et qu'on n'a pas d'historique, aller au login
            setView('login', false);
        }
        // Si on est sur login et qu'on n'a pas d'historique, empêcher de quitter l'app
        event.preventDefault();
    };

    // Gestionnaire pour beforeunload (quand l'utilisateur essaie de quitter la page)
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
        if (currentView !== 'login') {
            // Demander confirmation seulement si on n'est pas sur la page de login
            event.preventDefault();
            event.returnValue = 'Voulez-vous vraiment quitter cette page ?';
            return 'Voulez-vous vraiment quitter cette page ?';
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    handleError(error, 'Erreur lors de la vérification de la session');
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session?.user.id)
                    .maybeSingle();

                if (profileError) {
                    throw new Error(`Erreur chargement profil: ${profileError.message}`);
                }

                updateAuthState({
                    user: session?.user ?? null,
                    userTheme: profile?.theme
                });

                if (profile?.theme === 'light') document.documentElement.setAttribute('data-theme', "cupcake")
                else document.documentElement.setAttribute('data-theme', "dark");

                if (session?.user) {
                    setView('dashboard', true);
                } else {
                    // Initialiser l'historique du navigateur
                    window.history.replaceState({ view: 'login' }, '', '#login');
                }
            } catch (error) {
                handleError(error, 'Erreur inattendue lors de l\'initialisation de l\'auth');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Ajouter les écouteurs d'événements
        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleBeforeUnload);

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log(event);
                updateAuthState({
                    user: session?.user ?? null,
                    error: null,
                });

                if (session?.user) {
                    setView('dashboard', true);
                } else {
                    // Réinitialiser l'historique quand on se déconnecte
                    viewHistory.length = 0;
                    setCanGoBack(false);
                    setView('login', true);
                }
            }
        );

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('popstate', handlePopState);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            clearError();

            if (!email || !password) {
                throw new Error('Email et mot de passe sont requis');
            }

            const data = await loginUser(email, password);

            updateAuthState({
                user: data?.user,
                userName: data?.profile.name,
                error: null,
            });

            // Le changement d'état sera géré par onAuthStateChange

        } catch (error: any) {
            handleError(error, 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const register = async (email: string, password: string, name: string) => {
        try {
            setLoading(true);
            clearError();

            if (!email || !password || !name) {
                throw new Error('Tous les champs sont requis');
            }

            await registerNewUser(email, password, name);

            // Après inscription, on peut rediriger vers login
            setView('login', true);

        } catch (error: any) {
            handleError(error, "Erreur d'inscription");
        } finally {
            setLoading(false);
        }
    };

    const changePassword = async (newPassword: string) => {
        try {
            setLoading(true);
            clearError();
            await updatePassword(newPassword);
        } catch (error: any) {
            handleError(error, 'Erreur lors du changement de mot de passe');
        } finally {
            setLoading(false);
        }
    }

    const logout = async () => {
        try {
            setLoading(true);
            clearError();
            await logoutUser();
        } catch (error: any) {
            handleError(error, 'Erreur de déconnexion');
        } finally {
            setLoading(false);
        }
    };

    const changeTheme = async (theme: string) => {
        try {
            setLoading(true);
            clearError();

            if (!authState.user) {
                throw new Error('Utilisateur non connecté');
            }

            await updateUserTheme(authState.user.id, theme);

            updateAuthState({
                userTheme: theme
            });

            if (theme === 'light') {
                document.documentElement.setAttribute('data-theme', "cupcake");
            } else {
                document.documentElement.setAttribute('data-theme', "dark");
            }

            console.log(`Thème changé vers: ${theme}`);

        } catch (error: any) {
            handleError(error, 'Erreur lors du changement de thème');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                loading,
                login,
                register,
                changePassword,
                changeTheme,
                logout,
                setView,
                currentView,
                setLoading,
                clearError,
                goBack,
                canGoBack,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};