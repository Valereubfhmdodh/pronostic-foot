
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
    return (
        <div className={`bg-gray-800/50 border border-gray-700 p-6 rounded-xl shadow-lg animate-fade-in ${className}`}>
            {children}
        </div>
    );
};

export default Card;
