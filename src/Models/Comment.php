<?php

namespace TrueFans\LaravelReactReactions\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use TrueFans\LaravelReactReactions\Traits\HasReactions;

class Comment extends Model
{
    use SoftDeletes, HasReactions;

    protected $fillable = [
        'commentable_type',
        'commentable_id',
        'user_id',
        'parent_id',
        'content',
        'is_edited',
        'edited_at',
    ];

    protected $casts = [
        'is_edited' => 'boolean',
        'edited_at' => 'datetime',
    ];

    protected $appends = ['reactions_summary', 'user_reaction'];

    /**
     * Get the commentable entity (post, event, media, etc.)
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who created the comment
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(config('auth.providers.users.model'));
    }

    /**
     * Get the parent comment (for nested replies)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get all replies to this comment
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')->with('user')->latest();
    }

    /**
     * Get all replies with reactions data
     */
    public function repliesWithReactions(): HasMany
    {
        return $this->replies()->withReactionsData(auth()->id());
    }

    /**
     * Scope to get only top-level comments (no parent)
     */
    public function scopeTopLevel($query)
    {
        return $query->whereNull('parent_id');
    }

    /**
     * Check if reactions are enabled for comments
     */
    public function reactionsEnabled(): bool
    {
        return config('react-reactions.comments.reactions_enabled', true);
    }

    /**
     * Check if a user can edit this comment
     * Override this method to implement custom logic
     *
     * @param int|null $userId
     * @return bool
     */
    public function canEdit(): bool
    {
        return $this->commentable->canManageComment($this);
    }

    /**
     * Check if a user can delete this comment
     * Override this method to implement custom logic
     *
     * @param int|null $userId
     * @return bool
     */
    public function canDelete(): bool
    {
        return $this->commentable->canManageComment($this);
    }

    /**
     * Add a reply to this comment
     *
     * @param int $userId
     * @param string $content
     * @return Comment
     */
    public function addReply(int $userId, string $content): Comment
    {
        return self::create([
            'commentable_type' => $this->commentable_type,
            'commentable_id' => $this->commentable_id,
            'user_id' => $userId,
            'parent_id' => $this->id,
            'content' => $content,
        ]);
    }
}
