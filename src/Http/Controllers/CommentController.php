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
        \Log::info('Comment store called', [
            'data' => $request->all(),
            'user' => auth()->id()
        ]);

        $validator = Validator::make($request->all(), [
            'commentable_type' => 'required|string',
            'commentable_id' => 'required|integer',
            'content' => 'required|string|max:5000',
            'parent_id' => 'nullable|integer|exists:comments,id',
        ]);

        if ($validator->fails()) {
            \Log::error('Comment validation failed', ['errors' => $validator->errors()]);
            return redirect()->back(303)->withErrors($validator->errors());
        }

        // Fix double-escaped backslashes from JavaScript
        $commentableClass = stripslashes($request->input('commentable_type'));
        \Log::info('Commentable class', ['original' => $request->input('commentable_type'), 'fixed' => $commentableClass]);

        if (! class_exists($commentableClass)) {
            \Log::error('Class does not exist', ['class' => $commentableClass]);
            return redirect()->back(303)->withErrors(['commentable_type' => 'Invalid commentable type']);
        }

        $commentable = $commentableClass::find($request->input('commentable_id'));

        if (! $commentable) {
            return back()->withErrors(['commentable_id' => 'Commentable not found']);
        }

        // Check if user can comment on this model
        if (! $commentable->canManageComment()) {
            return back()->withErrors(['error' => 'You are not allowed to comment on this item']);
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
        // Check if user can edit this comment
        if (! $comment->canEdit()) {
            return back(303)->withErrors(['error' => 'You are not allowed to edit this comment']);
        }

        // Check edit timeout
        $editTimeout = config('react-reactions.comments.edit_timeout', 0);
        if ($editTimeout > 0 && $comment->created_at->addSeconds($editTimeout)->isPast()) {
            return redirect()->back(303)->withErrors(['error' => 'Edit time expired']);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
        ]);

        if ($validator->fails()) {
            return redirect()->back(303)->withErrors($validator->errors());
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
        // Check if user can delete this comment
        if (! $comment->canDelete()) {
            return redirect()->back(303)->withErrors(['errors' => 'You are not allowed to delete this comment']);
        }

        $comment->delete();

        return redirect()->back(303)->with(['success' => 'You have successfully deleted this comment']);
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
