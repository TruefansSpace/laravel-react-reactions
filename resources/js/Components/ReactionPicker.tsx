interface ReactionPickerProps {
    reactions: Record<string, string>;
    onSelect: (type: string) => void;
    currentReaction: string | null;
}

export default function ReactionPicker({ reactions, onSelect, currentReaction }: ReactionPickerProps) {
    return (
        <div 
            className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-1 animate-fade-in z-10"
            style={{
                animation: 'fadeInScale 0.2s ease-out',
            }}
        >
            {Object.entries(reactions).map(([type, emoji]) => (
                <button
                    key={type}
                    onClick={() => onSelect(type)}
                    className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-2xl
                        transition-all duration-200 hover:scale-125 hover:bg-gray-100
                        ${currentReaction === type ? 'bg-blue-100 scale-110' : ''}
                    `}
                    title={type}
                >
                    {emoji}
                </button>
            ))}
            <style>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(5px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}
