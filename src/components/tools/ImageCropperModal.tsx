import React, { useCallback, useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { Loader, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import Modal from './Modal';
import { cropImage, type CroppedArea } from '../../lib/image';
import { toMessage } from '../../lib/errors';
import { toast } from 'sonner';

interface ImageCropperModalProps {
    isOpen: boolean;
    /** URL de l'image source (object URL). */
    src: string | null;
    /** Rapport largeur / hauteur de la zone de recadrage. */
    aspect: number;
    onCancel: () => void;
    onConfirm: (blob: Blob) => void;
}

const INITIAL_CROP = { x: 0, y: 0 };

/**
 * Recadrage d'image. Extrait à l'identique de Products et Achievements, qui
 * en embarquaient chacun une copie (état, canvas, contrôles de zoom/rotation).
 */
const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    isOpen,
    src,
    aspect,
    onCancel,
    onConfirm,
}) => {
    const [crop, setCrop] = useState(INITIAL_CROP);
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [area, setArea] = useState<CroppedArea | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Chaque nouvelle image repart d'un cadrage neutre.
    useEffect(() => {
        if (!isOpen) return;
        setCrop(INITIAL_CROP);
        setZoom(1);
        setRotation(0);
        setArea(null);
    }, [isOpen, src]);

    const handleCropComplete = useCallback((_: unknown, areaPixels: CroppedArea) => {
        setArea(areaPixels);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!src || !area) return;
        setIsProcessing(true);
        try {
            onConfirm(await cropImage(src, area, rotation));
        } catch (error) {
            toast.error(toMessage(error, "Erreur lors du recadrage de l'image"));
        } finally {
            setIsProcessing(false);
        }
    }, [src, area, rotation, onConfirm]);

    return (
        <Modal isOpen={isOpen && Boolean(src)} onClose={onCancel}>
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Recadrer l'image</h2>

                {src && (
                    <div className="space-y-4">
                        <div className="relative h-64 w-full bg-base-200 rounded-lg overflow-hidden">
                            <Cropper
                                image={src}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspect}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                                onCropComplete={handleCropComplete}
                                objectFit="contain"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm">
                                <ZoomOut size={16} />
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(event) => setZoom(Number(event.target.value))}
                                    className="w-full"
                                    aria-label="Zoom"
                                />
                                <ZoomIn size={16} />
                            </label>

                            <label className="flex items-center space-x-2 text-sm">
                                <RotateCcw size={16} />
                                <span>Rotation&nbsp;:</span>
                                <input
                                    type="range"
                                    min={0}
                                    max={360}
                                    step={1}
                                    value={rotation}
                                    onChange={(event) => setRotation(Number(event.target.value))}
                                    className="w-full"
                                    aria-label="Rotation"
                                />
                                <span className="w-10 text-right tabular-nums">{rotation}°</span>
                            </label>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                disabled={isProcessing}
                                className="px-4 py-2 text-base-content/60 border border-base-300 rounded-md hover:bg-base-200 transition-colors duration-200 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isProcessing || !area}
                                className="btn btn-primary disabled:opacity-50 flex items-center gap-2"
                            >
                                {isProcessing && <Loader className="animate-spin h-4 w-4" />}
                                <span>Confirmer le recadrage</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ImageCropperModal;
