import type { User } from '@supabase/supabase-js';

// -- Thème ------------------------------------------------------------------

export type ThemeName = 'light' | 'dark';

// -- Navigation -------------------------------------------------------------

export const APP_VIEWS = [
    'login',
    'register',
    'forgot-password',
    'reset-password',
    'dashboard',
    'products',
    'testimonials',
    'achievements',
    'settings',
] as const;

export type AppView = (typeof APP_VIEWS)[number];

/**
 * Vues accessibles sans être connecté.
 *
 * `reset-password` en est volontairement absente : le lien de récupération
 * ouvre une session temporaire, l'utilisateur y est donc authentifié. L'y
 * inclure ferait rebondir la garde d'accès vers le tableau de bord.
 */
export const PUBLIC_VIEWS: readonly AppView[] = ['login', 'register', 'forgot-password'];

// -- Auth -------------------------------------------------------------------

export interface Profile {
    id: string;
    name: string;
    theme: ThemeName;
}

export interface AuthState {
    user: User | null;
    userName: string | null;
    userTheme: ThemeName;
    error: string | null;
}

// -- Base commune aux entités ----------------------------------------------

/** Champs que toute ligne possède, quelle que soit la table. */
export interface BaseEntity {
    id: string;
    user_id: string;
    created_at: string;
    updated_at: string | null;
}

/** Entité illustrée par une image du bucket de stockage. */
export interface ImageEntity extends BaseEntity {
    title: string;
    description: string;
    image_url: string | null;
}

// -- Produits ---------------------------------------------------------------

export const PRODUCT_TYPES = [
    'electrique',
    'thermique',
    'climatisation',
    'ventilation',
    'froid',
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];

/** Libellés affichés, indexés par valeur stockée en base. */
export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
    electrique: 'Électrique',
    thermique: 'Thermique',
    climatisation: 'Climatisation',
    ventilation: 'Ventilation',
    froid: 'Froid',
};

export const isProductType = (value: unknown): value is ProductType =>
    PRODUCT_TYPES.includes(value as ProductType);

export interface Product extends ImageEntity {
    type: ProductType;
}

export interface CreateProductData {
    title: string;
    description: string;
    type: ProductType;
    image_url?: string | null;
}

export type UpdateProductData = Partial<CreateProductData>;

// -- Interventions ----------------------------------------------------------

export type Achievement = ImageEntity;

export interface CreateAchievementData {
    title: string;
    description: string;
    image_url?: string | null;
}

export type UpdateAchievementData = Partial<CreateAchievementData>;

// -- Témoignages ------------------------------------------------------------

export interface Testimonial extends BaseEntity {
    client_name: string;
    message: string;
}

export interface CreateTestimonialData {
    client_name: string;
    message: string;
}

export type UpdateTestimonialData = Partial<CreateTestimonialData>;
