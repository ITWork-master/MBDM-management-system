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

export type AppView =  'login' | 'register' | 'dashboard' | 'products' | 'testimonials' | 'achievements' | 'settings';