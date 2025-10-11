// src/components/Testimonials.tsx
import React, { useState, useEffect } from 'react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import Modal from './tools/Modal';
import TestimonialCard from './TestimonialCard';
import { Plus, Loader, MessageCircle } from 'lucide-react';
import { useTestimonials } from './hooks/UseTestimonials';
import type { Testimonial, UpdateTestimonialData } from '../types/type';

const Testimonials: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
    const [formData, setFormData] = useState({
        client_name: '',
        message: '',
    });
    const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true);

    const {
        createTestimonial,
        getTestimonials,
        updateTestimonial,
        deleteTestimonial,
        loading,
        error
    } = useTestimonials();

    // Charger les témoignages au montage du composant
    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            setIsLoadingTestimonials(true);
            const testimonialsData = await getTestimonials();
            setTestimonials(testimonialsData);
        } catch (err) {
            console.error('Erreur lors du chargement des témoignages:', err);
        } finally {
            setIsLoadingTestimonials(false);
        }
    };

    const handleOpenModal = () => {
        setEditingTestimonial(null);
        setFormData({ client_name: '', message: '' });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTestimonial(null);
        setFormData({ client_name: '', message: '' });
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
            if (editingTestimonial) {
                // Mise à jour du témoignage existant
                const updateData: UpdateTestimonialData = {
                    client_name: formData.client_name,
                    message: formData.message,
                };

                await updateTestimonial(editingTestimonial.id, updateData);
            } else {
                // Création d'un nouveau témoignage
                await createTestimonial({
                    client_name: formData.client_name,
                    message: formData.message,
                });
            }

            // Recharger les témoignages et fermer le modal
            await loadTestimonials();
            handleCloseModal();

        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleEditTestimonial = (testimonial: Testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            client_name: testimonial.client_name,
            message: testimonial.message,
        });
        setIsModalOpen(true);
    };

    const handleDeleteTestimonial = async (testimonialId: string) => {
        try {
            await deleteTestimonial(testimonialId);
            await loadTestimonials();
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
            alert('Erreur lors de la suppression du témoignage. Veuillez réessayer.');
        }
    };

    const modalTitle = editingTestimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage';
    const submitButtonText = editingTestimonial ? 'Modifier le témoignage' : 'Ajouter le témoignage';

    // État de chargement principal
    if (isLoadingTestimonials) {
        return (
            <ComponentsLayout className='overflow-clip'>
                <Navbar sectionName='Témoignages' />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-base-content/60">Chargement des témoignages...</p>
                    </div>
                </div>
            </ComponentsLayout>
        );
    }

    return (
        <ComponentsLayout className='overflow-clip'>
            <Navbar sectionName='Témoignages' />

            {/* Liste des témoignages */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-base-content/90">Témoignages Clients</h1>
                    <span className="text-base-content/60">
                        {testimonials.length} témoignage{testimonials.length > 1 ? 's' : ''}
                    </span>
                </div>

                {testimonials.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-base-content/40 mb-4">
                            <MessageCircle size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-base-content/90 mb-2">
                            Aucun témoignage
                        </h3>
                        <p className="text-base-content/60 mb-4">
                            Commencez par ajouter votre premier témoignage client.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                            Ajouter un témoignage
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Version Desktop - Grille plus dense */}
                        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {testimonials.map((testimonial) => (
                                <TestimonialCard
                                    key={testimonial.id}
                                    testimonial={testimonial}
                                    onEdit={handleEditTestimonial}
                                    onDelete={handleDeleteTestimonial}
                                />
                            ))}
                        </div>

                        {/* Version Mobile - Liste compacte */}
                        <div className="md:hidden space-y-3">
                            {testimonials.map((testimonial) => (
                                <TestimonialCard
                                    key={testimonial.id}
                                    testimonial={testimonial}
                                    onEdit={handleEditTestimonial}
                                    onDelete={handleDeleteTestimonial}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Button Add flottant */}
            {testimonials.length > 0 && (
                <button
                    onClick={handleOpenModal}
                    className='rounded-full bg-green-600 w-max p-4 text-white fixed bottom-10 right-10 hover:bg-green-700 transition-colors duration-200 shadow-lg'
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
                                Nom du client *
                            </label>
                            <input
                                type="text"
                                name="client_name"
                                value={formData.client_name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Entrez le nom du client"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Témoignage *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                                rows={5}
                                placeholder="Entrez le témoignage du client"
                                required
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="px-4 py-2 text-base-content/60 border border-base-300 rounded-md hover:bg-base-200 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.client_name || !formData.message}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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

export default Testimonials;