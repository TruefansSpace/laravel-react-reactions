<?php

namespace TrueFans\LaravelReactReactions\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Events\CommentCreated;
use TrueFans\LaravelReactReactions\Notifications\NewCommentNotification;

class SendCommentNotification implements ShouldQueue
{
    /**
     * Handle the event.
     */
    public function handle(CommentCreated $event): void
    {
        $comment = $event->comment;
        
        // Get admin email from config
        $adminEmail = config('react-reactions.notifications.admin_email');
        
        if (!$adminEmail) {
            return;
        }

        // Check if notifications are enabled
        if (!config('react-reactions.notifications.enabled', true)) {
            return;
        }

        // Don't notify for replies if configured
        if ($comment->parent_id && !config('react-reactions.notifications.notify_on_replies', true)) {
            return;
        }

        // Send notification to admin
        Notification::route('mail', $adminEmail)
            ->notify(new NewCommentNotification($comment));

        // Optionally notify the commentable owner
        if (config('react-reactions.notifications.notify_owner', true)) {
            $commentable = $comment->commentable;
            
            // Check if commentable has a user/owner relationship
            if (method_exists($commentable, 'user') && $commentable->user) {
                $owner = $commentable->user;
                
                // Don't notify if owner is the commenter
                if ($owner->id !== $comment->user_id) {
                    $owner->notify(new NewCommentNotification($comment));
                }
            }
        }

        // Optionally notify parent comment author on replies
        if ($comment->parent_id && config('react-reactions.notifications.notify_parent_author', true)) {
            $parentComment = $comment->parent;
            
            if ($parentComment && $parentComment->user) {
                $parentAuthor = $parentComment->user;
                
                // Don't notify if parent author is the commenter
                if ($parentAuthor->id !== $comment->user_id) {
                    $parentAuthor->notify(new NewCommentNotification($comment));
                }
            }
        }
    }
}
