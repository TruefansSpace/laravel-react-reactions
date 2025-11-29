import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const REACTION_TYPES = {
    like: '👍',
    love: '❤️',
    haha: '😂',
    wow: '😮',
    sad: '😢',
    angry: '😠',
};

export default function ReactionsModal({ 
    isOpen, 
    onClose, 
    reactableType, 
    reactableId,
    reactionsSummary
}) {
    const [activeTab, setActiveTab] = useState('all');
    const [isAnimating, setIsAnimating] = useState(false);
    const [reactions, setReactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
            loadReactions(1, false);
        }
    }, [isOpen, activeTab]);

    const tabs = [
        { key: 'all', label: 'All', count: Object.values(reactionsSummary).reduce((a, b) => a + b, 0) },
        ...Object.entries(reactionsSummary)
            .filter(([, count]) => count > 0)
            .map(([type, count]) => ({
                key: type,
                label: REACTION_TYPES[type],
                count
            }))
    ];

    const loadReactions = async (pageNum, append = false) => {
        if (isLoading) return;
        
        setIsLoading(true);
        try {
            const url = `/reactions/list/${encodeURIComponent(reactableType)}/${reactableId}?type=${activeTab}&page=${pageNum}`;
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            
            if (data.reactions) {
                const paginatedData = data.reactions;
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleTabChange = (type) => {
        setActiveTab(type);
        setPage(1);
        setHasMore(true);
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
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
        >
            <div 
                className={`bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col transition-all duration-200 ${
                    isOpen && isAnimating 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Reactions</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
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
                    {!reactions || (reactions.length === 0 && !isLoading) ? (
                        <div className="text-center py-8 text-gray-500">
                            {isLoading ? 'Loading...' : 'No reactions yet'}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {reactions.map((reaction) => (
                                <div 
                                    key={reaction.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
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
                                    <div className="text-2xl flex-shrink-0">
                                        {REACTION_TYPES[reaction.type]}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="text-center py-4 text-gray-500">
                                    Loading...
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
