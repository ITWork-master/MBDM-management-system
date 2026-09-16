// src/components/auth/Register.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { MIN_PASSWORD_LENGTH } from '../../services/auth.service';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { register, pending, error, setView } = useAuth();

    const passwordsMatch = password === confirmPassword;
    const isPasswordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
    const canSubmit =
        Boolean(name.trim() && email && password && confirmPassword) &&
        passwordsMatch &&
        !isPasswordTooShort;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!canSubmit) return;
        await register(email, password, name.trim());
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <form onSubmit={handleSubmit}>
                <fieldset
                    className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
                    disabled={pending}
                >
                    <legend className="fieldset-legend text-2xl">Inscription</legend>

                    <label className="label" htmlFor="name">
                        Nom
                    </label>
                    <input
                        type="text"
                        id="name"
                        autoComplete="name"
                        className="input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        required
                    />

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
                        autoComplete="new-password"
                        className="input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={MIN_PASSWORD_LENGTH}
                        required
                    />
                    {isPasswordTooShort && (
                        <span className="text-sm text-error">
                            Au moins {MIN_PASSWORD_LENGTH} caractères.
                        </span>
                    )}

                    <label className="label" htmlFor="confirmPassword">
                        Confirmer le mot de passe
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        className="input"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        required
                    />
                    {confirmPassword && !passwordsMatch && (
                        <span className="text-sm text-error">
                            Les mots de passe ne correspondent pas
                        </span>
                    )}

                    {error && (
                        <div role="alert" className="alert alert-error mt-3 text-sm">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-neutral mt-4" disabled={!canSubmit}>
                        {pending ? 'Inscription…' : "S'inscrire"}
                    </button>

                    <p className="mt-2 text-sm">
                        Déjà un compte ?{' '}
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="link link-primary"
                        >
                            Se connecter
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
    );
};

export default Register;
