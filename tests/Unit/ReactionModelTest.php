<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use TrueFans\LaravelReactReactions\Models\Reaction;
use Workbench\App\Models\TestPost;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = createUser();
    $this->post = TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
        'user_id' => $this->user->id,
    ]);
});

test('reaction belongs to user', function () {
    $reaction = Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    expect($reaction->user->id)->toBe($this->user->id);
});

test('reaction belongs to reactable', function () {
    $reaction = Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    expect($reaction->reactable)->toBeInstanceOf(TestPost::class)
        ->and($reaction->reactable->id)->toBe($this->post->id);
});

test('reaction fillable attributes', function () {
    $reaction = new Reaction();
    
    expect($reaction->getFillable())->toContain('reactable_type')
        ->and($reaction->getFillable())->toContain('reactable_id')
        ->and($reaction->getFillable())->toContain('user_id')
        ->and($reaction->getFillable())->toContain('type');
});

test('reaction has unique constraint', function () {
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    expect(function () {
        Reaction::create([
            'reactable_type' => TestPost::class,
            'reactable_id' => $this->post->id,
            'user_id' => $this->user->id,
            'type' => 'love',
        ]);
    })->toThrow(\Illuminate\Database\QueryException::class);
});

test('can update existing reaction type', function () {
    $reaction = Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    $reaction->update(['type' => 'love']);
    
    expect($reaction->fresh()->type)->toBe('love');
});

test('reaction timestamps are set', function () {
    $reaction = Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    expect($reaction->created_at)->not->toBeNull()
        ->and($reaction->updated_at)->not->toBeNull();
});

test('reaction can be deleted', function () {
    $reaction = Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    $id = $reaction->id;
    $reaction->delete();
    
    expect(Reaction::find($id))->toBeNull();
});

test('reaction type validation', function () {
    $validTypes = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    
    foreach ($validTypes as $type) {
        $reaction = Reaction::create([
            'reactable_type' => TestPost::class,
            'reactable_id' => $this->post->id,
            'user_id' => createUser()->id,
            'type' => $type,
        ]);
        
        expect($reaction->type)->toBe($type);
    }
});

test('reaction scope by type', function () {
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => createUser()->id,
        'type' => 'love',
    ]);
    
    expect(Reaction::where('type', 'like')->count())->toBe(1)
        ->and(Reaction::where('type', 'love')->count())->toBe(1);
});

test('reaction scope by reactable', function () {
    $post2 = TestPost::create([
        'title' => 'Test Post 2',
        'content' => 'Test content 2',
        'user_id' => $this->user->id,
    ]);
    
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $post2->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    expect(Reaction::where('reactable_id', $this->post->id)->count())->toBe(1)
        ->and(Reaction::where('reactable_id', $post2->id)->count())->toBe(1);
});

test('reaction scope by user', function () {
    $user2 = createUser();
    
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'type' => 'like',
    ]);
    
    Reaction::create([
        'reactable_type' => TestPost::class,
        'reactable_id' => $this->post->id,
        'user_id' => $user2->id,
        'type' => 'love',
    ]);
    
    expect(Reaction::where('user_id', $this->user->id)->count())->toBe(1)
        ->and(Reaction::where('user_id', $user2->id)->count())->toBe(1);
});

it('reaction model has correct table name', function () {
    $reaction = new \TrueFans\LaravelReactReactions\Models\Reaction();
    
    expect($reaction->getTable())->toBe('reactions');
});

it('reaction model uses timestamps', function () {
    $reaction = new \TrueFans\LaravelReactReactions\Models\Reaction();
    
    expect($reaction->timestamps)->toBeTrue();
});

it('reaction model has correct casts', function () {
    $reaction = new \TrueFans\LaravelReactReactions\Models\Reaction();
    
    expect($reaction->getCasts())->toHaveKey('created_at')
        ->and($reaction->getCasts())->toHaveKey('updated_at');
});

it('reaction can be created with all attributes', function () {
    $user = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $reaction = \TrueFans\LaravelReactReactions\Models\Reaction::create([
        'reactable_type' => \Workbench\App\Models\TestPost::class,
        'reactable_id' => $post->id,
        'user_id' => $user->id,
        'type' => 'like',
    ]);

    expect($reaction)->toBeInstanceOf(\TrueFans\LaravelReactReactions\Models\Reaction::class)
        ->and($reaction->reactable_type)->toBe(\Workbench\App\Models\TestPost::class)
        ->and($reaction->reactable_id)->toBe($post->id)
        ->and($reaction->user_id)->toBe($user->id)
        ->and($reaction->type)->toBe('like');
});

it('can use ofType scope', function () {
    $user = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    \TrueFans\LaravelReactReactions\Models\Reaction::create([
        'reactable_type' => \Workbench\App\Models\TestPost::class,
        'reactable_id' => $post->id,
        'user_id' => $user->id,
        'type' => 'like',
    ]);

    \TrueFans\LaravelReactReactions\Models\Reaction::create([
        'reactable_type' => \Workbench\App\Models\TestPost::class,
        'reactable_id' => $post->id,
        'user_id' => createUser()->id,
        'type' => 'love',
    ]);

    $likes = \TrueFans\LaravelReactReactions\Models\Reaction::ofType('like')->get();
    
    expect($likes)->toHaveCount(1)
        ->and($likes->first()->type)->toBe('like');
});

it('can use byUser scope', function () {
    $user1 = createUser();
    $user2 = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    \TrueFans\LaravelReactReactions\Models\Reaction::create([
        'reactable_type' => \Workbench\App\Models\TestPost::class,
        'reactable_id' => $post->id,
        'user_id' => $user1->id,
        'type' => 'like',
    ]);

    \TrueFans\LaravelReactReactions\Models\Reaction::create([
        'reactable_type' => \Workbench\App\Models\TestPost::class,
        'reactable_id' => $post->id,
        'user_id' => $user2->id,
        'type' => 'love',
    ]);

    $user1Reactions = \TrueFans\LaravelReactReactions\Models\Reaction::byUser($user1->id)->get();
    
    expect($user1Reactions)->toHaveCount(1)
        ->and($user1Reactions->first()->user_id)->toBe($user1->id);
});
