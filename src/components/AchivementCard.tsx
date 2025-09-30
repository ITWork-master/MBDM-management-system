// src/components/AchievementCard.tsx
import React from 'react';
import { Edit2, Trash2, Trophy, Image as ImageIcon } from 'lucide-react';
import { type Achievement } from './../services/achievement.service';

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
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image de l'exploit */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {achievement.image_url ? (
                    <img
                        src={achievement.image_url}
                        alt={achievement.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <Trophy size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Contenu de l'exploit */}
            <div className="p-4">
                <div className="flex items-start mb-2">
                    <Trophy size={20} className="text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {achievement.title}
                    </h3>
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {achievement.description}
                </p>

                {/* Date de création */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                        Créé le {new Date(achievement.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {achievement.updated_at && (
                        <span>
                            Modifié le {new Date(achievement.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                        onClick={handleEdit}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                    >
                        <Edit2 size={16} />
                        <span>Modifier</span>
                    </button>

                    <button
                        onClick={handleDelete}
                        className="flex items-center space-x-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors duration-200"
                    >
                        <Trash2 size={16} />
                        <span>Effacer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AchievementCard;