// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { AuthState, AppView } from '../types/type';
import { supabase } from '../lib/supabase/Supabase';
import { loginUser, logoutUser, registerNewUser, updatePassword } from '../services/supabase.service';

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (newPassword : string) => Promise<void>;
    setView: (view: AppView) => void;
    currentView: AppView;
    setLoading: (loading: boolean) => void;
    loading: boolean;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        userName: null,
        error: null,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [currentView, setCurrentView] = useState<AppView>('login');

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

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                setLoading(true);
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    handleError(error, 'Erreur lors de la vérification de la session');
                    return;
                }

                updateAuthState({
                    user: session?.user ?? null,
                });

                if (session?.user) {
                    setCurrentView('dashboard');
                }
            } catch (error) {
                handleError(error, 'Erreur inattendue lors de l\'initialisation de l\'auth');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                updateAuthState({
                    user: session?.user ?? null,
                    error: null,
                });

                if (session?.user) {
                    setCurrentView('dashboard');
                } else {
                    setCurrentView('login');
                }
            }
        );

        return () => subscription.unsubscribe();
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

            // On ne change pas directement la vue ici, on attend la confirmation email si nécessaire
            // L'utilisateur sera redirigé vers le login après confirmation

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
            updatePassword(newPassword);
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
            logoutUser();
        } catch (error: any) {
            handleError(error, 'Erreur de déconnexion');
        } finally {
            setLoading(false);
        }
    };

    const setView = (view: AppView) => {
        clearError();
        setLoading(true)
        setTimeout(() => {
            setCurrentView(view);
            setLoading(false)
        }, 500)
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                loading,
                login,
                register,
                changePassword,
                logout,
                setView,
                currentView,
                setLoading,
                clearError,
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