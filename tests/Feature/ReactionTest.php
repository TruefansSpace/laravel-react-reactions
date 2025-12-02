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

it('can list all reactions for a reactable', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $user1 = createUser();
    $user2 = createUser();

    $post->react($user1->id, 'like');
    $post->react($user2->id, 'love');

    $response = $this->get('/reactions/list/'.urlencode(TestPost::class)."/{$post->id}");

    $response->assertOk()
        ->assertJsonStructure([
            'reactions' => [
                'data',
                'current_page',
                'per_page',
            ],
        ]);

    $data = $response->json('reactions.data');
    expect($data)->toHaveCount(2);
});

it('can filter reactions by type', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $user1 = createUser();
    $user2 = createUser();

    $post->react($user1->id, 'like');
    $post->react($user2->id, 'love');

    $response = $this->get('/reactions/list/'.urlencode(TestPost::class)."/{$post->id}?type=like");

    $response->assertOk();

    $data = $response->json('reactions.data');
    expect($data)->toHaveCount(1)
        ->and($data[0]['type'])->toBe('like');
});

it('paginates reactions list', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    // Create 10 reactions
    for ($i = 0; $i < 10; $i++) {
        $user = createUser();
        $post->react($user->id, 'like');
    }

    $response = $this->get('/reactions/list/'.urlencode(TestPost::class)."/{$post->id}");

    $response->assertOk();

    $reactions = $response->json('reactions');
    expect($reactions['per_page'])->toBe(8)
        ->and($reactions['total'])->toBe(10)
        ->and(count($reactions['data']))->toBe(8);
});

it('validates required fields for store', function () {
    $response = $this->post('/reactions', []);

    $response->assertSessionHasErrors(['reactable_type', 'reactable_id', 'type']);
});

it('validates required fields for destroy', function () {
    $response = $this->delete('/reactions', []);

    $response->assertSessionHasErrors(['reactable_type', 'reactable_id']);
});

it('returns 303 status code on store', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $response = $this->post('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
        'type' => 'like',
    ]);

    expect($response->status())->toBe(303);
});

it('returns 303 status code on destroy', function () {
    $post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $post->react(auth()->id(), 'like');

    $response = $this->delete('/reactions', [
        'reactable_type' => TestPost::class,
        'reactable_id' => $post->id,
    ]);

    expect($response->status())->toBe(303);
});
