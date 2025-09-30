// src/services/supabase.service.ts
import { supabase } from "../lib/supabase/Supabase";

const registerNewUser = async (email: string, password: string, name: string) => {
    try {
        // Validation des entrées
        if (!email || !password || !name) {
            throw new Error('Tous les champs sont requis');
        }

        if (password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        // Inscription de l'utilisateur
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            throw new Error(`Erreur inscription: ${error.message}`);
        }

        const user = data.user;
        if (!user) {
            throw new Error('Utilisateur non retourné après inscription');
        }

        // Création du profil
        const { error: profileError } = await supabase.from('profiles').insert({
            id: user.id,
            name: name
        });

        if (profileError) {
            // Si la création du profil échoue, on supprime l'utilisateur créé pour éviter les incohérences
            await supabase.auth.admin.deleteUser(user.id);
            throw new Error(`Erreur création profil: ${profileError.message}`);
        }

        console.log('Inscription réussie avec profil');
        return { user, profileCreated: true };
    } catch (error) {
        console.error('Erreur dans registerNewUser:', error);
        throw error;
    }
};

const loginUser = async (email: string, password: string) => {
    try {
        // Vérif des champs
        if (!email || !password) {
            throw new Error('Email et mot de passe sont requis');
        }

        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(`Erreur de connexion: ${error.message}`);
        }

        const user = data.user;
        if (!user) {
            throw new Error('Aucun utilisateur retourné après connexion');
        }

        // Récupération du profil lié
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            throw new Error(`Erreur chargement profil: ${profileError.message}`);
        }

        console.log('Utilisateur connecté avec profil:', { user, profile });

        return { user, profile };
    } catch (error) {
        console.error('Erreur dans loginUserWithProfile:', error);
        throw error;
    }
};


export {
    loginUser,
    registerNewUser
}