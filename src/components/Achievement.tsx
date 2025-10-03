// src/components/Achievements.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import Modal from './tools/Modal';
import AchievementCard from './AchivementCard';
import { Plus, Loader, Trophy, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useAchievements } from './hooks/UseAchievements';
import type { Achievement, UpdateAchievementData } from '../types/type';

// Types pour le recadrage
interface Crop {
    x: number;
    y: number;
}

interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

const Achievements: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // États pour le recadrage
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

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

    // Filtrer les exploits en fonction du terme de recherche
    const filteredAchievements = achievements.filter(achievement => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        return (
            achievement.title.toLowerCase().includes(searchLower) ||
            (achievement.description && achievement.description.toLowerCase().includes(searchLower))
        );
    });

    // Fonction pour créer une image recadrée
    const createCroppedImage = useCallback(async (): Promise<Blob> => {
        if (!imageSrc || !croppedAreaPixels) {
            throw new Error('Image source ou zone recadrée manquante');
        }

        const image = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve, reject) => {
            image.onload = () => {
                const { x, y, width, height } = croppedAreaPixels;

                canvas.width = width;
                canvas.height = height;

                if (ctx) {
                    // Sauvegarder l'état du contexte
                    ctx.save();

                    // Translater vers le centre pour la rotation
                    ctx.translate(width / 2, height / 2);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.translate(-width / 2, -height / 2);

                    // Dessiner l'image recadrée
                    ctx.drawImage(
                        image,
                        x,
                        y,
                        width,
                        height,
                        0,
                        0,
                        width,
                        height
                    );

                    // Restaurer l'état du contexte
                    ctx.restore();

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Erreur lors de la création du blob'));
                        }
                    }, 'image/jpeg', 0.9);
                }
            };
            image.onerror = reject;
            image.src = imageSrc;
        });
    }, [imageSrc, croppedAreaPixels, rotation]);

    // Fonction appelée quand le recadrage change
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
        console.log(croppedArea);        
    }, []);

    // Gestion de la sélection d'image avec recadrage
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = () => {
                setImageSrc(reader.result as string);
                setSelectedImage(file);
                setIsCropModalOpen(true);
                // Réinitialiser les paramètres de recadrage
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            };

            reader.readAsDataURL(file);
        }
    };

    // Confirmer le recadrage
    const handleConfirmCrop = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImageBlob = await createCroppedImage();
                const croppedFile = new File([croppedImageBlob], selectedImage?.name || 'cropped-image.jpg', {
                    type: 'image/jpeg'
                });
                setSelectedImage(croppedFile);
            }
            setIsCropModalOpen(false);
        } catch (error) {
            console.error('Erreur lors du recadrage:', error);
            alert('Erreur lors du recadrage de l\'image');
        }
    };

    const handleOpenModal = () => {
        setEditingAchievement(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
        setImageSrc(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAchievement(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
        setImageSrc(null);
    };

    const handleCloseCropModal = () => {
        setIsCropModalOpen(false);
        setSelectedImage(null);
        setImageSrc(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-base-content/90">Mes Exploits</h1>
                    
                    {/* Barre de recherche */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Rechercher un exploit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full input focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                    </div>
                    
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
                            className="px-4 py-2 bg-yellow-600 text-base-content rounded-md hover:bg-yellow-700 transition-colors duration-200"
                        >
                            Ajouter un exploit
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Filtrage des exploits */}
                        {filteredAchievements.length === 0 && searchTerm ? (
                            <div className="text-center py-8">
                                <p className="text-base-content/60">
                                    Aucun exploit trouvé pour "{searchTerm}"
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Version Desktop - Grille compacte responsive */}
                                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {filteredAchievements.map((achievement) => (
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
                                    {filteredAchievements.map((achievement) => (
                                        <AchievementCard
                                            key={achievement.id}
                                            achievement={achievement}
                                            onEdit={handleEditAchievement}
                                            onDelete={handleDeleteAchievement}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Button Add flottant */}
            {achievements.length > 0 && (
                <button
                    onClick={handleOpenModal}
                    className='rounded-full bg-yellow-600 w-max p-4 text-base-content fixed bottom-10 right-10 hover:bg-yellow-700 transition-colors duration-200 shadow-lg'
                >
                    <Plus size={30} />
                </button>
            )}

            {/* Modal principal Add/Edit */}
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
                                className="w-full px-3 py-2 border border-base-content/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                                className="w-full px-3 py-2 border border-base-content/30 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
                                className="file-input file-input-bordered w-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                            {selectedImage && !isCropModalOpen && (
                                <p className="mt-2 text-sm text-base-content/60">
                                    Image sélectionnée: {selectedImage.name}
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
                                className="px-4 py-2 text-base-content/60 border border-base-content/30 rounded-md hover:bg-base-100 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.description}
                                className="px-4 py-2 bg-yellow-600 text-base-content rounded-md hover:bg-yellow-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && <Loader className="animate-spin h-4 w-4" />}
                                <span>{loading ? 'Chargement...' : submitButtonText}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal de recadrage */}
            <Modal isOpen={isCropModalOpen} onClose={handleCloseCropModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Recadrer l'image</h2>

                    {imageSrc && (
                        <div className="space-y-4">
                            {/* Zone de recadrage */}
                            <div className="relative h-64 w-full bg-base-200 rounded-lg overflow-hidden">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={4/3}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    objectFit="contain"
                                />
                            </div>

                            {/* Contrôles de zoom */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                    <ZoomOut size={18} className="text-base-content/60" />
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <ZoomIn size={18} className="text-base-content/60" />
                                </div>

                                {/* Contrôle de rotation */}
                                <div className="flex items-center space-x-3">
                                    <RotateCcw size={18} className="text-base-content/60" />
                                    <span className="text-sm text-base-content/70 min-w-[80px]">Rotation:</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={360}
                                        step={1}
                                        value={rotation}
                                        onChange={(e) => setRotation(Number(e.target.value))}
                                        className="w-full h-2 bg-base-300 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-sm text-base-content/70 min-w-[40px]">{rotation}°</span>
                                </div>
                            </div>

                            {/* Informations */}
                            {/* <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                    💡 <strong>Conseil :</strong> Recadrez votre image pour mettre en valeur votre exploit.
                                    Le format carré est optimisé pour l'affichage.
                                </p>
                            </div> */}

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseCropModal}
                                    className="px-4 py-2 text-base-content/60 border border-base-content/30 rounded-md hover:bg-base-100 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCrop}
                                    className="px-4 py-2 bg-yellow-600 text-base-content rounded-md hover:bg-yellow-700 transition-colors duration-200 flex items-center space-x-2"
                                >
                                    <Trophy size={16} />
                                    <span>Confirmer le recadrage</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </ComponentsLayout>
    );
};

export default Achievements;