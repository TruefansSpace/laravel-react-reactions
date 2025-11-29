import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ReactionsModal from './ReactionsModal';

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
    userReaction = null,
    onUserClick
}) {
    const [reactions, setReactions] = useState(initialReactions);
    const [currentUserReaction, setCurrentUserReaction] = useState(userReaction);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const hoverTimeoutRef = React.useRef(null);

    const handleReaction = (type) => {
        if (isProcessing) return;

        setIsProcessing(true);

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

        const isRemoving = currentUserReaction === type;
        const data = {
            reactable_type: reactableType,
            reactable_id: reactableId,
            type: type,
        };

        const options = {
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
        };

        if (isRemoving) {
            // For DELETE, use router.visit with method and data
            router.visit('/reactions', {
                method: 'delete',
                data: data,
                ...options,
            });
        } else {
            // For POST, send data in body
            router.post('/reactions', data, options);
        }
    };

    const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

    const handleMouseEnter = () => {
        if (isProcessing) return;
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setIsOpen(true);
        }, 300);
    };

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        hoverTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    return (
        <div className="flex items-center gap-3">
            {/* Reaction picker dropdown */}
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen} modal={false}>
                <DropdownMenuTrigger asChild>
                    <button
                        onClick={() => handleReaction(currentUserReaction || 'like')}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
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
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    side="top" 
                    align="start"
                    className="bg-white rounded-xl shadow-xl border border-gray-200 p-2"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex gap-1">
                        {Object.entries(REACTION_TYPES).map(([type, emoji]) => (
                            <DropdownMenuItem
                                key={type}
                                onClick={() => handleReaction(type)}
                                className={`
                                    group relative flex flex-col items-center gap-1 p-2.5 rounded-lg transition-all duration-200
                                    hover:bg-gray-100 hover:scale-125 cursor-pointer
                                    ${currentUserReaction === type ? 'bg-gray-100' : ''}
                                `}
                                title={REACTION_LABELS[type]}
                            >
                                <span className="text-2xl">{emoji}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

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
                    
                    {/* Chevron button to open modal */}
                    <button
                        onClick={() => setShowModal(true)}
                        className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        title="See who reacted"
                    >
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                </div>
            )}

            {/* Reactions Modal */}
            <ReactionsModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                reactableType={reactableType}
                reactableId={reactableId}
                reactionsSummary={reactions}
                onUserClick={onUserClick}
            />
        </div>
    );
}
