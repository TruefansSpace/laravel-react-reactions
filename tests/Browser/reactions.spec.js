import { test, expect } from '@playwright/test';

test.describe('Reactions Component', () => {
    test.beforeEach(async ({ page }) => {
        // Listen for console logs
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
        page.on('pageerror', exception => console.log(`BROWSER ERROR: ${exception}`));

        // Navigate to the test page
        await page.goto('/');
        
        // Log page content for debugging
        console.log('PAGE CONTENT:', await page.content());

        // Wait for the page to load
        await page.waitForLoadState('networkidle');
    });

    test('should display the Like button', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        await expect(likeButton).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('initial-state.png');
    });

    test('should show reaction picker on hover', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Hover over the Like button
        await likeButton.hover();
        
        // Wait for picker to appear (300ms delay + animation)
        await page.waitForTimeout(500);
        
        // Check if all reaction emojis are visible
        const reactions = ['👍', '❤️', '😂', '😮', '😢', '😠'];
        for (const emoji of reactions) {
            await expect(page.locator(`button:has-text("${emoji}")`)).toBeVisible();
        }
        
        // Take screenshot of picker
        await expect(page).toHaveScreenshot('reaction-picker-visible.png');
    });

    test('should add a reaction when clicked', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Click the Like button
        await likeButton.click();
        
        // Wait for the reaction to be processed
        await page.waitForTimeout(500);
        
        // Check if button is now active (blue background)
        await expect(likeButton).toHaveClass(/bg-blue-100/);
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-added.png');
    });

    test('should change reaction type', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Hover to show picker
        await likeButton.hover();
        await page.waitForTimeout(500);
        
        // Click on love reaction
        await page.locator('button:has-text("❤️")').click();
        
        // Wait for processing
        await page.waitForTimeout(500);
        
        // Check if the main button now shows love
        await expect(page.getByRole('button', { name: /love/i })).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-changed-to-love.png');
    });

    test('should remove reaction when clicking same type', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Click again to remove
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Check if button is back to inactive state
        await expect(likeButton).toHaveClass(/bg-gray-100/);
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-removed.png');
    });

    test('should display reaction counts', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Check if count badge appears
        const countBadge = page.locator('button:has-text("👍"):has-text("1")');
        await expect(countBadge).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-count-displayed.png');
    });

    test('should persist reaction after page reload', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check if reaction is still active
        const activeButton = page.getByRole('button', { name: /like/i });
        await expect(activeButton).toHaveClass(/bg-blue-100/);
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-persisted.png');
    });

    test('should handle multiple reaction types', async ({ page }) => {
        // This test simulates multiple users by checking the UI updates
        const likeButton = page.getByRole('button', { name: /like/i });
        
        // Hover and select love
        await likeButton.hover();
        await page.waitForTimeout(500);
        await page.locator('button:has-text("❤️")').click();
        await page.waitForTimeout(500);
        
        // Hover again and select wow
        await page.getByRole('button', { name: /love/i }).hover();
        await page.waitForTimeout(500);
        await page.locator('button:has-text("😮")').click();
        await page.waitForTimeout(500);
        
        // Check if button shows wow
        await expect(page.getByRole('button', { name: /wow/i })).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('multiple-reactions.png');
    });
});
