// src/hooks/useTestimonials.ts
import { useState, useCallback } from 'react';
import { testimonialsService, type Testimonial, type CreateTestimonialData, type UpdateTestimonialData } from './../../services/testimonials.service';

export const useTestimonials = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTestimonial = useCallback(async (testimonialData: CreateTestimonialData): Promise<Testimonial> => {
        setLoading(true);
        setError(null);

        try {
            const testimonial = await testimonialsService.createTestimonial(testimonialData);
            return testimonial;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTestimonials = useCallback(async (): Promise<Testimonial[]> => {
        setLoading(true);
        setError(null);

        try {
            const testimonials = await testimonialsService.getTestimonials();
            return testimonials;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTestimonialById = useCallback(async (id: string): Promise<Testimonial> => {
        setLoading(true);
        setError(null);

        try {
            const testimonial = await testimonialsService.getTestimonialById(id);
            return testimonial;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateTestimonial = useCallback(async (id: string, updateData: UpdateTestimonialData): Promise<Testimonial> => {
        setLoading(true);
        setError(null);

        try {
            const testimonial = await testimonialsService.updateTestimonial(id, updateData);
            return testimonial;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTestimonial = useCallback(async (id: string): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
            await testimonialsService.deleteTestimonial(id);
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
        createTestimonial,
        getTestimonials,
        getTestimonialById,
        updateTestimonial,
        deleteTestimonial,
        clearError,
    };
};