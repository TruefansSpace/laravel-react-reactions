# Comment Delete Notifications

This document describes the comment deletion notification system implemented in the Laravel React Reactions package.

## Overview

Similar to comment creation, the package now dispatches events and sends email notifications when comments are deleted. This feature is disabled by default and can be enabled via configuration.

## Components

### Event
- **File**: `src/Events/CommentDeleted.php`
- **Purpose**: Dispatched when a comment is deleted
- **Properties**: Contains the deleted `Comment` model

### Listener
- **File**: `src/Listeners/SendCommentDeletedNotification.php`
- **Purpose**: Handles the `CommentDeleted` event and sends notifications
- **Recipients**:
  - Admin email (if configured)
  - Post/commentable owner (if enabled and not the deleter)

### Notification
- **File**: `src/Notifications/CommentDeletedNotification.php`
- **Purpose**: Email notification sent when a comment is deleted
- **Content**: Includes deleted comment content, user name, and commentable information

## Configuration

Add to your `.env` file:

```env
# Enable/disable delete notifications (default: false)
REACTIONS_NOTIFY_ON_DELETE=true

# Admin email for notifications
REACTIONS_ADMIN_EMAIL=admin@example.com
```

Or configure in `config/react-reactions.php`:

```php
'notifications' => [
    'enabled' => true,
    'notify_on_delete' => env('REACTIONS_NOTIFY_ON_DELETE', false),
    'admin_email' => env('REACTIONS_ADMIN_EMAIL', env('MAIL_FROM_ADDRESS')),
    'notify_owner' => true, // Notify the owner of the commentable item
],
```

## Usage

The event is automatically dispatched when a comment is deleted through the `CommentController`:

```php
// In CommentController@destroy
event(new CommentDeleted($comment));
$comment->delete();
```

## Testing

Comprehensive tests are included in `tests/Feature/CommentDeletedNotificationTest.php`:

- ✅ Event is dispatched when comment is deleted
- ✅ Admin receives notification
- ✅ Post owner receives notification
- ✅ Notifications respect the `notify_on_delete` config
- ✅ Notification includes deleted comment content
- ✅ Notification subject indicates deletion

Run tests:
```bash
vendor/bin/pest tests/Feature/CommentDeletedNotificationTest.php
```

## Email Content

The notification email includes:
- Subject: "Comment deleted on {Type}: {Title}"
- Commenter name
- Deleted comment content (quoted)
- Link to view the item (if commentable has `url()` method)

## Important Notes

1. **Disabled by Default**: Delete notifications are disabled by default to avoid notification spam. Enable explicitly via config.

2. **Event Timing**: The event is dispatched BEFORE the comment is deleted, ensuring all relationships (user, commentable) are still accessible.

3. **No Self-Notification**: The system prevents notifying the post owner if they are the one who deleted the comment.

4. **Queued Notifications**: Notifications are queued by default (configurable via `notifications.queue` setting).

## Comparison with Comment Creation

| Feature | Comment Created | Comment Deleted |
|---------|----------------|-----------------|
| Event | `CommentCreated` | `CommentDeleted` |
| Listener | `SendCommentNotification` | `SendCommentDeletedNotification` |
| Notification | `NewCommentNotification` | `CommentDeletedNotification` |
| Default State | Enabled | **Disabled** |
| Config Key | N/A | `notify_on_delete` |
| Notifies Parent Author | Yes (on replies) | No |

## Future Enhancements

Potential improvements:
- Add notification for comment updates
- Support for custom notification channels (Slack, SMS, etc.)
- Configurable notification templates
- Batch notifications for multiple deletions
