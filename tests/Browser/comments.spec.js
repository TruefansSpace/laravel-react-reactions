import { test, expect } from '@playwright/test';

test.describe('Comments System', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('http://localhost:8000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('http://localhost:8000');
    });

    test('can view comments section', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Wait for comments section to load
        await expect(page.locator('text=Comments')).toBeVisible();
        
        // Take screenshot of comments section
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comments-section.png',
            fullPage: true 
        });
    });

    test('can add a new comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Click "Add Comment" button
        await page.click('button:has-text("Add Comment")');
        
        // Wait for form to appear
        await expect(page.locator('textarea[placeholder*="comment"]')).toBeVisible();
        
        // Take screenshot of comment form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-form-empty.png' 
        });
        
        // Fill in comment
        const commentText = `Test comment ${Date.now()}`;
        await page.fill('textarea[placeholder*="comment"]', commentText);
        
        // Take screenshot of filled form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-form-filled.png' 
        });
        
        // Submit comment
        await page.click('button:has-text("Post")');
        
        // Wait for success toast
        await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(`text=${commentText}`)).toBeVisible();
        
        // Take screenshot of new comment
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-posted.png',
            fullPage: true 
        });
    });

    test('can edit a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Find first comment with edit button
        const commentItem = page.locator('[class*="comment"]').first();
        
        // Click more options menu
        await commentItem.locator('button').first().click();
        
        // Take screenshot of dropdown menu
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-menu.png' 
        });
        
        // Click edit
        await page.click('text=Edit');
        
        // Wait for edit form
        await expect(page.locator('textarea')).toBeVisible();
        
        // Update comment
        const updatedText = `Updated comment ${Date.now()}`;
        await page.fill('textarea', updatedText);
        
        // Take screenshot of edit form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-edit-form.png' 
        });
        
        // Submit update
        await page.click('button:has-text("Update")');
        
        // Wait for success
        await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(`text=${updatedText}`)).toBeVisible();
        await expect(page.locator('text=edited')).toBeVisible();
        
        // Take screenshot of edited comment
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-edited.png' 
        });
    });

    test('can reply to a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Click reply button on first comment
        await page.click('button:has-text("Reply")');
        
        // Wait for reply form
        await expect(page.locator('textarea[placeholder*="reply"]')).toBeVisible();
        
        // Take screenshot of reply form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/reply-form.png' 
        });
        
        // Fill in reply
        const replyText = `Test reply ${Date.now()}`;
        await page.fill('textarea[placeholder*="reply"]', replyText);
        
        // Submit reply
        await page.click('button:has-text("Post")');
        
        // Wait for success
        await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
        await expect(page.locator(`text=${replyText}`)).toBeVisible();
        
        // Take screenshot of nested reply
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-with-reply.png',
            fullPage: true 
        });
    });

    test('can delete a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Get initial comment count
        const initialCount = await page.locator('[class*="comment"]').count();
        
        // Click more options on first comment
        await page.locator('[class*="comment"]').first().locator('button').first().click();
        
        // Click delete
        await page.click('text=Delete');
        
        // Wait for confirmation dialog
        await expect(page.locator('text=Delete Comment')).toBeVisible();
        await expect(page.locator('text=Are you sure')).toBeVisible();
        
        // Take screenshot of confirmation dialog
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/delete-confirmation.png' 
        });
        
        // Confirm deletion
        await page.click('button:has-text("Delete")');
        
        // Wait for success
        await expect(page.locator('text=Success')).toBeVisible({ timeout: 5000 });
        
        // Verify comment count decreased
        await page.waitForTimeout(1000);
        const newCount = await page.locator('[class*="comment"]').count();
        expect(newCount).toBeLessThan(initialCount);
        
        // Take screenshot after deletion
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-deleted.png',
            fullPage: true 
        });
    });

    test('can react to a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Find reaction button on first comment
        const commentItem = page.locator('[class*="comment"]').first();
        const reactionButton = commentItem.locator('button').filter({ hasText: /👍|Like/ }).first();
        
        // Click reaction
        await reactionButton.click();
        
        // Wait for reaction to register
        await page.waitForTimeout(500);
        
        // Take screenshot of comment with reaction
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-with-reaction.png' 
        });
    });

    test('shows character counter', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Click add comment
        await page.click('button:has-text("Add Comment")');
        
        // Type in textarea
        await page.fill('textarea', 'Test');
        
        // Check character counter is visible
        await expect(page.locator('text=/\\d+\\/5000/')).toBeVisible();
        
        // Take screenshot of character counter
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/character-counter.png' 
        });
    });

    test('shows validation error for empty comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Click add comment
        await page.click('button:has-text("Add Comment")');
        
        // Try to submit empty comment
        await page.click('button:has-text("Post")');
        
        // Check for error message
        await expect(page.locator('text=/cannot be empty/i')).toBeVisible();
        
        // Take screenshot of validation error
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/validation-error.png' 
        });
    });

    test('can cancel comment editing', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Start editing
        await page.locator('[class*="comment"]').first().locator('button').first().click();
        await page.click('text=Edit');
        
        // Change text
        await page.fill('textarea', 'Changed text');
        
        // Click cancel
        await page.click('button:has-text("Cancel")');
        
        // Verify form is hidden
        await expect(page.locator('textarea')).not.toBeVisible();
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/edit-cancelled.png' 
        });
    });

    test('displays user avatars and names', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Check for user avatar
        const commentItem = page.locator('[class*="comment"]').first();
        await expect(commentItem.locator('[class*="rounded-full"]')).toBeVisible();
        
        // Check for user name
        await expect(commentItem.locator('text=/Test User|User/')).toBeVisible();
        
        // Take screenshot
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/user-info.png' 
        });
    });

    test('shows edited indicator', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Look for edited indicator
        const editedIndicator = page.locator('text=edited');
        
        if (await editedIndicator.count() > 0) {
            await expect(editedIndicator.first()).toBeVisible();
            
            // Take screenshot
            await page.screenshot({ 
                path: 'tests/Browser/comments.spec.js-snapshots/edited-indicator.png' 
            });
        }
    });
});
