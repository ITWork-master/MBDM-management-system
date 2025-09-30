// src/components/Auth/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Register: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, loading, error, setView } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            return;
        }

        await register(email, password, name);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
                <legend className="fieldset-legend text-2xl ">Inscription</legend>
                <label className="label" htmlFor="name">Nom</label>
                <input
                    type="text"
                    className="input"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                />
                <label className="label" htmlFor="email">Email</label>
                <input
                    type="email"
                    className="input"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                />
                <label className="label" htmlFor="password">Mot de passe</label>
                <input
                    type="password"
                    className="input"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                <label className="label" htmlFor="confirmPassword">Confirmer le mot de passe</label>
                <input
                    type="password"
                    className="input"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                />
                {password !== confirmPassword && confirmPassword && (
                    <div className="error-message">Les mots de passe ne correspondent pas</div>
                )}

                {error && <div className="error-message">{error}</div>}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || password !== confirmPassword}
                    className="btn btn-neutral mt-4"
                >
                    {loading ? 'Inscription...' : "S'inscrire"}
                </button>
                <div className="auth-switch">
                    <p>
                        Déjà un compte ?{' '}
                        <button
                            onClick={() => setView('login')}
                            className="link-button"
                        >
                            Se connecter
                        </button>
                    </p>
                </div>
            </fieldset>
        </div>
    );
};

export default Register;