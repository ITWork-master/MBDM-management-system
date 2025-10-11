// src/components/ProductCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Trash2, Image as ImageIcon, Calendar, CalendarCheck } from 'lucide-react';
import type { Product } from '../types/type';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const titleRef = useRef<HTMLHeadingElement>(null);

    const handleEdit = () => {
        onEdit(product);
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            onDelete(product.id);
        }
    };

    // Vérifier si le texte dépasse
    useEffect(() => {
        const titleElement = titleRef.current;
        if (titleElement) {
            const isTextOverflowing = titleElement.scrollWidth > titleElement.clientWidth;
            setIsOverflowing(isTextOverflowing);
        }
    }, [product.title]);

    return (
        <>
            {/* Version Desktop - Grille avec image carrée */}
            <div
                className="hidden md:block bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group h-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="flex flex-col h-full">
                    {/* Image carrée compacte */}
                    <div className="flex-shrink-0 mb-3">
                        {product.image_url ? (
                            <div className="w-full aspect-square rounded-md overflow-hidden bg-base-200">
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ) : (
                            <div className="w-full aspect-square rounded-md bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                                <ImageIcon size={32} className="text-base-content/30" />
                            </div>
                        )}
                    </div>

                    {/* Contenu compact */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* En-tête avec titre et type */}
                        <div className="flex items-start justify-between gap-2 mb-2">
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
                                    title={isOverflowing ? product.title : ''}
                                >
                                    {product.title}
                                </h3>

                                {/* Gradient overlay pour indiquer qu'il y a plus de texte */}
                                {isOverflowing && !isHovered && (
                                    <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-base-100 to-transparent" />
                                )}
                            </div>
                            
                            {/* Type badge compact */}
                            <span className="badge badge-primary badge-outline capitalize">
                                {product.type}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-base-content/70 line-clamp-3 mb-3 leading-relaxed flex-1 min-h-[3rem]">
                            {product.description}
                        </p>

                        {/* Dates et actions */}
                        <div className="mt-auto space-y-2">
                            {/* Dates compactes */}
                            <div className="flex items-center justify-between text-xs text-base-content/50">
                                <div className="flex items-center gap-1">
                                    <Calendar size={10} />
                                    <span>
                                        {new Date(product.created_at).toLocaleDateString('fr-FR', {
                                            day: 'numeric',
                                            month: 'short'
                                        })}
                                    </span>
                                </div>
                                {product.updated_at && product.updated_at !== product.created_at && (
                                    <div className="flex items-center gap-1" title="Dernière modification">
                                        <CalendarCheck size={10} />
                                        <span>
                                            {new Date(product.updated_at).toLocaleDateString('fr-FR', {
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

            {/* Version Mobile - Liste avec image carrée */}
            <div className="md:hidden bg-base-100 rounded-lg border border-base-content/10 p-3 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start gap-3">
                    {/* Image carrée miniature */}
                    <div className="flex-shrink-0">
                        {product.image_url ? (
                            <div className="w-14 h-14 rounded-md overflow-hidden bg-base-200">
                                <img
                                    src={product.image_url}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-md bg-gradient-to-br from-base-200 to-base-300 flex items-center justify-center">
                                <ImageIcon size={20} className="text-base-content/30" />
                            </div>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                        {/* En-tête avec titre et type */}
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-base-content/90 truncate flex-1">
                                {product.title}
                            </h3>
                            <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full whitespace-nowrap flex-shrink-0">
                                T{product.type}
                            </span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-base-content/60 line-clamp-2 mb-2 leading-relaxed">
                            {product.description}
                        </p>

                        {/* Dates et actions */}
                        <div className="flex items-center justify-between">
                            {/* Dates version mobile */}
                            <div className="flex items-center gap-3 text-xs text-base-content/50">
                                <span>
                                    {new Date(product.created_at).toLocaleDateString('fr-FR', {
                                        day: 'numeric',
                                        month: 'short'
                                    })}
                                </span>
                                {product.updated_at && product.updated_at !== product.created_at && (
                                    <span title="Dernière modification">
                                        modif: {new Date(product.updated_at).toLocaleDateString('fr-FR', {
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

export default ProductCard;