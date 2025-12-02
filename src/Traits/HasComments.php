<?php

namespace TrueFans\LaravelReactReactions\Traits;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use TrueFans\LaravelReactReactions\Models\Comment;

trait HasComments
{
    /**
     * Get all comments for this model
     */
    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    /**
     * Get top-level comments (no parent)
     */
    public function topLevelComments(): MorphMany
    {
        return $this->comments()->topLevel()->with('user')->latest();
    }

    /**
     * Get comments with reactions data
     */
    public function commentsWithReactions(?int $userId = null): MorphMany
    {
        return $this->comments()
            ->topLevel()
            ->withReactionsData($userId)
            ->with(['user', 'replies' => function ($query) use ($userId) {
                $query->withReactionsData($userId);
            }]);
    }

    /**
     * Add a comment to this model
     */
    public function comment(int $userId, string $content, ?int $parentId = null): Comment
    {
        return $this->comments()->create([
            'user_id' => $userId,
            'content' => $content,
            'parent_id' => $parentId,
        ]);
    }

    /**
     * Get total comments count (including replies)
     */
    public function totalCommentsCount(): int
    {
        return $this->comments()->count();
    }

    /**
     * Get top-level comments count only
     */
    public function topLevelCommentsCount(): int
    {
        return $this->comments()->topLevel()->count();
    }

    /**
     * Check if a user can create or manage comments
     * Override this method in your model to implement custom logic
     */
    public function canManageComment(?\TrueFans\LaravelReactReactions\Models\Comment $comment = null): bool
    {
        $user = auth()->user();

        if (! $user) {
            return false;
        }

        // If no comment is provided, check if user can create a new comment
        if ($comment === null) {
            return true; // Any authenticated user can create comments by default
        }

        // If comment is provided, check if user can edit/delete it
        // Allow if user is admin or comment author
        if (isset($user->is_admin) && $user->is_admin) {
            return true;
        }

        return $comment->user_id === $user->id;
    }
}
