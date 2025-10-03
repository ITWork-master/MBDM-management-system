// src/components/Products.tsx
import React, { useState, useEffect, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import Modal from './tools/Modal';
import ProductCard from './ProductCard';
import { Plus, Loader, Package, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { useProduct } from './hooks/UseProducts';
import type { Product, UpdateProductData } from '../types/type';

// Types pour le recadrage
interface Crop {
  x: number;
  y: number;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const Products: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '1'
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    // États pour le recadrage
    const [crop, setCrop] = useState<Crop>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    const {
        createProduct,
        getProducts,
        updateProduct,
        deleteProduct,
        uploadImage,
        loading,
        error
    } = useProduct();

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

    // Fonction pour créer une image recadrée
    const createCroppedImage = useCallback(async (): Promise<Blob> => {
        if (!imageSrc || !croppedAreaPixels) {
            throw new Error('Image source ou zone recadrée manquante');
        }

        const image = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve, reject) => {
            image.onload = () => {
                const { x, y, width, height } = croppedAreaPixels;

                canvas.width = width;
                canvas.height = height;

                if (ctx) {
                    // Sauvegarder l'état du contexte
                    ctx.save();
                    
                    // Translater vers le centre pour la rotation
                    ctx.translate(width / 2, height / 2);
                    ctx.rotate((rotation * Math.PI) / 180);
                    ctx.translate(-width / 2, -height / 2);
                    
                    // Dessiner l'image recadrée
                    ctx.drawImage(
                        image,
                        x,
                        y,
                        width,
                        height,
                        0,
                        0,
                        width,
                        height
                    );
                    
                    // Restaurer l'état du contexte
                    ctx.restore();

                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Erreur lors de la création du blob'));
                        }
                    }, 'image/jpeg', 0.9);
                }
            };
            image.onerror = reject;
            image.src = imageSrc;
        });
    }, [imageSrc, croppedAreaPixels, rotation]);

    // Fonction appelée quand le recadrage change
    const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CroppedArea) => {
        setCroppedAreaPixels(croppedAreaPixels);
        console.log(croppedArea);
        
    }, []);

    // Gestion de la sélection d'image avec recadrage
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = () => {
                setImageSrc(reader.result as string);
                setSelectedImage(file);
                setIsCropModalOpen(true);
                // Réinitialiser les paramètres de recadrage
                setCrop({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
            };
            
            reader.readAsDataURL(file);
        }
    };

    // Confirmer le recadrage
    const handleConfirmCrop = async () => {
        try {
            if (croppedAreaPixels) {
                const croppedImageBlob = await createCroppedImage();
                const croppedFile = new File([croppedImageBlob], selectedImage?.name || 'cropped-image.jpg', {
                    type: 'image/jpeg'
                });
                setSelectedImage(croppedFile);
            }
            setIsCropModalOpen(false);
        } catch (error) {
            console.error('Erreur lors du recadrage:', error);
            alert('Erreur lors du recadrage de l\'image');
        }
    };

    const handleOpenModal = () => {
        setEditingProduct(null);
        setFormData({ title: '', description: '', type: '1' });
        setSelectedImage(null);
        setImageSrc(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({ title: '', description: '', type: '1' });
        setSelectedImage(null);
        setImageSrc(null);
    };

    const handleCloseCropModal = () => {
        setIsCropModalOpen(false);
        setSelectedImage(null);
        setImageSrc(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        try {
            let imageUrl = undefined;

            if (selectedImage) {
                imageUrl = await uploadImage(selectedImage);
            }

            if (editingProduct) {
                const updateData: UpdateProductData = {
                    title: formData.title,
                    description: formData.description,
                    type: formData.type
                };

                if (imageUrl) {
                    updateData.image_url = imageUrl;
                }

                await updateProduct(editingProduct.id, updateData);
                alert('Produit modifié avec succès!');
            } else {
                await createProduct({
                    title: formData.title,
                    description: formData.description,
                    type: formData.type,
                    image_url: imageUrl,
                });
                alert('Produit créé avec succès!');
            }

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
            type: product.type
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

    if (isLoadingProducts) {
        return (
            <ComponentsLayout className='overflow-clip'>
                <Navbar sectionName='Produits' />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-base-content/60">Chargement des produits...</p>
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
                    <h1 className="text-2xl font-bold text-base-content/90">Mes Produits</h1>
                    <span className="text-base-content/60">
                        {products.length} produit{products.length > 1 ? 's' : ''}
                    </span>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-base-content/40 mb-4">
                            <Package size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-base-content/90 mb-2">
                            Aucun produit
                        </h3>
                        <p className="text-base-content/60 mb-4">
                            Commencez par ajouter votre premier produit.
                        </p>
                        <button
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-blue-500 text-base-content rounded-md hover:bg-blue-600 transition-colors duration-200"
                        >
                            Ajouter un produit
                        </button>
                    </div>
                ) : (
                    <div>
                        {/* Version Desktop */}
                        <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={handleEditProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                        </div>

                        {/* Version Mobile */}
                        <div className="md:hidden space-y-3">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onEdit={handleEditProduct}
                                    onDelete={handleDeleteProduct}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Button Add flottant */}
            {products.length > 0 && (
                <button
                    onClick={handleOpenModal}
                    className='rounded-full bg-blue-500 w-max p-4 text-base-content fixed bottom-10 right-10 hover:bg-blue-600 transition-colors duration-200 shadow-lg'
                >
                    <Plus size={30} />
                </button>
            )}

            {/* Modal principal Add/Edit */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-6">{modalTitle}</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className='flex flex-col sm:flex-row gap-4'>
                            <div className='flex-1'>
                                <label className="block text-sm font-medium text-base-content/70 mb-2">
                                    Nom du produit *
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Entrez le nom du produit"
                                    required
                                />
                            </div>
                            <div className='flex-1'>
                                <label className="block text-sm font-medium text-base-content/70 mb-2">
                                    Type *
                                </label>
                                <select
                                    name="type"
                                    className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.type}
                                    onChange={handleTypeChange}
                                    required
                                >
                                    <option value="1">Type 1</option>
                                    <option value="2">Type 2</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Description *
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-base-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={4}
                                placeholder="Entrez la description du produit"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-base-content/70 mb-2">
                                Image du produit
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input file-input-bordered w-full focus:ring-2 focus:ring-blue-500"
                            />
                            {selectedImage && !isCropModalOpen && (
                                <p className="mt-2 text-sm text-base-content/60">
                                    Image sélectionnée: {selectedImage.name}
                                </p>
                            )}
                            {editingProduct?.image_url && !selectedImage && (
                                <p className="mt-2 text-sm text-base-content/60">
                                    Image actuelle: <a href={editingProduct.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Voir l'image</a>
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={loading}
                                className="px-4 py-2 text-base-content/60 border border-base-300 rounded-md hover:bg-base-200 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !formData.title || !formData.description}
                                className="px-4 py-2 bg-blue-500 text-base-content rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {loading && <Loader className="animate-spin h-4 w-4" />}
                                <span>{loading ? 'Chargement...' : submitButtonText}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal de recadrage */}
            <Modal isOpen={isCropModalOpen} onClose={handleCloseCropModal}>
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Recadrer l'image</h2>
                    
                    {imageSrc && (
                        <div className="space-y-4">
                            {/* Zone de recadrage */}
                            <div className="relative h-64 w-full bg-base-200 rounded-lg overflow-hidden">
                                <Cropper
                                    image={imageSrc}
                                    crop={crop}
                                    zoom={zoom}
                                    rotation={rotation}
                                    aspect={3 / 3}
                                    onCropChange={setCrop}
                                    onZoomChange={setZoom}
                                    onRotationChange={setRotation}
                                    onCropComplete={onCropComplete}
                                    objectFit="contain"
                                />
                            </div>

                            {/* Contrôles de zoom */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-sm">
                                    <ZoomOut size={16} />
                                    <input
                                        type="range"
                                        min={1}
                                        max={3}
                                        step={0.1}
                                        value={zoom}
                                        onChange={(e) => setZoom(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <ZoomIn size={16} />
                                </label>

                                {/* Contrôle de rotation */}
                                <label className="flex items-center space-x-2 text-sm">
                                    <RotateCcw size={16} />
                                    <span>Rotation:</span>
                                    <input
                                        type="range"
                                        min={0}
                                        max={360}
                                        step={1}
                                        value={rotation}
                                        onChange={(e) => setRotation(Number(e.target.value))}
                                        className="w-full"
                                    />
                                    <span>{rotation}°</span>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseCropModal}
                                    className="px-4 py-2 text-base-content/60 border border-base-300 rounded-md hover:bg-base-200 transition-colors duration-200"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCrop}
                                    className="px-4 py-2 bg-blue-500 text-base-content rounded-md hover:bg-blue-600 transition-colors duration-200"
                                >
                                    Confirmer le recadrage
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>
        </ComponentsLayout>
    );
};

export default Products;