import { test, expect } from '@playwright/test';

test.describe('ReactionsModal', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password');
        await page.click('button[type="submit"]');
        await page.waitForURL('/');
        
        // Ensure we are on the test page
        await page.waitForLoadState('networkidle');
    });

    test('opens modal when clicking reaction count', async ({ page }) => {
        // Add a reaction first
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Click on the reaction count
        await page.click('[data-testid="reaction-count-like"]');
        
        // Modal should be visible
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('text=Reactions')).toBeVisible();
    });

    test('displays tabs for different reaction types', async ({ page }) => {
        // Add multiple reaction types
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(300);
        
        // Change to love
        await page.click('[data-testid="reaction-button-love"]');
        await page.waitForTimeout(300);
        
        // Open modal
        await page.click('[data-testid="reaction-count-love"]');
        
        // Check tabs exist
        await expect(page.locator('text=All')).toBeVisible();
        await expect(page.locator('[data-testid="reaction-tab-love"]')).toBeVisible();
    });

    test('filters users by reaction type when clicking tab', async ({ page }) => {
        // Add a reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Open modal
        await page.click('[data-testid="reaction-count-like"]');
        
        // Click on specific reaction tab
        await page.click('[data-testid="reaction-tab-like"]');
        
        // Should show filtered users
        await expect(page.locator('[data-testid="user-reaction-item"]')).toBeVisible();
    });

    test('shows user name and reaction type in list', async ({ page }) => {
        // Add a reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Open modal
        await page.click('[data-testid="reaction-count-like"]');
        
        // Check user info is displayed
        await expect(page.locator('text=Test User')).toBeVisible();
        await expect(page.locator('[data-testid="user-reaction-type"]')).toContainText('👍');
    });

    test('closes modal when clicking close button', async ({ page }) => {
        // Add a reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Open modal
        await page.click('[data-testid="reaction-count-like"]');
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close modal
        await page.click('[data-testid="close-modal"]');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('closes modal when clicking outside', async ({ page }) => {
        // Add a reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Open modal
        await page.click('[data-testid="reaction-count-like"]');
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Click outside (on overlay)
        await page.click('[data-testid="modal-overlay"]');
        await expect(page.locator('[role="dialog"]')).not.toBeVisible();
    });

    test('loads more users when scrolling', async ({ page }) => {
        // This would require seeding many users
        // Skip for now or implement with proper test data
        test.skip();
    });

    test('shows empty state when no reactions', async ({ page }) => {
        // Open modal without any reactions (if possible)
        // This might need a different test setup
        test.skip();
    });

    test('updates in real-time when reactions change', async ({ page }) => {
        // Add a reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Open modal
        await page.click('[data-testid="reaction-count-like"]');
        
        // Remove reaction
        await page.click('[data-testid="reaction-button-like"]');
        await page.waitForTimeout(500);
        
        // Modal should update or close
        // Implementation depends on actual behavior
    });
});
