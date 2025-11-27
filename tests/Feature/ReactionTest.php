<?php

use TrueFans\LaravelReactReactions\Models\Reaction;
use Workbench\App\Models\TestPost;

beforeEach(function () {
    $this->actingAs(createUser());
});

it('can store a reaction via API', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $response = $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
        'type' => 'like',
    ]);

    $response->assertSessionHas('message', 'Reaction added successfully');
    expect($post->reactions()->count())->toBe(1);
});

it('can delete a reaction via API', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'like');

    $response = $this->delete('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
    ]);

    $response->assertSessionHas('message', 'Reaction removed successfully');
    expect($post->reactions()->count())->toBe(0);
});

it('validates reaction type', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $response = $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
        'type' => 'invalid',
    ]);

    $response->assertSessionHasErrors('type');
});

it('validates reactable type exists', function () {
    $response = $this->post('/reactions', [
        'reactable_type' => 'NonExistentClass',
        'reactable_id' => 1,
        'type' => 'like',
    ]);

    $response->assertSessionHasErrors('reactable_type');
});

it('validates reactable exists', function () {
    $response = $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => 99999,
        'type' => 'like',
    ]);

    $response->assertSessionHasErrors('reactable_id');
});


it('updates existing reaction when posting again', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    // First reaction
    $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
        'type' => 'like',
    ]);

    // Change reaction
    $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
        'type' => 'love',
    ]);

    expect($post->reactions()->count())->toBe(1)
        ->and($post->userReaction(auth()->id()))->toBe('love');
});

