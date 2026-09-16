import { useCrud } from './useCrud';
import { productsService } from '../services/products.service';
import type { CreateProductData, Product, UpdateProductData } from '../types/type';

const MESSAGES = {
    created: 'Produit ajouté.',
    updated: 'Produit modifié.',
    removed: 'Produit supprimé.',
};

export const useProducts = () =>
    useCrud<Product, CreateProductData, UpdateProductData>(productsService, MESSAGES);
