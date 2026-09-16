// src/components/Settings.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Palette, PowerOff, Shield, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import ThemeSwitcher from './tools/ThemeSwitcher';
import { useConfirm } from './tools/useConfirm';
import { useAuth } from '../context/useAuth';
import { deleteOwnAccount, MIN_PASSWORD_LENGTH } from '../services/auth.service';
import { applyTheme } from '../lib/theme';
import { toMessage } from '../lib/errors';
import type { ThemeName } from '../types/type';

const Settings: React.FC = () => {
    const { logout, changePassword, changeTheme, userTheme, userName, pending } = useAuth();
    const confirm = useConfirm();

    const [newPassword, setNewPassword] = useState('');
    const [previewTheme, setPreviewTheme] = useState<ThemeName>(userTheme);
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);

    // Le thème enregistré arrive avec le profil, après le premier rendu.
    useEffect(() => setPreviewTheme(userTheme), [userTheme]);

    // Aperçu immédiat du thème sélectionné, sans l'enregistrer.
    useEffect(() => applyTheme(previewTheme), [previewTheme]);

    // En quittant la page sans valider, on rétablit le thème enregistré.
    const savedTheme = useRef(userTheme);
    useEffect(() => {
        savedTheme.current = userTheme;
    }, [userTheme]);
    useEffect(() => () => applyTheme(savedTheme.current), []);

    const isPasswordTooShort =
        newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;

    const handleChangePassword = async () => {
        // `changePassword` renvoie désormais un booléen. Le service précédent
        // retournait l'erreur au lieu de la lever, et l'interface affichait
        // « Mot de passe modifié avec succès » même en cas d'échec.
        if (await changePassword(newPassword)) setNewPassword('');
    };

    const handleApplyTheme = async () => {
        await changeTheme(previewTheme);
    };

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Se déconnecter',
            message: 'Vous devrez saisir à nouveau vos identifiants pour revenir.',
            confirmLabel: 'Se déconnecter',
            danger: true,
        });
        if (confirmed) await logout();
    };

    const handleAccountDeletion = async () => {
        const confirmed = await confirm({
            title: 'Supprimer définitivement le compte',
            message:
                'Vos produits, témoignages et interventions seront supprimés. Cette action est irréversible.',
            confirmLabel: 'Supprimer mon compte',
            danger: true,
        });
        if (!confirmed) return;

        setIsDeletingAccount(true);
        try {
            await deleteOwnAccount();
            toast.success('Compte supprimé.');
        } catch (error) {
            toast.error(toMessage(error, 'Erreur lors de la suppression du compte'));
        } finally {
            setIsDeletingAccount(false);
        }
    };

    const isBusy = pending || isDeletingAccount;

    return (
        <ComponentsLayout className="overflow-clip">
            <Navbar sectionName="Paramètres" />

            <div className="flex flex-col justify-between h-full pb-20">
                <div className="mx-auto my-20 md:w-2/4 w-2/3">
                    {userName && (
                        <p className="mb-4 text-base-content/60">
                            Connecté en tant que <span className="font-medium">{userName}</span>.
                        </p>
                    )}

                    {/* Mot de passe */}
                    <div className="collapse collapse-arrow bg-base-100 border-base-300 border mb-4">
                        <input type="checkbox" aria-label="Changer de mot de passe" />
                        <div className="collapse-title font-semibold flex items-center gap-3">
                            <Shield size={20} />
                            Changer Mot de Passe
                        </div>
                        <div className="collapse-content">
                            <div className="space-y-2 w-full">
                                <div>
                                    <label
                                        htmlFor="newPassword"
                                        className="block text-sm font-medium text-base-content/70 mb-2"
                                    >
                                        Nouveau Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        autoComplete="new-password"
                                        className="input input-bordered w-full"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        placeholder="Entrez votre nouveau mot de passe"
                                    />
                                    {isPasswordTooShort && (
                                        <p className="mt-1 text-sm text-error">
                                            Au moins {MIN_PASSWORD_LENGTH} caractères.
                                        </p>
                                    )}
                                </div>
                                <div className="text-right">
                                    <button
                                        type="button"
                                        className="btn btn-neutral"
                                        onClick={handleChangePassword}
                                        disabled={
                                            isBusy ||
                                            newPassword.length < MIN_PASSWORD_LENGTH
                                        }
                                    >
                                        Modifier le mot de passe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Apparence */}
                    <div className="collapse collapse-arrow bg-base-100 border-base-300 border mb-4">
                        <input type="checkbox" aria-label="Apparence" />
                        <div className="collapse-title font-semibold flex items-center gap-3">
                            <Palette size={20} />
                            Apparence
                        </div>
                        <div className="collapse-content">
                            <div className="space-y-5">
                                <div className="form-control flex justify-center md:gap-10 gap-2">
                                    <div className="w-max">
                                        <ThemeSwitcher
                                            value={previewTheme}
                                            onChange={setPreviewTheme}
                                        />
                                    </div>
                                    <label className="label">
                                        <span className="label-text">Thème</span>
                                        <span className="label-text-alt text-info">
                                            {previewTheme === userTheme ? '✓' : ''}
                                        </span>
                                    </label>
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-primary w-full"
                                    onClick={handleApplyTheme}
                                    disabled={isBusy || previewTheme === userTheme}
                                >
                                    {previewTheme === userTheme
                                        ? 'Thème déjà appliqué'
                                        : 'Appliquer le thème'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 md:w-1/3 w-3/4 mx-auto">
                    <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isBusy}
                        className="btn btn-outline btn-error w-full flex items-center gap-2"
                    >
                        <PowerOff size={20} />
                        Se déconnecter
                    </button>

                    <button
                        type="button"
                        onClick={handleAccountDeletion}
                        disabled={isBusy}
                        className="btn btn-ghost btn-error w-full flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} />
                        {isDeletingAccount ? 'Suppression…' : 'Supprimer mon compte'}
                    </button>
                </div>
            </div>
        </ComponentsLayout>
    );
};

export default Settings;
