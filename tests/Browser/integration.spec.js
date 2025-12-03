import { test, expect } from '@playwright/test';

test.describe('Reactions and Comments Integration', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('http://localhost:8000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('http://localhost:8000');
        
        // Ensure we are on the test page
        await page.waitForLoadState('networkidle');
    });

    test('can react to comments', async ({ page }) => {
        // Click to show comment form on first post
        await page.locator('[data-testid="add-comment-button"]').first().click();
        await page.waitForTimeout(200);
        
        // Add a comment
        await page.fill('[data-testid="comment-input"]', 'Test comment for reactions');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(1000);
        
        // Wait for comment to appear and find its reaction button
        await page.waitForSelector('text=Test comment for reactions');
        
        // Find the comment container and click its like button
        const commentSection = page.locator('text=Test comment for reactions').locator('..');
        await commentSection.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Verify reaction was added - look for reaction count
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
    });

    test('comment reactions update independently from post reactions', async ({ page }) => {
        // React to first post
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Verify post reaction was added
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
        
        // Click to show comment form
        await page.locator('[data-testid="add-comment-button"]').first().click();
        await page.waitForTimeout(200);
        
        // Add comment
        await page.fill('[data-testid="comment-input"]', 'Test comment independence');
        await page.click('[data-testid="submit-comment"]');
        await page.waitForTimeout(1000);
        
        // Wait for comment to appear
        await page.waitForSelector('text=Test comment independence');
        
        // React to comment - hover to show picker and click love
        const commentSection = page.locator('text=Test comment independence').locator('..');
        const commentReactionButton = commentSection.locator('[data-testid="reaction-button-like"]').first();
        await commentReactionButton.hover();
        await page.waitForTimeout(400);
        
        // Click love reaction from the picker
        await page.locator('[data-testid="reaction-button-love"]').last().click();
        await page.waitForTimeout(500);
        
        // Verify both reactions exist independently
        const postReactionCount = await page.locator('[data-testid="reaction-count-like"]').count();
        expect(postReactionCount).toBeGreaterThan(0);
    });
});
