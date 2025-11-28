import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { ThumbsUp } from 'lucide-react';

const REACTION_TYPES = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠',
};

const REACTION_LABELS = {
    like: 'Like',
    love: 'Love',
    haha: 'Haha',
    wow: 'Wow',
    sad: 'Sad',
    angry: 'Angry',
};

export default function Reactions({ 
    reactableType, 
    reactableId, 
    initialReactions = {}, 
    userReaction = null 
}) {
    const [reactions, setReactions] = useState(initialReactions);
    const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
    const [showPicker, setShowPicker] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const timeoutRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleMouseEnter = () => {
        if (isProcessing) return;
        timeoutRef.current = setTimeout(() => {
            setShowPicker(true);
        }, 200);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setTimeout(() => setShowPicker(false), 100);
    };

    const handleReaction = (type) => {
        if (isProcessing) return;

        setIsProcessing(true);
        setShowPicker(false);

        // Optimistic update
        const previousReactions = { ...reactions };
        const previousUserReaction = currentUserReaction;

        // Update UI optimistically
        const newReactions = { ...reactions };
        
        if (currentUserReaction === type) {
            // Remove reaction
            if (newReactions[type] > 0) {
                newReactions[type]--;
                if (newReactions[type] === 0) {
                    delete newReactions[type];
                }
            }
            setCurrentUserReaction(null);
        } else {
            // Remove old reaction if exists
            if (currentUserReaction && newReactions[currentUserReaction] > 0) {
                newReactions[currentUserReaction]--;
                if (newReactions[currentUserReaction] === 0) {
                    delete newReactions[currentUserReaction];
                }
            }
            // Add new reaction
            newReactions[type] = (newReactions[type] || 0) + 1;
            setCurrentUserReaction(type);
        }

        setReactions(newReactions);

        const method = currentUserReaction === type ? 'delete' : 'post';
        const data = {
            reactable_type: reactableType,
            reactable_id: reactableId,
            type: type,
        };

        router[method]('/reactions', data, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: (page) => {
                if (page.props.reactions_summary) {
                    setReactions(page.props.reactions_summary);
                }
                if (page.props.user_reaction !== undefined) {
                    setCurrentUserReaction(page.props.user_reaction);
                }
                setIsProcessing(false);
            },
            onError: (errors) => {
                console.error('Failed to update reaction:', errors);
                setReactions(previousReactions);
                setCurrentUserReaction(previousUserReaction);
                setIsProcessing(false);
            },
        });
    };

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    return (
        <div 
            ref={containerRef}
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-3">
                {/* Main reaction button */}
                <button
                    onClick={() => handleReaction(currentUserReaction || 'like')}
                    disabled={isProcessing}
                    className={`
                        group inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
                        ${currentUserReaction 
                            ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm' 
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                    `}
                >
                    <span className="text-lg">
                        {currentUserReaction ? REACTION_TYPES[currentUserReaction] : '👍'}
                    </span>
                    <span className="font-medium">
                        {currentUserReaction ? REACTION_LABELS[currentUserReaction] : 'Like'}
                    </span>
                </button>

                {/* Reaction counts */}
                {totalReactions > 0 && (
                    <div className="flex items-center gap-1.5">
                        {Object.entries(reactions)
                            .sort(([, a], [, b]) => b - a)
                            .map(([type, count]) => (
                                <button
                                    key={type}
                                    onClick={() => handleReaction(type)}
                                    disabled={isProcessing}
                                    className={`
                                        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                        ${currentUserReaction === type
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }
                                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                                    `}
                                >
                                    <span className="text-base">{REACTION_TYPES[type]}</span>
                                    <span>{count}</span>
                                </button>
                            ))}
                    </div>
                )}
            </div>

            {/* Reaction picker dropdown */}
            {showPicker && !isProcessing && (
                <div className="absolute bottom-full left-0 mb-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-2 flex gap-1">
                        {Object.entries(REACTION_TYPES).map(([type, emoji]) => (
                            <button
                                key={type}
                                onClick={() => handleReaction(type)}
                                className={`
                                    group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200
                                    hover:bg-gray-100 hover:scale-125
                                    ${currentUserReaction === type ? 'bg-gray-100' : ''}
                                `}
                                title={REACTION_LABELS[type]}
                            >
                                <span className="text-2xl">{emoji}</span>
                                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {REACTION_LABELS[type]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
