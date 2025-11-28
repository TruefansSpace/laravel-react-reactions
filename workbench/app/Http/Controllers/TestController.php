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
        $posts = TestPost::latest()->get();

        return Inertia::render('TestPage', [
            'posts' => $posts,
        ]);
    }
}
