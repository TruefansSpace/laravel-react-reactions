import React, { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Send, X } from 'lucide-react';

export default function CommentForm({
    commentableType,
    commentableId,
    parentId = null,
    initialContent = '',
    commentId = null,
    onSuccess,
    onCancel,
    isEditing = false,
    placeholder = 'Write a comment...'
}) {
     const { errors } = usePage().props
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const textareaRef = useRef(null);

    useEffect(() => {
        // Auto-focus and adjust height
        if (textareaRef.current) {
            textareaRef.current.focus();
            adjustTextareaHeight();
        }
    }, []);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!content.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        if (content.length > 5000) {
            setError('Comment is too long (max 5000 characters)');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const data = {
            commentable_type: commentableType,
            commentable_id: commentableId,
            content: content.trim(),
            parent_id: parentId,
        };

        if (isEditing && commentId) {
            // Update existing comment - back(303) will reload automatically
            router.put(`/comments/${commentId}`, data, {
                preserveScroll: true,
                onSuccess: () => {
                    onSuccess(content.trim());
                    setContent('');
                },
                onError: (errors) => {
                    setError(errors.content || errors.error || 'Failed to update comment');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } else {
            // Create new comment - back(303) will reload automatically
            router.post('/comments', data, {
                preserveScroll: true,
                onSuccess: () => {
                    setContent('');
                    if (onCancel) onCancel();
                },
                onError: (errors) => {
                    setError(errors.content || errors.error || 'Failed to add comment');
                    setIsSubmitting(false);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        }
    };

    const handleCancel = () => {
        setContent(initialContent);
        setError('');
        onCancel();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-2">
            <div className="relative">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        adjustTextareaHeight();
                        setError('');
                    }}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    rows={3}
                    maxLength={5000}
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                    {content.length}/5000
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isEditing ? 'Updating...' : 'Posting...'}
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            {isEditing ? 'Update' : 'Post'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
