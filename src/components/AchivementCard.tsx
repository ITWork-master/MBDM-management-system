// src/components/AchievementCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Trophy, Calendar, CalendarCheck } from 'lucide-react';
import { type Achievement } from './../types/type';

interface AchievementCardProps {
    achievement: Achievement;
    onEdit: (achievement: Achievement) => void;
    onDelete: (achievementId: string) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
    achievement,
    onEdit,
    onDelete
}) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const handleEdit = () => {
        onEdit(achievement);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exploit ?')) {
            onDelete(achievement.id);
        }
    };

    // Vérifier si le texte dépasse
    useEffect(() => {
        const titleElement = titleRef.current;
        if (titleElement) {
            const isTextOverflowing = titleElement.scrollWidth > titleElement.clientWidth;
            setIsOverflowing(isTextOverflowing);
        }
    }, [achievement.title]);

    return (
        <>
            {/* Version Desktop - Grille compacte */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    {/* Image compacte */}
                    <div className="flex-shrink-0 mb-2">
                        {achievement.image_url ? (
                            <img
                                src={achievement.image_url}
                                alt={achievement.title}
                                className="w-full h-20 rounded-md object-cover"
                            />
                        ) : (
                            <div className="w-full h-20 rounded-md bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                                <Trophy size={28} className="text-base-content/40" />
                            </div>
                        )}
                    </div>

                    {/* Contenu compact */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-start gap-1 mb-1">
                            <Trophy size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0 relative overflow-hidden">
                                <h3
                                    ref={titleRef}
                                    className={`text-sm font-semibold text-base-content/90 whitespace-nowrap transition-transform duration-3000 ${isOverflowing && isHovered ? 'translate-x-[calc(100%-100%)]' : ''
                                        }`}
                                    style={{
                                        transform: isOverflowing && isHovered
                                            ? `translateX(calc(-${titleRef.current?.scrollWidth! - titleRef.current?.clientWidth!}px))`
                                            : 'translateX(0)',
                                        transitionDuration: isOverflowing && isHovered ? `${Math.max(3, (titleRef.current?.scrollWidth! - titleRef.current?.clientWidth!) / 20)}s` : '0.3s'
                                    }}
                                    title={isOverflowing ? achievement.title : ''}
                                >
                                    {achievement.title}
                                </h3>

                                {/* Gradient overlay pour indiquer qu'il y a plus de texte */}
                                {isOverflowing && !isHovered && (
                                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-base-100 to-transparent" />
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-base-content/70 line-clamp-2 mb-2 leading-relaxed flex-1">
                            {achievement.description}
                        </p>

                        {/* Dates compactes */}
                        <div className="flex items-center gap-2 text-xs text-base-content/50 mb-2">
                            <div className="flex items-center gap-1">
                                <Calendar size={10} />
                                <span className="text-xs">
                                    {new Date(achievement.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            </div>
                            {achievement.updated_at && (
                                <div className="flex items-center gap-1">
                                    <CalendarCheck size={10} />
                                    <span className="text-xs">
                                        {new Date(achievement.updated_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-1 pt-2 border-t border-base-content/10">
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

            {/* Version Mobile - Liste compacte (inchangée) */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-center gap-3">
                    {/* Image miniature */}
                    <div className="flex-shrink-0">
                        {achievement.image_url ? (
                            <img
                                src={achievement.image_url}
                                alt={achievement.title}
                                className="w-12 h-12 rounded object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 rounded bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                                <Trophy size={20} className="text-base-content/40" />
                            </div>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-base-content/90 truncate">
                            {achievement.title}
                        </h3>
                        <p className="text-xs text-base-content/60 line-clamp-2 mt-1">
                            {achievement.description}
                        </p>

                        {/* Dates version mobile */}
                        <div className="flex items-center gap-3 mt-2 text-xs text-base-content/50">
                            <span>
                                {new Date(achievement.created_at).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short'
                                })}
                            </span>
                            {achievement.updated_at && (
                                <span>
                                    Modif: {new Date(achievement.updated_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleEdit}
                            className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 transition-opacity"
                            title="Modifier"
                        >
                            <Edit2 size={14} />
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn btn-ghost btn-xs btn-square text-error opacity-70 hover:opacity-100 transition-opacity"
                            title="Supprimer"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AchievementCard;