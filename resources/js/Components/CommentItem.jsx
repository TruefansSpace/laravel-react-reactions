import { useState } from 'react';
import { router } from '@inertiajs/react';
import { MoreVertical, Edit2, Trash2, Reply, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Reactions from './Reactions';
import CommentForm from './CommentForm';

export default function CommentItem({
    comment,
    commentableType,
    commentableId,
    reactionsEnabled,
    onUserClick,
    onCommentUpdated,
    onCommentDeleted,
    onReplyAdded,
    currentUserId,
    isReply = false
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isOwner = currentUserId === comment.user_id;
    const formattedDate = new Date(comment.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        setIsDeleting(true);
        setShowDeleteConfirm(false);
        
        router.delete(`/comments/${comment.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                onCommentDeleted(comment.id);
                // Toast will be shown by Layout's flash message handler
            },
            onError: () => {
                setIsDeleting(false);
                // Toast will be shown by Layout's error handler
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    const handleEditSuccess = (updatedContent) => {
        onCommentUpdated(comment.id, updatedContent);
        setIsEditing(false);
    };

    const handleReplySuccess = (newReply) => {
        onReplyAdded(comment.id, newReply);
        setShowReplyForm(false);
    };

    if (isDeleting) {
        return (
            <div className="animate-pulse bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-500">Deleting...</p>
            </div>
        );
    }

    return (
        <div className={`${isReply ? 'ml-10' : ''}`}>
            <div data-content_id={comment.id} data-content_owner_id={`container_${comment.user?.id}`} className="bg-white rounded-md border border-gray-200 p-3">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div 
                        data-user_id={comment.user_id}
                        role="avatar"
                            onClick={() => onUserClick?.(comment.user?.id)}
                            className={`w-8 h-8 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 ${
                                onUserClick ? 'cursor-pointer hover:ring-2 hover:ring-gray-900 hover:ring-offset-1 transition-all' : ''
                            }`}
                        >
                            {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span 
                                    onClick={() => onUserClick?.(comment.user?.id)}
                                    className={`text-sm font-semibold text-gray-900 ${
                                        onUserClick ? 'cursor-pointer hover:underline' : ''
                                    }`}
                                >
                                    {comment.user?.name || 'Unknown User'}
                                </span>
                                {comment.is_edited && (
                                    <span className="text-xs text-gray-400 flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        edited
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">{formattedDate}</span>
                        </div>
                    </div>

                    {/* Actions Menu */}
                    {isOwner && !isEditing && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button data-content_owner_id={`view_more_button_${comment.user?.id}`} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                                    <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleEdit} className="cursor-pointer" data-testid="edit-comment">
                                    <Edit2 className="w-4 h-4 mr-2" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-red-600" data-testid="delete-comment">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Content */}
                {isEditing ? (
                    <CommentForm
                        commentableType={commentableType}
                        commentableId={commentableId}
                        initialContent={comment.content}
                        commentId={comment.id}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setIsEditing(false)}
                        isEditing
                    />
                ) : (
                    <>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap mb-2">{comment.content}</p>

                        {/* Actions Bar */}
                        <div className="flex items-center gap-3">
                            {reactionsEnabled && (
                                <Reactions
                                    reactableType="TrueFans\\LaravelReactReactions\\Models\\Comment"
                                    reactableId={comment.id}
                                    initialReactions={comment.reactions_summary || {}}
                                    userReaction={comment.user_reaction}
                                    onUserClick={onUserClick}
                                />
                            )}
                            
                            {!isReply && (
                                <button
                                    onClick={() => setShowReplyForm(!showReplyForm)}
                                    data-testid="reply-button"
                                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <Reply className="w-4 h-4" />
                                    Reply
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Reply Form */}
            {showReplyForm && (
                <div className="ml-12 mt-3">
                    <CommentForm
                        commentableType={commentableType}
                        commentableId={commentableId}
                        parentId={comment.id}
                        onSuccess={handleReplySuccess}
                        onCancel={() => setShowReplyForm(false)}
                        placeholder="Write a reply..."
                    />
                </div>
            )}

            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2 space-y-2">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            commentableType={commentableType}
                            commentableId={commentableId}
                            reactionsEnabled={reactionsEnabled}
                            onUserClick={onUserClick}
                            onCommentUpdated={onCommentUpdated}
                            onCommentDeleted={onCommentDeleted}
                            onReplyAdded={onReplyAdded}
                            currentUserId={currentUserId}
                            isReply
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this comment? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700" data-testid="confirm-delete">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
