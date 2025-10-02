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
        <div className="bg-base-100 rounded-lg shadow-md border border-base-content/20 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Contenu du témoignage */}
            <div className="pb-2 pt-4 px-3">
                <div className="flex items-start mb-4">
                    <Quote size={20} className="text-base-content/40 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-base-content/70 italic line-clamp-4">
                        "{testimonial.message}"
                    </p>
                </div>

                <div className="border-t border-base-content/10 flex justify-between items-center pt-2">

                    <div className="text-xs text-base-content/50 h-full">
                        {testimonial.client_name} | Ajouté le {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleEdit}
                            className="btn btn-primary btn-sm"
                        >
                            <Edit2 size={16} />
                        </button>

                        <button
                            onClick={handleDelete}
                            className="btn btn-error btn-sm"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestimonialCard;