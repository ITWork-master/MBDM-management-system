import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { validateImageFile } from '../lib/image';

export interface ImagePicker {
    /** Fichier retenu, déjà recadré, prêt à être envoyé. */
    file: File | null;
    /** URL temporaire de l'image d'origine, pour le recadreur. */
    sourceUrl: string | null;
    isCropperOpen: boolean;
    selectFile: (event: React.ChangeEvent<HTMLInputElement>) => void;
    confirmCrop: (blob: Blob) => void;
    cancelCrop: () => void;
    reset: () => void;
}

/**
 * Sélection d'image : validation, aperçu et cycle de recadrage.
 *
 * L'aperçu passe par `URL.createObjectURL`, révoqué dès qu'il n'est plus
 * utilisé. La version précédente encodait l'image entière en data-URL base64 et
 * la gardait en mémoire dans l'état du composant.
 */
export const useImagePicker = (): ImagePicker => {
    const [file, setFile] = useState<File | null>(null);
    const [sourceUrl, setSourceUrl] = useState<string | null>(null);
    const [isCropperOpen, setIsCropperOpen] = useState(false);

    // Nom d'origine conservé pour l'affichage, et pour nommer le fichier recadré.
    const originalName = useRef<string>('image.jpg');
    const objectUrl = useRef<string | null>(null);

    const releaseObjectUrl = useCallback(() => {
        if (objectUrl.current) {
            URL.revokeObjectURL(objectUrl.current);
            objectUrl.current = null;
        }
    }, []);

    useEffect(() => releaseObjectUrl, [releaseObjectUrl]);

    const reset = useCallback(() => {
        releaseObjectUrl();
        setFile(null);
        setSourceUrl(null);
        setIsCropperOpen(false);
    }, [releaseObjectUrl]);

    const selectFile = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const selected = event.target.files?.[0];
            // Permet de resélectionner le même fichier après une annulation.
            event.target.value = '';
            if (!selected) return;

            const invalid = validateImageFile(selected);
            if (invalid) {
                toast.error(invalid);
                return;
            }

            releaseObjectUrl();
            objectUrl.current = URL.createObjectURL(selected);
            originalName.current = selected.name || 'image.jpg';

            setFile(selected);
            setSourceUrl(objectUrl.current);
            setIsCropperOpen(true);
        },
        [releaseObjectUrl],
    );

    const confirmCrop = useCallback((blob: Blob) => {
        const name = originalName.current.replace(/\.[^./\\]+$/, '') || 'image';
        setFile(new File([blob], `${name}.jpg`, { type: 'image/jpeg' }));
        setIsCropperOpen(false);
    }, []);

    const cancelCrop = useCallback(() => {
        reset();
    }, [reset]);

    return { file, sourceUrl, isCropperOpen, selectFile, confirmCrop, cancelCrop, reset };
};
