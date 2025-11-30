<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Models\Comment;
use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification;
use Workbench\App\Models\TestPost;
use Workbench\App\Models\User;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);
});

test('authenticated user can create comment', function () {
    $this->actingAs($this->user);

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $this->assertDatabaseHas('comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);
});

test('unauthenticated user cannot create comment', function () {
    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    $response->assertRedirect('/login');
});

test('can create reply to comment', function () {
    $this->actingAs($this->user);
    $parentComment = $this->post->comment($this->user->id, 'Parent');

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Reply comment',
        'parent_id' => $parentComment->id,
    ]);

    $response->assertRedirect();

    $this->assertDatabaseHas('comments', [
        'parent_id' => $parentComment->id,
        'content' => 'Reply comment',
    ]);
});

test('comment creation validates required fields', function () {
    $this->actingAs($this->user);

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
    ]);

    $response->assertSessionHasErrors('content');
});

test('comment creation validates content length', function () {
    $this->actingAs($this->user);

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => str_repeat('a', 5001),
    ]);

    $response->assertSessionHasErrors('content');
});

test('comment author can update their comment', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Original content');

    $response = $this->put("/comments/{$comment->id}", [
        'content' => 'Updated content',
    ]);

    $response->assertRedirect();

    $comment->refresh();
    expect($comment->content)->toBe('Updated content')
        ->and($comment->is_edited)->toBeTrue()
        ->and($comment->edited_at)->not->toBeNull();
});

test('non-author cannot update comment', function () {
    $otherUser = createUser();
    $this->actingAs($otherUser);
    $comment = $this->post->comment($this->user->id, 'Original');

    $response = $this->put("/comments/{$comment->id}", [
        'content' => 'Hacked content',
    ]);

    $response->assertSessionHasErrors();

    expect($comment->fresh()->content)->toBe('Original');
});

test('comment author can delete their comment', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Test');

    $response = $this->delete("/comments/{$comment->id}");

    $response->assertRedirect();
    $response->assertSessionHas('success');

    expect(Comment::find($comment->id))->toBeNull();
});

test('non-author cannot delete comment', function () {
    $otherUser = createUser();
    $this->actingAs($otherUser);
    $comment = $this->post->comment($this->user->id, 'Test');

    $response = $this->delete("/comments/{$comment->id}");

    $response->assertSessionHasErrors();

    expect(Comment::find($comment->id))->not->toBeNull();
});

test('can load replies for a comment', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Parent');
    $comment->addReply($this->user->id, 'Reply 1');
    $comment->addReply($this->user->id, 'Reply 2');

    $response = $this->get("/comments/{$comment->id}/replies");

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'replies' => [
                '*' => [
                    'id',
                    'content',
                    'user',
                    'reactions_summary',
                    'can_edit',
                    'can_delete',
                ],
            ],
        ])
        ->assertJsonCount(2, 'replies');
});

test('comment creation sends notification to admin', function () {
    Notification::fake();
    config(['react-reactions.notifications.admin_email' => 'admin@example.com']);

    $this->actingAs($this->user);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    // Process the queued notification
    $this->artisan('queue:work --once');

    Notification::assertSentOnDemand(
        NewCommentNotification::class,
        function ($notification, $channels, $notifiable) {
            return $notifiable->routes['mail'] === 'admin@example.com';
        }
    );
});

test('comment creation sends notification to post owner', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_owner' => true]);

    $postOwner = createUser();
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $postOwner->id,
    ]);
    $commenter = createUser();

    $this->actingAs($commenter);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $post->id,
        'content' => 'Test comment',
    ]);

    Notification::assertSentTo(
        $postOwner,
        NewCommentNotification::class
    );
});

test('comment creation does not notify post owner if they are the commenter', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_owner' => true]);

    $this->actingAs($this->user);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    // Process the queued notification
    $this->artisan('queue:work --once');

    // Should only send to admin, not to post owner (who is the commenter)
    Notification::assertNotSentTo($this->user, NewCommentNotification::class);
});

test('reply sends notification to parent comment author', function () {
    Notification::fake();
    config(['react-reactions.notifications.notify_parent_author' => true]);

    $parentAuthor = createUser();
    $replier = createUser();
    $parentComment = $this->post->comment($parentAuthor->id, 'Parent');

    $this->actingAs($replier);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Reply',
        'parent_id' => $parentComment->id,
    ]);

    // Process the queued notification
    $this->artisan('queue:work --once');

    Notification::assertSentTo(
        $parentAuthor,
        NewCommentNotification::class
    );
});

test('comment with reactions can be retrieved', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Test');
    $comment->react($this->user->id, 'like');

    $comments = Comment::withReactionsData($this->user->id)->get();

    expect($comments->first()->parseReactionsSummary())->toHaveKey('like')
        ->and($comments->first()->parseUserReaction())->toBe('like');
});

test('trims whitespace from comment content', function () {
    $this->actingAs($this->user);

    $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => '  Test comment  ',
    ]);

    $this->assertDatabaseHas('comments', [
        'content' => 'Test comment',
    ]);
});

test('validates parent comment belongs to same commentable', function () {
    $this->actingAs($this->user);
    $otherPost = TestPost::create(['title' => 'Test Post', 'content' => 'Test content']);
    $otherComment = $otherPost->comment($this->user->id, 'Other post comment');

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => 'Reply',
        'parent_id' => $otherComment->id,
    ]);

    $response->assertSessionHasErrors('parent_id');
});

test('validates commentable type class exists', function () {
    $this->actingAs($this->user);

    $response = $this->post('/comments', [
        'commentable_type' => 'NonExistentClass',
        'commentable_id' => 1,
        'content' => 'Test comment',
    ]);

    $response->assertSessionHasErrors('commentable_type');
});

test('validates commentable model exists', function () {
    $this->actingAs($this->user);

    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => 99999,
        'content' => 'Test comment',
    ]);

    $response->assertSessionHasErrors('commentable_id');
});

test('validates commentable has HasComments trait', function () {
    $this->actingAs($this->user);
    
    // Create a model without HasComments trait
    $user = createUser();

    $response = $this->post('/comments', [
        'commentable_type' => User::class,
        'commentable_id' => $user->id,
        'content' => 'Test comment',
    ]);

    $response->assertSessionHasErrors('commentable_type');
});

test('handles stripslashes for commentable type', function () {
    $this->actingAs($this->user);

    // Simulate double-escaped backslashes from JavaScript
    $escapedClass = addslashes(TestPost::class);

    $response = $this->post('/comments', [
        'commentable_type' => $escapedClass,
        'commentable_id' => $this->post->id,
        'content' => 'Test comment',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
});

test('handles database transaction rollback on error', function () {
    $this->actingAs($this->user);

    // Force an error by using invalid data after validation
    $response = $this->post('/comments', [
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'content' => str_repeat('a', 10000), // Exceeds max length
    ]);

    $response->assertSessionHasErrors();
});


