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
        // Clean controller - all query complexity is abstracted into the scope
        $posts = TestPost::withReactionsData(auth()->id())
            ->with([
                'comments' => function ($query) {
                    $query->whereNull('parent_id')
                        ->with([
                            'user:id,name,email',
                            'replies' => function ($q) {
                                $q->with('user:id,name,email')
                                    ->latest();
                            }
                        ])
                        ->latest();
                }
            ])
            ->latest()
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'created_at' => $post->created_at,
                    'reactions_summary' => $post->parseReactionsSummary(),
                    'user_reaction' => $post->parseUserReaction(),
                    'comments' => $post->comments->map(function ($comment) {
                        return [
                            'id' => $comment->id,
                            'content' => $comment->content,
                            'user' => $comment->user,
                            'created_at' => $comment->created_at,
                            'is_edited' => $comment->is_edited,
                            'edited_at' => $comment->edited_at,
                            'replies' => $comment->replies->map(function ($reply) {
                                return [
                                    'id' => $reply->id,
                                    'content' => $reply->content,
                                    'user' => $reply->user,
                                    'created_at' => $reply->created_at,
                                    'is_edited' => $reply->is_edited,
                                    'edited_at' => $reply->edited_at,
                                ];
                            }),
                        ];
                    }),
                ];
            });

        return Inertia::render('TestPage', [
            'posts' => $posts,
        ]);
    }
}
