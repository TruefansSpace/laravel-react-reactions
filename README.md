# Laravel React Reactions

A Facebook-like reaction system for Laravel with Inertia.js and React. This package provides a complete solution for adding reactions (like, love, haha, wow, sad, angry) to any Eloquent model.

## Features

- 🎯 **Easy Integration**: Add reactions to any Eloquent model with a single trait
- ⚡ **Inertia.js v2**: Seamless integration with Inertia and React
- 🎨 **Beautiful UI**: Animated reaction picker with hover effects
- 🔄 **Optimistic Updates**: Instant UI feedback with server-side validation
- 🧪 **Fully Tested**: Comprehensive unit, feature, and E2E tests with Playwright
- 📦 **Self-Contained**: All functionality packaged with workbench for isolated testing

## Requirements

- PHP ^8.4
- Laravel ^11.0 || ^12.0
- Inertia.js v2
- React 19

## Installation

Install the package via Composer:

```bash
composer require truefanspace/laravel-react-reactions
```

### Publish Assets

Publish the migration:

```bash
php artisan vendor:publish --tag=react-reactions-migrations
```

Publish the React components:

```bash
php artisan vendor:publish --tag=react-reactions-components
```

This will copy the React components to `resources/js/Components/Reactions/`.

Publish the config file (optional):

```bash
php artisan vendor:publish --tag=react-reactions-config
```

Run the migration:

```bash
php artisan migrate
```

## Usage

### 1. Add the Trait to Your Model

Add the `HasReactions` trait to any model you want to make reactable:

```php
use TrueFans\LaravelReactReactions\Traits\HasReactions;

class Post extends Model
{
    use HasReactions;

    protected $appends = ['reactions_summary', 'user_reaction'];
}
```

### 2. Use the React Component

In your Inertia page component:

```jsx
import Reactions from '@/Components/Reactions/Reactions';

export default function PostShow({ post }) {
    return (
        <div>
            <h1>{post.title}</h1>
            <p>{post.content}</p>

            <Reactions
                reactableType="App\\Models\\Post"
                reactableId={post.id}
                initialReactions={post.reactions_summary}
                userReaction={post.user_reaction}
            />
        </div>
    );
}
```

### 3. Pass Data from Controller

In your controller, make sure to load the reactions data:

```php
use Inertia\Inertia;

public function show(Post $post)
{
    return Inertia::render('Posts/Show', [
        'post' => $post, // reactions_summary and user_reaction are auto-appended
    ]);
}
```

### ⚠️ Avoiding N+1 Query Issues

When loading multiple models with reactions (e.g., a list of posts), **always eager load the reactions** to avoid N+1 query problems:

#### ❌ Bad (N+1 Issue - 21 queries for 10 posts)

```php
public function index()
{
    $posts = Post::latest()->get(); // 1 query for posts + 2 queries per post = 21 queries!
    
    return Inertia::render('Posts/Index', [
        'posts' => $posts,
    ]);
}
```

#### ✅ Good (Optimized - Only 3 queries, scales to millions)

```php
public function index()
{
    $userId = auth()->id();
    
    // Use database aggregation - efficient even with millions of reactions
    $posts = Post::query()
        ->latest()
        ->get()
        ->map(function ($post) use ($userId) {
            // These use separate optimized queries per post
            // Still better than N+1, and handles large datasets
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'reactions_summary' => $post->reactionsSummary(),
                'user_reaction' => $userId ? $post->userReaction($userId) : null,
            ];
        });

    return Inertia::render('Posts/Index', [
        'posts' => $posts,
    ]);
}
```

#### 🚀 Best (Optimized with Query Scope - Only 1 query!)

For maximum performance with large datasets, use the `withReactionsData()` scope:

```php
public function index()
{
    $posts = Post::withReactionsData(auth()->id())
        ->latest()
        ->get()
        ->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'reactions_summary' => $post->parseReactionsSummary(),
                'user_reaction' => $post->parseUserReaction(),
            ];
        });

    return Inertia::render('Posts/Index', [
        'posts' => $posts,
    ]);
}
```

**How it works:**
The `withReactionsData()` scope adds SQL subqueries to your main query:
- **Subquery 1**: Aggregates reaction counts by type using `GROUP BY` and `COUNT()` at the database level
- **Subquery 2**: Fetches the current user's reaction (if user ID provided)
- Both subqueries execute as part of the main SELECT, resulting in **1 total query**
- No reactions are loaded into memory - only the final aggregated counts

**Example SQL generated:**
```sql
SELECT posts.*,
  (SELECT JSON_OBJECT('like', COUNT(*), 'love', COUNT(*), ...)
   FROM reactions WHERE reactable_id = posts.id) as reactions_summary_json,
  (SELECT type FROM reactions 
   WHERE reactable_id = posts.id AND user_id = 1) as user_reaction_type
FROM posts
ORDER BY created_at DESC
```

**Performance Comparison:**

| Approach | Queries for 10 posts | Queries for 100 posts | Memory Usage |
|----------|---------------------|----------------------|--------------|
| ❌ Appended attributes | 21 queries | 201 queries | Low |
| ✅ Database aggregation | 21 queries | 201 queries | Low |
| 🚀 Subqueries | 1 query | 1 query | Low |

**Why database aggregation matters:**
- The "Good" approach still has N+1 queries, but uses `GROUP BY` at the database level
- This means it can handle millions of reactions without loading them into memory
- The "Best" approach with subqueries eliminates N+1 entirely with a single query

**Pro tip:** Use [Laravel Debugbar](https://github.com/barryvdh/laravel-debugbar) to monitor your queries and catch N+1 issues early.

## API Methods

The `HasReactions` trait provides several helpful methods:

```php
// Add or update a reaction
$post->react($userId, 'like');

// Remove a reaction
$post->unreact($userId);

// Toggle a reaction (remove if same type, otherwise update)
$post->toggleReaction($userId, 'love');

// Get reactions summary (counts by type)
$summary = $post->reactionsSummary();
// Returns: ['like' => 5, 'love' => 3, 'haha' => 1]

// Get a specific user's reaction
$reaction = $post->userReaction($userId);
// Returns: 'like' or null

// Get all reactions relationship
$post->reactions()->get();
```

## Configuration

The config file (`config/react-reactions.php`) allows you to customize:

```php
return [
    'types' => [
        'like' => '👍',
        'love' => '❤️',
        'haha' => '😂',
        'wow' => '😮',
        'sad' => '😢',
        'angry' => '😠',
    ],

    'route' => [
        'prefix' => 'reactions',
        'middleware' => ['web', 'auth'],
    ],

    'ui' => [
        'picker_delay' => 300, // ms before showing picker on hover
        'animation_duration' => 200, // ms for animations
    ],
];
```

## Testing

The package includes comprehensive tests:

### Run PHP Tests

```bash
composer test
```

### Run E2E Tests with Playwright

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Build assets
npm run build

# Run Playwright tests
npm run test:e2e
```

### Run Specific Test Suites

```bash
# Unit tests only
vendor/bin/pest --filter=HasReactionsTest

# Feature tests only
vendor/bin/pest --filter=ReactionTest

# Architecture tests
vendor/bin/pest --filter=ArchTest
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

## License

The MIT License (MIT). Please see [License File](LICENSE.md) for more information.

## Credits

- [Vahan Drnoyan](https://github.com/truefanspace)
- [All Contributors](../../contributors)
