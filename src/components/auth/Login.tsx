// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, pending, error, setView } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        await login(email, password);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            {/* Un vrai <form> : la touche Entrée valide, et les attributs
                `required` des champs reprennent leur effet. */}
            <form onSubmit={handleSubmit}>
                <fieldset
                    className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
                    disabled={pending}
                >
                    <legend className="fieldset-legend text-2xl">Se Connecter</legend>

                    <label className="label" htmlFor="email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        autoComplete="email"
                        className="input"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <label className="label" htmlFor="password">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        className="input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />

                    {error && (
                        <div role="alert" className="alert alert-error mt-3 text-sm">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-neutral mt-4">
                        {pending ? 'Connexion…' : 'Se connecter'}
                    </button>

                    <p className="mt-2 text-sm">
                        Pas de compte ?{' '}
                        <button
                            type="button"
                            onClick={() => setView('register')}
                            className="link link-primary"
                        >
                            S'inscrire
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
    );
};

export default Login;
