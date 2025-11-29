import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

export default function Comments({
    commentableType,
    commentableId,
    initialComments = [],
    reactionsEnabled = true,
    onUserClick,
    currentUserId
}) {
    const [comments, setComments] = useState(initialComments);
    const [showForm, setShowForm] = useState(false);

    const handleCommentAdded = (newComment) => {
        setComments(prev => [newComment, ...prev]);
        setShowForm(false);
    };

    const handleCommentUpdated = (commentId, updatedContent) => {
        setComments(prev => prev.map(comment => 
            comment.id === commentId 
                ? { ...comment, content: updatedContent, is_edited: true, edited_at: new Date() }
                : comment
        ));
    };

    const handleCommentDeleted = (commentId) => {
        setComments(prev => prev.filter(comment => comment.id !== commentId));
    };

    const handleReplyAdded = (parentId, newReply) => {
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

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                        Comments ({comments.length})
                    </h3>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
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
            <div className="space-y-4">
                {comments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium mb-1">No comments yet</p>
                        <p className="text-sm text-gray-400">Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map(comment => (
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
                    ))
                )}
            </div>
        </div>
    );
}
