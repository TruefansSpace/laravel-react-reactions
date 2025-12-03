import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
    let authUser;

    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('http://localhost:8000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('http://localhost:8000');
        
        // Ensure we are on the test page
        await page.waitForLoadState('networkidle');
        
        // Extract auth user data from data attribute
        const authUserData = await page.getAttribute('[data-auth_user]', 'data-auth_user');
        authUser = authUserData ? JSON.parse(authUserData) : null;
        console.log('Authenticated user:', authUser);
    });

    test('shows success toast when adding comment', async ({ page }) => {
        // Click to show comment form
        await page.locator('[data-testid="add-comment-button"]').first().click();
        await page.waitForTimeout(200);
        
        // Fill and submit comment
        await page.fill('[data-testid="comment-input"]', 'Test comment for toast');
        await page.click('[data-testid="submit-comment"]');
        
        // Wait for page reload (Inertia redirect)
        await page.waitForLoadState('networkidle');
        
        // Check toast appears with success message
        const toast = page.locator('[data-testid="toast"]').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
        
        // Verify toast contains success message
        await expect(toast).toContainText('Comment posted successfully');
    });

    test('shows success toast when deleting comment', async ({ page }) => {
        // First, add a comment
        await page.locator('[data-testid="add-comment-button"]').first().click();
        await page.waitForTimeout(200);
        await page.fill('[data-testid="comment-input"]', 'Comment to be deleted');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForLoadState('networkidle');
        
        // Wait for the "posted" toast to disappear
        await page.waitForTimeout(6000);
        
        // Find the comment we just created and delete it
        // Look for the comment with our text
        const commentContainer = page.locator('text=Comment to be deleted').locator('..').locator('..');
        
        // Click the more options button (three dots)
        await commentContainer.locator('button').first().click();
        await page.waitForTimeout(200);
        
        // Click delete
        await page.locator('[data-testid="delete-comment"]').click();
        await page.waitForTimeout(200);
        
        // Confirm deletion
        await page.locator('[data-testid="confirm-delete"]').click();
        
        // Wait for page reload
        await page.waitForLoadState('networkidle');
        
        // Check toast appears with success message
        const toast = page.locator('[data-testid="toast"]').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
        
        // Verify toast contains success message
        await expect(toast).toContainText('Comment deleted successfully');
    });

    test('toast auto-dismisses after timeout', async ({ page }) => {
        // Add a comment to trigger toast
        await page.locator('[data-testid="add-comment-button"]').first().click();
        await page.waitForTimeout(200);
        await page.fill('[data-testid="comment-input"]', 'Test auto-dismiss');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForLoadState('networkidle');
        
        // Toast should be visible
        const toast = page.locator('[data-testid="toast"]').first();
        await expect(toast).toBeVisible({ timeout: 3000 });
        
        // Wait for auto-dismiss (5 seconds as per use-toast.ts)
        await page.waitForTimeout(6000);
        
        // Toast should be gone
        await expect(toast).toBeHidden();
    });
});
