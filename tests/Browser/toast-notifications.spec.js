import { test, expect } from '@playwright/test';

test.describe('Toast Notifications', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/test');
        await page.waitForLoadState('networkidle');
        
        // Login
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/test');
    });

    test('shows success toast when adding reaction', async ({ page }) => {
        await page.click('[data-testid="reaction-button-like"]');
        
        // Wait for toast to appear
        await expect(page.locator('[data-testid="toast"]')).toBeVisible();
        await expect(page.locator('text=Reaction added')).toBeVisible();
    });

    test('shows success toast when removing reaction', async ({ page }) => {
        // Add reaction first
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Remove reaction
        await page.click('[data-testid="reaction-button-like"]');
        
        // Check toast
        await expect(page.locator('text=Reaction removed')).toBeVisible();
    });

    test('shows success toast when changing reaction', async ({ page }) => {
        // Add reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Change to different reaction
        await page.click('[data-testid="reaction-button-love"]');
        
        // Check toast
        await expect(page.locator('text=Reaction updated')).toBeVisible();
    });

    test('shows success toast when adding comment', async ({ page }) => {
        await page.fill('[data-testid="comment-input"]', 'Test comment');
        await page.click('[data-testid="submit-comment"]');
        
        await expect(page.locator('text=Comment added')).toBeVisible();
    });

    test('shows success toast when editing comment', async ({ page }) => {
        // Add comment first
        await page.fill('[data-testid="comment-input"]', 'Original comment');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(500);
        
        // Edit comment
        await page.click('[data-testid="edit-comment"]');
        await page.fill('[data-testid="edit-comment-input"]', 'Edited comment');
        await page.click('[data-testid="save-edit"]');
        
        await expect(page.locator('text=Comment updated')).toBeVisible();
    });

    test('shows success toast when deleting comment', async ({ page }) => {
        // Add comment first
        await page.fill('[data-testid="comment-input"]', 'Test comment');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(500);
        
        // Delete comment
        await page.click('[data-testid="delete-comment"]');
        await page.click('[data-testid="confirm-delete"]');
        
        await expect(page.locator('text=Comment deleted')).toBeVisible();
    });

    test('shows error toast on network failure', async ({ page }) => {
        // Simulate network failure
        await page.route('**/reactions/toggle', route => route.abort());
        
        await page.click('[data-testid="reaction-button-like"]');
        
        await expect(page.locator('[data-testid="toast-error"]')).toBeVisible();
    });

    test('toast auto-dismisses after timeout', async ({ page }) => {
        await page.click('[data-testid="reaction-button-like"]');
        
        // Toast should be visible
        await expect(page.locator('[data-testid="toast"]')).toBeVisible();
        
        // Wait for auto-dismiss (usually 3-5 seconds)
        await page.waitForTimeout(6000);
        
        // Toast should be gone
        await expect(page.locator('[data-testid="toast"]')).not.toBeVisible();
    });

    test('can manually dismiss toast', async ({ page }) => {
        await page.click('[data-testid="reaction-button-like"]');
        
        await expect(page.locator('[data-testid="toast"]')).toBeVisible();
        
        // Click dismiss button
        await page.click('[data-testid="toast-close"]');
        
        await expect(page.locator('[data-testid="toast"]')).not.toBeVisible();
    });

    test('multiple toasts stack correctly', async ({ page }) => {
        // Trigger multiple actions quickly
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(100);
        await page.click('[data-testid="reaction-button-love"]');
        
        // Should show multiple toasts or queue them
        const toasts = page.locator('[data-testid="toast"]');
        await expect(toasts).toHaveCount(2);
    });
});
