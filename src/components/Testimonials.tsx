// src/components/Testimonials.tsx
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import PageLoader from './tools/PageLoader';
import EmptyState from './tools/EmptyState';
import FloatingAddButton from './tools/FloatingAddButton';
import { useConfirm } from './tools/useConfirm';
import EntityFormModal from './entities/EntityFormModal';
import TestimonialCard from './TestimonialCard';
import { useTestimonials } from '../hooks/useTestimonials';
import type { CreateTestimonialData, Testimonial } from '../types/type';

const EMPTY_FORM = { client_name: '', message: '' };

const Testimonials: React.FC = () => {
    const testimonials = useTestimonials();
    const confirm = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Testimonial | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        testimonials.clearError();
    };

    const openCreateModal = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        testimonials.clearError();
        setIsModalOpen(true);
    };

    const openEditModal = (testimonial: Testimonial) => {
        setEditing(testimonial);
        setForm({
            client_name: testimonial.client_name,
            message: testimonial.message,
        });
        testimonials.clearError();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const payload: CreateTestimonialData = {
            client_name: form.client_name.trim(),
            message: form.message.trim(),
        };
        if (!payload.client_name || !payload.message) return;

        const saved = editing
            ? await testimonials.update(editing.id, payload)
            : await testimonials.create(payload);

        if (saved) closeModal();
    };

    const handleDelete = async (testimonial: Testimonial) => {
        const confirmed = await confirm({
            title: 'Supprimer le témoignage',
            message: `Le témoignage de ${testimonial.client_name} sera définitivement supprimé.`,
            confirmLabel: 'Supprimer',
            danger: true,
        });
        if (confirmed) await testimonials.remove(testimonial.id);
    };

    if (testimonials.isLoading) {
        return (
            <ComponentsLayout className="overflow-clip">
                <Navbar sectionName="Témoignages" />
                <PageLoader message="Chargement des témoignages…" />
            </ComponentsLayout>
        );
    }

    const canSubmit = Boolean(form.client_name.trim() && form.message.trim());

    return (
        <ComponentsLayout className="overflow-clip">
            <Navbar sectionName="Témoignages" />

            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-base-content/90">Témoignages Clients</h1>
                    <span className="text-base-content/60">
                        {testimonials.items.length} témoignage
                        {testimonials.items.length > 1 ? 's' : ''}
                    </span>
                </div>

                {testimonials.items.length === 0 ? (
                    <EmptyState
                        icon={MessageCircle}
                        title="Aucun témoignage"
                        description="Commencez par ajouter votre premier témoignage client."
                        actionLabel="Ajouter un témoignage"
                        onAction={openCreateModal}
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {testimonials.items.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.id}
                                testimonial={testimonial}
                                isDeleting={testimonials.deletingId === testimonial.id}
                                onEdit={openEditModal}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}
            </div>

            {testimonials.items.length > 0 && (
                <FloatingAddButton onClick={openCreateModal} label="Ajouter un témoignage" />
            )}

            <EntityFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                heading={editing ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
                submitLabel={editing ? 'Modifier le témoignage' : 'Ajouter le témoignage'}
                isSaving={testimonials.isSaving}
                error={testimonials.error}
                canSubmit={canSubmit}
                onSubmit={handleSubmit}
            >
                <div>
                    <label
                        htmlFor="testimonial-client"
                        className="block text-sm font-medium text-base-content/70 mb-2"
                    >
                        Nom du client *
                    </label>
                    <input
                        id="testimonial-client"
                        type="text"
                        value={form.client_name}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                client_name: event.target.value,
                            }))
                        }
                        className="input input-bordered w-full"
                        placeholder="Entrez le nom du client"
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="testimonial-message"
                        className="block text-sm font-medium text-base-content/70 mb-2"
                    >
                        Témoignage *
                    </label>
                    <textarea
                        id="testimonial-message"
                        value={form.message}
                        onChange={(event) =>
                            setForm((previous) => ({ ...previous, message: event.target.value }))
                        }
                        className="textarea textarea-bordered w-full"
                        rows={5}
                        placeholder="Entrez le témoignage du client"
                        required
                    />
                </div>
            </EntityFormModal>
        </ComponentsLayout>
    );
};

export default Testimonials;
