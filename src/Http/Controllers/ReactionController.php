<?php

namespace TrueFans\LaravelReactReactions\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ReactionController extends Controller
{
    public function store(Request $request)
    {
        $allowedTypes = implode(',', array_keys(config('react-reactions.types', [])));
        
        $validator = Validator::make($request->all(), [
            'reactable_type' => 'required|string',
            'reactable_id' => 'required|integer',
            'type' => 'required|string|in:' . $allowedTypes,
        ]);

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator->errors());
        }

        // Fix double-escaped backslashes from JavaScript
        $reactableClass = stripslashes($request->input('reactable_type'));
        
        // If stripslashes removed too much, try the original
        if (!class_exists($reactableClass)) {
            $reactableClass = $request->input('reactable_type');
        }
        
        if (! class_exists($reactableClass)) {
            return redirect()->back()->withErrors(['reactable_type' => 'Invalid reactable type']);
        }

        $reactable = $reactableClass::find($request->input('reactable_id'));

        if (! $reactable) {
            return redirect()->back()->withErrors(['reactable_id' => 'Reactable not found']);
        }

        $reaction = $reactable->react(
            auth()->id(),
            $request->input('type')
        );

        // Inertia automatically converts POST redirects to GET with 303
        return redirect()->back(303)->with('message', 'Reaction added successfully');
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'reactable_type' => 'required|string',
            'reactable_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return redirect()->back(303)->withErrors($validator->errors());
        }

        // Fix double-escaped backslashes from JavaScript
        $reactableClass = stripslashes($request->input('reactable_type'));
        
        // If stripslashes removed too much, try the original
        if (!class_exists($reactableClass)) {
            $reactableClass = $request->input('reactable_type');
        }
        
        if (! class_exists($reactableClass)) {
            return redirect()->back(303)->withErrors(['reactable_type' => 'Invalid reactable type']);
        }

        $reactable = $reactableClass::find($request->input('reactable_id'));

        if (! $reactable) {
            return redirect()->back(303)->withErrors(['reactable_id' => 'Reactable not found']);
        }

        $deleted = $reactable->unreact(auth()->id());

        // Return 303 redirect to force GET request (prevents method not allowed error)
        return redirect()->back(303)->with('message', 'Reaction removed successfully');
    }

    public function list(Request $request, string $reactableType, int $reactableId)
    {
        $type = $request->query('type', 'all');
        $perPage = 8;

        // Decode the reactable type (it's URL encoded)
        $reactableClass = urldecode($reactableType);
        
        // Handle double-escaped backslashes from JavaScript
        // If the class doesn't exist, try with stripslashes
        if (!class_exists($reactableClass)) {
            $reactableClass = stripslashes($reactableClass);
        }

        $query = \TrueFans\LaravelReactReactions\Models\Reaction::query()
            ->where('reactable_type', $reactableClass)
            ->where('reactable_id', $reactableId)
            ->with('user:id,name,email')
            ->latest();

        if ($type !== 'all') {
            $query->where('type', $type);
        }

        $reactions = $query->paginate($perPage);

        return response()->json([
            'reactions' => $reactions,
        ]);
    }
}

