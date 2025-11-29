import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { router } from '@inertiajs/react';

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
    const [reactions, setReactions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [nextPage, setNextPage] = useState(null);
    const scrollRef = useRef(null);

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

    const loadReactions = async (page = 1, append = false) => {
        setIsLoading(true);
        try {
            const url = `/reactions/list/${encodeURIComponent(reactableType)}/${reactableId}?type=${activeTab}&page=${page}`;
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            const data = await response.json();
            
            if (append) {
                setReactions(prev => [...prev, ...data.data]);
            } else {
                setReactions(data.data);
            }
            setNextPage(data.next_page);
        } catch (error) {
            console.error('Failed to load reactions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadReactions();
        }
    }, [isOpen, activeTab]);

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && nextPage && !isLoading) {
            loadReactions(nextPage, true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md h-[600px] flex flex-col"
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

                {/* List */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto p-4"
                >
                    {reactions.length === 0 && !isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            No reactions yet
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
