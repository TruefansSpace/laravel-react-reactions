<?php

namespace Workbench\App\Http\Controllers;

use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Workbench\App\Models\TestPost;

class TestController extends Controller
{
    public function index(): Response
    {
        // Load posts with reactions data
        $posts = TestPost::withReactionsData(auth()->id())
            ->latest()
            ->get();

        // Get all post IDs
        $postIds = $posts->pluck('id');

        // Load all top-level comments counts in one query
        $commentCounts = \TrueFans\LaravelReactReactions\Models\Comment::query()
            ->whereIn('commentable_id', $postIds)
            ->where('commentable_type', TestPost::class)
            ->whereNull('parent_id')
            ->select('commentable_id', DB::raw('count(*) as total'))
            ->groupBy('commentable_id')
            ->pluck('total', 'commentable_id');

        // Load all comments with their replies in one query
        $allComments = \TrueFans\LaravelReactReactions\Models\Comment::query()
            ->whereIn('commentable_id', $postIds)
            ->where('commentable_type', TestPost::class)
            ->whereNull('parent_id')
            ->with([
                'user:id,name,email',
                'replies' => function ($q) {
                    $q->with('user:id,name,email')->latest();
                }
            ])
            ->withCount('replies')
            ->latest()
            ->get()
            ->groupBy('commentable_id')
            ->map(function ($comments) {
                return $comments->take(5);
            });

        // Map posts with their comments
        $postsData = $posts->map(function ($post) use ($commentCounts, $allComments) {
            $comments = $allComments->get($post->id, collect());
            
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'created_at' => $post->created_at,
                'reactions_summary' => $post->parseReactionsSummary(),
                'user_reaction' => $post->parseUserReaction(),
                'comments' => $comments->map(function ($comment) use ($post) {
                    return [
                        'id' => $comment->id,
                        'content' => $comment->content,
                        'user' => $comment->user,
                        'user_id' => $comment->user_id,
                        'created_at' => $comment->created_at,
                        'is_edited' => $comment->is_edited,
                        'edited_at' => $comment->edited_at,
                        'can_edit' => auth()->check() && auth()->id() === $comment->user_id,
                        'can_delete' => auth()->check() && auth()->id() === $comment->user_id,
                        'replies_count' => $comment->replies_count,
                        'replies' => $comment->replies->map(function ($reply) {
                            return [
                                'id' => $reply->id,
                                'content' => $reply->content,
                                'user' => $reply->user,
                                'user_id' => $reply->user_id,
                                'created_at' => $reply->created_at,
                                'is_edited' => $reply->is_edited,
                                'edited_at' => $reply->edited_at,
                                'can_edit' => auth()->check() && auth()->id() === $reply->user_id,
                                'can_delete' => auth()->check() && auth()->id() === $reply->user_id,
                            ];
                        }),
                    ];
                })->values(),
                'total_comments' => $commentCounts->get($post->id, 0),
            ];
        });

        $errors = session()->get('errors');
        
        // Explicitly pass auth, flash, and errors since middleware sharing isn't working
        return Inertia::render('TestPage', [
            'posts' => $postsData,
            'auth' => [
                'user' => auth()->user() ? [
                    'id' => auth()->user()->id,
                    'name' => auth()->user()->name,
                    'email' => auth()->user()->email,
                ] : null,
            ],
            'flash' => [
                'success' => session()->get('success'),
                'error' => session()->get('error'),
            ],
            'errors' => $errors ? $errors->getBag('default')->getMessages() : [],
            'reactionTypes' => config('react-reactions.types', []),
        ]);
    }
}
