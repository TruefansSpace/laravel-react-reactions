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
                'title' => 'Test Post for Reactions',
                'content' => 'This is a test post to demonstrate the Facebook-like reaction system. Hover over the Like button to see all available reactions!',
            ]);
        }

        return Inertia::render('TestPage', [
            'post' => $post,
        ]);
    }

    public function react(\Illuminate\Http\Request $request)
    {
        $data = $request->validate([
            'reactable_id' => 'required|integer',
            'reactable_type' => 'required|string',
            'type' => 'required|string',
        ]);

        \Illuminate\Support\Facades\Log::info('Reactable Type: ' . $data['reactable_type']);
        \Illuminate\Support\Facades\Log::info('Class exists: ' . (class_exists($data['reactable_type']) ? 'yes' : 'no'));

        // Try to load directly to see if it works
        if ($data['reactable_type'] === 'Workbench\\App\\Models\\TestPost') {
             $post = \Workbench\App\Models\TestPost::findOrFail($data['reactable_id']);
        } else {
             $post = $data['reactable_type']::findOrFail($data['reactable_id']);
        }
        
        // Use a hardcoded user ID for testing since we're not authenticated
        $userId = 1;
        
        $post->toggleReaction($userId, $data['type']);
        
        return back();
    }
}
