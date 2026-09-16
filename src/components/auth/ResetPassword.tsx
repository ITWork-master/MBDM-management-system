// src/components/auth/ResetPassword.tsx
import React, { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { MIN_PASSWORD_LENGTH } from '../../services/auth.service';

/**
 * Formulaire affiché après un clic sur le lien de récupération.
 *
 * Le lien a ouvert une session, mais la garde d'accès d'AuthContext maintient
 * l'utilisateur ici tant que le mot de passe n'a pas été renouvelé : cette
 * session ne donne accès à rien d'autre.
 */
const ResetPassword: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { completePasswordRecovery, cancelPasswordRecovery, pending, error } = useAuth();

    const passwordsMatch = password === confirmPassword;
    const isTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
    const canSubmit = Boolean(password && confirmPassword) && passwordsMatch && !isTooShort;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (canSubmit) await completePasswordRecovery(password);
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <form onSubmit={handleSubmit}>
                <fieldset
                    className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
                    disabled={pending}
                >
                    <legend className="fieldset-legend text-2xl">Nouveau mot de passe</legend>

                    <p className="text-sm text-base-content/70 mb-2">
                        Choisissez un nouveau mot de passe pour votre compte.
                    </p>

                    <label className="label" htmlFor="new-password">
                        Mot de passe
                    </label>
                    <input
                        type="password"
                        id="new-password"
                        autoComplete="new-password"
                        className="input"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        minLength={MIN_PASSWORD_LENGTH}
                        required
                        autoFocus
                    />
                    {isTooShort && (
                        <span className="text-sm text-error">
                            Au moins {MIN_PASSWORD_LENGTH} caractères.
                        </span>
                    )}

                    <label className="label" htmlFor="confirm-new-password">
                        Confirmer
                    </label>
                    <input
                        type="password"
                        id="confirm-new-password"
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
                        {pending ? 'Enregistrement…' : 'Enregistrer'}
                    </button>

                    <p className="mt-2 text-sm">
                        <button
                            type="button"
                            onClick={cancelPasswordRecovery}
                            className="link link-primary"
                        >
                            Annuler
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
    );
};

export default ResetPassword;
