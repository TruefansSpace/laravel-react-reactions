# Laravel React Reactions

A complete Facebook-like reaction and commenting system for Laravel with Inertia.js and React. Add reactions, comments with nested replies, and toast notifications to any Eloquent model.

## Features

- 🎯 **Reactions System**: Facebook-style reactions (like, love, haha, wow, sad, angry) on any model
- 💬 **Comments System**: Full-featured commenting with unlimited nested replies
- 🔄 **Reactions on Comments**: Users can react to comments just like posts
- ⚡ **Inertia.js v2**: Seamless SPA experience with server-side routing
- 🎨 **Beautiful UI**: Animated reaction picker, modal viewers, and smooth interactions
- 🔔 **Toast Notifications**: Built-in toast system for user feedback
- 🔒 **Flexible Permissions**: Customizable permission system for comments
- 🚀 **Query Optimized**: Database subqueries eliminate N+1 problems (1 query for any dataset size)
- 📝 **Full TypeScript**: All React components are written in TypeScript with proper type definitions
- ⚙️ **Configurable**: Reaction types and emojis are fully configurable via config file
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🧪 **Fully Tested**: Comprehensive unit, feature, and E2E tests (151 passing tests)

## Requirements

- PHP ^8.4
- Laravel ^11.0 || ^12.0
- Inertia.js v2
- React 19
- TypeScript ^5.0 (recommended for type safety)

## Installation

```bash
composer require truefanspace/laravel-react-reactions
```

### Publishing Assets

You can publish all package assets at once or individually:

**Publish everything (recommended for first-time setup):**
```bash
php artisan vendor:publish --provider="TrueFans\LaravelReactReactions\LaravelReactReactionsServiceProvider"
```

**Or publish individually:**
```bash
# Publish and run migrations
php artisan vendor:publish --tag=react-reactions-migrations
php artisan migrate

# Publish React components (TypeScript)
php artisan vendor:publish --tag=react-reactions-components

# Publish configuration file
php artisan vendor:publish --tag=react-reactions-config
```

**Available tags:**
- `react-reactions-migrations` - Database migrations for reactions and comments tables
- `react-reactions-components` - React/TypeScript components to `resources/js/Components/Reactions`
- `react-reactions-config` - Configuration file to `config/react-reactions.php`

## Quick Start

### 1. Add Traits to Your Model

```php
use TrueFans\LaravelReactReactions\Traits\HasReactions;
use TrueFans\LaravelReactReactions\Traits\HasComments;

class Post extends Model
{
    use HasReactions, HasComments;

    protected $appends = ['reactions_summary', 'user_reaction'];

    public function canManageComment($comment): bool
    {
        // null = creating new comment, Comment instance = editing/deleting
        if ($comment === null) {
            return auth()->check(); // Anyone can comment
        }
        
        // Users can manage their own comments
        return $comment->user_id === auth()->id();
    }
}
```

### 2. Setup Controller with Query Optimization

```php
use Illuminate\Support\Facades\DB;

class PostController extends Controller
{
    public function index()
    {
        $userId = auth()->id();
        
        // ✅ OPTIMIZED: Load all posts with reactions in 1 query
        $posts = Post::withReactionsData($userId)
            ->latest()
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'reactions_summary' => $post->parseReactionsSummary(),
                'user_reaction' => $post->parseUserReaction(),
            ]);

        return Inertia::render('Posts/Index', ['posts' => $posts]);
    }

    public function show(Post $post)
    {
        $userId = auth()->id();
        
        // ✅ OPTIMIZED: Load all comments with reactions efficiently
        $postIds = [$post->id];
        
        // Get comment counts in one query
        $commentCounts = Comment::whereIn('commentable_id', $postIds)
            ->where('commentable_type', Post::class)
            ->whereNull('parent_id')
            ->select('commentable_id', DB::raw('count(*) as total'))
            ->groupBy('commentable_id')
            ->pluck('total', 'commentable_id');
        
        // Load comments with replies in one query
        $comments = Comment::where('commentable_id', $post->id)
            ->where('commentable_type', Post::class)
            ->whereNull('parent_id')
            ->with(['user:id,name,email', 'replies.user:id,name,email'])
            ->withCount('replies')
            ->latest()
            ->take(5)
            ->get()
            ->map(fn($comment) => [
                'id' => $comment->id,
                'content' => $comment->content,
                'user' => $comment->user,
                'user_id' => $comment->user_id,
                'created_at' => $comment->created_at,
                'is_edited' => $comment->is_edited,
                'can_edit' => $userId === $comment->user_id,
                'can_delete' => $userId === $comment->user_id,
                'replies_count' => $comment->replies_count,
                'replies' => $comment->replies->map(fn($reply) => [
                    'id' => $reply->id,
                    'content' => $reply->content,
                    'user' => $reply->user,
                    'user_id' => $reply->user_id,
                    'created_at' => $reply->created_at,
                    'is_edited' => $reply->is_edited,
                    'can_edit' => $userId === $reply->user_id,
                    'can_delete' => $userId === $reply->user_id,
                ]),
            ]);

        return Inertia::render('Posts/Show', [
            'post' => $post,
            'comments' => $comments,
            'total_comments' => $commentCounts->get($post->id, 0),
        ]);
    }
}
```

### 3. Setup Inertia Middleware

```php
class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
            // Share reaction types from config
            'reactionTypes' => config('react-reactions.types', []),
        ];
    }
}
```

### 4. Use React Components

```jsx
import Reactions from '@/Components/Reactions/Reactions';
import Comments from '@/Components/Comments/Comments';

export default function PostShow({ post, comments, total_comments }) {
    return (
        <div>
            <h1>{post.title}</h1>
            
            {/* Reactions */}
            <Reactions
                reactableType="App\\Models\\Post"
                reactableId={post.id}
                initialReactions={post.reactions_summary}
                userReaction={post.user_reaction}
            />

            {/* Comments */}
            <Comments
                commentableType="App\\Models\\Post"
                commentableId={post.id}
                initialComments={comments}
                totalComments={total_comments}
                currentUserId={auth.user.id}
            />
        </div>
    );
}
```

## Query Optimization Guide

### The N+1 Problem

**❌ BAD: This creates N+1 queries**
```php
// Loading 10 posts = 21 queries (1 + 10*2)
$posts = Post::latest()->get(); // Appended attributes cause N+1
```

**✅ GOOD: This uses 1 query**
```php
// Loading 10 posts = 1 query
// Loading 1000 posts = still 1 query!
$posts = Post::withReactionsData(auth()->id())
    ->latest()
    ->get()
    ->map(fn($post) => [
        'id' => $post->id,
        'reactions_summary' => $post->parseReactionsSummary(),
        'user_reaction' => $post->parseUserReaction(),
    ]);
```

### How It Works

The `withReactionsData()` scope adds SQL subqueries to aggregate reactions at the database level:

```sql
SELECT posts.*,
  -- Aggregate all reactions into JSON
  (SELECT JSON_OBJECT(
    'like', COALESCE(SUM(CASE WHEN type = 'like' THEN 1 END), 0),
    'love', COALESCE(SUM(CASE WHEN type = 'love' THEN 1 END), 0),
    ...
  ) FROM reactions 
  WHERE reactable_id = posts.id 
  AND reactable_type = 'App\\Models\\Post') as reactions_summary_json,
  
  -- Get current user's reaction
  (SELECT type FROM reactions 
  WHERE reactable_id = posts.id 
  AND user_id = ? LIMIT 1) as user_reaction_type
FROM posts
```

This executes as **one query** regardless of how many posts you load.

### Performance Comparison

| Dataset | Without Optimization | With `withReactionsData()` |
|---------|---------------------|---------------------------|
| 10 posts | 21 queries | 1 query |
| 100 posts | 201 queries | 1 query |
| 1000 posts | 2001 queries | 1 query |

### Comments Optimization

**❌ BAD: Loading comments per post in a loop**
```php
$posts->map(function($post) {
    $comments = $post->comments()->get(); // N+1 query
    $totalComments = $post->comments()->count(); // Another N+1
});
```

**✅ GOOD: Load all comments at once**
```php
$postIds = $posts->pluck('id');

// Get all comment counts in 1 query
$commentCounts = Comment::whereIn('commentable_id', $postIds)
    ->where('commentable_type', Post::class)
    ->whereNull('parent_id')
    ->select('commentable_id', DB::raw('count(*) as total'))
    ->groupBy('commentable_id')
    ->pluck('total', 'commentable_id');

// Load all comments with replies in 1 query
$allComments = Comment::whereIn('commentable_id', $postIds)
    ->where('commentable_type', Post::class)
    ->whereNull('parent_id')
    ->with(['user', 'replies.user'])
    ->withCount('replies')
    ->latest()
    ->get()
    ->groupBy('commentable_id');
```

### Key Optimization Rules

1. **Always use `withReactionsData()`** when loading multiple models
2. **Eager load relationships** with `with()` to avoid N+1
3. **Use `withCount()`** instead of `count()` in loops
4. **Batch load related data** before mapping
5. **Avoid calling methods on models in loops** that trigger queries
6. **Monitor queries** with Laravel Debugbar in development

## Configuration

### Customizing Reaction Types

All reaction types are configurable in `config/react-reactions.php`. The frontend automatically reads from this config:

```php
return [
    // Customize reaction types and emojis
    'types' => [
        'like' => '👍',
        'adore' => '🥰',  // You can change this to 'love' => '❤️'
        'haha' => '😂',
        'wow' => '😮',
        'sad' => '😢',
        'angry' => '😠',
        // Add your own:
        // 'fire' => '🔥',
        // 'celebrate' => '🎉',
    ],

    'comments' => [
        'reactions_enabled' => true,
        'max_depth' => 3,
        'edit_timeout' => 300, // seconds
        'per_page' => 10,
    ],

    'notifications' => [
        'enabled' => true,
        'admin_email' => env('REACTIONS_ADMIN_EMAIL'),
        'notify_owner' => true,
        'notify_parent_author' => true,
    ],
];
```

**Important**: The reaction types are shared with the frontend via Inertia middleware. Make sure to add this to your `HandleInertiaRequests`:

```php
public function share(Request $request): array
{
    return [
        ...parent::share($request),
        'reactionTypes' => config('react-reactions.types', []),
    ];
}
```

This ensures the frontend always uses the same reaction types as the backend, maintaining consistency across your application.

## API Reference

### HasReactions Trait

```php
// Add or update reaction
$model->react(int $userId, string $type): void

// Remove reaction
$model->unreact(int $userId): void

// Get reactions summary
$model->reactionsSummary(): array

// Get user's reaction
$model->userReaction(int $userId): ?string

// Query scope for optimized loading
Model::withReactionsData(?int $userId)

// Parse reactions data (after withReactionsData)
$model->parseReactionsSummary(): array
$model->parseUserReaction(): ?string
```

### HasComments Trait

```php
// Add a comment
$model->addComment(int $userId, string $content): Comment

// Get comments relationship
$model->comments(): MorphMany

// Check permissions
$model->canManageComment(?Comment $comment): bool
```

### Comment Model

```php
// Add a reply
$comment->addReply(int $userId, string $content): Comment

// Get replies
$comment->replies(): HasMany

// Check permissions
$comment->canEdit(): bool
$comment->canDelete(): bool

// Query scope
Comment::topLevel() // Only top-level comments
```

## TypeScript Support

All React components are written in TypeScript with full type safety. The package includes:

- ✅ TypeScript definitions for all components
- ✅ Proper type inference for props
- ✅ Type-safe event handlers
- ✅ Configurable reaction types with type safety

### Component Type Definitions

```tsx
// Reactions Component
interface ReactionsProps {
    reactableType: string;
    reactableId: number;
    initialReactions?: Record<string, number>;
    userReaction?: string | null;
    onUserClick?: (userId: number) => void;
}

// Comments Component
interface CommentsProps {
    commentableType: string;
    commentableId: number;
    initialComments?: Comment[];
    totalComments?: number | null;
    reactionsEnabled?: boolean;
    onUserClick?: (userId: number) => void;
    currentUserId: number;
    perPage?: number;
}

// Comment Type
interface Comment {
    id: number;
    content: string;
    user_id: number;
    user?: User;
    created_at: string;
    is_edited?: boolean;
    reactions_summary?: Record<string, number>;
    user_reaction?: string | null;
    replies?: Comment[];
}
```

### Using with TypeScript

```tsx
import Reactions from '@/Components/Reactions/Reactions';
import Comments from '@/Components/Comments/Comments';
import type { Comment } from '@/types'; // Define your types

interface Post {
    id: number;
    title: string;
    reactions_summary: Record<string, number>;
    user_reaction: string | null;
}

export default function PostShow({ post, comments }: { 
    post: Post; 
    comments: Comment[];
}) {
    return (
        <div>
            <Reactions
                reactableType="App\\Models\\Post"
                reactableId={post.id}
                initialReactions={post.reactions_summary}
                userReaction={post.user_reaction}
            />
            
            <Comments
                commentableType="App\\Models\\Post"
                commentableId={post.id}
                initialComments={comments}
                currentUserId={1}
            />
        </div>
    );
}
```

## Testing

```bash
# Run PHP tests
composer test

# Run E2E tests
npm run build
npm run test:e2e
```

## Troubleshooting

### N+1 Query Issues
- Always use `withReactionsData()` when loading multiple models
- Use `with()` to eager load relationships
- Use `withCount()` instead of `count()` in loops
- Monitor queries with Laravel Debugbar

### Reactions Not Working
- Check routes: `php artisan route:list | grep reactions`
- Verify user is authenticated
- Check browser console for errors

### Comments Not Showing
- Verify `initialComments` prop is passed
- Check user authentication
- Ensure `canManageComment()` is implemented

## License

MIT License. See [License File](LICENSE.md) for details.

## Credits

- [Vahan Drnoyan](https://github.com/truefanspace)
- Built with Laravel 11, Inertia.js v2, React 19, TypeScript, and shadcn/ui
