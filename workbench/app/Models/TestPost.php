<?php

namespace Workbench\App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasReactions;

class TestPost extends Model
{
    use HasReactions;

    protected $fillable = [
        'title',
        'content',
    ];

    protected $appends = [
        'reactions_summary',
        'user_reaction',
    ];
}
