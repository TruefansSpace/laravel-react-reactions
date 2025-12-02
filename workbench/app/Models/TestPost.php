<?php

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasComments;
use TrueFans\LaravelReactReactions\Traits\HasReactions;

class TestPost extends Model
{
    use HasComments, HasReactions;

    protected $fillable = [
        'title',
        'content',
        'user_id',
    ];

    protected $appends = [
        'reactions_summary',
        'user_reaction',
    ];

    public function getUserReactionAttribute(): ?string
    {
        // For testing purposes, we assume user ID 1
        return $this->userReaction(1);
    }

    /**
     * Get the user that owns the post
     */
    public function user()
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'user_id');
    }

    /**
     * Example: Override canManageComment to implement custom permission logic
     * Uncomment and modify this method to add your own rules
     */
    // public function canManageComment($comment): bool
    // {
    //     // Example 1: Post author can manage all comments
    //     // if (!$this->is_published) {
    //     //     return false;
    //     // }
    //
    //     // Example 2: Only allow comments from authenticated users
    //     // if (!$userId) {
    //     //     return false;
    //     // }
    //
    //     // Example 3: Only allow comments if user is not blocked
    //     // $user = User::find($userId);
    //     // if ($user && $user->is_blocked) {
    //     //     return false;
    //     // }
    //
    //     // Example 4: Only allow comments if post owner allows it
    //     // if ($this->comments_disabled) {
    //     //     return false;
    //     // }
    //
    //     return true;
    // }
}
