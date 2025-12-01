import { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email?: string;
}

interface Comment {
    id: number;
    content: string;
    user_id: number;
    user?: User;
    created_at: string;
    is_edited?: boolean;
    reactions_summary?: Record<string, number>;
    user_reaction?: string | null;
    replies?: Comment[];
}

interface CommentsProps {
    commentableType: string;
    commentableId: number;
    initialComments?: Comment[];
    totalComments?: number | null;
    reactionsEnabled?: boolean;
    onUserClick?: (userId: number) => void;
    currentUserId: number;
    perPage?: number;
}

interface PaginationData {
    has_more: boolean;
}

interface CommentsResponse {
    success: boolean;
    comments: Comment[];
    pagination: PaginationData;
}

export default function Comments({
    commentableType,
    commentableId,
    initialComments = [],
    totalComments = null,
    reactionsEnabled = true,
    onUserClick,
    currentUserId,
    perPage = 5
}: CommentsProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);

    // Update comments when initialComments prop changes (after Inertia reload)
    useEffect(() => {
        console.log('Comments initialized:', {
            initialCount: initialComments.length,
            totalComments,
            hasMore: initialComments.length < (totalComments || initialComments.length)
        });
        setComments(initialComments);
        setPage(1);
        // Check if there are more comments to load
        const total = totalComments !== null ? totalComments : initialComments.length;
        setHasMore(initialComments.length < total);
    }, [initialComments, totalComments]);

    const handleCommentAdded = () => {
        // Form will close itself, page will reload with new data
        setShowForm(false);
    };

    const handleCommentUpdated = (commentId: number, updatedContent: string) => {
        setComments(prev => prev.map(comment => 
            comment.id === commentId 
                ? { ...comment, content: updatedContent, is_edited: true, edited_at: new Date().toISOString() }
                : comment
        ));
    };

    const handleCommentDeleted = (commentId: number) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };

    const handleReplyAdded = (parentId: number, newReply: Comment) => {
        setComments(prev => prev.map(comment => {
            if (comment.id === parentId) {
                return {
                    ...comment,
                    replies: [newReply, ...(comment.replies || [])]
                };
            }
            return comment;
        }));
    };

    // Load more comments
    const loadMoreComments = async () => {
        if (loading || !hasMore) {
            console.log('Load more skipped:', { loading, hasMore });
            return;
        }

        console.log('Loading more comments...');
        setLoading(true);
        try {
            const nextPage = page + 1;
            // Base64 encode the type to avoid URL encoding issues
            const encodedType = btoa(commentableType);
            const url = `/comments/list/${encodedType}/${commentableId}?page=${nextPage}&per_page=${perPage}`;
            console.log('Fetching URL:', url);
            console.log('Original type:', commentableType);
            console.log('Encoded type:', encodedType);
            
            const response = await axios.get<CommentsResponse>(url);
            console.log('Response received:', response.data);

            if (response.data.success) {
                const newComments = response.data.comments;
                console.log('New comments:', newComments.length);
                
                if (newComments.length > 0) {
                    setComments(prev => {
                        const updated = [...prev, ...newComments];
                        console.log('Updated comments count:', updated.length);
                        return updated;
                    });
                    setPage(nextPage);
                }
                setHasMore(response.data.pagination.has_more);
                console.log('Has more:', response.data.pagination.has_more);
            } else {
                console.error('API returned success: false');
            }
        } catch (error) {
            console.error('Failed to load more comments:', error);
            if (axios.isAxiosError(error)) {
                console.error('Error details:', error.response?.data);
            }
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    // Show less comments (collapse back to initial 5)
    const showLessComments = () => {
        setComments(initialComments);
        setPage(1);
        setHasMore(initialComments.length < (totalComments || initialComments.length));
    };

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">
                        Comments ({totalComments !== null ? totalComments : comments.length})
                    </h3>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        data-testid="add-comment-button"
                        className="px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Add Comment
                    </button>
                )}
            </div>

            {/* Add Comment Form */}
            {showForm && (
                <CommentForm
                    commentableType={commentableType}
                    commentableId={commentableId}
                    onSuccess={handleCommentAdded}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Comments List */}
            <div className="space-y-2">
                {comments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium mb-1">No comments yet</p>
                        <p className="text-sm text-gray-400">Be the first to comment!</p>
                    </div>
                ) : (
                    <>
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                commentableType={commentableType}
                                commentableId={commentableId}
                                reactionsEnabled={reactionsEnabled}
                                onUserClick={onUserClick}
                                onCommentUpdated={handleCommentUpdated}
                                onCommentDeleted={handleCommentDeleted}
                                onReplyAdded={handleReplyAdded}
                                currentUserId={currentUserId}
                            />
                        ))}
                        
                        {/* Show More / Show Less Buttons */}
                        {(hasMore || comments.length > initialComments.length) && (
                            <div className="pt-4 flex justify-center gap-3">
                                {hasMore && (
                                    <button
                                        onClick={loadMoreComments}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Loading...
                                            </>
                                        ) : (
                                            <>Show More Comments</>
                                        )}
                                    </button>
                                )}
                                
                                {comments.length > initialComments.length && (
                                    <button
                                        onClick={showLessComments}
                                        disabled={loading}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Show Less
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
