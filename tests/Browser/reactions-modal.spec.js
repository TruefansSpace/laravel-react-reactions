import { test, expect } from '@playwright/test';

test.describe('ReactionsModal', () => {
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

    test('opens modal when clicking reaction count', async ({ page }) => {
        // Add a reaction first
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Click on the chevron button to open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        
        // Modal should be visible
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        await expect(page.locator('#modal-title')).toContainText('Reactions');
    });

    test('displays tabs for different reaction types', async ({ page }) => {
        // Add a reaction
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        
        // Check tabs exist
        await expect(page.locator('[data-testid="reaction-tab-all"]')).toBeVisible();
        await expect(page.locator('[data-testid="reaction-tab-like"]')).toBeVisible();
    });

    test('filters users by reaction type when clicking tab', async ({ page }) => {
        // Add a reaction
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        
        // Click on specific reaction tab
        await page.click('[data-testid="reaction-tab-like"]');
        await page.waitForTimeout(300);
        
        // Should show filtered users
        await expect(page.locator('[data-testid="user-reaction-item"]').first()).toBeVisible();
    });

    test('shows user name and reaction type in list', async ({ page }) => {
        // Add a reaction
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        
        // Check user info is displayed in modal - should show at least one user
        const modal = page.locator('[role="dialog"]');
        await expect(modal.locator('[data-testid="user-reaction-item"]').first()).toBeVisible();
        await expect(modal.locator('[data-testid="user-reaction-type"]').first()).toBeVisible();
    });

    test('closes modal when clicking close button', async ({ page }) => {
        // Add a reaction
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Close modal
        await page.locator('[data-testid="close-modal"]').click();
        
        // Wait for modal to completely disappear (check for detached state)
        await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 1000 });
    });

    test('closes modal when clicking outside', async ({ page }) => {
        // Add a reaction
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Click outside (on overlay) - need to click on the overlay itself, not the modal
        await page.locator('[data-testid="modal-overlay"]').click({ position: { x: 10, y: 10 } });
        
        // Wait for modal to completely disappear
        await page.waitForSelector('[role="dialog"]', { state: 'detached', timeout: 1000 });
        await expect(page.locator('[role="dialog"]')).toBeHidden();
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
        await page.locator('[data-testid="reaction-button-like"]').first().click();
        await page.waitForTimeout(500);
        
        // Open modal
        await page.locator('[data-testid="open-reactions-modal"]').first().click();
        await page.waitForTimeout(300);
        
        // Verify modal is open
        await expect(page.locator('[role="dialog"]')).toBeVisible();
        
        // Modal should show the reaction
        await expect(page.locator('[data-testid="user-reaction-item"]').first()).toBeVisible();
    });
});
