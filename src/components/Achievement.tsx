// src/components/Achievements.tsx
import React, { useState, useEffect } from 'react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import Modal from './tools/Modal';
import AchievementCard from './AchivementCard';
import { Plus, Loader, Trophy } from 'lucide-react';
import { useAchievements } from './hooks/UseAchievements';
import type { Achievement, UpdateAchievementData } from '../types/type';

const Achievements: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);

    const {
        createAchievement,
        getAchievements,
        updateAchievement,
        deleteAchievement,
        uploadImage,
        loading,
        error
    } = useAchievements();

    // Charger les exploits au montage du composant
    useEffect(() => {
        loadAchievements();
    }, []);

    const loadAchievements = async () => {
        try {
            setIsLoadingAchievements(true);
            const achievementsData = await getAchievements();
            setAchievements(achievementsData);
        } catch (err) {
            console.error('Erreur lors du chargement des exploits:', err);
        } finally {
            setIsLoadingAchievements(false);
        }
    };

    const handleOpenModal = () => {
        setEditingAchievement(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAchievement(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = undefined;

            // Upload de l'image si une nouvelle image est sélectionnée
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            if (editingAchievement) {
                // Mise à jour de l'exploit existant
                const updateData: UpdateAchievementData = {
                    title: formData.title,
                    description: formData.description,
                };

                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                await updateAchievement(editingAchievement.id, updateData);
                alert('Exploit modifié avec succès!');
            } else {
                // Création d'un nouvel exploit
                await createAchievement({
                    title: formData.title,
                    description: formData.description,
                    image_url: imageUrl,
                });
                alert('Exploit créé avec succès!');
            }

            // Recharger les exploits et fermer le modal
            await loadAchievements();
            handleCloseModal();

        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleEditAchievement = (achievement: Achievement) => {
        setEditingAchievement(achievement);
        setFormData({
            title: achievement.title,
            description: achievement.description || '',
        });
        setIsModalOpen(true);
    };

    const handleDeleteAchievement = async (achievementId: string) => {
        try {
            await deleteAchievement(achievementId);
            await loadAchievements();
            alert('Exploit supprimé avec succès!');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const modalTitle = editingAchievement ? 'Modifier l\'exploit' : 'Ajouter un exploit';
    const submitButtonText = editingAchievement ? 'Modifier l\'exploit' : 'Ajouter l\'exploit';

    // État de chargement principal
    if (isLoadingAchievements) {
        return (
            <ComponentsLayout className='overflow-clip'>
                <Navbar sectionName='Exploits' />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-12 w-12 text-yellow-600 mx-auto mb-4" />
                        <p className="text-base-content/60">Chargement des exploits...</p>
                    </div>
                </div>
            </ComponentsLayout>
        );
    }

    return (
        <ComponentsLayout className='overflow-clip'>
            <Navbar sectionName='Exploits' />

            {/* Liste des exploits */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-base-content/90">Mes Exploits</h1>
                    <span className="text-base-content/60">
                        {achievements.length} exploit{achievements.length > 1 ? 's' : ''}
                    </span>
                </div>


                {achievements.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-base-content/40 mb-4">
                            <Trophy size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-base-content/90 mb-2">
                            Aucun exploit
                        </h3>
                        <p className="text-base-content/60 mb-4">
                            Commencez par ajouter votre premier exploit ou réalisation.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200"
                        >
                            Ajouter un exploit
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Version Desktop - Grille compacte responsive */}
                        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {achievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    onEdit={handleEditAchievement}
                                    onDelete={handleDeleteAchievement}
                                />
                            ))}
                        </div>

                        {/* Version Mobile - Liste compacte */}
                        <div className="md:hidden space-y-3">
                            {achievements.map((achievement) => (
                                <AchievementCard
                                    key={achievement.id}
                                    achievement={achievement}
                                    onEdit={handleEditAchievement}
                                    onDelete={handleDeleteAchievement}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Button Add flottant */}
            {achievements.length > 0 && (
                <button
                    onClick={handleOpenModal}
                    className='rounded-full bg-yellow-600 w-max p-4 text-white fixed bottom-10 right-10 hover:bg-yellow-700 transition-colors duration-200 shadow-lg'
                >
                    <Plus size={30} />
                </button>
            )}

            {/* Modal Add/Edit */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{modalTitle}</h2>

                    {/* Affichage des erreurs */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Formulaire */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Titre de l'exploit *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                placeholder="Entrez le titre de l'exploit"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                rows={4}
                                placeholder="Décrivez votre exploit ou réalisation"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Image de l'exploit
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            {selectedImage && (
                                <p className="mt-2 text-sm text-base-content/60">
                                    Nouvelle image sélectionnée: {selectedImage.name}
                                </p>
                            )}
                            {editingAchievement?.image_url && !selectedImage && (
                                <p className="mt-2 text-sm text-base-content/60">
                                    Image actuelle: <a href={editingAchievement.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir l'image</a>
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="px-4 py-2 text-base-content/60 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.description}
                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && <Loader className="animate-spin h-4 w-4" />}
                                <span>{loading ? 'Chargement...' : submitButtonText}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </ComponentsLayout>
    );
};

export default Achievements;