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
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet intervention ?')) {
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
            {/* Version Desktop - Grille avec image 4:3 */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    {/* Image ratio 4:3 */}
                    <div className="flex-shrink-0 mb-3">
                        {achievement.image_url ? (
                            <div className="w-full aspect-[4/3] rounded-md overflow-hidden bg-base-200">
                                <img
                                    src={achievement.image_url}
                                    alt={achievement.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-[4/3] rounded-md bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center border border-amber-200">
                                <div className="text-center">
                                    <Trophy size={32} className="text-amber-400 mx-auto mb-1" />
                                    <span className="text-xs text-amber-600 font-medium">Intervention</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Contenu compact */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* En-tête avec icône et titre */}
                        <div className="flex items-start gap-2 mb-2">
                            <Trophy size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0 relative overflow-hidden">
                                <h3
                                    ref={titleRef}
                                    className="text-sm font-semibold text-base-content/90 whitespace-nowrap transition-transform duration-3000"
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

                        {/* Description */}
                        <p className="text-xs text-base-content/70 line-clamp-3 mb-3 leading-relaxed flex-1 min-h-[3rem]">
                            {achievement.description}
                        </p>

                        {/* Dates et actions */}
                        <div className="mt-auto space-y-2">
                            {/* Dates compactes */}
                            <div className="flex items-center justify-between text-xs text-base-content/50">
                                <div className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    <span>
                                        {new Date(achievement.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                                {achievement.updated_at && achievement.updated_at !== achievement.created_at && (
                                    <div className="flex items-center gap-1" title="Dernière modification">
                                        <CalendarCheck size={10} />
                                        <span>
                                            {new Date(achievement.updated_at).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short'
                                            })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Actions alignées à droite */}
                            <div className="flex justify-end gap-1 pt-2 border-t border-base-content/10">
                                <button
                                    onClick={handleEdit}
                                    className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 hover:bg-base-200 transition-all"
                                    title="Modifier"
                                >
                                    <Edit2 size={12} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-ghost btn-xs btn-square text-error opacity-70 hover:opacity-100 hover:bg-base-200 transition-all"
                                    title="Supprimer"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Version Mobile - Liste avec image 4:3 */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start gap-3">
                    {/* Image 4:3 miniature */}
                    <div className="flex-shrink-0">
                        {achievement.image_url ? (
                            <div className="w-16 h-12 rounded-md overflow-hidden bg-base-200">
                                <img
                                    src={achievement.image_url}
                                    alt={achievement.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-12 rounded-md bg-gradient-to-br from-yellow-50 to-amber-100 flex items-center justify-center border border-amber-200">
                                <Trophy size={18} className="text-amber-400" />
                            </div>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        {/* En-tête avec icône et titre */}
                        <div className="flex items-start gap-2 mb-1">
                            <Trophy size={14} className="text-yellow-500 mt-0.5 flex-shrink-0" />
                            <h3 className="text-sm font-semibold text-base-content/90 truncate flex-1">
                                {achievement.title}
                            </h3>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-base-content/60 line-clamp-2 mb-2 leading-relaxed">
                            {achievement.description}
                        </p>

                        {/* Dates et actions */}
                        <div className="flex items-center justify-between">
                            {/* Dates version mobile */}
                            <div className="flex items-center gap-3 text-xs text-base-content/50">
                                <span>
                                    {new Date(achievement.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                                {achievement.updated_at && achievement.updated_at !== achievement.created_at && (
                                    <span title="Dernière modification">
                                        modif: {new Date(achievement.updated_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                )}
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
                </div>
            </div>
        </>
    );
};

export default AchievementCard;