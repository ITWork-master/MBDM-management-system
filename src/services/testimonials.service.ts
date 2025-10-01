// src/services/testimonials.service.ts
import type { CreateTestimonialData, Testimonial, UpdateTestimonialData } from '../types/type';
import { supabase } from './../lib/supabase/Supabase';

export const testimonialsService = {
    // Créer un témoignage
    async createTestimonial(testimonialData: CreateTestimonialData): Promise<Testimonial> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('testimonials')
            .insert([
                {
                    ...testimonialData,
                    user_id: user.id,
                }
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création du témoignage: ${error.message}`);
        }

        return data;
    },

    // Récupérer tous les témoignages de l'utilisateur
    async getTestimonials(): Promise<Testimonial[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Erreur lors de la récupération des témoignages: ${error.message}`);
        }

        return data || [];
    },

    // Récupérer un témoignage par ID
    async getTestimonialById(id: string): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Erreur lors de la récupération du témoignage: ${error.message}`);
        }

        return data;
    },

    // Mettre à jour un témoignage
    async updateTestimonial(id: string, updateData: UpdateTestimonialData): Promise<Testimonial> {
        const { data, error } = await supabase
            .from('testimonials')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la mise à jour du témoignage: ${error.message}`);
        }

        return data;
    },

    // Supprimer un témoignage
    async deleteTestimonial(id: string): Promise<void> {
        const { error } = await supabase
            .from('testimonials')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(`Erreur lors de la suppression du témoignage: ${error.message}`);
        }
    },
};