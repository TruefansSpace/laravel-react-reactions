<?php

namespace TrueFans\LaravelReactReactions\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use TrueFans\LaravelReactReactions\Models\Comment;

class CommentController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|integer',
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        if ($validator->fails()) {
            return redirect()->back(303)->withErrors($validator->errors());
        }

        $commentableClass = $request->input('commentable_type');

        if (! class_exists($commentableClass)) {
            return redirect()->back(303)->withErrors(['commentable_type' => 'Invalid commentable type']);
        }

        $commentable = $commentableClass::find($request->input('commentable_id'));

        if (! $commentable) {
            return redirect()->back(303)->withErrors(['commentable_id' => 'Commentable not found']);
        }

        $comment = $commentable->comment(
            auth()->id(),
            $request->input('content'),
            $request->input('parent_id')
        );

        return redirect()->back(303)->with('success', 'Comment added successfully');
    }

    public function update(Request $request, Comment $comment)
    {
        // Check if user owns the comment
        if ($comment->user_id !== auth()->id()) {
            return redirect()->back(303)->withErrors(['error' => 'Unauthorized']);
        }

        // Check edit timeout
        $editTimeout = config('react-reactions.comments.edit_timeout', 0);
        if ($editTimeout > 0 && $comment->created_at->addSeconds($editTimeout)->isPast()) {
            return redirect()->back()->withErrors(['error' => 'Edit time expired']);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        $comment->update([
            'content' => $request->input('content'),
            'is_edited' => true,
            'edited_at' => now(),
        ]);

        return back(303);
    }

    public function destroy(Comment $comment)
    {
        // Check if user owns the comment or is admin
        if ($comment->user_id !== auth()->id() && ! (auth()->user()->is_admin ?? false)) {
            return back(303)->withErrors(['error' => 'Unauthorized']);
        }

        $comment->delete();

        return back(303);
    }

    public function list(Request $request, string $commentableType, int $commentableId)
    {
        $perPage = config('react-reactions.comments.per_page', 10);

        $commentableClass = $commentableType;

        if (! class_exists($commentableClass)) {
            return response()->json(['error' => 'Invalid commentable type'], 400);
        }

        $commentable = $commentableClass::find($commentableId);

        if (! $commentable) {
            return response()->json(['error' => 'Commentable not found'], 404);
        }

        $comments = $commentable->comments()
            ->topLevel()
            ->withReactionsData(auth()->id())
            ->with(['user', 'replies' => function ($query) {
                $query->withReactionsData(auth()->id())->with('user');
            }])
            ->paginate($perPage);

        return response()->json($comments);
    }
}
