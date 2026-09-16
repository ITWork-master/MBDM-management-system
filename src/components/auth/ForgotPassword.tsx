// src/components/auth/ForgotPassword.tsx
import React, { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSent, setIsSent] = useState(false);
    const { sendPasswordReset, pending, error, setView } = useAuth();

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (await sendPasswordReset(email)) setIsSent(true);
    };

    if (isSent) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="bg-base-200 border-base-300 rounded-box w-xs border p-6 text-center">
                    <MailCheck size={40} className="mx-auto mb-4 text-success" />
                    <h2 className="text-lg font-semibold mb-2">Lien envoyé</h2>
                    {/* Volontairement neutre : confirmer l'existence d'un compte
                        permettrait d'énumérer les adresses enregistrées. */}
                    <p className="text-sm text-base-content/70">
                        Si un compte existe pour <span className="font-medium">{email}</span>,
                        un lien de réinitialisation vient d'y être envoyé. Pensez à vérifier
                        les indésirables.
                    </p>
                    <button
                        type="button"
                        onClick={() => setView('login')}
                        className="btn btn-neutral w-full mt-5"
                    >
                        Retour à la connexion
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen flex justify-center items-center">
            <form onSubmit={handleSubmit}>
                <fieldset
                    className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4"
                    disabled={pending}
                >
                    <legend className="fieldset-legend text-2xl">Mot de passe oublié</legend>

                    <p className="text-sm text-base-content/70 mb-2">
                        Saisissez votre adresse e-mail : vous recevrez un lien pour choisir
                        un nouveau mot de passe.
                    </p>

                    <label className="label" htmlFor="reset-email">
                        Email
                    </label>
                    <input
                        type="email"
                        id="reset-email"
                        autoComplete="email"
                        className="input"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        autoFocus
                    />

                    {error && (
                        <div role="alert" className="alert alert-error mt-3 text-sm">
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-neutral mt-4" disabled={!email}>
                        {pending ? 'Envoi…' : 'Envoyer le lien'}
                    </button>

                    <p className="mt-2 text-sm">
                        <button
                            type="button"
                            onClick={() => setView('login')}
                            className="link link-primary"
                        >
                            Retour à la connexion
                        </button>
                    </p>
                </fieldset>
            </form>
        </div>
    );
};

export default ForgotPassword;
