// src/services/products.services.ts
import { supabase } from './../lib/supabase/Supabase';

export interface Product {
    id: string;
    user_id: string;
    title: string;
    description: string;
    image_url: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface CreateProductData {
    title: string;
    description: string;
    image_url?: string;
}

export interface UpdateProductData {
    title?: string;
    description?: string;
    image_url?: string;
}

export const productsService = {
    // Créer un produit
    async createProduct(productData: CreateProductData): Promise<Product> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('images')
            .insert([
                {
                    ...productData,
                    user_id: user.id,
                }
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création du produit: ${error.message}`);
        }

        return data;
    },

    // Récupérer tous les produits de l'utilisateur
    async getProducts(): Promise<Product[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('images')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Erreur lors de la récupération des produits: ${error.message}`);
        }

        return data || [];
    },

    // Récupérer un produit par ID
    async getProductById(id: string): Promise<Product> {
        const { data, error } = await supabase
            .from('images')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Erreur lors de la récupération du produit: ${error.message}`);
        }

        return data;
    },

    // Mettre à jour un produit
    async updateProduct(id: string, updateData: UpdateProductData): Promise<Product> {
        const { data, error } = await supabase
            .from('images')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la mise à jour du produit: ${error.message}`);
        }

        return data;
    },

    // Version avec gestion d'erreurs séparées pour plus de robustesse
    async deleteProduct(id: string): Promise<void> {
        // Récupérer d'abord le produit pour avoir l'URL de l'image
        const { data: product, error: fetchError } = await supabase
            .from('images')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Erreur lors de la récupération du produit: ${fetchError.message}`);
        }

        // Supprimer l'image du bucket si elle existe (ne pas bloquer si ça échoue)
        if (product?.image_url) {
            this.deleteImageFromStorage(product.image_url).catch(error => {
                console.warn('Échec de la suppression de l\'image, continuation...', error);
            });
        }

        // Supprimer le produit de la base de données
        const { error: deleteError } = await supabase
            .from('images')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw new Error(`Erreur lors de la suppression du produit: ${deleteError.message}`);
        }
    },

    async deleteImageFromStorage(imageUrl: string): Promise<void> {
        try {
            // Méthode simple : extraire le nom de fichier de l'URL
            const url = new URL(imageUrl);
            const pathname = url.pathname;

            // Supprimer le début du chemin pour garder seulement la partie après /images/
            const imagesIndex = pathname.indexOf('/images/');
            if (imagesIndex !== -1) {
                const filePath = pathname.substring(imagesIndex + 8); // +8 pour supprimer "/images/"

                const { error } = await supabase.storage
                    .from('images')
                    .remove([filePath]);

                if (error) {
                    throw error;
                }
            }
        } catch (error) {
            console.warn('Erreur suppression image storage:', error);
            throw error; // Relancer pour que l'appelant puisse gérer si nécessaire
        }
    },

    // Uploader une image
    async uploadImage(file: File): Promise<string> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(fileName, file);

        if (uploadError) {
            throw new Error(`Erreur lors de l'upload de l'image: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(fileName);

        return publicUrl;
    }
};