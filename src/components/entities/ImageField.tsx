import React from 'react';
import { formatBytes, MAX_IMAGE_BYTES, ACCEPTED_IMAGE_TYPES } from '../../lib/image';
import type { ImagePicker } from '../../hooks/useImagePicker';

interface ImageFieldProps {
    label: string;
    picker: ImagePicker;
    /** Image déjà enregistrée, en cas de modification. */
    currentImageUrl?: string | null;
}

const ImageField: React.FC<ImageFieldProps> = ({ label, picker, currentImageUrl }) => (
    <div>
        <label htmlFor="entity-image" className="block text-sm font-medium text-base-content/70 mb-2">
            {label}
        </label>
        <input
            id="entity-image"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={picker.selectFile}
            className="file-input file-input-bordered w-full"
        />
        <p className="mt-1 text-xs text-base-content/50">
            JPEG, PNG, WebP, AVIF ou GIF — {formatBytes(MAX_IMAGE_BYTES)} maximum.
        </p>

        {picker.file && !picker.isCropperOpen && (
            <p className="mt-2 text-sm text-base-content/60">
                Image sélectionnée : {picker.file.name} ({formatBytes(picker.file.size)})
            </p>
        )}

        {currentImageUrl && !picker.file && (
            <p className="mt-2 text-sm text-base-content/60">
                Image actuelle :{' '}
                <a
                    href={currentImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary"
                >
                    Voir l'image
                </a>
            </p>
        )}
    </div>
);

export default ImageField;
