<?php

namespace Workbench\App\Http\Controllers;

use Illuminate\Routing\Controller;
use Inertia\Inertia;
use Inertia\Response;
use Workbench\App\Models\TestPost;

class TestController extends Controller
{
    public function index(): Response
    {
        $post = TestPost::first();

        if (! $post) {
            $post = TestPost::create([
                'title' => 'Test Post',
                'content' => 'This is a test post for reactions',
            ]);
        }

        return Inertia::render('TestPage', [
            'post' => $post,
        ]);
    }
}
