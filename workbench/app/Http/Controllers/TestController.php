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
            ->get()
            ->map(function ($post) {
                // Get total comments count
                $totalComments = $post->comments()->whereNull('parent_id')->count();
                
                // Load only first 5 comments with their replies
                $comments = $post->comments()
                    ->whereNull('parent_id')
                    ->with([
                        'user:id,name,email',
                        'replies' => function ($q) {
                            $q->with('user:id,name,email')->latest();
                        }
                    ])
                    ->latest()
                    ->take(5)
                    ->get();

                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'created_at' => $post->created_at,
                    'reactions_summary' => $post->parseReactionsSummary(),
                    'user_reaction' => $post->parseUserReaction(),
                    'comments' => $comments->map(function ($comment) {
                        return [
                            'id' => $comment->id,
                            'content' => $comment->content,
                            'user' => $comment->user,
                            'created_at' => $comment->created_at,
                            'is_edited' => $comment->is_edited,
                            'edited_at' => $comment->edited_at,
                            'can_edit' => $comment->canEdit(),
                            'can_delete' => $comment->canDelete(),
                            'replies_count' => $comment->replies()->count(),
                            'replies' => $comment->replies->map(function ($reply) {
                                return [
                                    'id' => $reply->id,
                                    'content' => $reply->content,
                                    'user' => $reply->user,
                                    'created_at' => $reply->created_at,
                                    'is_edited' => $reply->is_edited,
                                    'edited_at' => $reply->edited_at,
                                    'can_edit' => $reply->canEdit(),
                                    'can_delete' => $reply->canDelete(),
                                ];
                            }),
                        ];
                    }),
                    'total_comments' => $totalComments,
                ];
            });

        $errors = session()->get('errors');
        
        return Inertia::render('TestPage', [
            'posts' => $posts,
            'flash' => [
                'success' => session()->get('success'),
            ],
            'errors' => $errors ? $errors->getBag('default')->getMessages() : [],
        ]);
    }
}
