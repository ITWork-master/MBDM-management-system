// src/components/ProductCard.tsx
import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import type { Product } from './../services/products.service';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onEdit, onDelete }) => {
    const handleEdit = () => {
        onEdit(product);
    };

    const handleDelete = () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            onDelete(product.id);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            {/* Image du produit */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                    />
                ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100">
                        <ImageIcon size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Contenu du produit */}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.title}
                </h3>

                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {product.description}
                </p>

                {/* Date de création */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                        Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
                    </span>
                    {product.updated_at && (
                        <span>
                            Modifié le {new Date(product.updated_at).toLocaleDateString('fr-FR')}
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

export default ProductCard;