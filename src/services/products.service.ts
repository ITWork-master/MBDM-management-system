import { createCrudService } from './crud.service';
import type { CreateProductData, Product, UpdateProductData } from '../types/type';

/**
 * Les produits sont stockés dans la table `images` pour des raisons
 * historiques. Ce n'est pas le bucket de stockage, qui porte le même nom
 * (cf. IMAGE_BUCKET dans storage.service.ts).
 */
export const PRODUCTS_TABLE = 'images';

export const productsService = createCrudService<Product, CreateProductData, UpdateProductData>({
    table: PRODUCTS_TABLE,
    labels: { one: 'du produit', many: 'des produits' },
    hasImage: true,
});
