// src/components/TestimonialCard.tsx
import React from 'react';
import { Edit2, Trash2, Quote } from 'lucide-react';
import type { Testimonial } from './../types/type';

interface TestimonialCardProps {
    testimonial: Testimonial;
    onEdit: (testimonial: Testimonial) => void;
    onDelete: (testimonialId: string) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, onEdit, onDelete }) => {
    const handleEdit = () => {
        onEdit(testimonial);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
            onDelete(testimonial.id);
        }
    };

    return (
        <div className="bg-base-100 rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Contenu du témoignage */}
            <div className="p-6">
                <div className="flex items-start mb-4">
                    <Quote size={20} className="text-base-content/40 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-base-content/70 italic line-clamp-4">
                        "{testimonial.message}"
                    </p>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <h3 className="font-semibold text-base-content/90 text-lg mb-1">
                        {testimonial.client_name}
                    </h3>

                    {/* Date de création */}
                    <div className="text-xs text-base-content/50 mb-3">
                        Ajouté le {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={handleEdit}
                            className="flex items-center btn btn-primary"
                        >
                            <Edit2 size={16} />
                            <span>Modifier</span>
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex items-center btn btn-error"
                        >
                            <Trash2 size={16} />
                            <span>Effacer</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;