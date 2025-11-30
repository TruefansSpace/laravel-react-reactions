<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use TrueFans\LaravelReactReactions\Models\Comment;
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

test('comment belongs to user', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);
    
    expect($comment->user->id)->toBe($this->user->id);
});

test('comment belongs to commentable', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test comment',
    ]);
    
    expect($comment->commentable)->toBeInstanceOf(TestPost::class)
        ->and($comment->commentable->id)->toBe($this->post->id);
});

test('comment can have parent', function () {
    $parent = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Parent comment',
    ]);
    
    $child = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $parent->id,
        'content' => 'Child comment',
    ]);
    
    expect($child->parent)->toBeInstanceOf(Comment::class)
        ->and($child->parent->id)->toBe($parent->id);
});

test('comment can have replies', function () {
    $parent = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Parent comment',
    ]);
    
    $reply1 = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $parent->id,
        'content' => 'Reply 1',
    ]);
    
    $reply2 = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $parent->id,
        'content' => 'Reply 2',
    ]);
    
    expect($parent->replies)->toHaveCount(2);
});

test('top level scope filters parent comments', function () {
    $parent = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Parent',
    ]);
    
    Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $parent->id,
        'content' => 'Reply',
    ]);
    
    expect(Comment::topLevel()->count())->toBe(1)
        ->and(Comment::count())->toBe(2);
});

test('reactions enabled returns config value', function () {
    config(['react-reactions.comments.reactions_enabled' => true]);
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test',
    ]);
    
    expect($comment->reactionsEnabled())->toBeTrue();
    
    config(['react-reactions.comments.reactions_enabled' => false]);
    expect($comment->reactionsEnabled())->toBeFalse();
});

test('can edit calls commentable can manage comment', function () {
    $this->actingAs($this->user);
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test',
    ]);
    
    expect($comment->canEdit())->toBeTrue();
});

test('can delete calls commentable can manage comment', function () {
    $this->actingAs($this->user);
    
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test',
    ]);
    
    expect($comment->canDelete())->toBeTrue();
});

test('can create reply to comment', function () {
    $parent = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Parent',
    ]);
    
    $reply = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'parent_id' => $parent->id,
        'content' => 'Reply content',
    ]);
    
    expect($reply)->toBeInstanceOf(Comment::class)
        ->and($reply->parent_id)->toBe($parent->id)
        ->and($reply->content)->toBe('Reply content')
        ->and($reply->commentable_id)->toBe($this->post->id)
        ->and($reply->commentable_type)->toBe(TestPost::class);
});

test('comment uses soft deletes', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test',
    ]);
    
    $id = $comment->id;
    $comment->delete();
    
    expect(Comment::find($id))->toBeNull()
        ->and(Comment::withTrashed()->find($id))->not->toBeNull();
});

test('comment fillable attributes', function () {
    $comment = new Comment();
    
    expect($comment->getFillable())->toContain('commentable_type')
        ->and($comment->getFillable())->toContain('commentable_id')
        ->and($comment->getFillable())->toContain('user_id')
        ->and($comment->getFillable())->toContain('parent_id')
        ->and($comment->getFillable())->toContain('content');
});

test('comment casts attributes correctly', function () {
    $comment = Comment::create([
        'commentable_type' => TestPost::class,
        'commentable_id' => $this->post->id,
        'user_id' => $this->user->id,
        'content' => 'Test',
        'is_edited' => 1,
        'edited_at' => '2024-01-01 12:00:00',
    ]);
    
    expect($comment->is_edited)->toBeTrue()
        ->and($comment->edited_at)->toBeInstanceOf(\Illuminate\Support\Carbon::class);
});

it('has replies with reactions relationship', function () {
    $user = createUser();
    $post = \Workbench\App\Models\TestPost::create([
        'title' => 'Test Post',
        'content' => 'Test content',
    ]);

    $comment = \TrueFans\LaravelReactReactions\Models\Comment::create([
        'commentable_type' => \Workbench\App\Models\TestPost::class,
        'commentable_id' => $post->id,
        'user_id' => $user->id,
        'content' => 'Parent comment',
    ]);

    $this->actingAs($user);
    
    $repliesRelation = $comment->repliesWithReactions();
    
    expect($repliesRelation)->toBeInstanceOf(\Illuminate\Database\Eloquent\Relations\HasMany::class);
});
