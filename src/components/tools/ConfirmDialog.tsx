import React, { useCallback, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { ConfirmContext, type ConfirmFn, type ConfirmOptions } from './useConfirm';

interface PendingConfirm {
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
}

/**
 * Remplace `window.confirm`, qui bloque le thread principal, ignore le thème de
 * l'application et ne peut pas être stylé.
 */
const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [pending, setPending] = useState<PendingConfirm | null>(null);

    const confirm = useCallback<ConfirmFn>(
        (options) => new Promise<boolean>((resolve) => setPending({ options, resolve })),
        [],
    );

    const settle = useCallback((confirmed: boolean) => {
        setPending((current) => {
            current?.resolve(confirmed);
            return null;
        });
    }, []);

    const options = pending?.options;

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}

            <Modal isOpen={pending !== null} onClose={() => settle(false)} className="max-w-md">
                {options && (
                    <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertTriangle
                                size={24}
                                className={`flex-shrink-0 ${options.danger ? 'text-error' : 'text-warning'}`}
                            />
                            <div>
                                <h2 className="text-lg font-semibold">{options.title}</h2>
                                <p className="text-sm text-base-content/70 mt-1">
                                    {options.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => settle(false)}
                            >
                                {options.cancelLabel ?? 'Annuler'}
                            </button>
                            <button
                                type="button"
                                className={`btn ${options.danger ? 'btn-error' : 'btn-primary'}`}
                                onClick={() => settle(true)}
                                autoFocus
                            >
                                {options.confirmLabel ?? 'Confirmer'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </ConfirmContext.Provider>
    );
};

export default ConfirmProvider;
