import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
}) => (
    <div className="text-center py-12">
        <div className="text-base-content/40 mb-4">
            <Icon size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-base-content/90 mb-2">{title}</h3>
        <p className="text-base-content/60 mb-4">{description}</p>
        <button type="button" onClick={onAction} className="btn btn-primary">
            {actionLabel}
        </button>
    </div>
);

export default EmptyState;
