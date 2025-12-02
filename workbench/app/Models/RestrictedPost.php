<?php

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasComments;
use TrueFans\LaravelReactReactions\Traits\HasReactions;

class RestrictedPost extends Model
{
    use HasComments, HasReactions;

    protected $table = 'test_posts';

    protected $fillable = [
        'title',
        'content',
        'user_id',
    ];

    /**
     * Override to restrict commenting
     */
    public function canManageComment($comment): bool
    {
        // Only allow the post owner to comment
        if ($comment === null) {
            // Creating new comment - check if user is post owner
            return auth()->check() && auth()->id() === $this->user_id;
        }

        // Editing/deleting existing comment
        return auth()->check() && auth()->id() === $comment->user_id;
    }

    public function user()
    {
        return $this->belongsTo(config('auth.providers.users.model'), 'user_id');
    }
}
