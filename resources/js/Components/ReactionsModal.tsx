import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';

const REACTION_TYPES: Record<string, string> = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠',
};

interface User {
    id: number;
    name: string;
    email: string;
}

interface Reaction {
    id: number;
    type: string;
    user?: User;
}

interface PaginatedReactions {
    data: Reaction[];
    current_page: number;
    last_page: number;
}

interface ReactionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    reactableType: string;
    reactableId: number;
    reactionsSummary: Record<string, number>;
    onUserClick?: (userId: number) => void;
}

interface Tab {
    key: string;
    label: string;
    count: number;
}

export default function ReactionsModal({ 
    isOpen, 
    onClose, 
    reactableType, 
    reactableId,
    reactionsSummary,
    onUserClick
}: ReactionsModalProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [isAnimating, setIsAnimating] = useState(false);
    const [reactions, setReactions] = useState<Reaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            loadReactions(1, false);
        }
    }, [isOpen, activeTab]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Focus trap - circular tab navigation
    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusableElements = modalRef.current!.querySelectorAll<HTMLElement>(
                'button:not([disabled]), [tabindex="0"]'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab: going backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement?.focus();
                }
            } else {
                // Tab: going forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement?.focus();
                }
            }
        };

        modalRef.current.addEventListener('keydown', handleTabKey);
        const currentModalRef = modalRef.current;
        return () => currentModalRef?.removeEventListener('keydown', handleTabKey);
    }, [isOpen, reactions]);

    const tabs: Tab[] = [
        { key: 'all', label: 'All', count: Object.values(reactionsSummary).reduce((a, b) => a + b, 0) },
        ...Object.entries(reactionsSummary)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => ({
                key: type,
                label: REACTION_TYPES[type],
                count
            }))
    ];

    const loadReactions = async (pageNum: number, append = false) => {
        if (isLoading || isLoadingMore) return;
        
        if (append) {
            setIsLoadingMore(true);
        } else {
            setIsLoading(true);
            setError(null);
        }
        
        try {
            const url = `/reactions/list/${encodeURIComponent(reactableType)}/${reactableId}?type=${activeTab}&page=${pageNum}`;
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.reactions) {
                const paginatedData: PaginatedReactions = data.reactions;
                if (append) {
                    setReactions(prev => [...prev, ...paginatedData.data]);
                } else {
                    setReactions(paginatedData.data);
                }
                setHasMore(paginatedData.current_page < paginatedData.last_page);
                setPage(paginatedData.current_page);
            }
        } catch (error) {
            console.error('Failed to load reactions:', error);
            setError(append ? 'Failed to load more reactions' : 'Failed to load reactions');
        } finally {
            setIsLoading(false);
            setIsLoadingMore(false);
        }
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && hasMore && !isLoading) {
            loadReactions(page + 1, true);
        }
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    if (!isOpen && !isAnimating) return null;

    return (
        <div 
            className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ${
                isOpen && isAnimating ? 'bg-black/50' : 'bg-black/0'
            }`}
            onClick={handleClose}
            data-testid="modal-overlay"
        >
            <div 
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
                className={`bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col transition-all duration-200 ${
                    isOpen && isAnimating 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 id="modal-title" className="text-lg font-semibold">Reactions</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                        data-testid="close-modal"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 px-4 py-3 border-b border-gray-200 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            data-testid={`reaction-tab-${tab.key}`}
                            className={`
                                flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                                ${activeTab === tab.key
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }
                            `}
                        >
                            <span className="text-base">{tab.label}</span>
                            <span>{tab.count}</span>
                        </button>
                    ))}
                </div>

                {/* List with Infinite Scroll */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4"
                >
                    {error ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                            <p className="text-gray-900 font-medium mb-1">Oops! Something went wrong</p>
                            <p className="text-sm text-gray-500 mb-4">{error}</p>
                            <button
                                onClick={() => loadReactions(1, false)}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : isLoading ? (
                        <div className="space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                                    <div className="flex-1 min-w-0">
                                        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-48"></div>
                                    </div>
                                    <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
                                </div>
                            ))}
                        </div>
                    ) : reactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="text-6xl mb-3">😊</div>
                            <p className="text-gray-900 font-medium mb-1">No reactions yet</p>
                            <p className="text-sm text-gray-500">Be the first to react!</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reactions.map((reaction, index) => (
                                <div 
                                    key={reaction.id}
                                    role={onUserClick ? "button" : undefined}
                                    tabIndex={onUserClick ? 0 : undefined}
                                    onClick={() => onUserClick?.(reaction.user?.id!)}
                                    data-testid="user-reaction-item"
                                    onKeyDown={(e) => {
                                        if (onUserClick && (e.key === 'Enter' || e.key === ' ')) {
                                            e.preventDefault();
                                            onUserClick(reaction.user?.id!);
                                        }
                                    }}
                                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
                                        onUserClick ? 'hover:bg-gray-100 cursor-pointer active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2' : 'hover:bg-gray-50'
                                    }`}
                                    style={{ animationDelay: `${index * 30}ms`, animationFillMode: 'backwards' }}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {reaction.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                            {reaction.user?.name || 'Unknown User'}
                                        </div>
                                        <div className="text-sm text-gray-500 truncate">
                                            {reaction.user?.email}
                                        </div>
                                    </div>
                                    <div className="text-2xl flex-shrink-0" data-testid="user-reaction-type">
                                        {REACTION_TYPES[reaction.type]}
                                    </div>
                                </div>
                            ))}
                            {isLoadingMore && (
                                <div className="flex items-center justify-center py-4 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    <span>Loading more...</span>
                                </div>
                            )}
                            {!hasMore && reactions.length > 0 && (
                                <div className="text-center py-4 text-sm text-gray-400">
                                    That's all! 🎉
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
