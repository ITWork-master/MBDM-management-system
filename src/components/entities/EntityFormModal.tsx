import React from 'react';
import { Loader } from 'lucide-react';
import Modal from '../tools/Modal';

interface EntityFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    heading: string;
    submitLabel: string;
    isSaving: boolean;
    error: string | null;
    canSubmit: boolean;
    onSubmit: () => void;
    children: React.ReactNode;
}

/**
 * Enveloppe commune aux formulaires d'ajout et de modification : titre, bandeau
 * d'erreur, boutons d'action, et soumission au `submit` du formulaire — ce qui
 * réactive la validation HTML native et la touche Entrée. Les trois pages
 * utilisaient auparavant un `<button type="button">` avec un `onClick`, ce qui
 * rendait les attributs `required` des champs purement décoratifs.
 */
const EntityFormModal: React.FC<EntityFormModalProps> = ({
    isOpen,
    onClose,
    heading,
    submitLabel,
    isSaving,
    error,
    canSubmit,
    onSubmit,
    children,
}) => (
    <Modal isOpen={isOpen} onClose={onClose}>
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">{heading}</h2>

            {error && (
                <div role="alert" className="alert alert-error mb-4 text-sm">
                    {error}
                </div>
            )}

            <form
                className="space-y-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    onSubmit();
                }}
            >
                {children}

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="btn btn-ghost"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || !canSubmit}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        {isSaving && <Loader className="animate-spin h-4 w-4" />}
                        <span>{isSaving ? 'Enregistrement…' : submitLabel}</span>
                    </button>
                </div>
            </form>
        </div>
    </Modal>
);

export default EntityFormModal;
