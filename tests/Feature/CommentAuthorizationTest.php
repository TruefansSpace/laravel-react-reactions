<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Workbench\App\Models\RestrictedPost;

uses(RefreshDatabase::class);

test('unauthorized user cannot comment on restricted post', function () {
    $owner = createUser();
    $otherUser = createUser();
    
    $post = RestrictedPost::create([
        'title' => 'Restricted Post',
        'content' => 'Only owner can comment',
        'user_id' => $owner->id,
    ]);

    // Try to comment as a different user
    $this->actingAs($otherUser);

    $response = $this->post('/comments', [
        'commentable_type' => RestrictedPost::class,
        'commentable_id' => $post->id,
        'content' => 'Trying to comment',
    ]);

    $response->assertRedirect();
    $response->assertSessionHasErrors('error');
    expect(session('errors')->first('error'))->toContain('not allowed');
});

test('authorized user can comment on restricted post', function () {
    $owner = createUser();
    
    $post = RestrictedPost::create([
        'title' => 'Restricted Post',
        'content' => 'Only owner can comment',
        'user_id' => $owner->id,
    ]);

    // Comment as the owner
    $this->actingAs($owner);

    $response = $this->post('/comments', [
        'commentable_type' => RestrictedPost::class,
        'commentable_id' => $post->id,
        'content' => 'Owner commenting',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');
    
    $this->assertDatabaseHas('comments', [
        'commentable_type' => RestrictedPost::class,
        'commentable_id' => $post->id,
        'user_id' => $owner->id,
        'content' => 'Owner commenting',
    ]);
});
