import type { CreateAchievementData, Achievement, UpdateAchievementData } from '../types/type';
import { supabase } from './../lib/supabase/Supabase';

export const achievementsService = {
    // Créer un exploit
    async createAchievement(achievementData: CreateAchievementData): Promise<Achievement> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('achievements')
            .insert([
                {
                    ...achievementData,
                    user_id: user.id,
                }
            ])
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la création de l'exploit: ${error.message}`);
        }

        return data;
    },

    // Récupérer tous les exploits de l'utilisateur
    async getAchievements(): Promise<Achievement[]> {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            throw new Error('Utilisateur non connecté');
        }

        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw new Error(`Erreur lors de la récupération des exploits: ${error.message}`);
        }

        return data || [];
    },

    // Récupérer un exploit par ID
    async getAchievementById(id: string): Promise<Achievement> {
        const { data, error } = await supabase
            .from('achievements')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(`Erreur lors de la récupération de l'exploit: ${error.message}`);
        }

        return data;
    },

    // Mettre à jour un exploit
    async updateAchievement(id: string, updateData: UpdateAchievementData): Promise<Achievement> {
        const { data, error } = await supabase
            .from('achievements')
            .update({
                ...updateData,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new Error(`Erreur lors de la mise à jour de l'exploit: ${error.message}`);
        }

        return data;
    },

    // Supprimer un exploit
    async deleteAchievement(id: string): Promise<void> {
        // Récupérer d'abord l'exploit pour avoir l'URL de l'image
        const { data: achievement, error: fetchError } = await supabase
            .from('achievements')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) {
            throw new Error(`Erreur lors de la récupération de l'exploit: ${fetchError.message}`);
        }

        // Supprimer l'image du bucket si elle existe
        if (achievement?.image_url) {
            await this.deleteImageFromStorage(achievement.image_url);
        }

        // Supprimer l'exploit de la base de données
        const { error: deleteError } = await supabase
            .from('achievements')
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw new Error(`Erreur lors de la suppression de l'exploit: ${deleteError.message}`);
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
    },

    // Supprimer une image du storage
    async deleteImageFromStorage(imageUrl: string): Promise<void> {
        try {
            const url = new URL(imageUrl);
            const pathname = url.pathname;

            const imagesIndex = pathname.indexOf('/images/');
            if (imagesIndex !== -1) {
                const filePath = pathname.substring(imagesIndex + 8);

                const { error } = await supabase.storage
                    .from('images')
                    .remove([filePath]);

                if (error) {
                    console.warn(`Impossible de supprimer l'image du storage: ${error.message}`);
                }
            }
        } catch (error) {
            console.warn('Erreur lors de la suppression de l\'image:', error);
        }
    }
};