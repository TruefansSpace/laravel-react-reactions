<?php

namespace TrueFans\LaravelReactReactions\Events;

use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use TrueFans\LaravelReactReactions\Models\Comment;

class CommentDeleted
{
    use Dispatchable, SerializesModels;

    public Comment $comment;

    /**
     * Create a new event instance.
     */
    public function __construct(Comment $comment)
    {
        $this->comment = $comment;
    }
}
