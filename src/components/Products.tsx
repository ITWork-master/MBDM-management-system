// src/components/Products.tsx
import React, { useMemo, useState } from 'react';
import { Image as ImageIcon, Package } from 'lucide-react';
import Navbar from './tools/Navbar';
import ComponentsLayout from './tools/ComponentsLayout';
import PageLoader from './tools/PageLoader';
import EmptyState from './tools/EmptyState';
import FloatingAddButton from './tools/FloatingAddButton';
import ImageCropperModal from './tools/ImageCropperModal';
import { useConfirm } from './tools/useConfirm';
import EntityCard from './entities/EntityCard';
import EntityFormModal from './entities/EntityFormModal';
import ImageField from './entities/ImageField';
import { useProducts } from '../hooks/useProducts';
import { useImagePicker } from '../hooks/useImagePicker';
import { deleteImage, uploadImage } from '../services/storage.service';
import { toMessage } from '../lib/errors';
import { toast } from 'sonner';
import {
    PRODUCT_TYPES,
    PRODUCT_TYPE_LABELS,
    isProductType,
    type CreateProductData,
    type Product,
    type ProductType,
} from '../types/type';

const EMPTY_FORM = {
    title: '',
    description: '',
    type: 'electrique' as ProductType,
};

const PLACEHOLDER = {
    icon: ImageIcon,
    className: 'bg-gradient-to-br from-base-200 to-base-300',
    iconClassName: 'text-base-content/30',
};

const Products: React.FC = () => {
    const products = useProducts();
    const picker = useImagePicker();
    const confirm = useConfirm();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState<Product | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isUploading, setIsUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | ProductType>('all');

    const filtered = useMemo(() => {
        const needle = searchTerm.trim().toLowerCase();
        return products.items.filter((product) => {
            const matchesType = filterType === 'all' || product.type === filterType;
            const matchesSearch =
                !needle ||
                product.title.toLowerCase().includes(needle) ||
                product.description.toLowerCase().includes(needle);
            return matchesType && matchesSearch;
        });
    }, [products.items, filterType, searchTerm]);

    const closeModal = () => {
        setIsModalOpen(false);
        setEditing(null);
        setForm(EMPTY_FORM);
        picker.reset();
        products.clearError();
    };

    const openCreateModal = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        picker.reset();
        products.clearError();
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        setEditing(product);
        setForm({
            title: product.title,
            description: product.description ?? '',
            type: isProductType(product.type) ? product.type : EMPTY_FORM.type,
        });
        picker.reset();
        products.clearError();
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        const title = form.title.trim();
        const description = form.description.trim();
        if (!title || !description) return;

        let uploadedUrl: string | undefined;
        if (picker.file) {
            setIsUploading(true);
            try {
                uploadedUrl = await uploadImage(picker.file);
            } catch (cause) {
                toast.error(toMessage(cause, "Erreur lors de l'envoi de l'image"));
                return;
            } finally {
                setIsUploading(false);
            }
        }

        const payload: CreateProductData = { title, description, type: form.type };
        if (uploadedUrl) payload.image_url = uploadedUrl;

        const saved = editing
            ? await products.update(editing.id, payload)
            : await products.create(payload);

        if (saved) {
            closeModal();
        } else if (uploadedUrl) {
            // L'enregistrement a échoué : ne pas laisser l'image envoyée orpheline.
            await deleteImage(uploadedUrl);
        }
    };

    const handleDelete = async (product: Product) => {
        const confirmed = await confirm({
            title: 'Supprimer le produit',
            message: `« ${product.title} » sera définitivement supprimé, ainsi que son image.`,
            confirmLabel: 'Supprimer',
            danger: true,
        });
        if (confirmed) await products.remove(product.id);
    };

    if (products.isLoading) {
        return (
            <ComponentsLayout className="overflow-clip">
                <Navbar sectionName="Produits" />
                <PageLoader message="Chargement des produits…" />
            </ComponentsLayout>
        );
    }

    const isSaving = products.isSaving || isUploading;
    const canSubmit = Boolean(form.title.trim() && form.description.trim());

    return (
        <ComponentsLayout className="overflow-clip">
            <Navbar sectionName="Produits" />

            <div className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                    <h1 className="text-2xl font-bold text-base-content/90">Mes Produits</h1>

                    <input
                        type="search"
                        placeholder="Rechercher un produit…"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label="Rechercher un produit"
                        className="input w-full sm:w-64"
                    />

                    <span className="text-base-content/60 whitespace-nowrap">
                        {filtered.length} produit{filtered.length > 1 ? 's' : ''}
                        {filterType !== 'all' && ' (filtrés)'}
                    </span>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                    {(['all', ...PRODUCT_TYPES] as const).map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilterType(value)}
                            className={`px-3 py-1 rounded-md text-sm transition-colors duration-200 ${
                                filterType === value
                                    ? 'bg-primary text-primary-content'
                                    : 'bg-base-200 text-base-content/70 hover:bg-base-300'
                            }`}
                        >
                            {value === 'all' ? 'Tous' : PRODUCT_TYPE_LABELS[value]}
                        </button>
                    ))}
                </div>

                {products.items.length === 0 ? (
                    <EmptyState
                        icon={Package}
                        title="Aucun produit"
                        description="Commencez par ajouter votre premier produit."
                        actionLabel="Ajouter un produit"
                        onAction={openCreateModal}
                    />
                ) : filtered.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-base-content/60">
                            Aucun produit ne correspond à votre recherche.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                        {filtered.map((product) => (
                            <EntityCard
                                key={product.id}
                                title={product.title}
                                description={product.description}
                                imageUrl={product.image_url}
                                createdAt={product.created_at}
                                updatedAt={product.updated_at}
                                desktopImageClass="aspect-square"
                                mobileImageClass="w-14 h-14"
                                placeholder={PLACEHOLDER}
                                badge={
                                    <span className="badge badge-primary badge-outline whitespace-nowrap flex-shrink-0">
                                        {PRODUCT_TYPE_LABELS[product.type] ?? product.type}
                                    </span>
                                }
                                isDeleting={products.deletingId === product.id}
                                onEdit={() => openEditModal(product)}
                                onDelete={() => handleDelete(product)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {products.items.length > 0 && (
                <FloatingAddButton onClick={openCreateModal} label="Ajouter un produit" />
            )}

            <EntityFormModal
                isOpen={isModalOpen}
                onClose={closeModal}
                heading={editing ? 'Modifier le produit' : 'Ajouter un produit'}
                submitLabel={editing ? 'Modifier le produit' : 'Ajouter le produit'}
                isSaving={isSaving}
                error={products.error}
                canSubmit={canSubmit}
                onSubmit={handleSubmit}
            >
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label
                            htmlFor="product-title"
                            className="block text-sm font-medium text-base-content/70 mb-2"
                        >
                            Nom du produit *
                        </label>
                        <input
                            id="product-title"
                            type="text"
                            value={form.title}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, title: event.target.value }))
                            }
                            className="input input-bordered w-full"
                            placeholder="Entrez le nom du produit"
                            required
                        />
                    </div>

                    <div className="flex-1">
                        <label
                            htmlFor="product-type"
                            className="block text-sm font-medium text-base-content/70 mb-2"
                        >
                            Type *
                        </label>
                        <select
                            id="product-type"
                            className="select select-bordered w-full"
                            value={form.type}
                            onChange={(event) =>
                                setForm((previous) => ({
                                    ...previous,
                                    type: isProductType(event.target.value)
                                        ? event.target.value
                                        : previous.type,
                                }))
                            }
                            required
                        >
                            {PRODUCT_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {PRODUCT_TYPE_LABELS[type]}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="product-description"
                        className="block text-sm font-medium text-base-content/70 mb-2"
                    >
                        Description *
                    </label>
                    <textarea
                        id="product-description"
                        value={form.description}
                        onChange={(event) =>
                            setForm((previous) => ({
                                ...previous,
                                description: event.target.value,
                            }))
                        }
                        className="textarea textarea-bordered w-full"
                        rows={4}
                        placeholder="Entrez la description du produit"
                        required
                    />
                </div>

                <ImageField
                    label="Image du produit"
                    picker={picker}
                    currentImageUrl={editing?.image_url}
                />
            </EntityFormModal>

            <ImageCropperModal
                isOpen={picker.isCropperOpen}
                src={picker.sourceUrl}
                aspect={1}
                onCancel={picker.cancelCrop}
                onConfirm={picker.confirmCrop}
            />
        </ComponentsLayout>
    );
};

export default Products;
