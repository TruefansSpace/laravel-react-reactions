<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use TrueFans\LaravelReactReactions\Models\Comment;
use Workbench\App\Models\TestPost;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->actingAs($this->user);
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);
});

test('handles validation exception during comment creation', function () {
    // Test with invalid commentable type to trigger validation exception
    $response = $this->post('/comments', [
        'commentable_type' => 'InvalidClass',
        'commentable_id' => 999,
        'content' => 'Test comment',
    ]);

    $response->assertSessionHasErrors('commentable_type');
});

test('validates content is required for comment update', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Original content',
    ]);

    $response = $this->put("/comments/{$comment->id}", [
        'content' => '',
    ]);

    $response->assertSessionHasErrors('content');
});

test('non-owner cannot delete comment', function () {
    $otherUser = createUser();
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $otherUser->id,
        'content' => 'Test content',
    ]);

    $response = $this->delete("/comments/{$comment->id}");

    $response->assertSessionHasErrors('error');
});

test('edit timeout is checked when configured', function () {
    // Set edit timeout to 1 hour (3600 seconds)
    config(['react-reactions.comments.edit_timeout' => 3600]);
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Original content',
    ]);
    
    // Manually set created_at to 3 hours ago
    $comment->created_at = now()->subHours(3);
    $comment->saveQuietly();

    $response = $this->put("/comments/{$comment->id}", [
        'content' => 'Updated content',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('error');
});

test('handles replies endpoint exception gracefully', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Parent comment',
    ]);

    // Create a reply
    Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $comment->id,
        'content' => 'Reply comment',
    ]);

    // The endpoint should handle errors gracefully
    $response = $this->get("/comments/{$comment->id}/replies");

    $response->assertOk();
    $response->assertJsonStructure([
        'success',
        'replies',
    ]);
});


