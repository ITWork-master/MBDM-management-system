// src/components/tools/Navbar.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

interface NavbarProps {
    sectionName: string;
}

const Navbar: React.FC<NavbarProps> = ({ sectionName }) => {
    // `goBack` suit l'historique du navigateur, et retombe sur le tableau de
    // bord s'il n'y a rien derrière : le bouton et la flèche « retour » du
    // navigateur font désormais exactement la même chose.
    const { goBack } = useAuth();

    return (
        <nav className="fixed top-0 w-screen bg-base-100 shadow-sm border-b z-20 border-base-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={goBack}
                            className="flex items-center space-x-2 transition-colors duration-200 p-2 rounded-lg hover:bg-base-300"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Retour</span>
                        </button>
                        <div className="h-6 w-px bg-base-content/20" />
                        <h1 className="text-xl font-semibold">{sectionName}</h1>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
