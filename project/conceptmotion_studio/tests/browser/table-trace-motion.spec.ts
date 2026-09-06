import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Table Trace motion is semantic, editable and reduced-motion safe', async ({ page }) => {
  await page.goto('/#/visual-sandbox');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Visual Sandbox');

  const picker = page.getByLabel('Figure example');
  const traceOptions = await picker.locator('option').evaluateAll(options => options
    .map(option => (option as HTMLOptionElement).value)
    .filter(value => value.startsWith('sandbox-table-trace-')));
  expect(traceOptions).toEqual([
    'sandbox-table-trace-filter',
    'sandbox-table-trace-sort',
    'sandbox-table-trace-group-sum',
    'sandbox-table-trace-pivot',
    'sandbox-table-trace-join',
  ]);

  // Count real browser Web Animations calls rather than inferring motion from
  // static DOM attributes. The renderer still owns deterministic final SVG state.
  await page.evaluate(() => {
    const target = window as typeof window & { __cmMotionCalls?: number };
    target.__cmMotionCalls = 0;
    const original = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      target.__cmMotionCalls = (target.__cmMotionCalls ?? 0) + 1;
      return original.apply(this, args as Parameters<typeof original>);
    };
  });

  await picker.selectOption('sandbox-table-trace-sort');
  const trace = page.locator('[data-role="table-trace"]');
  await expect(trace).toHaveAttribute('data-frame-id', 'reorder');
  await expect(trace).toHaveAttribute('data-motion-enabled', 'true');
  await expect(page.locator('[data-role="trace-motion-token"][data-motion="travel"]')).toHaveCount(3);
  await expect.poll(() => page.evaluate(() => (window as typeof window & { __cmMotionCalls?: number }).__cmMotionCalls ?? 0)).toBeGreaterThan(0);

  await picker.selectOption('sandbox-table-trace-group-sum');
  await expect(page.locator('[data-role="trace-motion-token"][data-motion="converge"]')).toHaveCount(3);
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-role="table-trace"]')).toHaveAttribute('data-frame-id', 'aggregate');
  await expect(page.locator('[data-role="trace-motion-token"][data-motion="converge"]')).toHaveCount(3);

  const reduced = page.getByRole('switch', { name: 'Reduced motion' });
  await reduced.check();
  await picker.selectOption('sandbox-table-trace-join');
  await expect(page.locator('[data-role="table-trace"]')).toHaveAttribute('data-motion-enabled', 'false');
  await expect(page.locator('[data-role="trace-motion-token"]')).toHaveCount(0);
  await expect(page.getByText('Reduced motion: static steps remain available; automatic playback is off.')).toBeVisible();

  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(axe.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical')).toEqual([]);
});
