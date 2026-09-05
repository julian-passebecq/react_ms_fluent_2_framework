import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function audit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
  expect(result.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical')).toEqual([]);
}
async function open(page: Page, mode = '') {
  await page.goto(mode ? `/?mode=${mode}` : '/');
  await page.getByRole('button', { name: 'Explore story', exact: true }).click();
}
const pointX = (page: Page) => page.locator('[data-story-point]').evaluate(node => new DOMMatrix(getComputedStyle(node).transform).m41);

test('independent story plays, pauses, steps and resets with real motion and generic metadata', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('main')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Explore story', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  const svg = page.locator('svg[data-external-story]');
  const play = page.getByRole('button', { name: 'Play', exact: true });
  await expect(svg).toHaveAttribute('data-active-step', '0');
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.waitForTimeout(1350); // Beyond one playback interval: autoplay starts off.
  await expect(svg).toHaveAttribute('data-active-step', '0');
  await expect(page.locator('svg[data-conceptmotion]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Export SVG', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'One point, three positions' })).toBeVisible();
  for (const text of ['Follow a point from start to finish.', 'Each step keeps the same point and changes its position.']) await expect(page.getByText(text, { exact: true })).toBeVisible();
  const attribution = page.locator('.dp-source-note');
  await expect(attribution).toBeVisible();
  await expect(attribution).toContainText('Consumer-authored demonstration.');
  await expect(attribution).toContainText('Positions are illustrative.');
  const dimensions = await svg.boundingBox();
  expect(dimensions!.width).toBeLessThanOrEqual(info.project.name === 'phone' ? 390 : 1440);
  expect(dimensions!.height).toBeLessThanOrEqual(241);
  await page.keyboard.press('Tab');
  await expect(play).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeFocused();
  const point = await page.locator('[data-story-point]').elementHandle();
  await page.keyboard.press('Enter');
  await expect(svg).toHaveAttribute('data-active-step', '1');
  await expect(page.locator('.dp-figure-player__caption')).toHaveText('The same point moves to the middle.');
  // Freeze the actual CSS transition at its midpoint, then inspect rendered geometry.
  await expect.poll(() => page.locator('[data-story-point]').evaluate(node => node.getAnimations().length)).toBeGreaterThan(0);
  const middle = await page.locator('[data-story-point]').evaluate(node => {
    const animation = node.getAnimations()[0]; animation.pause(); animation.currentTime = 200;
    return new DOMMatrix(getComputedStyle(node).transform).m41;
  });
  expect(middle).toBeGreaterThan(40); expect(middle).toBeLessThan(160);
  await page.locator('[data-story-point]').evaluate(node => node.getAnimations().forEach(animation => animation.finish()));
  expect(await pointX(page)).toBe(160);
  expect(await point!.evaluate(node => node === document.querySelector('[data-story-point]'))).toBe(true);
  await audit(page);
  await page.screenshot({ path: info.outputPath(`external-story-${info.project.name}.png`), fullPage: true });
  await page.getByRole('button', { name: 'Previous', exact: true }).press('Enter');
  await expect(svg).toHaveAttribute('data-active-step', '0');
  await play.click();
  await expect(svg).toHaveAttribute('data-active-step', '1');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.waitForTimeout(1350);
  await expect(svg).toHaveAttribute('data-active-step', '1');
  await play.click();
  await expect(svg).toHaveAttribute('data-active-step', '2');
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await expect(page.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(svg).toHaveAttribute('data-active-step', '0');
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('slider', { name: 'Timeline step' }).focus();
  await page.keyboard.press('End');
  await expect(svg).toHaveAttribute('data-active-step', '2');
  expect(errors).toEqual([]);
});

test('reduced motion reaches the adapter and stops playback while retaining static steps', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await open(page);
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const svg = page.locator('svg[data-external-story]');
  await expect(svg).toHaveAttribute('data-motion', 'true');
  await expect(page.getByRole('button', { name: /^Play unavailable/ })).toBeDisabled();
  const frame = await svg.getAttribute('data-active-step');
  await page.waitForTimeout(1350);
  await expect(svg).toHaveAttribute('data-active-step', frame!);
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await page.getByRole('button', { name: 'Next', exact: true }).press('Enter');
  expect(await pointX(page)).toBe(160);
  expect(await page.locator('[data-story-point]').evaluate(node => node.getAnimations().length)).toBe(0);
  await expect(page.locator('.dp-figure-player__caption')).toHaveText('The same point moves to the middle.');
  await page.getByRole('button', { name: 'Previous', exact: true }).click();
  expect(await pointX(page)).toBe(40);
  await audit(page); expect(errors).toEqual([]);
});

test('missing renderer, invalid payload and unsupported steps retain an accessible fallback', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const mode of ['missing', 'invalid', 'unsupported']) {
    await open(page, mode);
    await expect(page.getByRole('alert')).toContainText('Figure unavailable.');
    await expect(page.getByRole('alert')).toContainText(mode === 'missing' ? 'No adapter is registered' : 'Unsupported demo payload or step shape.');
    await expect(page.locator('svg[data-external-story]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next', exact: true })).toHaveCount(0);
    await page.getByText('Text alternative', { exact: true }).click();
    await expect(page.getByText('A point moves from left to middle to right across three steps.', { exact: true })).toBeVisible();
    await audit(page);
  }
  expect(errors).toEqual([]);
});

test('FigureView renders the reduced static state and Code stays lazy until requested', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await open(page, 'view');
  await expect(page.locator('svg[data-external-story]')).toHaveAttribute('data-active-step', '2');
  expect(await pointX(page)).toBe(280);
  expect(requests.some(url => /MonacoSurfaces/.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Show code', exact: true }).click();
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  expect(requests.some(url => /MonacoSurfaces/.test(url))).toBe(true);
  await audit(page); expect(errors).toEqual([]);
});
