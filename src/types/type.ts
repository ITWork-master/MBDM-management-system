import type { User } from "@supabase/supabase-js";

export interface AppUser {
    id: string;
    email: string;
    user_metadata?: {
        name?: string;
    };
}

export interface AuthState {
    user: User | null;
    userName: string | null;
    error: string | null;
}

export type AppView = 'login' | 'register' | 'dashboard' | 'products' | 'testimonials' | 'achievements' | 'settings';

// Products Interfaces
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

// Achievements Interfaces

export interface Achievement {
    id: string;
    user_id: string;
    title: string;
    description: string;
    image_url: string | null;
    created_at: string;
    updated_at: string | null;
}

export interface CreateAchievementData {
    title: string;
    description: string;
    image_url?: string;
}

export interface UpdateAchievementData {
    title?: string;
    description?: string;
    image_url?: string;
}


// Testimonials Interfaces
export interface Testimonial {
    id: string;
    user_id: string;
    client_name: string;
    message: string;
    created_at: string;
    updated_at: string | null;
}

export interface CreateTestimonialData {
    client_name: string;
    message: string;
}

export interface UpdateTestimonialData {
    client_name?: string;
    message?: string;
}