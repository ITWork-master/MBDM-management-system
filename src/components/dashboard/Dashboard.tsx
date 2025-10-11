// src/components/Dashboard.tsx
import React from 'react';
import Card from '../tools/Card';
import { MessageCircleDashed, PackageOpen, Settings, Trophy, type LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import type { AppView } from '../../types/type';

interface DashboardItem {
    id: string;
    label: string;
    icon: LucideIcon;
    view: AppView;
    hoverColor: string;
}

const DASHBOARD_ITEMS: DashboardItem[] = [
    {
        id: 'products',
        label: 'Produits',
        icon: PackageOpen,
        view: 'products',
        hoverColor: 'hover:shadow-blue-500/50 hover:border-blue-500 hover:text-blue-500'
    },
    {
        id: 'testimonials',
        label: 'Témoignages',
        icon: MessageCircleDashed,
        view: 'testimonials',
        hoverColor: 'hover:shadow-green-500/50 hover:border-green-500 hover:text-green-500'
    },
    {
        id: 'achievements',
        label: 'Interventions',
        icon: Trophy,
        view: 'achievements',
        hoverColor: 'hover:shadow-yellow-500/50 hover:border-yellow-500 hover:text-yellow-500'
    },
    {
        id: 'settings',
        label: 'Paramètre',
        icon: Settings,
        view: 'settings',
        hoverColor: 'hover:shadow-purple-500/50 hover:border-purple-500 hover:text-purple-500'
    },
];

const Dashboard: React.FC = () => {
    const { setView } = useAuth();

    const handleCardClick = (view: AppView) => {
        setView(view);
    };

    return (
        <div className='w-screen h-screen flex justify-center items-center'>
            <div className='grid md:grid-cols-2 gap-4'>
                {DASHBOARD_ITEMS.map((item) => (
                    <Card
                        key={item.id}
                        className={`${item.hoverColor} cursor-pointer`}
                        onClick={() => handleCardClick(item.view)}
                    >
                        <item.icon size={30} />
                        <div>{item.label}</div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;