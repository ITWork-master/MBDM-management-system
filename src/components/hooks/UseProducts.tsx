// src/hooks/useProduct.ts
import { useState, useCallback } from 'react';
import { productsService } from './../../services/products.service';
import type { CreateProductData, Product, UpdateProductData } from '../../types/type';

export const useProduct = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createProduct = useCallback(async (productData: CreateProductData): Promise<Product> => {
        setLoading(true);
        setError(null);

        try {
            const product = await productsService.createProduct(productData);
            return product;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getProducts = useCallback(async (): Promise<Product[]> => {
        setLoading(true);
        setError(null);

        try {
            const products = await productsService.getProducts();
            return products;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getProductById = useCallback(async (id: string): Promise<Product> => {
        setLoading(true);
        setError(null);

        try {
            const product = await productsService.getProductById(id);
            return product;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProduct = useCallback(async (id: string, updateData: UpdateProductData): Promise<Product> => {
        setLoading(true);
        setError(null);

        try {
            const product = await productsService.updateProduct(id, updateData);
            return product;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteProduct = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await productsService.deleteProduct(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadImage = useCallback(async (file: File): Promise<string> => {
        setLoading(true);
        setError(null);

        try {
            const imageUrl = await productsService.uploadImage(file);
            return imageUrl;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        setLoading,
        error,
        createProduct,
        getProducts,
        getProductById,
        updateProduct,
        deleteProduct,
        uploadImage,
        clearError,
    };
};