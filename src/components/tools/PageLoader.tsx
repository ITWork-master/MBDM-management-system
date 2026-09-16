import React from 'react';
import { Loader } from 'lucide-react';

interface PageLoaderProps {
    message: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ message }) => (
    <div className="flex justify-center items-center h-64">
        <div className="text-center">
            <Loader className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
            <p className="text-base-content/60">{message}</p>
        </div>
    </div>
);

export default PageLoader;
