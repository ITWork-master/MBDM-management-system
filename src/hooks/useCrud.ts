import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { CrudService } from '../services/crud.service';
import { toMessage } from '../lib/errors';
import type { BaseEntity } from '../types/type';

/** Messages de confirmation affichés après chaque opération réussie. */
export interface CrudToastMessages {
    created: string;
    updated: string;
    removed: string;
}

export interface CrudController<T, CreateData, UpdateData> {
    items: T[];
    /** Chargement initial de la liste. */
    isLoading: boolean;
    /** Création ou mise à jour en cours. */
    isSaving: boolean;
    /** Identifiant de la ligne en cours de suppression, le cas échéant. */
    deletingId: string | null;
    error: string | null;
    reload: () => Promise<void>;
    create: (data: CreateData) => Promise<boolean>;
    update: (id: string, data: UpdateData) => Promise<boolean>;
    remove: (id: string) => Promise<boolean>;
    clearError: () => void;
}

/**
 * État et opérations d'une liste d'entités.
 *
 * Remplace `useProducts` / `useAchievements` / `useTestimonials`, qui étaient
 * trois copies du même code à quelques identifiants près.
 *
 * Les états de chargement sont distincts : auparavant un `loading` unique
 * couvrait lecture, écriture et suppression, si bien qu'un envoi d'image
 * désactivait aussi les boutons de suppression des autres cartes.
 */
export const useCrud = <T extends BaseEntity, CreateData extends object, UpdateData extends object>(
    service: CrudService<T, CreateData, UpdateData>,
    messages: CrudToastMessages,
): CrudController<T, CreateData, UpdateData> => {
    const [items, setItems] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Évite d'écrire dans l'état après démontage (navigation pendant une requête).
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);

    const handleFailure = useCallback((cause: unknown) => {
        const message = toMessage(cause);
        if (mounted.current) setError(message);
        toast.error(message);
        return false;
    }, []);

    const reload = useCallback(async () => {
        if (mounted.current) setIsLoading(true);
        try {
            const rows = await service.list();
            if (mounted.current) {
                setItems(rows);
                setError(null);
            }
        } catch (cause) {
            handleFailure(cause);
        } finally {
            if (mounted.current) setIsLoading(false);
        }
    }, [service, handleFailure]);

    useEffect(() => {
        void reload();
    }, [reload]);

    const create = useCallback(
        async (data: CreateData) => {
            if (mounted.current) {
                setIsSaving(true);
                setError(null);
            }
            try {
                const created = await service.create(data);
                // La liste est triée par date de création décroissante.
                if (mounted.current) setItems((previous) => [created, ...previous]);
                toast.success(messages.created);
                return true;
            } catch (cause) {
                return handleFailure(cause);
            } finally {
                if (mounted.current) setIsSaving(false);
            }
        },
        [service, messages.created, handleFailure],
    );

    const update = useCallback(
        async (id: string, data: UpdateData) => {
            if (mounted.current) {
                setIsSaving(true);
                setError(null);
            }
            try {
                const updated = await service.update(id, data);
                if (mounted.current) {
                    setItems((previous) =>
                        previous.map((item) => (item.id === id ? updated : item)),
                    );
                }
                toast.success(messages.updated);
                return true;
            } catch (cause) {
                return handleFailure(cause);
            } finally {
                if (mounted.current) setIsSaving(false);
            }
        },
        [service, messages.updated, handleFailure],
    );

    const remove = useCallback(
        async (id: string) => {
            if (mounted.current) {
                setDeletingId(id);
                setError(null);
            }
            try {
                await service.remove(id);
                if (mounted.current) {
                    setItems((previous) => previous.filter((item) => item.id !== id));
                }
                toast.success(messages.removed);
                return true;
            } catch (cause) {
                return handleFailure(cause);
            } finally {
                if (mounted.current) setDeletingId(null);
            }
        },
        [service, messages.removed, handleFailure],
    );

    const clearError = useCallback(() => setError(null), []);

    return {
        items,
        isLoading,
        isSaving,
        deletingId,
        error,
        reload,
        create,
        update,
        remove,
        clearError,
    };
};
