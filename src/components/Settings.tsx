import React, { useState } from 'react'
import Navbar from './tools/Navbar'
import ComponentsLayout from './tools/ComponentsLayout'
import { PowerOff, Shield, Palette, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Settings: React.FC = () => {

    const [isLoadingLogout, setIsLoadingLogout] = useState(false)
    const [theme, setTheme] = useState('light')
    const [formData, setFormData] = useState({
        newPassword: '',
    })
    const { logout, changePassword } = useAuth()

    const handleLogout = () => {
        if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            try {
                setIsLoadingLogout(true);
                console.log('Déconnexion...')
                setTimeout(() => {
                    logout();
                    setIsLoadingLogout(false)
                }, 2000);
            } catch (error) {
                console.log("Erreur lors de la Déconnexion :", error);
            }
        }
    }

    const handleInputChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleChangePassword = () => {
        if (!formData.newPassword) {
            alert('Veuillez entrer un nouveau mot de passe');
            return;
        }

        try {
            changePassword(formData.newPassword);
            setFormData({ newPassword: '' }); // Réinitialiser le champ après succès
            alert('Mot de passe modifié avec succès');
        } catch (error: any) {
            console.log("Erreur lors du changement de Mot de passe : ", error);
            alert('Erreur lors du changement de mot de passe');
        }
    }

    const handleAccountDeletion = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
            console.log('Suppression du compte...')
            // Logique de suppression de compte ici
        }
    }

    if (isLoadingLogout) {
        return (
            <ComponentsLayout className='overflow-clip'>
                <Navbar sectionName='Paramètres' />
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center gap-4 text-error">
                        <span>Déconnexion en cours ...</span>
                        <span className="loading loading-bars loading-xl"></span>
                    </div>
                </div>
            </ComponentsLayout>
        );
    }

    return (
        <ComponentsLayout className='overflow-clip'>
            <Navbar sectionName='Paramètres' />

            {/* Section Profil */}
            <div className='flex flex-col justify-between h-full pb-20'>
                <div className='mx-auto my-20 md:w-2/4 w-2/3'>
                    <div className="collapse collapse-arrow bg-base-100 border-base-300 border mb-4">
                        <input type="checkbox" />
                        <div className="collapse-title font-semibold flex items-center gap-3">
                            <Shield size={20} />
                            Changer Mot de Passe
                        </div>
                        <div className="collapse-content">
                            <div className='space-y-2 w-full'>
                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nouveau Mot de passe
                                    </label>
                                    <input
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        className='input input-bordered w-full'
                                        value={formData.newPassword}
                                        onChange={handleInputChangePassword}
                                        placeholder="Entrez votre nouveau mot de passe"
                                    />
                                </div>
                                <div className='text-right'>
                                    <button
                                        type='button'
                                        className='btn btn-neutral'
                                        onClick={handleChangePassword}
                                        disabled={!formData.newPassword}
                                    >
                                        Modifier le mot de passe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section Apparence */}
                    <div className="collapse collapse-arrow bg-base-100 border-base-300 border mb-4">
                        <input type="checkbox" />
                        <div className="collapse-title font-semibold flex items-center gap-3">
                            <Palette size={20} />
                            Apparence
                        </div>
                        <div className="collapse-content">
                            <div className="space-y-4">
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Thème</span>
                                    </label>
                                    <select
                                        className="select select-bordered"
                                        value={theme}
                                        onChange={(e) => setTheme(e.target.value)}
                                    >
                                        <option value="light">Clair</option>
                                        <option value="dark">Sombre</option>
                                        <option value="auto">Automatique</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4 md:w-1/3 w-3/4 mx-auto">
                    <button
                        onClick={handleLogout}
                        className="btn btn-outline btn-error w-full flex items-center gap-2"
                    >
                        <PowerOff size={20} />
                        Se déconnecter
                    </button>

                    <button
                        onClick={handleAccountDeletion}
                        className="btn btn-ghost btn-error w-full flex items-center gap-2 text-sm"
                    >
                        <Trash2 size={16} />
                        Supprimer mon compte
                    </button>
                </div>
            </div>
        </ComponentsLayout>
    )
}

export default Settings