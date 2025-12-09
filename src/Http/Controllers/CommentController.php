<?php

namespace TrueFans\LaravelReactReactions\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Events\CommentDeleted;
use TrueFans\LaravelReactReactions\Models\Comment;

class CommentController extends Controller
{
    /**
     * Store a new comment
     */
    public function store(Request $request)
    {
        // Validate input
        $validated = $request->validate([
            'commentable_type' => 'required|string|max:255',
            'commentable_id' => 'required|integer|min:1',
            'content' => 'required|string|min:1|max:5000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        try {
            // Fix double-escaped backslashes from JavaScript
            $commentableClass = stripslashes($validated['commentable_type']);

            // If stripslashes removed too much, try the original
            if (! class_exists($commentableClass)) {
                $commentableClass = $validated['commentable_type'];
            }

            // Validate commentable class exists
            if (! class_exists($commentableClass)) {
                throw ValidationException::withMessages([
                    'commentable_type' => 'Invalid commentable type.',
                ]);
            }

            // Find commentable model
            $commentable = $commentableClass::find($validated['commentable_id']);

            if (! $commentable) {
                throw ValidationException::withMessages([
                    'commentable_id' => 'The selected item does not exist.',
                ]);
            }

            // Check if commentable has the HasComments trait
            if (! method_exists($commentable, 'canManageComment')) {
                throw ValidationException::withMessages([
                    'commentable_type' => 'This type does not support comments.',
                ]);
            }

            // Authorization: Check if user can comment (pass null to check creation permission)
            if (! $commentable->canManageComment(null)) {
                return redirect()->back(303)->withErrors([
                    'error' => 'You are not allowed to comment on this item.',
                ]);
            }

            // If parent_id is provided, validate it belongs to the same commentable
            if (! empty($validated['parent_id'])) {
                $parentComment = Comment::find($validated['parent_id']);

                if (! $parentComment ||
                    $parentComment->commentable_type !== $commentableClass ||
                    $parentComment->commentable_id != $validated['commentable_id']) {
                    throw ValidationException::withMessages([
                        'parent_id' => 'Invalid parent comment.',
                    ]);
                }
            }

            // Create comment in transaction
            DB::beginTransaction();

            $comment = Comment::create([
                'commentable_type' => $commentableClass,
                'commentable_id' => $validated['commentable_id'],
                'user_id' => auth()->id(),
                'parent_id' => $validated['parent_id'] ?? null,
                'content' => trim($validated['content']),
            ]);

            DB::commit();

            // Dispatch event for notifications
            event(new CommentCreated($comment));

            Log::info('Comment created', [
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
                'commentable' => $commentableClass.':'.$validated['commentable_id'],
            ]);

            return redirect()->back(303)->with('success', 'Comment posted successfully.');

        } catch (ValidationException $e) {
            DB::rollBack();
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to create comment', [
                'error' => $e->getMessage(),
                'user_id' => auth()->id(),
                'data' => $validated,
            ]);

            return redirect()->back(303)->withErrors([
                'error' => 'Failed to post comment. Please try again. '.$e->getMessage(),
            ]);
        }
    }

    /**
     * Update an existing comment
     */
    public function update(Request $request, Comment $comment)
    {
        // Authorization: Check if user can edit this comment
        if (! $comment->canEdit()) {
            return redirect()->back(303)->withErrors([
                'error' => 'You are not allowed to edit this comment.',
            ]);
        }

        // Check edit timeout if configured
        $editTimeout = config('react-reactions.comments.edit_timeout', 0);
        if ($editTimeout > 0 && $comment->created_at->addSeconds($editTimeout)->isPast()) {
            return redirect()->back(303)->withErrors([
                'error' => 'The time limit for editing this comment has expired.',
            ]);
        }

        // Validate input
        $validated = $request->validate([
            'content' => 'required|string|min:1|max:5000',
        ]);

        try {
            DB::beginTransaction();

            $comment->update([
                'content' => trim($validated['content']),
                'is_edited' => true,
                'edited_at' => now(),
            ]);

            DB::commit();

            Log::info('Comment updated', [
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back(303)->with('success', 'Comment updated successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to update comment', [
                'error' => $e->getMessage(),
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back(303)->withErrors([
                'error' => 'Failed to update comment. Please try again.',
            ]);
        }
    }

    /**
     * Delete a comment
     */
    public function destroy(Comment $comment)
    {
        // Authorization: Check if user can delete this comment
        if (! $comment->canDelete()) {
            return redirect()->back(303)->withErrors([
                'error' => 'You are not allowed to delete this comment.',
            ]);
        }

        try {
            DB::beginTransaction();

            $commentId = $comment->id;
            
            // Dispatch event before deletion (while we still have access to relationships)
            event(new CommentDeleted($comment));
            
            $comment->delete();

            DB::commit();

            Log::info('Comment deleted', [
                'comment_id' => $commentId,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back(303)->with('success', 'Comment deleted successfully.');

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Failed to delete comment', [
                'error' => $e->getMessage(),
                'comment_id' => $comment->id,
                'user_id' => auth()->id(),
            ]);

            return redirect()->back(303)->withErrors([
                'error' => 'Failed to delete comment. Please try again.',
            ]);
        }
    }

    /**
     * Get replies for a comment
     */
    public function replies(Comment $comment)
    {
        try {
            $replies = $comment->replies()
                ->with(['user', 'commentable'])
                ->withReactionsData(auth()->id())
                ->latest()
                ->get()
                ->map(function ($reply) {
                    return [
                        'id' => $reply->id,
                        'content' => $reply->content,
                        'created_at' => $reply->created_at,
                        'is_edited' => $reply->is_edited,
                        'edited_at' => $reply->edited_at,
                        'user' => [
                            'id' => $reply->user->id,
                            'name' => $reply->user->name,
                            'avatar' => $reply->user->avatar ?? null,
                        ],
                        'reactions_summary' => $reply->parseReactionsSummary(),
                        'user_reaction' => $reply->parseUserReaction(),
                        'can_edit' => $reply->canEdit(),
                        'can_delete' => $reply->canDelete(),
                        'replies_count' => 0, // Replies don't have nested replies
                    ];
                });

            return response()->json([
                'success' => true,
                'replies' => $replies,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load replies', [
                'error' => $e->getMessage(),
                'comment_id' => $comment->id,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to load replies.',
            ], 500);
        }
    }

    /**
     * Get paginated comments list
     **/
    public function list(Request $request, string $commentableType, int $commentableId)
    {
        try {
            $perPage = $request->query('per_page', 5);
            $page = $request->query('page', 1);

            // Decode the commentable type from base64
            $commentableClass = base64_decode($commentableType);

            // Fix double-escaped backslashes
            $commentableClass = stripslashes($commentableClass);

            Log::info('Comment list request', [
                'original' => $commentableType,
                'decoded' => $commentableClass,
                'exists' => class_exists($commentableClass),
            ]);

            // Validate commentable class exists
            if (! class_exists($commentableClass)) {
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid commentable type.',
                    'debug' => [
                        'received' => $commentableType,
                        'decoded' => $commentableClass,
                    ],
                ], 400);
            }

            // Find commentable model
            $commentable = $commentableClass::find($commentableId);

            if (! $commentable) {
                return response()->json([
                    'success' => false,
                    'error' => 'Commentable not found.',
                ], 404);
            }

            // Get paginated comments
            $comments = $commentable->comments()
                ->topLevel()
                ->withReactionsData(auth()->id())
                ->with(['user', 'commentable'])
                ->withCount('replies')
                ->latest()
                ->paginate($perPage, ['*'], 'page', $page);

            // Format comments
            $formattedComments = $comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'is_edited' => $comment->is_edited,
                    'edited_at' => $comment->edited_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar ?? null,
                    ],
                    'reactions_summary' => $comment->parseReactionsSummary(),
                    'user_reaction' => $comment->parseUserReaction(),
                    'can_edit' => $comment->canEdit(),
                    'can_delete' => $comment->canDelete(),
                    'replies_count' => $comment->replies_count,
                ];
            });

            return response()->json([
                'success' => true,
                'comments' => $formattedComments,
                'pagination' => [
                    'current_page' => $comments->currentPage(),
                    'last_page' => $comments->lastPage(),
                    'per_page' => $comments->perPage(),
                    'total' => $comments->total(),
                    'has_more' => $comments->hasMorePages(),
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to load comments', [
                'error' => $e->getMessage(),
                'commentable_type' => $commentableType,
                'commentable_id' => $commentableId,
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to load comments.',
            ], 500);
        }
    }
}
