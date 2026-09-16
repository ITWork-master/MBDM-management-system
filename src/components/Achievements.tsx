// src/components/Achievements.tsx
import React, { useMemo, useState } from 'react';
import { Trophy } from 'lucide-react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import PageLoader from './tools/PageLoader';
import EmptyState from './tools/EmptyState';
import FloatingAddButton from './tools/FloatingAddButton';
import ImageCropperModal from './tools/ImageCropperModal';
import { useConfirm } from './tools/useConfirm';
import EntityCard from './entities/EntityCard';
import EntityFormModal from './entities/EntityFormModal';
import ImageField from './entities/ImageField';
import { useAchievements } from '../hooks/useAchievements';
import { useImagePicker } from '../hooks/useImagePicker';
import { deleteImage, uploadImage } from '../services/storage.service';
import { toMessage } from '../lib/errors';
import { toast } from 'sonner';
import type { Achievement, CreateAchievementData } from '../types/type';

const EMPTY_FORM = { title: '', description: '' };

const PLACEHOLDER = {
    icon: Trophy,
    label: 'Intervention',
    className: 'bg-gradient-to-br from-yellow-50 to-amber-100 border border-amber-200',
    iconClassName: 'text-amber-400 mb-1',
};

const Achievements: React.FC = () => {
    const achievements = useAchievements();
    const picker = useImagePicker();
    const confirm = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Achievement | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        if (!needle) return achievements.items;
        return achievements.items.filter(
            (item) =>
                item.title.toLowerCase().includes(needle) ||
                item.description.toLowerCase().includes(needle),
        );
    }, [achievements.items, searchTerm]);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        picker.reset();
        achievements.clearError();
    };

    const openCreateModal = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        picker.reset();
        achievements.clearError();
        setIsModalOpen(true);
    };

    const openEditModal = (achievement: Achievement) => {
        setEditing(achievement);
        setForm({
            title: achievement.title,
            description: achievement.description ?? '',
        });
        picker.reset();
        achievements.clearError();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const title = form.title.trim();
        const description = form.description.trim();
        if (!title || !description) return;

        let uploadedUrl: string | undefined;
        if (picker.file) {
            setIsUploading(true);
            try {
                uploadedUrl = await uploadImage(picker.file);
            } catch (cause) {
                toast.error(toMessage(cause, "Erreur lors de l'envoi de l'image"));
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const payload: CreateAchievementData = { title, description };
        if (uploadedUrl) payload.image_url = uploadedUrl;

        const saved = editing
            ? await achievements.update(editing.id, payload)
            : await achievements.create(payload);

        if (saved) {
            closeModal();
        } else if (uploadedUrl) {
            // L'enregistrement a échoué : ne pas laisser l'image envoyée orpheline.
            await deleteImage(uploadedUrl);
        }
    };

    const handleDelete = async (achievement: Achievement) => {
        const confirmed = await confirm({
            title: "Supprimer l'intervention",
            message: `« ${achievement.title} » sera définitivement supprimée, ainsi que son image.`,
            confirmLabel: 'Supprimer',
            danger: true,
        });
        if (confirmed) await achievements.remove(achievement.id);
    };

    if (achievements.isLoading) {
        return (
            <ComponentsLayout className="overflow-clip">
                <Navbar sectionName="Interventions" />
                <PageLoader message="Chargement des interventions…" />
            </ComponentsLayout>
        );
    }

    const isSaving = achievements.isSaving || isUploading;
    const canSubmit = Boolean(form.title.trim() && form.description.trim());

    return (
        <ComponentsLayout className="overflow-clip">
            <Navbar sectionName="Interventions" />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-base-content/90">Mes Interventions</h1>

                    <input
                        type="search"
                        placeholder="Rechercher une intervention…"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label="Rechercher une intervention"
                        className="input w-full sm:w-64"
                    />

                    <span className="text-base-content/60 whitespace-nowrap">
                        {filtered.length} intervention{filtered.length > 1 ? 's' : ''}
                    </span>
                </div>

                {achievements.items.length === 0 ? (
                    <EmptyState
                        icon={Trophy}
                        title="Aucune intervention"
                        description="Commencez par ajouter votre première intervention ou réalisation."
                        actionLabel="Ajouter une intervention"
                        onAction={openCreateModal}
                    />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-base-content/60">
                            Aucune intervention trouvée pour «&nbsp;{searchTerm}&nbsp;».
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                        {filtered.map((achievement) => (
                            <EntityCard
                                key={achievement.id}
                                title={achievement.title}
                                description={achievement.description}
                                imageUrl={achievement.image_url}
                                createdAt={achievement.created_at}
                                updatedAt={achievement.updated_at}
                                desktopImageClass="aspect-[4/3]"
                                mobileImageClass="w-16 h-12"
                                placeholder={PLACEHOLDER}
                                titleIcon={Trophy}
                                isDeleting={achievements.deletingId === achievement.id}
                                onEdit={() => openEditModal(achievement)}
                                onDelete={() => handleDelete(achievement)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {achievements.items.length > 0 && (
                <FloatingAddButton onClick={openCreateModal} label="Ajouter une intervention" />
            )}

            <EntityFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                heading={editing ? "Modifier l'intervention" : 'Ajouter une intervention'}
                submitLabel={editing ? "Modifier l'intervention" : "Ajouter l'intervention"}
                isSaving={isSaving}
                error={achievements.error}
                canSubmit={canSubmit}
                onSubmit={handleSubmit}
            >
                <div>
                    <label
                        htmlFor="achievement-title"
                        className="block text-sm font-medium text-base-content/70 mb-2"
                    >
                        Titre de l'intervention *
                    </label>
                    <input
                        id="achievement-title"
                        type="text"
                        value={form.title}
                        onChange={(event) =>
                            setForm((previous) => ({ ...previous, title: event.target.value }))
                        }
                        className="input input-bordered w-full"
                        placeholder="Entrez le titre de l'intervention"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="achievement-description"
                        className="block text-sm font-medium text-base-content/70 mb-2"
                    >
                        Description *
                    </label>
                    <textarea
                        id="achievement-description"
                        value={form.description}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                description: event.target.value,
                            }))
                        }
                        className="textarea textarea-bordered w-full"
                        rows={4}
                        placeholder="Décrivez votre intervention ou réalisation"
                        required
                    />
                </div>

                <ImageField
                    label="Image de l'intervention"
                    picker={picker}
                    currentImageUrl={editing?.image_url}
                />
            </EntityFormModal>

            <ImageCropperModal
                isOpen={picker.isCropperOpen}
                src={picker.sourceUrl}
                aspect={4 / 3}
                onCancel={picker.cancelCrop}
                onConfirm={picker.confirmCrop}
            />
        </ComponentsLayout>
    );
};

export default Achievements;
