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
                ];
            });

        return Inertia::render('TestPage', [
            'posts' => $posts,
        ]);
    }
}
