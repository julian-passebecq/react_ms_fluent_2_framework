import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('real Figure playback from an independent production bundle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Find a value with binary search');
  await expect(page.getByText('323 practice activities')).toBeVisible();
  async function audit() {
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    // Existing V4 exception: library focus sentinels, never application controls.
    const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
    expect(result.violations.filter(item => item.impact === 'serious' || item.impact === 'critical')).toEqual([]);
    expect(errors).toEqual([]);
  }
  await audit();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Explore', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('svg[data-conceptmotion]')).toBeVisible();
  await audit();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Export SVG', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('svg [data-role="explanation"]')).toHaveAttribute('data-explanation-step', 'compare-upper-half');
  await expect(page.getByRole('slider', { name: 'Timeline step' })).toHaveValue('1');
  await page.keyboard.press('Enter');
  await expect(page.locator('svg [data-role="explanation"]')).toHaveAttribute('data-explanation-step', 'found-target');
  await expect(page.getByRole('slider', { name: 'Timeline step' })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await audit();
});
