import React, { useState } from 'react';
import { Calendar, CalendarCheck, Edit2, Loader, Trash2, type LucideIcon } from 'lucide-react';
import ScrollingText from '../tools/ScrollingText';

/** Apparence de la vignette affichée quand l'entité n'a pas d'image. */
export interface CardPlaceholder {
    icon: LucideIcon;
    /** Texte optionnel sous l'icône, en version bureau. */
    label?: string;
    /** Classes du cadre (fond, bordure). */
    className: string;
    iconClassName: string;
}

interface EntityCardProps {
    title: string;
    description: string;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string | null;
    /** Rapport d'image en version bureau, ex. `aspect-square`. */
    desktopImageClass: string;
    /** Taille de la miniature en version mobile, ex. `w-14 h-14`. */
    mobileImageClass: string;
    placeholder: CardPlaceholder;
    /** Icône affichée devant le titre. */
    titleIcon?: LucideIcon;
    /** Pastille affichée à droite du titre (type de produit, par exemple). */
    badge?: React.ReactNode;
    isDeleting?: boolean;
    onEdit: () => void;
    onDelete: () => void;
}

const formatShortDate = (value: string): string =>
    new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });

/**
 * Carte d'une entité illustrée, en versions bureau (grille) et mobile (liste).
 *
 * ProductCard et AchievementCard étaient le même composant à l'icône et au
 * rapport d'image près — environ deux cents lignes dupliquées.
 */
const EntityCard: React.FC<EntityCardProps> = ({
    title,
    description,
    imageUrl,
    createdAt,
    updatedAt,
    desktopImageClass,
    mobileImageClass,
    placeholder,
    titleIcon: TitleIcon,
    badge,
    isDeleting = false,
    onEdit,
    onDelete,
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const PlaceholderIcon = placeholder.icon;
    const wasEdited = Boolean(updatedAt && updatedAt !== createdAt);

    const actions = (size: number) => (
        <>
            <button
                type="button"
                onClick={onEdit}
                disabled={isDeleting}
                className="btn btn-ghost btn-xs btn-square opacity-70 hover:opacity-100 hover:bg-base-200 transition-all disabled:opacity-30"
                title="Modifier"
                aria-label={`Modifier ${title}`}
            >
                <Edit2 size={size} />
            </button>
            <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="btn btn-ghost btn-xs btn-square text-error opacity-70 hover:opacity-100 hover:bg-base-200 transition-all disabled:opacity-30"
                title="Supprimer"
                aria-label={`Supprimer ${title}`}
            >
                {isDeleting ? (
                    <Loader size={size} className="animate-spin" />
                ) : (
                    <Trash2 size={size} />
                )}
            </button>
        </>
    );

    const dates = (
        <>
            <div className="flex items-center gap-1">
                <Calendar size={10} />
                <span>{formatShortDate(createdAt)}</span>
            </div>
            {wasEdited && updatedAt && (
                <div className="flex items-center gap-1" title="Dernière modification">
                    <CalendarCheck size={10} />
                    <span>{formatShortDate(updatedAt)}</span>
                </div>
            )}
        </>
    );

    return (
        <>
            {/* Version bureau — carte en grille */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    <div className="flex-shrink-0 mb-3">
                        {imageUrl ? (
                            <div
                                className={`w-full ${desktopImageClass} rounded-md overflow-hidden bg-base-200`}
                            >
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div
                                className={`w-full ${desktopImageClass} rounded-md flex items-center justify-center ${placeholder.className}`}
                            >
                                <div className="text-center">
                                    <PlaceholderIcon
                                        size={32}
                                        className={`mx-auto ${placeholder.iconClassName}`}
                                    />
                                    {placeholder.label && (
                                        <span className="text-xs font-medium">
                                            {placeholder.label}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col min-h-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            {TitleIcon && (
                                <TitleIcon size={16} className="mt-0.5 flex-shrink-0 opacity-70" />
                            )}
                            <ScrollingText
                                text={title}
                                active={isHovered}
                                className="text-sm font-semibold text-base-content/90"
                            />
                            {badge}
                        </div>

                        <p className="text-xs text-base-content/70 line-clamp-3 mb-3 leading-relaxed flex-1 min-h-[3rem]">
                            {description}
                        </p>

                        <div className="mt-auto space-y-2">
                            <div className="flex items-center justify-between text-xs text-base-content/50">
                                {dates}
                            </div>
                            <div className="flex justify-end gap-1 pt-2 border-t border-base-content/10">
                                {actions(12)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Version mobile — ligne de liste */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {imageUrl ? (
                            <div
                                className={`${mobileImageClass} rounded-md overflow-hidden bg-base-200`}
                            >
                                <img
                                    src={imageUrl}
                                    alt={title}
                                    loading="lazy"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div
                                className={`${mobileImageClass} rounded-md flex items-center justify-center ${placeholder.className}`}
                            >
                                <PlaceholderIcon size={18} className={placeholder.iconClassName} />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            {TitleIcon && (
                                <TitleIcon size={14} className="mt-0.5 flex-shrink-0 opacity-70" />
                            )}
                            <h3 className="text-sm font-semibold text-base-content/90 truncate flex-1">
                                {title}
                            </h3>
                            {badge}
                        </div>

                        <p className="text-xs text-base-content/60 line-clamp-2 mb-2 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-base-content/50">
                                {dates}
                            </div>
                            <div className="flex items-center gap-1">{actions(14)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EntityCard;
