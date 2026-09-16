// src/App.tsx
import React from 'react';
import { Toaster } from 'sonner';
import { useAuth } from './context/useAuth';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Dashboard from './components/dashboard/Dashboard';
import Products from './components/Products';
import Testimonials from './components/Testimonials';
import Achievements from './components/Achievements';
import Settings from './components/Settings';
import type { AppView } from './types/type';

const VIEWS: Record<AppView, React.ComponentType> = {
    login: Login,
    register: Register,
    'forgot-password': ForgotPassword,
    'reset-password': ResetPassword,
    dashboard: Dashboard,
    products: Products,
    testimonials: Testimonials,
    achievements: Achievements,
    settings: Settings,
};

const App: React.FC = () => {
    const { currentView, initializing, userTheme } = useAuth();

    // La table couvre exhaustivement `AppView` : ajouter une vue sans l'y
    // déclarer devient une erreur de compilation, là où le `switch` précédent
    // retombait silencieusement sur l'écran de connexion.
    const View = VIEWS[currentView];

    return (
        <div className="app">
            {initializing ? (
                <div className="absolute w-screen h-screen flex justify-center items-center bg-base-100 text-base-content">
                    <span className="loading loading-infinity loading-xl" />
                </div>
            ) : (
                <View />
            )}

            <Toaster position="top-right" richColors closeButton theme={userTheme} />
        </div>
    );
};

export default App;
