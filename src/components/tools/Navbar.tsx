// src/components/Navbar.tsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
    sectionName: string;
}

const Navbar: React.FC<NavbarProps> = ({ sectionName }) => {
    const { setView } = useAuth();

    const handleBackToDashboard = () => {
        setView('dashboard');
    };

    return (
        <nav className="fixed top-0 w-screen bg-base-100 shadow-sm border-b z-20 border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Bouton retour et nom de la section */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleBackToDashboard}
                            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Retour</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <h1 className="text-xl font-semibold text-gray-900">
                            {sectionName}
                        </h1>
                    </div>

                    {/* Vous pouvez ajouter d'autres éléments ici si nécessaire */}
                    <div className="flex items-center space-x-4">
                        {/* Espace pour d'éventuels éléments futurs (profil, notifications, etc.) */}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;