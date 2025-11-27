import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import ReactionPicker from './ReactionPicker';
import ReactionButton from './ReactionButton';

const REACTION_TYPES = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠',
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
        timeoutRef.current = setTimeout(() => {
            setShowPicker(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setShowPicker(false);
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
                // Update with server response if available
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
                // Revert optimistic update
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
            <div className="flex items-center gap-2">
                {/* Main reaction button */}
                <button
                    onClick={() => handleReaction(currentUserReaction || 'like')}
                    disabled={isProcessing}
                    className={`
                        px-4 py-2 rounded-lg font-medium transition-all duration-200
                        ${currentUserReaction 
                            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                >
                    <span className="flex items-center gap-2">
                        <span className="text-xl">
                            {currentUserReaction ? REACTION_TYPES[currentUserReaction] : '👍'}
                        </span>
                        <span>{currentUserReaction || 'Like'}</span>
                    </span>
                </button>

                {/* Reaction counts */}
                {totalReactions > 0 && (
                    <div className="flex items-center gap-1">
                        {Object.entries(reactions).map(([type, count]) => (
                            <ReactionButton
                                key={type}
                                type={type}
                                emoji={REACTION_TYPES[type]}
                                count={count}
                                isActive={currentUserReaction === type}
                                onClick={() => handleReaction(type)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Reaction picker */}
            {showPicker && (
                <ReactionPicker
                    reactions={REACTION_TYPES}
                    onSelect={handleReaction}
                    currentReaction={currentUserReaction}
                />
            )}
        </div>
    );
}

