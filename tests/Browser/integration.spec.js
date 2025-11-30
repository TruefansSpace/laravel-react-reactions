import { test, expect } from '@playwright/test';

test.describe('Reactions and Comments Integration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/test');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/test');
    });

    test('can react to comments', async ({ page }) => {
        // Add a comment
        await page.fill('[data-testid="comment-input"]', 'Test comment');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(500);
        
        // React to the comment
        await page.click('[data-testid="comment-reaction-like"]');
        
        // Verify reaction was added
        await expect(page.locator('[data-testid="comment-reaction-count"]')).toContainText('1');
    });

    test('comment reactions update independently from post reactions', async ({ page }) => {
        // React to post
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(300);
        
        // Add comment
        await page.fill('[data-testid="comment-input"]', 'Test comment');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(500);
        
        // React to comment with different reaction
        await page.click('[data-testid="comment-reaction-love"]');
        
        // Verify both reactions exist independently
        await expect(page.locator('[data-testid="post-reaction-like"]')).toContainText('1');
        await expect(page.locator('[data-testid="comment-reaction-love"]')).toContainText('1');
    });
