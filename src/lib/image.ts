/** Zone de recadrage en pixels, telle que fournie par react-easy-crop. */
export interface CroppedArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 Mo

export const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
] as const;

/**
 * Extension déduite du type MIME réel, et non du nom fourni par l'utilisateur.
 * Le nom d'un fichier uploadé n'est pas une source de confiance.
 */
export const EXTENSION_BY_MIME: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
};

/** Côté maximal de l'image produite par le recadrage, pour borner l'upload. */
const MAX_OUTPUT_SIDE = 1600;

const JPEG_QUALITY = 0.9;

export const formatBytes = (bytes: number): string =>
    bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
        : `${Math.round(bytes / 1024)} Ko`;

/**
 * Valide un fichier choisi dans un `<input type="file">`.
 * Renvoie un message d'erreur, ou `null` si le fichier est acceptable.
 */
export const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
        return `Format non supporté (${file.type || 'inconnu'}). Formats acceptés : JPEG, PNG, WebP, AVIF, GIF.`;
    }
    if (file.size > MAX_IMAGE_BYTES) {
        return `Image trop volumineuse (${formatBytes(file.size)}). Maximum : ${formatBytes(MAX_IMAGE_BYTES)}.`;
    }
    return null;
};

const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', () =>
            reject(new Error("L'image n'a pas pu être chargée")),
        );
        image.src = src;
    });

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/** Dimensions de la boîte englobante d'une image après rotation. */
const rotatedSize = (width: number, height: number, rotation: number) => {
    const rad = toRadians(rotation);
    return {
        width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
        height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
    };
};

const createContext = (width: number, height: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Le canvas n'est pas disponible dans ce navigateur");
    return { canvas, ctx };
};

/**
 * Applique le recadrage et la rotation, puis renvoie un JPEG.
 *
 * La rotation est appliquée à l'image entière avant l'extraction de la zone
 * recadrée : c'est ce que suppose react-easy-crop lorsqu'il calcule
 * `croppedAreaPixels`. L'implémentation précédente faisait l'inverse — elle
 * tournait le canvas de destination puis y recopiait la zone non tournée —
 * ce qui décalait le résultat dès que la rotation n'était pas nulle.
 */
export const cropImage = async (
    src: string,
    area: CroppedArea,
    rotation: number,
): Promise<Blob> => {
    const image = await loadImage(src);

    // 1. Dessiner l'image redressée dans sa boîte englobante.
    const box = rotatedSize(image.width, image.height, rotation);
    const { canvas: rotated, ctx: rotatedCtx } = createContext(box.width, box.height);

    rotatedCtx.translate(box.width / 2, box.height / 2);
    rotatedCtx.rotate(toRadians(rotation));
    rotatedCtx.translate(-image.width / 2, -image.height / 2);
    rotatedCtx.drawImage(image, 0, 0);

    // 2. En extraire la zone recadrée, en bornant la taille de sortie.
    const scale = Math.min(1, MAX_OUTPUT_SIDE / Math.max(area.width, area.height));
    const { canvas: output, ctx: outputCtx } = createContext(
        area.width * scale,
        area.height * scale,
    );

    outputCtx.imageSmoothingQuality = 'high';
    outputCtx.drawImage(
        rotated,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        output.width,
        output.height,
    );

    return new Promise((resolve, reject) => {
        output.toBlob(
            (blob) =>
                blob
                    ? resolve(blob)
                    : reject(new Error("Le recadrage de l'image a échoué")),
            'image/jpeg',
            JPEG_QUALITY,
        );
    });
};
