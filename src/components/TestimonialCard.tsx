// src/components/TestimonialCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Quote, Calendar, User } from 'lucide-react';
import type { Testimonial } from './../types/type';

interface TestimonialCardProps {
    testimonial: Testimonial;
    onEdit: (testimonial: Testimonial) => void;
    onDelete: (testimonialId: string) => void;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ testimonial, onEdit, onDelete }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const clientNameRef = useRef<HTMLDivElement>(null);

    const handleEdit = () => {
        onEdit(testimonial);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) {
            onDelete(testimonial.id);
        }
    };

    // Vérifier si le nom du client dépasse
    useEffect(() => {
        const nameElement = clientNameRef.current;
        if (nameElement) {
            const isTextOverflowing = nameElement.scrollWidth > nameElement.clientWidth;
            setIsOverflowing(isTextOverflowing);
        }
    }, [testimonial.client_name]);

    return (
        <>
            {/* Version Desktop - Compacte */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-4 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    {/* Icône et message */}
                    <div className="flex items-start gap-2 mb-3 flex-1">
                        <Quote size={16} className="text-green-500 mt-1 flex-shrink-0" />
                        <p className="text-sm text-base-content/70 line-clamp-4 leading-relaxed flex-1">
                            "{testimonial.message}"
                        </p>
                    </div>

                    {/* Informations client et actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-base-content/10">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User size={12} className="text-base-content/40 flex-shrink-0" />
                            <div className="min-w-0 flex-1 relative">
                                <div
                                    ref={clientNameRef}
                                    className="text-xs font-medium text-base-content/90 whitespace-nowrap transition-transform duration-3000"
                                    style={{
                                        transform: isOverflowing && isHovered
                                            ? `translateX(calc(-${clientNameRef.current?.scrollWidth! - clientNameRef.current?.clientWidth!}px))`
                                            : 'translateX(0)',
                                        transitionDuration: isOverflowing && isHovered ? `${Math.max(3, (clientNameRef.current?.scrollWidth! - clientNameRef.current?.clientWidth!) / 15)}s` : '0.3s'
                                    }}
                                    title={isOverflowing ? testimonial.client_name : ''}
                                >
                                    {testimonial.client_name}
                                </div>

                                {/* Gradient overlay pour indiquer qu'il y a plus de texte */}
                                {isOverflowing && !isHovered && (
                                    <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-base-100 to-transparent" />
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 ml-3">
                            {/* Date */}
                            <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <Calendar size={10} />
                                <span>
                                    {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <button
                                    onClick={handleEdit}
                                    className="btn btn-ghost btn-xs btn-square"
                                    title="Modifier"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-ghost btn-xs btn-square text-error"
                                    title="Supprimer"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Version Mobile - Compacte */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group">
                <div className="flex flex-col">
                    {/* Message */}
                    <div className="flex items-start gap-2 mb-3">
                        <Quote size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/70 line-clamp-3 leading-relaxed flex-1">
                            "{testimonial.message}"
                        </p>
                    </div>

                    {/* Informations client et actions */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User size={12} className="text-base-content/40 flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/90 truncate">
                                {testimonial.client_name}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 ml-2">
                            {/* Date */}
                            <div className="text-xs text-base-content/50">
                                {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1">
                                <button
                                    onClick={handleEdit}
                                    className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 transition-opacity"
                                    title="Modifier"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-ghost btn-xs btn-square text-error opacity-70 hover:opacity-100 transition-opacity"
                                    title="Supprimer"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TestimonialCard;