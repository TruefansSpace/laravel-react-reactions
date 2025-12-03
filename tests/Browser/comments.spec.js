import { test, expect } from '@playwright/test';

test.describe('Comments System', () => {
    let authUser;

    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('http://localhost:8000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('http://localhost:8000');
        
        // Extract auth user data from data attribute
        const authUserData = await page.getAttribute('[data-auth_user]', 'data-auth_user');
        authUser = authUserData ? JSON.parse(authUserData) : null;
        console.log('Authenticated user:', authUser);
    });

    test('can view comments section', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
        // Wait for comments section to load
        await expect(page.locator('text=Comments').first()).toBeVisible();
        
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
        await expect(page.locator('text=Success').first()).toBeVisible({ timeout: 5000 });
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
        const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
        
        // Click more options menu
        await commentItem.locator('button').first().click();
        
        // Take screenshot of dropdown menu
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-menu.png' 
        });
        
        // Click edit
        await page.locator('[data-testid="edit-comment"]').first().click();
        
        // Wait for edit form
        await expect(commentItem.locator('textarea')).toBeVisible();
        
        // Update comment
        const updatedText = `Updated comment ${Date.now()}`;
        await page.fill('textarea', updatedText);
        
        // Take screenshot of edit form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-edit-form.png' 
        });
        
        // Submit update
        await page.click('button:has-text("Update")');
        
        // Wait for page reload
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // Verify updated content
        await expect(page.locator(`text=${updatedText}`)).toBeVisible({ timeout: 5000 });
        
        // Verify edited indicator
        await expect(page.getByText(/edited/i).first()).toBeVisible({ timeout: 3000 });
        
        // Take screenshot of edited comment
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-edited.png' 
        });
    });

    test('can reply to a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
         const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
        
        // Click reply button on first comment
        await commentItem.locator('button:has-text("Reply")').first().click();
        
        // Wait for reply form
        await expect(page.locator('[data-testid="comment-input"]')).toBeVisible();
        
        // Take screenshot of reply form
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/reply-form.png' 
        });
        
        // Fill in reply
        const replyText = `Test reply ${Date.now()}`;
        await page.fill('textarea[placeholder*="reply"]', replyText);
        
        // Submit reply
        await page.click('button:has-text("Post")');
        
        // Wait for page reload and reply to appear
        await page.waitForLoadState('networkidle');
        await expect(page.locator(`text=${replyText}`)).toBeVisible({ timeout: 5000 });
        
        // Take screenshot of nested reply
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-with-reply.png',
            fullPage: true 
        });
    });

    test('can delete a comment', async ({ page }) => {
        const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
        
        // Click more options menu
        await commentItem.locator('button').first().click();
        
        await page.locator('[data-testid="delete-comment"]').first().click();
        
        // Wait for confirmation dialog
        await expect(page.locator('text=Delete Comment')).toBeVisible();
        await expect(page.locator('text=Are you sure')).toBeVisible();
        
        // Take screenshot of confirmation dialog
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/delete-confirmation.png' 
        });
        
        // Confirm deletion
        await page.click('[data-testid="confirm-delete"]');
        
        // Wait for page reload
        await page.waitForLoadState('networkidle');
        
        // Check toast appears with success message
        const toast = page.locator('[data-testid="toast"]').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
        await expect(toast).toContainText('Comment deleted successfully');
        
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/comment-deleted.png',
            fullPage: true 
        });
    });

    test('can react to a comment', async ({ page }) => {
        await page.goto('http://localhost:8000');
        const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
        // Find reaction button on first comment
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
         const button = await page.locator('button:has-text("Post")');
        await expect(button).toBeDisabled();
        
        // Take screenshot of validation error
        await page.screenshot({ 
            path: 'tests/Browser/comments.spec.js-snapshots/button-disabled.png' 
        });
        const textarea = await page.locator('[data-testid="comment-input"]').first();
        await textarea.fill('test ');
        await expect(button).toBeEnabled();
    });

    test('can cancel comment editing', async ({ page }) => {
        await page.goto('http://localhost:8000');
        
         const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
        
        // Click more options menu
        await commentItem.locator('button').first().click();
        
        await page.locator('[data-testid="edit-comment"]').first().click();
        
    
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
          const commentItem = page.locator(`[data-content_owner_id="container_${authUser.id}"]`).first();
       await expect(commentItem.locator(`[data-user_id="${authUser.id}"][role="avatar"]`)).toBeVisible();
        
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
