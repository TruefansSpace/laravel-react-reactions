import React from 'react';

export default function ReactionButton({ type, emoji, count, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1
                transition-all duration-200 hover:scale-105
                ${isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
            `}
        >
            <span className="text-base">{emoji}</span>
            <span>{count}</span>
        </button>
    );
}
