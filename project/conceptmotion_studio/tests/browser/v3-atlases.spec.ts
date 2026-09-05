import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { test, expect, type Page, type TestInfo } from '@playwright/test';

async function audit(page: Page, info: TestInfo, name: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 'no page overflow').toBeLessThanOrEqual(1);
  const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? '')).map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) }))).toEqual([]);
  fs.mkdirSync('qa/v4-screenshots', { recursive: true });
  await page.screenshot({ path: path.join('qa/v4-screenshots', `${name.replace(/^v3-/, 'v4-regression-')}-${info.project.name}.png`), fullPage: true, animations: 'disabled' });
}

test('Algorithm Atlas catalog → semantic steps → reduced motion / export', async ({ page }, info) => {
  const requests: string[] = []; page.on('request', req => requests.push(req.url()));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('http://127.0.0.1:4178');
  await expect(page.getByRole('heading', { name: 'See the invariant.' })).toBeVisible();
  await audit(page, info, 'v3-algorithm-catalog');
  await page.getByRole('searchbox', { name: 'Search concepts' }).fill('Sliding window');
  await page.getByRole('button', { name: /Sliding window: subtract, then add/ }).press('Enter');
  await expect(page.locator('[data-figure-id="algorithm-sliding-window"] svg[data-conceptmotion]')).toBeVisible();
  if (info.project.name.includes('phone')) {
    const canvas = page.getByRole('region', { name: 'Scrollable figure canvas' });
    await expect(canvas).toBeVisible();
    expect(await canvas.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(true);
    await canvas.focus(); await page.keyboard.press('ArrowRight');
    await expect.poll(() => canvas.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
    await canvas.evaluate(node => { node.scrollLeft = 0; });
  }
  await expect(page.getByRole('button', { name: /Play unavailable/ })).toBeDisabled();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.dp-figure-player__caption')).toContainText('Remove 2 and add 2');
  await page.locator('[data-item-id="i1"]').press('Enter');
  await expect(page.getByText('Selected: Index 1', { exact: true })).toBeVisible();
  await page.getByText('Selection details', { exact: true }).click();
  await expect(page.getByText('Selected: i1', { exact: true })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('link', { name: 'Export SVG', exact: true }).click(); expect((await download).suggestedFilename()).toBe('algorithm-sliding-window.svg');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '0');
  await audit(page, info, 'v3-algorithm-scene');
  expect(requests.some(url => /monaco|editor\.worker|json\.worker/i.test(url))).toBe(false);
});

test('Architecture Atlas stage → provider lens → radial / shared workflow and lineage', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.goto('http://127.0.0.1:4179');
  await expect(page.locator('[data-figure-renderer="diagram.flow"] svg[data-conceptmotion]')).toBeVisible();
  await page.getByRole('button', { name: 'Process', exact: true }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Stage Lens · Process' })).toBeVisible();
  await page.getByLabel('Provider', { exact: true }).selectOption('fabric');
  await expect(page.locator('.architecture-current')).toHaveText('Fabric Spark / Dataflow Gen2');
  await expect(page.getByRole('table', { name: 'Stage provider comparison' })).toContainText('Dataform / Managed Spark');
  await page.getByLabel('Layout', { exact: true }).selectOption('radial');
  await expect(page.locator('[data-layout-provider="contract"]')).toBeVisible();
  await page.locator('[data-node-id="store"]').press('Enter');
  await expect(page.getByRole('heading', { name: 'Stage Lens · Store' })).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('link', { name: 'Export SVG' }).click(); expect((await download).suggestedFilename()).toContain('architecture-medallion-fabric-radial');
  await audit(page, info, 'v3-architecture-radial');
  await page.getByLabel('View', { exact: true }).selectOption('workflow'); await expect(page.locator('[data-figure-renderer="workflow.run"] svg[data-conceptmotion]')).toBeVisible();
  await page.getByLabel('View', { exact: true }).selectOption('lineage'); await expect(page.locator('[data-figure-renderer="lineage.model"] svg[data-conceptmotion]')).toBeVisible();
  await expect(page.getByText('SVG export unavailable for this renderer')).toHaveCount(0);
  await audit(page, info, 'v3-architecture-lineage'); expect(errors).toEqual([]);
});
