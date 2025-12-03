import { test, expect } from '@playwright/test';

test.describe('Reactions Component', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('http://localhost:8000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('http://localhost:8000');
        
        // Wait for the page to load
        await page.waitForLoadState('networkidle');
    });

    test('should display the Like button', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i }).first();
        await expect(likeButton).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('initial-state.png');
    });

    test('should show reaction picker on hover', async ({ page }) => {
        const likeButton = page.getByRole('button', { name: /like/i }).first();
        
        // Hover over the Like button
        await likeButton.hover();
        
        // Wait for picker to appear (300ms delay + animation)
        await page.waitForTimeout(500);
        
        // Check if all reaction emojis are visible
        const reactions = ['👍', '❤️', '😂', '😮', '😢', '😠'];
        for (const emoji of reactions) {
            await expect(page.locator(`button:has-text("${emoji}")`).first()).toBeVisible();
        }
        
        // Take screenshot of picker
        await expect(page).toHaveScreenshot('reaction-picker-visible.png');
    });

    test('should add a reaction when clicked', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Click the Like button
        await likeButton.click();
        
        // Wait for the reaction to be processed
        await page.waitForTimeout(500);
        
        // Check if reaction count appears
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-added.png');
    });

    test('should change reaction type', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Hover to show picker
        await likeButton.hover();
        await page.waitForTimeout(500);
        
        // Click on love reaction from picker
        await page.locator('[data-testid="reaction-button-love"]').first().click();
        
        // Wait for processing
        await page.waitForTimeout(500);
        
        // Check if the main button now shows love
        await expect(page.locator('[data-testid="reaction-count-love"]').first()).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-changed-to-love.png');
    });

    test('should remove reaction when clicking same type', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Get initial count
        const initialCount = await page.locator('[data-testid="reaction-count-like"]').first().textContent().catch(() => '0');
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Verify reaction was added (count increased or button changed)
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
        
        // Click again to remove
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Verify button is back to inactive state (not highlighted)
        await expect(likeButton).toHaveClass(/bg-white|bg-gray/);
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-removed.png');
    });

    test('should display reaction counts', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Check if count badge appears
        const countBadge = page.locator('[data-testid="reaction-count-like"]').first();
        await expect(countBadge).toBeVisible();
        await expect(countBadge).toContainText('1');
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-count-displayed.png');
    });

    test('should persist reaction after page reload', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Add a reaction
        await likeButton.click();
        await page.waitForTimeout(500);
        
        // Verify reaction was added
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
        
        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Check if reaction is still there
        await expect(page.locator('[data-testid="reaction-count-like"]').first()).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('reaction-persisted.png');
    });

    test('should handle multiple reaction types', async ({ page }) => {
        const likeButton = page.locator('[data-testid="reaction-button-like"]').first();
        
        // Hover and select love
        await likeButton.hover();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="reaction-button-love"]').first().click();
        await page.waitForTimeout(500);
        
        // Verify love reaction was added
        await expect(page.locator('[data-testid="reaction-count-love"]').first()).toBeVisible();
        
        // Hover again and select wow
        const loveButton = page.locator('[data-testid="reaction-button-love"]').first();
        await loveButton.hover();
        await page.waitForTimeout(500);
        await page.locator('[data-testid="reaction-button-wow"]').first().click();
        await page.waitForTimeout(500);
        
        // Check if wow reaction is now active
        await expect(page.locator('[data-testid="reaction-count-wow"]').first()).toBeVisible();
        
        // Take screenshot
        await expect(page).toHaveScreenshot('multiple-reactions.png');
    });
});
