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
- ♿ **Accessible**: Full keyboard navigation and screen reader support
- 🧪 **Fully Tested**: Comprehensive unit, feature, and E2E tests

## Requirements

- PHP ^8.4
- Laravel ^11.0 || ^12.0
- Inertia.js v2
- React 19

## Installation

```bash
# Install package
composer require truefanspace/laravel-react-reactions

# Publish migrations
php artisan vendor:publish --tag=react-reactions-migrations
php artisan migrate

# Publish React components
php artisan vendor:publish --tag=react-reactions-components

# Publish config (optional)
php artisan vendor:publish --tag=react-reactions-config
```

## How to Use

This guide walks you through implementing reactions and comments in your Laravel application.

### Complete Implementation Example

Let's add reactions and comments to a blog post system.

#### Step 1: Prepare Your Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasReactions;
use TrueFans\LaravelReactReactions\Traits\HasComments;

class Post extends Model
{
    use HasReactions, HasComments;

    protected $fillable = ['title', 'content', 'user_id'];
    
    // Add these to automatically include reactions data
    protected $appends = ['reactions_summary', 'user_reaction'];

    // Define relationship to user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Determine who can create or manage comments
     * Customize this based on your business logic
     * 
     * @param Comment|null $comment - null when creating, Comment instance when editing/deleting
     */
    public function canManageComment($comment = null): bool
    {
        $user = auth()->user();
        
        if (!$user) {
            return false;
        }

        // If no comment provided, check if user can CREATE a new comment
        if ($comment === null) {
            // Example: Only verified users can create comments
            return $user->hasVerifiedEmail();
            
            // Or: Only post author can allow comments
            // return $this->user_id === $user->id;
            
            // Or: Anyone authenticated can comment
            // return true;
        }

        // If comment provided, check if user can EDIT/DELETE it
        // Post author can manage all comments on their post
        if ($this->user_id === $user->id) {
            return true;
        }
        
        // Users can manage their own comments
        return $comment->user_id === $user->id;
    }
}
```

#### Step 2: Setup Inertia Middleware

Create or update `app/Http/Middleware/HandleInertiaRequests.php`:

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    protected $rootView = 'app';

    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            
            // Share authenticated user
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'avatar' => $request->user()->avatar ?? null,
                ] : null,
            ],
            
            // Share flash messages for toast notifications
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
```

Register the middleware in `bootstrap/app.php`:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->web(append: [
        \App\Http\Middleware\HandleInertiaRequests::class,
    ]);
})
```

#### Step 3: Install shadcn/ui Toast Components

```bash
# Install shadcn/ui toast (if not already installed)
npx shadcn@latest add toast
```

This creates:
- `resources/js/components/ui/toast.jsx`
- `resources/js/components/ui/toaster.jsx`
- `resources/js/hooks/use-toast.js`

#### Step 4: Setup Your Layout with Toast

Create or update `resources/js/Layouts/AppLayout.jsx`:

```jsx
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function AppLayout({ children }) {
    const { toast } = useToast();
    const { flash } = usePage().props;

    // Automatically display flash messages from server
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }

        if (flash?.error) {
            toast({
                title: 'Error',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                {/* Your navigation */}
            </nav>
            
            <main className="container mx-auto py-8">
                {children}
            </main>
            
            {/* Toast notifications will appear here */}
            <Toaster />
        </div>
    );
}
```

#### Step 5: Create Your Controller

Create `app/Http/Controllers/PostController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PostController extends Controller
{
    /**
     * Display a listing of posts with reactions
     */
    public function index()
    {
        $userId = auth()->id();

        // Load posts with optimized reactions data (1 query!)
        $posts = Post::with('user')
            ->withReactionsData($userId)
            ->latest()
            ->paginate(10)
            ->through(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'created_at' => $post->created_at->diffForHumans(),
                    'user' => [
                        'id' => $post->user->id,
                        'name' => $post->user->name,
                    ],
                    'reactions_summary' => $post->parseReactionsSummary(),
                    'user_reaction' => $post->parseUserReaction(),
                ];
            });

        return Inertia::render('Posts/Index', [
            'posts' => $posts,
        ]);
    }

    /**
     * Display a single post with comments
     */
    public function show(Post $post)
    {
        $userId = auth()->id();

        // Load post with reactions
        $post->load('user');
        $postData = [
            'id' => $post->id,
            'title' => $post->title,
            'content' => $post->content,
            'created_at' => $post->created_at->format('M d, Y'),
            'user' => [
                'id' => $post->user->id,
                'name' => $post->user->name,
                'avatar' => $post->user->avatar,
            ],
            'reactions_summary' => $post->reactionsSummary(),
            'user_reaction' => $post->userReaction($userId),
        ];

        // Load top-level comments with reactions (optimized)
        $comments = $post->comments()
            ->topLevel()
            ->with('user')
            ->withReactionsData($userId)
            ->latest()
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'is_edited' => $comment->is_edited,
                    'edited_at' => $comment->edited_at,
                    'user' => [
                        'id' => $comment->user->id,
                        'name' => $comment->user->name,
                        'avatar' => $comment->user->avatar ?? null,
                    ],
                    'reactions_summary' => $comment->parseReactionsSummary(),
                    'user_reaction' => $comment->parseUserReaction(),
                    'can_edit' => $comment->canEdit(),
                    'can_delete' => $comment->canDelete(),
                    'replies_count' => $comment->replies()->count(),
                ];
            });

        return Inertia::render('Posts/Show', [
            'post' => $postData,
            'comments' => $comments,
        ]);
    }
}
```

#### Step 6: Create Your React Pages

**Posts Index Page** (`resources/js/Pages/Posts/Index.jsx`):

```jsx
import AppLayout from '@/Layouts/AppLayout';
import Reactions from '@/Components/Reactions/Reactions';
import { Link } from '@inertiajs/react';

export default function Index({ posts }) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
                
                <div className="space-y-6">
                    {posts.data.map((post) => (
                        <div key={post.id} className="bg-white rounded-lg shadow p-6">
                            <Link 
                                href={`/posts/${post.id}`}
                                className="text-2xl font-semibold hover:text-blue-600"
                            >
                                {post.title}
                            </Link>
                            
                            <p className="text-gray-600 mt-2 mb-4">
                                {post.content.substring(0, 200)}...
                            </p>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    By {post.user.name} • {post.created_at}
                                </span>
                                
                                <Reactions
                                    reactableType="App\\Models\\Post"
                                    reactableId={post.id}
                                    initialReactions={post.reactions_summary}
                                    userReaction={post.user_reaction}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
```

**Post Show Page** (`resources/js/Pages/Posts/Show.jsx`):

```jsx
import AppLayout from '@/Layouts/AppLayout';
import Reactions from '@/Components/Reactions/Reactions';
import Comments from '@/Components/Comments/Comments';

export default function Show({ post, comments }) {
    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto">
                {/* Post Content */}
                <article className="bg-white rounded-lg shadow p-8 mb-8">
                    <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
                    
                    <div className="flex items-center gap-3 mb-6">
                        {post.user.avatar && (
                            <img 
                                src={post.user.avatar} 
                                alt={post.user.name}
                                className="w-10 h-10 rounded-full"
                            />
                        )}
                        <div>
                            <p className="font-medium">{post.user.name}</p>
                            <p className="text-sm text-gray-500">{post.created_at}</p>
                        </div>
                    </div>
                    
                    <div className="prose max-w-none mb-6">
                        {post.content}
                    </div>
                    
                    {/* Reactions */}
                    <Reactions
                        reactableType="App\\Models\\Post"
                        reactableId={post.id}
                        initialReactions={post.reactions_summary}
                        userReaction={post.user_reaction}
                    />
                </article>

                {/* Comments Section */}
                <div className="bg-white rounded-lg shadow p-8">
                    <h2 className="text-2xl font-bold mb-6">Comments</h2>
                    
                    <Comments
                        commentableType="App\\Models\\Post"
                        commentableId={post.id}
                        initialComments={comments}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
```

#### Step 7: Setup Routes

Add to `routes/web.php`:

```php
use App\Http\Controllers\PostController;

Route::middleware(['auth'])->group(function () {
    Route::get('/posts', [PostController::class, 'index'])->name('posts.index');
    Route::get('/posts/{post}', [PostController::class, 'show'])->name('posts.show');
});
```

#### Step 8: Test Your Implementation

1. **Create a test post:**
```php
php artisan tinker
>>> $post = Post::create(['title' => 'My First Post', 'content' => 'Hello World!', 'user_id' => 1]);
```

2. **Visit the page:**
```
http://your-app.test/posts/1
```

3. **Try the features:**
   - Click reactions (like, love, etc.)
   - Add a comment
   - Reply to a comment
   - Edit your comment
   - Delete your comment
   - React to comments

### Usage in Different Scenarios

#### Scenario 1: Events with Comments

```php
class Event extends Model
{
    use HasReactions, HasComments;
    
    protected $appends = ['reactions_summary', 'user_reaction'];
}
```

#### Scenario 2: Media/Photos with Reactions Only

```php
class Photo extends Model
{
    use HasReactions; // Only reactions, no comments
    
    protected $appends = ['reactions_summary', 'user_reaction'];
}
```

```jsx
// In your component
<Reactions
    reactableType="App\\Models\\Photo"
    reactableId={photo.id}
    initialReactions={photo.reactions_summary}
    userReaction={photo.user_reaction}
/>
```

#### Scenario 3: Admin Moderation

```php
class Post extends Model
{
    use HasReactions, HasComments;
    
    public function canManageComment($comment): bool
    {
        $user = auth()->user();
        
        // Admins can delete any comment
        if ($user->hasRole('admin')) {
            return true;
        }
        
        // Moderators can delete comments on any post
        if ($user->hasRole('moderator')) {
            return true;
        }
        
        // Post authors can delete comments on their posts
        if ($this->user_id === $user->id) {
            return true;
        }
        
        // Users can only edit/delete their own comments
        return $comment->user_id === $user->id;
    }
}
```

#### Scenario 4: Time-Limited Editing

```php
public function canManageComment($comment): bool
{
    $user = auth()->user();
    
    // Not the comment author
    if ($comment->user_id !== $user->id) {
        return false;
    }
    
    // Can only edit within 15 minutes of posting
    $minutesSincePost = $comment->created_at->diffInMinutes(now());
    return $minutesSincePost <= 15;
}
```

### Manual Toast Notifications

You can trigger toasts manually from your React components:

```jsx
import { useToast } from '@/hooks/use-toast';
import { router } from '@inertiajs/react';

export default function MyComponent() {
    const { toast } = useToast();

    const handleCustomAction = () => {
        // Your logic here
        
        toast({
            title: 'Action Completed',
            description: 'Your custom action was successful!',
        });
    };

    const handleDelete = (id) => {
        router.delete(`/posts/${id}`, {
            onSuccess: () => {
                toast({
                    title: 'Deleted',
                    description: 'Post deleted successfully!',
                });
            },
            onError: () => {
                toast({
                    title: 'Error',
                    description: 'Failed to delete post.',
                    variant: 'destructive',
                });
            },
        });
    };

    return (
        <div>
            <button onClick={handleCustomAction}>Custom Action</button>
            <button onClick={() => handleDelete(1)}>Delete Post</button>
        </div>
    );
}
```

### Programmatic API Usage

You can also use the reactions and comments programmatically:

```php
// In a controller or job
$post = Post::find(1);

// Add a reaction
$post->react(auth()->id(), 'like');

// Remove a reaction
$post->unreact(auth()->id());

// Toggle a reaction
$post->toggleReaction(auth()->id(), 'love');

// Add a comment
$comment = $post->addComment(auth()->id(), 'Great post!');

// Add a reply
$reply = $comment->addReply(auth()->id(), 'Thanks!');

// Get reactions summary
$summary = $post->reactionsSummary();
// ['like' => 5, 'love' => 3]

// Get user's reaction
$userReaction = $post->userReaction(auth()->id());
// 'like' or null
```

## Quick Start

### 1. Add Traits to Your Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use TrueFans\LaravelReactReactions\Traits\HasReactions;
use TrueFans\LaravelReactReactions\Traits\HasComments;

class Post extends Model
{
    use HasReactions, HasComments;

    protected $appends = ['reactions_summary', 'user_reaction'];

    /**
     * Check if a user can comment on this post
     */
    public function canComment(?int $userId = null): bool
    {
        return $userId !== null; // Any authenticated user can comment
    }

    /**
     * Check if a user can manage (edit/delete) a comment
     */
    public function canManageComment($comment): bool
    {
        return $comment->user_id === auth()->id(); // Only comment author
    }
}
```

### 2. Setup Inertia Middleware

```php
<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            
            'auth' => [
                'user' => $request->user(),
            ],
            
            // Share flash messages for toast notifications
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
```

### 3. Setup Toast Notifications in Layout

```jsx
// resources/js/Layouts/Layout.jsx
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function Layout({ children }) {
    const { toast } = useToast();
    const { flash } = usePage().props;

    // Auto-display flash messages from server
    useEffect(() => {
        if (flash?.success) {
            toast({
                title: 'Success',
                description: flash.success,
            });
        }

        if (flash?.error) {
            toast({
                title: 'Error',
                description: flash.error,
                variant: 'destructive',
            });
        }
    }, [flash, toast]);

    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
```

### 4. Controller Implementation

```php
<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Inertia\Inertia;

class PostController extends Controller
{
    public function show(Post $post)
    {
        $userId = auth()->id();

        // Load comments with reactions data (optimized - single query)
        $comments = $post->comments()
            ->topLevel()
            ->with('user')
            ->withReactionsData($userId)
            ->latest()
            ->get()
            ->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'created_at' => $comment->created_at,
                    'is_edited' => $comment->is_edited,
                    'edited_at' => $comment->edited_at,
                    'user' => $comment->user,
                    'reactions_summary' => $comment->parseReactionsSummary(),
                    'user_reaction' => $comment->parseUserReaction(),
                    'can_edit' => $comment->canEdit(),
                    'can_delete' => $comment->canDelete(),
                    'replies_count' => $comment->replies()->count(),
                ];
            });

        return Inertia::render('Posts/Show', [
            'post' => $post,
            'comments' => $comments,
        ]);
    }
}
```

### 5. React Component Usage

```jsx
// resources/js/Pages/Posts/Show.jsx
import Reactions from '@/Components/Reactions/Reactions';
import Comments from '@/Components/Comments/Comments';

export default function PostShow({ post, comments, can_comment }) {
    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Post Content */}
            <article className="mb-8">
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                <p className="text-gray-700 mb-6">{post.content}</p>
                
                {/* Reactions */}
                <Reactions
                    reactableType="App\\Models\\Post"
                    reactableId={post.id}
                    initialReactions={post.reactions_summary}
                    userReaction={post.user_reaction}
                />
            </article>

            {/* Comments */}
            <Comments
                commentableType="App\\Models\\Post"
                commentableId={post.id}
                initialComments={comments}
                canComment={can_comment}
            />
        </div>
    );
}
```

## Reactions System

### Basic Usage

```php
// Add or update a reaction
$post->react($userId, 'like');

// Remove a reaction
$post->unreact($userId);

// Toggle a reaction
$post->toggleReaction($userId, 'love');

// Get reactions summary
$summary = $post->reactionsSummary();
// Returns: ['like' => 5, 'love' => 3, 'haha' => 1]

// Get user's reaction
$reaction = $post->userReaction($userId);
// Returns: 'like' or null
```

### Query Optimization

**❌ Bad (N+1 Issue - 21 queries for 10 posts)**
```php
$posts = Post::latest()->get(); // Appended attributes cause N+1
```

**✅ Good (1 query for any number of posts)**
```php
$posts = Post::withReactionsData(auth()->id())
    ->latest()
    ->get()
    ->map(function ($post) {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'reactions_summary' => $post->parseReactionsSummary(),
            'user_reaction' => $post->parseUserReaction(),
        ];
    });
```

The `withReactionsData()` scope uses database subqueries to aggregate reactions in a single query, regardless of dataset size.

## Comments System

### Basic Usage

```php
// Add a comment
$post->addComment($userId, 'Great post!');

// Add a reply
$comment->addReply($userId, 'Thanks!');

// Update a comment
$comment->update([
    'content' => 'Updated content',
    'is_edited' => true,
    'edited_at' => now(),
]);

// Delete a comment (soft delete)
$comment->delete();

// Get top-level comments
$post->comments()->topLevel()->get();

// Get replies
$comment->replies()->get();
```

### Permission System

Override permission methods in your model for custom logic:

```php
class Post extends Model
{
    use HasComments;

    /**
     * Post author can manage all comments, users can manage their own
     */
    public function canManageComment($comment): bool
    {
        $userId = auth()->id();
        
        // Post author can manage all comments
        if ($this->user_id === $userId) {
            return true;
        }
        
        // Users can manage their own comments
        return $comment->user_id === $userId;
    }
}
```

### Advanced Permission Examples

**Time-Limited Editing**
```php
public function canManageComment($comment): bool
{
    if ($comment->user_id !== auth()->id()) {
        return false;
    }
    
    // Can only edit within 15 minutes
    return $comment->created_at->diffInMinutes(now()) <= 15;
}
```

**Role-Based Permissions**
```php
public function canManageComment($comment): bool
{
    $user = auth()->user();
    
    // Admins and moderators can manage any comment
    if ($user->hasRole(['admin', 'moderator'])) {
        return true;
    }
    
    // Users can manage their own comments
    return $comment->user_id === $user->id;
}
```

## Toast Notifications

### From Laravel Controllers

```php
// Success message
return redirect()->back()->with('success', 'Comment posted successfully!');

// Error message
return redirect()->back()->with('error', 'Failed to post comment.');

// With Inertia
return Inertia::render('Posts/Show', ['post' => $post])
    ->with('success', 'Post created successfully!');
```

### From React Components

```jsx
import { useToast } from '@/hooks/use-toast';

export default function MyComponent() {
    const { toast } = useToast();

    const handleAction = () => {
        // Success toast
        toast({
            title: 'Success',
            description: 'Action completed successfully!',
        });

        // Error toast
        toast({
            title: 'Error',
            description: 'Something went wrong.',
            variant: 'destructive',
        });

        // Custom duration
        toast({
            title: 'Info',
            description: 'This will disappear in 2 seconds.',
            duration: 2000,
        });
    };

    return <button onClick={handleAction}>Do Something</button>;
}
```

### Toast Options

```jsx
toast({
    title: 'Title',              // Toast title
    description: 'Message',      // Toast message
    variant: 'default',          // 'default' | 'destructive'
    duration: 5000,              // Duration in ms (default: 5000)
    action: <Button>Undo</Button>, // Optional action button
});
```

## Configuration

```php
// config/react-reactions.php
return [
    // Available reaction types
    'types' => [
        'like' => '👍',
        'love' => '❤️',
        'haha' => '😂',
        'wow' => '😮',
        'sad' => '😢',
        'angry' => '😠',
    ],

    // Route configuration
    'route' => [
        'prefix' => 'reactions',
        'middleware' => ['web', 'auth'],
    ],

    // Comments configuration
    'comments' => [
        'reactions_enabled' => true, // Enable reactions on comments
        'max_depth' => 3,            // Max nesting depth (0 = unlimited)
        'edit_timeout' => 300,       // Seconds to allow editing (0 = unlimited)
    ],

    // Notification configuration
    'notifications' => [
        'enabled' => true,                    // Enable/disable notifications
        'admin_email' => env('REACTIONS_ADMIN_EMAIL'), // Admin email for notifications
        'notify_owner' => true,               // Notify content owner
        'notify_parent_author' => true,       // Notify parent comment author on replies
        'notify_on_replies' => true,          // Send notifications for replies
    ],

    // UI configuration
    'ui' => [
        'picker_delay' => 300,       // ms before showing picker on hover
        'animation_duration' => 200, // ms for animations
    ],
];
```

### Environment Variables

Add these to your `.env` file:

```env
# Email notifications for new comments
REACTIONS_NOTIFICATIONS_ENABLED=true
REACTIONS_ADMIN_EMAIL=admin@example.com
```

## API Reference

### HasReactions Trait

```php
// Add or update reaction
$model->react(int $userId, string $type): void

// Remove reaction
$model->unreact(int $userId): void

// Toggle reaction (remove if same, otherwise update)
$model->toggleReaction(int $userId, string $type): void

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
$model->canManageComment(Comment $comment): bool
```

### Comment Model

```php
// Add a reply
$comment->addReply(int $userId, string $content): Comment

// Get replies
$comment->replies(): HasMany

// Get replies with reactions
$comment->repliesWithReactions(): HasMany

// Check permissions
$comment->canEdit(): bool
$comment->canDelete(): bool

// Query scope
Comment::topLevel() // Only top-level comments (no parent)
```

## Component Props

### Reactions Component

```jsx
<Reactions
    reactableType="App\\Models\\Post"  // Required: Model class name
    reactableId={post.id}              // Required: Model ID
    initialReactions={{                // Required: Reactions summary
        like: 5,
        love: 2
    }}
    userReaction="like"                // Optional: Current user's reaction
/>
```

### Comments Component

```jsx
<Comments
    commentableType="App\\Models\\Post"  // Required: Model class name
    commentableId={post.id}              // Required: Model ID
    initialComments={[...]}              // Required: Array of comments
/>
```

## Performance

### Query Optimization Results

| Approach | Queries for 10 posts | Queries for 100 posts | Queries for 1000 posts |
|----------|---------------------|----------------------|------------------------|
| ❌ Appended attributes | 21 queries | 201 queries | 2001 queries |
| ✅ withReactionsData() | 1 query | 1 query | 1 query |

### How It Works

The `withReactionsData()` scope adds SQL subqueries to your main query:

```sql
SELECT posts.*,
  (SELECT JSON_OBJECT('like', COUNT(*), 'love', COUNT(*), ...)
   FROM reactions WHERE reactable_id = posts.id
   GROUP BY type) as reactions_summary_json,
  (SELECT type FROM reactions 
   WHERE reactable_id = posts.id AND user_id = ?) as user_reaction_type
FROM posts
```

This executes as a single query with database-level aggregation, handling millions of reactions efficiently.

## Testing

```bash
# Run PHP tests
composer test

# Run specific test suite
vendor/bin/pest --filter=HasReactionsTest

# Run E2E tests with Playwright
npx playwright install
npm run build
npm run test:e2e
```

## Development

### Workbench

The package includes a workbench for isolated testing:

```bash
# Build workbench
php vendor/bin/testbench workbench:build

# Serve workbench
php vendor/bin/testbench serve

# Run migrations
php vendor/bin/testbench migrate:fresh --seed
```

### Frontend Development

```bash
# Install dependencies
npm install

# Build assets
npm run build

# Watch for changes
npm run dev
```

## Database Schema

### Reactions Table

```sql
CREATE TABLE reactions (
    id BIGINT UNSIGNED PRIMARY KEY,
    reactable_type VARCHAR(255),
    reactable_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    type VARCHAR(50),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    
    UNIQUE KEY unique_reaction (reactable_type, reactable_id, user_id),
    INDEX idx_reactable (reactable_type, reactable_id),
    INDEX idx_user (user_id)
);
```

### Comments Table

```sql
CREATE TABLE comments (
    id BIGINT UNSIGNED PRIMARY KEY,
    commentable_type VARCHAR(255),
    commentable_id BIGINT UNSIGNED,
    user_id BIGINT UNSIGNED,
    parent_id BIGINT UNSIGNED NULLABLE,
    content TEXT,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP NULLABLE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULLABLE,
    
    INDEX idx_commentable (commentable_type, commentable_id),
    INDEX idx_parent (parent_id),
    INDEX idx_user (user_id)
);
```

## Troubleshooting

### Reactions Not Working
- Check if routes are registered: `php artisan route:list | grep reactions`
- Verify middleware is configured in config
- Check browser console for errors

### Comments Not Showing
- Verify comments are loaded in controller
- Check `initialComments` prop is passed to component
- Ensure user is authenticated for protected routes

### Toast Not Appearing
- Verify `<Toaster />` is in your layout
- Check Inertia middleware shares flash messages
- Ensure `useEffect` hook is set up correctly

### N+1 Query Issues
- Use `withReactionsData()` scope when loading multiple models
- Monitor queries with Laravel Debugbar
- Check the query log in development

## Security

The package includes multiple security layers:

- ✅ Authentication via middleware
- ✅ Authorization via permission methods
- ✅ CSRF protection (Inertia)
- ✅ XSS prevention (React escaping)
- ✅ SQL injection protection (Eloquent ORM)
- ✅ Input validation
- ✅ Soft deletes for data preservation

## Email Notifications

The package automatically sends email notifications when new comments are posted.

### Setup

1. **Configure your mail settings** in `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME="${APP_NAME}"
```

2. **Set admin email** for notifications:
```env
REACTIONS_ADMIN_EMAIL=admin@example.com
```

3. **Configure notification settings** in `config/react-reactions.php`:
```php
'notifications' => [
    'enabled' => true,                    // Enable/disable all notifications
    'admin_email' => env('REACTIONS_ADMIN_EMAIL'), // Admin receives all comments
    'notify_owner' => true,               // Notify post/content owner
    'notify_parent_author' => true,       // Notify parent comment author on replies
    'notify_on_replies' => true,          // Include reply notifications
],
```

### Who Gets Notified?

- **Admin**: Receives notification for every new comment (if `admin_email` is set)
- **Content Owner**: Receives notification when someone comments on their content (if `notify_owner` is true)
- **Parent Comment Author**: Receives notification when someone replies to their comment (if `notify_parent_author` is true)

### Customizing Notifications

You can customize the notification by extending the `NewCommentNotification` class:

```php
<?php

namespace App\Notifications;

use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification as BaseNotification;

class CustomCommentNotification extends BaseNotification
{
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Comment Alert!')
            ->line('Someone commented on your post')
            ->line($this->comment->content)
            ->action('View Comment', url('/posts/' . $this->comment->commentable_id))
            ->line('Thank you!');
    }
}
```

Then update your listener to use the custom notification.

### Disabling Notifications

To disable notifications entirely:

```env
REACTIONS_NOTIFICATIONS_ENABLED=false
```

Or in config:
```php
'notifications' => [
    'enabled' => false,
],
```

### Queue Configuration

Notifications are queued by default for better performance. Make sure your queue is running:

```bash
php artisan queue:work
```

For development, you can use the sync driver in `.env`:
```env
QUEUE_CONNECTION=sync
```

## Best Practices

1. **Always use `withReactionsData()`** when loading multiple models
2. **Implement proper permissions** in your models
3. **Validate comment content** before saving
4. **Use soft deletes** to preserve conversation context
5. **Add rate limiting** to prevent spam
6. **Cache comment counts** for better performance
7. **Monitor queries** with Laravel Debugbar in development
8. **Configure email notifications** for comment moderation
9. **Use queues** for sending notification emails

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Credits

- [Vahan Drnoyan](https://github.com/truefanspace)
- Built with Laravel 11, Inertia.js v2, React 19, and shadcn/ui
- [All Contributors](../../contributors)

## Support

- **GitHub Issues**: Report bugs or request features
- **GitHub Discussions**: Ask questions and share ideas
- **Examples**: Check the `workbench/` folder for working examples
