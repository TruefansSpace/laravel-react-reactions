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
}
