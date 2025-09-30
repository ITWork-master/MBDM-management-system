// src/tools/Card.tsx
import type React from "react";

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => {
    return (
        <div
            className={`
                bg-base-100 shadow-md 
                flex md:justify-center items-center 
                p-10 rounded-lg gap-3 
                border-2 border-transparent
                transition-all duration-300 ease-in-out
                hover:shadow-lg hover:scale-105
                cursor-pointer
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

export default Card;