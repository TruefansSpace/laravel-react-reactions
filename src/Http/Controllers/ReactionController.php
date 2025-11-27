<?php

namespace TrueFans\LaravelReactReactions\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;

class ReactionController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reactable_type' => 'required|string',
            'reactable_id' => 'required|integer',
            'type' => 'required|string|in:like,love,haha,wow,sad,angry',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $reactableClass = $request->input('reactable_type');
        
        if (! class_exists($reactableClass)) {
            return back()->withErrors(['reactable_type' => 'Invalid reactable type']);
        }

        $reactable = $reactableClass::find($request->input('reactable_id'));

        if (! $reactable) {
            return back()->withErrors(['reactable_id' => 'Reactable not found']);
        }

        $reaction = $reactable->react(
            auth()->id(),
            $request->input('type')
        );

        return back()->with([
            'message' => 'Reaction added successfully',
            'reactions_summary' => $reactable->reactionsSummary(),
            'user_reaction' => $reactable->userReaction(auth()->id()),
        ]);
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reactable_type' => 'required|string',
            'reactable_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator->errors());
        }

        $reactableClass = $request->input('reactable_type');
        
        if (! class_exists($reactableClass)) {
            return back()->withErrors(['reactable_type' => 'Invalid reactable type']);
        }

        $reactable = $reactableClass::find($request->input('reactable_id'));

        if (! $reactable) {
            return back()->withErrors(['reactable_id' => 'Reactable not found']);
        }

        $deleted = $reactable->unreact(auth()->id());

        return back()->with([
            'message' => $deleted ? 'Reaction removed successfully' : 'No reaction to remove',
            'reactions_summary' => $reactable->reactionsSummary(),
            'user_reaction' => null,
        ]);
    }
}

