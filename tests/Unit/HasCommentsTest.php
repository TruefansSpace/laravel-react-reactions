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

test('can add comment to model', function () {
    $comment = $this->post->comment($this->user->id, 'Test comment');

    expect($comment)->toBeInstanceOf(Comment::class)
        ->and($comment->content)->toBe('Test comment')
        ->and($comment->user_id)->toBe($this->user->id)
        ->and($comment->commentable_id)->toBe($this->post->id)
        ->and($comment->commentable_type)->toBe(TestPost::class);
});

test('can get comments relationship', function () {
    $this->post->comment($this->user->id, 'Comment 1');
    $this->post->comment($this->user->id, 'Comment 2');

    expect($this->post->comments()->count())->toBe(2);
});

test('can get top level comments only', function () {
    $comment1 = $this->post->comment($this->user->id, 'Top level');
    $comment2 = $this->post->comment($this->user->id, 'Reply', $comment1->id);

    expect($this->post->topLevelComments()->count())->toBe(1)
        ->and($this->post->comments()->count())->toBe(2);
});

test('can add reply to comment', function () {
    $comment = $this->post->comment($this->user->id, 'Parent comment');
    $reply = $comment->addReply($this->user->id, 'Reply comment');

    expect($reply->parent_id)->toBe($comment->id)
        ->and($reply->content)->toBe('Reply comment')
        ->and($comment->replies()->count())->toBe(1);
});

test('can get comments with reactions data', function () {
    $comment = $this->post->comment($this->user->id, 'Test');
    $comment->react($this->user->id, 'like');

    $comments = $this->post->commentsWithReactions($this->user->id)->get();

    expect($comments)->toHaveCount(1)
        ->and($comments->first()->parseReactionsSummary())->toHaveKey('like')
        ->and($comments->first()->parseUserReaction())->toBe('like');
});

test('can count total comments including replies', function () {
    $comment = $this->post->comment($this->user->id, 'Parent');
    $comment->addReply($this->user->id, 'Reply 1');
    $comment->addReply($this->user->id, 'Reply 2');

    expect($this->post->totalCommentsCount())->toBe(3);
});

test('can count top level comments only', function () {
    $comment = $this->post->comment($this->user->id, 'Parent');
    $comment->addReply($this->user->id, 'Reply 1');
    $comment->addReply($this->user->id, 'Reply 2');

    expect($this->post->topLevelCommentsCount())->toBe(1);
});

test('can manage comment returns true for authenticated user by default', function () {
    $this->actingAs($this->user);
    
    expect($this->post->canManageComment(null))->toBeTrue();
});

test('can manage comment returns false for unauthenticated user', function () {
    expect($this->post->canManageComment(null))->toBeFalse();
});

test('can manage comment returns true for comment author', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Test');

    expect($this->post->canManageComment($comment))->toBeTrue();
});

test('can manage comment returns false for non-author', function () {
    $otherUser = createUser();
    $this->actingAs($otherUser);
    $comment = $this->post->comment($this->user->id, 'Test');

    expect($this->post->canManageComment($comment))->toBeFalse();
});

test('comment can edit returns true for author', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Test');

    expect($comment->canEdit())->toBeTrue();
});

test('comment can delete returns true for author', function () {
    $this->actingAs($this->user);
    $comment = $this->post->comment($this->user->id, 'Test');

    expect($comment->canDelete())->toBeTrue();
});

test('comment soft deletes', function () {
    $comment = $this->post->comment($this->user->id, 'Test');
    $commentId = $comment->id;

    $comment->delete();

    expect(Comment::find($commentId))->toBeNull()
        ->and(Comment::withTrashed()->find($commentId))->not->toBeNull();
});

test('comment tracks edit status', function () {
    $comment = $this->post->comment($this->user->id, 'Original');

    // Fresh from database to get default values
    $comment = $comment->fresh();
    
    expect($comment->is_edited)->toBeFalsy()
        ->and($comment->edited_at)->toBeNull();

    $comment->update([
        'content' => 'Updated',
        'is_edited' => true,
        'edited_at' => now(),
    ]);

    expect($comment->fresh()->is_edited)->toBeTrue()
        ->and($comment->fresh()->edited_at)->not->toBeNull();
});

it('can create reply using comment model', function () {
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

    $reply = $comment->addReply($user->id, 'Reply content');
    
    expect($reply)->toBeInstanceOf(\TrueFans\LaravelReactReactions\Models\Comment::class)
        ->and($reply->content)->toBe('Reply content')
        ->and($reply->parent_id)->toBe($comment->id);
});
