// src/components/AchievementCard.tsx
import React from 'react';
import { Edit2, Trash2, Trophy } from 'lucide-react';
import { type Achievement } from './../types/type';

interface AchievementCardProps {
    achievement: Achievement;
    onEdit: (achievement: Achievement) => void;
    onDelete: (achievementId: string) => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({ achievement, onEdit, onDelete }) => {
    const handleEdit = () => {
        onEdit(achievement);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet exploit ?')) {
            onDelete(achievement.id);
        }
    };

    return (
        <div className="bg-base-100 rounded-lg shadow-md border border-base-content/20 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image de l'exploit */}
            <div className='flex items-center gap-4'>
                <div className="aspect-w-16 aspect-h-9 bg-base-200">
                    {achievement.image_url ? (
                        <img
                            src={achievement.image_url}
                            alt={achievement.title}
                            className="w-full h-20 object-cover"
                        />
                    ) : (
                        <div className="w-full h-20 flex items-center justify-center bg-base-200">
                            <Trophy size={48} className="text-base-content/40" />
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-start">
                        <Trophy size={20} className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                        <h3 className="text-lg font-semibold text-base-content/90 line-clamp-2">
                            {achievement.title}
                        </h3>
                    </div>

                    <p className="text-base-content/60 text-sm mb-3 line-clamp-3">
                        {achievement.description}
                    </p>
                </div>
            </div>

            {/* Contenu de l'exploit */}
            <div className="px-4 pb-2">
                <div className='flex justify-between items-center border-t border-base-content/10 pt-2'>
                    <div className="flex items-center justify-between text-xs text-base-content/50">
                        <span>
                            Créé le {new Date(achievement.created_at).toLocaleDateString('fr-FR')}
                        </span>
                        {achievement.updated_at && (
                            <span>
                                Modifié le {new Date(achievement.updated_at).toLocaleDateString('fr-FR')}
                            </span>
                        )}
                    </div>

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

export default AchievementCard;