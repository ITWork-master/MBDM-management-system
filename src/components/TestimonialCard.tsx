// src/components/TestimonialCard.tsx
import React, { useState } from 'react';
import { Calendar, Edit2, Loader, Quote, Trash2, User } from 'lucide-react';
import ScrollingText from './tools/ScrollingText';
import type { Testimonial } from '../types/type';

interface TestimonialCardProps {
    testimonial: Testimonial;
    isDeleting?: boolean;
    onEdit: (testimonial: Testimonial) => void;
    onDelete: (testimonial: Testimonial) => void;
}

const formatShortDate = (value: string): string =>
    new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

const TestimonialCard: React.FC<TestimonialCardProps> = ({
    testimonial,
    isDeleting = false,
    onEdit,
    onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const actions = (
        <>
            <button
                type="button"
                onClick={() => onEdit(testimonial)}
                disabled={isDeleting}
                className="btn btn-ghost btn-xs btn-square disabled:opacity-30"
                title="Modifier"
                aria-label={`Modifier le témoignage de ${testimonial.client_name}`}
            >
                <Edit2 size={12} />
            </button>
            <button
                type="button"
                onClick={() => onDelete(testimonial)}
                disabled={isDeleting}
                className="btn btn-ghost btn-xs btn-square text-error disabled:opacity-30"
                title="Supprimer"
                aria-label={`Supprimer le témoignage de ${testimonial.client_name}`}
            >
                {isDeleting ? <Loader size={12} className="animate-spin" /> : <Trash2 size={12} />}
            </button>
        </>
    );

    return (
        <>
            {/* Version bureau */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-4 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-start gap-2 mb-3 flex-1">
                        <Quote size={16} className="text-success mt-1 flex-shrink-0" />
                        <p className="text-sm text-base-content/70 line-clamp-4 leading-relaxed flex-1">
                            «&nbsp;{testimonial.message}&nbsp;»
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-base-content/10">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User size={12} className="text-base-content/40 flex-shrink-0" />
                            <ScrollingText
                                text={testimonial.client_name}
                                active={isHovered}
                                speed={15}
                                fadeClassName="w-4"
                                className="text-xs font-medium text-base-content/90"
                            />
                        </div>

                        <div className="flex items-center gap-4 ml-3">
                            <div className="flex items-center gap-1 text-xs text-base-content/50">
                                <Calendar size={10} />
                                <span>{formatShortDate(testimonial.created_at)}</span>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                                {actions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Version mobile */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200">
                <div className="flex flex-col">
                    <div className="flex items-start gap-2 mb-3">
                        <Quote size={14} className="text-success mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-base-content/70 line-clamp-3 leading-relaxed flex-1">
                            «&nbsp;{testimonial.message}&nbsp;»
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            <User size={12} className="text-base-content/40 flex-shrink-0" />
                            <span className="text-xs font-medium text-base-content/90 truncate">
                                {testimonial.client_name}
                            </span>
                        </div>

                        <div className="flex items-center gap-3 ml-2">
                            <div className="text-xs text-base-content/50">
                                {formatShortDate(testimonial.created_at)}
                            </div>
                            <div className="flex gap-1">{actions}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TestimonialCard;
