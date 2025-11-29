<?php

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasReactions;
use TrueFans\LaravelReactReactions\Traits\HasComments;

class TestPost extends Model
{
    use HasReactions, HasComments;

    protected $fillable = [
        'title',
        'content',
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
     * Example: Override canComment to implement custom permission logic
     * Uncomment and modify this method to add your own rules
     */
    // public function canComment(?int $userId = null): bool
    // {
    //     // Example 1: Only allow comments if post is published
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
