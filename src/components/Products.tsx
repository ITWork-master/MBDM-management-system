// src/components/Products.tsx
import React, { useState, useEffect } from 'react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import Modal from './tools/Modal';
import ProductCard from './ProductCard';
import { Plus, Loader } from 'lucide-react';
import { useProduct } from './hooks/UseProducts';
import type { Product, UpdateProductData } from './../services/products.service';

const Products: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    const {
        createProduct,
        getProducts,
        updateProduct,
        deleteProduct,
        uploadImage,
        loading,
        error
    } = useProduct();

    // Charger les produits au montage du composant
    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setIsLoadingProducts(true);
            const productsData = await getProducts();
            setProducts(productsData);
        } catch (err) {
            console.error('Erreur lors du chargement des produits:', err);
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const handleOpenModal = () => {
        setEditingProduct(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ title: '', description: '' });
        setSelectedImage(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedImage(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = undefined;

            // Upload de l'image si une nouvelle image est sélectionnée
            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            if (editingProduct) {
                // Mise à jour du produit existant
                const updateData: UpdateProductData = {
                    title: formData.title,
                    description: formData.description,
                };

                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                await updateProduct(editingProduct.id, updateData);
                alert('Produit modifié avec succès!');
            } else {
                // Création d'un nouveau produit
                await createProduct({
                    title: formData.title,
                    description: formData.description,
                    image_url: imageUrl,
                });
                alert('Produit créé avec succès!');
            }

            // Recharger les produits et fermer le modal
            await loadProducts();
            handleCloseModal();

        } catch (err) {
            console.error('Erreur:', err);
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            title: product.title,
            description: product.description || '',
        });
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (productId: string) => {
        try {
            await deleteProduct(productId);
            await loadProducts();
            alert('Produit supprimé avec succès!');
        } catch (err) {
            console.error('Erreur lors de la suppression:', err);
        }
    };

    const modalTitle = editingProduct ? 'Modifier le produit' : 'Ajouter un produit';
    const submitButtonText = editingProduct ? 'Modifier le produit' : 'Ajouter le produit';

    // État de chargement principal
    if (isLoadingProducts) {
        return (
            <ComponentsLayout className='overflow-clip'>
                <Navbar sectionName='Produits' />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600">Chargement des produits...</p>
                    </div>
                </div>
            </ComponentsLayout>
        );
    }

    return (
        <ComponentsLayout className='overflow-clip'>
            <Navbar sectionName='Produits' />

            {/* Liste des produits */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Mes Produits</h1>
                    <span className="text-gray-600">
                        {products.length} produit{products.length > 1 ? 's' : ''}
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <Plus size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Aucun produit
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Commencez par ajouter votre premier produit.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                        >
                            Ajouter un produit
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handleEditProduct}
                                onDelete={handleDeleteProduct}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Button Add flottant */}
            {products.length > 0 && (
                <button
                    onClick={handleOpenModal}
                    className='rounded-full bg-blue-500 w-max p-4 text-white fixed bottom-10 right-10 hover:bg-blue-700 transition-colors duration-200 shadow-lg'
                >
                    <Plus size={30} />
                </button>
            )}

            {/* Modal Add/Edit */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{modalTitle}</h2>

                    {/* Affichage des erreurs */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Formulaire */}
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom du produit *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Entrez le nom du produit"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Entrez la description du produit"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Image du produit
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {selectedImage && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Nouvelle image sélectionnée: {selectedImage.name}
                                </p>
                            )}
                            {editingProduct?.image_url && !selectedImage && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Image actuelle: <a href={editingProduct.image_url} target="_blank" rel="noopener noreferrer" className="text-neutral hover:underline">Voir l'image</a>
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.description}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && <Loader className="animate-spin h-4 w-4" />}
                                <span>{loading ? 'Chargement...' : submitButtonText}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </ComponentsLayout>
    );
};

export default Products;