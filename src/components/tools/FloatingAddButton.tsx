import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingAddButtonProps {
    onClick: () => void;
    label: string;
}

const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ onClick, label }) => (
    <button
        type="button"
        onClick={onClick}
        title={label}
        aria-label={label}
        className="btn btn-primary rounded-full w-max p-4 h-auto fixed bottom-10 right-10 shadow-lg"
    >
        <Plus size={30} />
    </button>
);

export default FloatingAddButton;
