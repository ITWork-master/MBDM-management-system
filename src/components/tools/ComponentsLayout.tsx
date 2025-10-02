import type React from "react";

interface ComponentsLayoutProps {
    children: React.ReactNode;
    className?: string;
}

const ComponentsLayout: React.FC<ComponentsLayoutProps> = ({ children, className = "" }) => {
    return (
        <div
            className={`w-screen pt-17 h-screen overflow-x-hidden overflow-y-scroll
                ${className}
            `}
        >
            {children}
        </div>
    );
};

export default ComponentsLayout;