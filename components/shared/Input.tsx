
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const Input: React.FC<InputProps> = ({ label, ...props }) => {
    return (
        <div className="w-full">
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <input
                className="w-full bg-gray-700 border border-gray-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-300"
                {...props}
            />
        </div>
    );
};

export default Input;
