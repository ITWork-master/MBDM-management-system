import { createContext, useContext } from 'react';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    /** Met en avant le bouton de confirmation en rouge. */
    danger?: boolean;
}

export type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

export const ConfirmContext = createContext<ConfirmFn | null>(null);

export const useConfirm = (): ConfirmFn => {
    const confirm = useContext(ConfirmContext);
    if (!confirm) {
        throw new Error('useConfirm doit être utilisé dans un ConfirmProvider');
    }
    return confirm;
};
