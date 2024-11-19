import { test, expect } from '@playwright/test';

test('basic navigation test', async ({ page }) => {
  // Start from the index page
  await page.goto('/');

  // The page should contain a heading
  await expect(page.getByRole('heading')).toBeVisible();

  // Should be able to navigate to different pages
  await page.getByRole('link', { name: /about/i }).click();
  await expect(page).toHaveURL(/.*about/);

  // The about page should be accessible
  await expect(page.getByRole('heading')).toBeVisible();
});
