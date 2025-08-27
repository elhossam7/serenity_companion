import { test, expect } from '@playwright/test';

test('app loads and shows auth page', async ({ page }) => {
  await page.goto('/user-login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveTitle(/Serenity Companion|.*/);
  const brand = page.locator('header').getByText('Serenity Companion', { exact: true });
  await expect(brand).toBeVisible({ timeout: 10000 });
});
