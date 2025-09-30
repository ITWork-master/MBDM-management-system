// src/components/Auth/Login.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error, setView } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend text-2xl ">Se Connecter</legend>

                <label className="label">Email</label>
                <input
                    type="email"
                    id="email"
                    className='input'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />

                <label className="label">Mot de passe</label>
                <input
                    type="password"
                    id="password"
                    className='input'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                {error && <div className="error-message">{error}</div>}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn btn-neutral mt-4"
                >
                    {loading ? 'Connexion...' : 'Se connecter'}
                </button>
                <div className="auth-switch">
                    <p>
                        Pas de compte ?{' '}
                        <button
                            onClick={() => setView('register')}
                            className="link-button"
                        >
                            S'inscrire
                        </button>
                    </p>
                </div>
            </fieldset>
        </div>
    );
};

export default Login;