import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import fs from 'node:fs';

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('V4 Figure sizes retain semantic content, readable panning and deterministic export', async ({ page }, info) => {
  await page.goto('/#/visual-sandbox');
  await page.getByLabel('Figure example', { exact: true }).selectOption('algorithm-binary-search');
  await page.getByLabel('Developer details', { exact: true }).uncheck();
  const figure = page.locator('[data-figure-id="algorithm-binary-search"]');
  const svg = figure.locator('svg[data-conceptmotion]');
  const heights: number[] = [];
  for (const size of ['compact', 'regular', 'expanded']) {
    await page.getByLabel('Figure presentation', { exact: true }).selectOption(size);
    await expect(figure).toHaveAttribute('data-presentation-size', size);
    const firstBounds = await svg.evaluate(element => {
      const node = element as SVGSVGElement;
      const content = node.getBBox(); const viewport = node.viewBox.baseVal;
      return { height: viewport.height, bottom: content.y + content.height, right: content.x + content.width, width: viewport.width };
    });
    expect(firstBounds.bottom).toBeLessThanOrEqual(firstBounds.height + 1);
    expect(firstBounds.right).toBeLessThanOrEqual(firstBounds.width + 1);
    heights.push(firstBounds.height);
    const next = figure.getByRole('button', { name: 'Next', exact: true });
    while (await next.isEnabled()) {
      await next.click();
      await expect(svg).toHaveAttribute('viewBox', `0 0 960 ${firstBounds.height}`);
      const bottom = await svg.evaluate(element => { const bounds = (element as SVGSVGElement).getBBox(); return bounds.y + bounds.height; });
      expect(bottom).toBeLessThanOrEqual(firstBounds.height + 1);
    }
    await figure.getByRole('button', { name: 'Reset', exact: true }).click();
    const snapshots: string[] = [];
    for (let index = 0; index < 2; index++) {
      const download = page.waitForEvent('download');
      await figure.getByRole('link', { name: 'Export SVG', exact: true }).click();
      const artifact = await download;
      snapshots.push(fs.readFileSync((await artifact.path())!, 'utf8'));
    }
    expect(snapshots[0]).toEqual(snapshots[1]);
    expect(snapshots[0]).toContain('data-code-ref');
    expect(snapshots[0]).not.toContain('<script');
  }
  expect(heights[0]).toBeLessThan(heights[1]); expect(heights[1]).toBeLessThan(heights[2]);
  const details = figure.locator('.dp-content-details');
  await expect(details).not.toHaveAttribute('open');
  await expect(figure.locator('.dp-figure-frame__header')).not.toContainText('Source IDs');
  await details.getByText('Details & sources', { exact: true }).press('Enter');
  await expect(details).toHaveAttribute('open');
  await expect(details).toContainText('Source IDs');
  // Both a phone and the desktop split-pane preview need native-size labels.
  const canvas = figure.getByRole('region', { name: 'Scrollable figure canvas' });
  await expect(canvas).toHaveAttribute('tabindex', '0');
  expect(await svg.evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThanOrEqual(959);
  await canvas.focus(); await page.keyboard.press('ArrowRight');
  await expect.poll(() => canvas.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await canvas.evaluate(element => { element.scrollLeft = 0; });
  const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  fs.mkdirSync('qa/v4-screenshots', { recursive: true });
  await page.screenshot({ path: `qa/v4-screenshots/v4-figure-presentation-${info.project.name}.png`, fullPage: true, animations: 'disabled' });
});

test('V4 authoring distinguishes valid unapplied edits from the applied preview', async ({ page }) => {
  await page.goto('/#/visual-sandbox');
  await page.getByLabel('Figure example', { exact: true }).selectOption('algorithm-scan');
  const editor = page.getByRole('textbox', { name: 'Figure JSON spec', exact: true });
  await expect(editor).toBeVisible();
  await editor.focus();
  await page.keyboard.press('ControlOrMeta+End');
  await page.keyboard.insertText(' ');
  await expect(page.getByTestId('sandbox-validation')).toHaveAttribute('data-authoring-state', 'valid-pending');
  await expect(page.getByTestId('sandbox-validation')).toContainText('preview still shows the last applied spec');
  await page.getByRole('button', { name: 'Apply valid spec', exact: true }).click();
  await expect(page.getByTestId('sandbox-validation')).toHaveAttribute('data-authoring-state', 'applied');
  await editor.focus(); await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.insertText('{');
  await expect(page.getByTestId('sandbox-validation')).toHaveAttribute('data-authoring-state', 'invalid');
  await expect(page.locator('[data-figure-id="algorithm-scan"]')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply valid spec', exact: true })).toBeDisabled();
  await page.getByText('Authoring help', { exact: true }).click();
  await expect(page.getByRole('link', { name: 'Authoring documentation', exact: true })).toHaveAttribute('href', /AUTHORING_DX\.md$/);
  await expect(page.getByRole('link', { name: 'Storybook examples (local server)', exact: true })).toHaveAttribute('href', /v4-approved-compositions--compact-figure/);
});
