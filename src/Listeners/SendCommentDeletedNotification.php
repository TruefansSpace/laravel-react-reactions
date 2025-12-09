<?php

namespace TrueFans\LaravelReactReactions\Listeners;

use Illuminate\Support\Facades\Notification;
use TrueFans\LaravelReactReactions\Events\CommentDeleted;
use TrueFans\LaravelReactReactions\Notifications\CommentDeletedNotification;

class SendCommentDeletedNotification
{
    /**
     * Handle the event.
     */
    public function handle(CommentDeleted $event): void
    {
        $comment = $event->comment;

        \Log::info('CommentDeleted listener triggered', [
            'comment_id' => $comment->id,
        ]);

        // Get admin email from config
        $adminEmail = config('react-reactions.notifications.admin_email');

        \Log::info('Admin email config', [
            'admin_email' => $adminEmail,
        ]);

        if (! $adminEmail) {
            \Log::warning('No admin email configured');

            return;
        }

        // Check if notifications are enabled
        $notificationsEnabled = config('react-reactions.notifications.enabled', true);
        \Log::info('Notifications enabled check', [
            'enabled' => $notificationsEnabled,
        ]);

        if (! $notificationsEnabled) {
            \Log::warning('Notifications disabled');

            return;
        }

        // Check if delete notifications are enabled
        $notifyOnDelete = config('react-reactions.notifications.notify_on_delete', false);
        \Log::info('Notify on delete check', [
            'notify_on_delete' => $notifyOnDelete,
        ]);

        if (! $notifyOnDelete) {
            \Log::warning('Delete notifications disabled');

            return;
        }

        \Log::info('Sending deletion notification to admin', [
            'admin_email' => $adminEmail,
            'comment_id' => $comment->id,
        ]);

        // Send notification to admin
        Notification::route('mail', $adminEmail)
            ->notify(new CommentDeletedNotification($comment));

        // Optionally notify the commentable owner
        if (config('react-reactions.notifications.notify_owner', true)) {
            $commentable = $comment->commentable;

            // Check if commentable has a user/owner relationship
            if (method_exists($commentable, 'user') && $commentable->user) {
                $owner = $commentable->user;

                // Don't notify if owner is the one who deleted
                if ($owner->id !== $comment->user_id) {
                    $owner->notify(new CommentDeletedNotification($comment));
                }
            }
        }
    }
}
