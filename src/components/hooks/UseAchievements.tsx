// src/hooks/useAchievements.ts
import { useState, useCallback } from 'react';
import { achievementsService } from './../../services/achievement.service';
import type { CreateAchievementData, Achievement, UpdateAchievementData } from '../../types/type';

export const useAchievements = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createAchievement = useCallback(async (achievementData: CreateAchievementData): Promise<Achievement> => {
        setLoading(true);
        setError(null);

        try {
            const achievement = await achievementsService.createAchievement(achievementData);
            return achievement;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAchievements = useCallback(async (): Promise<Achievement[]> => {
        setLoading(true);
        setError(null);

        try {
            const achievements = await achievementsService.getAchievements();
            return achievements;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getAchievementById = useCallback(async (id: string): Promise<Achievement> => {
        setLoading(true);
        setError(null);

        try {
            const achievement = await achievementsService.getAchievementById(id);
            return achievement;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateAchievement = useCallback(async (id: string, updateData: UpdateAchievementData): Promise<Achievement> => {
        setLoading(true);
        setError(null);

        try {
            const achievement = await achievementsService.updateAchievement(id, updateData);
            return achievement;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteAchievement = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await achievementsService.deleteAchievement(id);
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
            const imageUrl = await achievementsService.uploadImage(file);
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
        error,
        createAchievement,
        getAchievements,
        getAchievementById,
        updateAchievement,
        deleteAchievement,
        uploadImage,
        clearError,
    };
};