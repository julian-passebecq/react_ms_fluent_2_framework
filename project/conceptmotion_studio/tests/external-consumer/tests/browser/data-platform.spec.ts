import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const examples = ['sales-star-schema', 'sales-column-lineage', 'sales-kpi-lineage', 'medallion-asset-lineage', 'lakehouse-conceptual', 'lakehouse-fabric', 'lakehouse-databricks', 'lakehouse-gcp', 'lakehouse-azure', 'backfill-dependencies', 'backfill-workflow-topology', 'de-backfill'];

async function audit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
  expect(axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
  await expect(page.locator('[data-conceptmotion-error], [data-renderer-error="true"]')).toHaveCount(0);
}

async function fit(page: Page) {
  for (const svg of await page.locator('svg[data-conceptmotion]').all()) {
    const result = await svg.evaluate(element => {
      const svg = element as SVGSVGElement;
      const box = svg.getBBox();
      const cards = [...svg.querySelectorAll<SVGRectElement>('[data-role="asset-control"] > rect[data-role="background"]')].map(rect => rect.getBoundingClientRect());
      const collisions = cards.flatMap((a, i) => cards.slice(i + 1).filter(b => Math.min(a.right, b.right) > Math.max(a.left, b.left) + 1 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 1));
      const labels = [...svg.querySelectorAll<SVGTextElement>('[data-role="asset"] text')].flatMap(text => {
        const card = text.closest('[data-role="asset"]')!.querySelector('[data-role="background"]')!.getBoundingClientRect();
        const label = text.getBoundingClientRect();
        return text.textContent && (label.left < card.left - 1 || label.right > card.right + 1 || label.top < card.top - 1 || label.bottom > card.bottom + 1) ? [text.textContent] : [];
      });
      return { left: -box.x, top: -box.y, right: box.x + box.width - svg.viewBox.baseVal.width, bottom: box.y + box.height - svg.viewBox.baseVal.height, collisions: collisions.length, labels };
    });
    for (const side of ['left', 'top', 'right', 'bottom'] as const) expect(result[side], `SVG ${side}`).toBeLessThanOrEqual(1);
    expect(result.collisions).toBe(0);
    expect(result.labels).toEqual([]);
  }
}

for (const id of examples) test(`data platform ${id}: production Figure and readable semantic labels`, async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/?platform=${id}`);
  await expect(page.locator('svg[data-conceptmotion]')).toBeVisible();
  await fit(page);
  if (id === 'sales-star-schema') {
    await expect(page.locator('[data-asset-id]')).toHaveCount(4);
    await expect(page.locator('[data-role="grain"]').filter({ hasText: 'One row per order line' })).toHaveCount(1);
    await expect(page.locator('[data-role="role"]').filter({ hasText: /^FK$/ })).toHaveCount(3);
    await expect(page.locator('[data-role="role"]').filter({ hasText: /^PK$/ })).toHaveCount(4);
    await expect(page.locator('[data-role="filter-direction"]').filter({ hasText: 'filter ←' })).toHaveCount(3);
    const key = page.locator('[data-asset-id="gold.fact_sales"] [data-column-id="sales_key"]');
    await key.focus(); await key.press('Enter');
    await expect(key).toHaveAttribute('aria-pressed', 'true');
  }
  if (id === 'sales-column-lineage') {
    await expect(page.locator('[data-relation-id="clean-amount"]')).toHaveAttribute('data-source-port', 'lineage-port:raw.orders:column:amount');
    await expect(page.locator('[data-relation-id="publish-amount_clean"]')).toHaveAttribute('data-target-port', 'lineage-port:gold.fact_sales:column:sales_amount');
    await expect(page.locator('[data-relation-id="derive-date-key"]')).toHaveAccessibleName('CAST(ordered_at AS DATE)');
  }
  if (id === 'sales-kpi-lineage') await expect(page.locator('[data-relation-id="bind-revenue-kpi"]')).toHaveAttribute('data-target-port', 'lineage-port:report.sales:column:revenue-kpi');
  if (id.startsWith('lakehouse-')) {
    for (const role of ['source', 'move', 'store', 'process', 'model', 'serve', 'operate', 'govern']) await expect(page.locator(`[data-node-id="${role}"]`)).toBeAttached();
  }
  if (id === 'de-backfill') {
    const next = page.getByRole('button', { name: 'Next', exact: true });
    await next.press('Enter'); await next.press('Enter');
    await expect(page.locator('[data-node-id="day2"]')).toHaveAttribute('data-status', 'retrying');
    await expect(page.locator('[data-node-id="publish"]')).toHaveAttribute('data-status', 'pending');
    await next.press('Enter');
    await expect(page.locator('[data-node-id="publish"]')).toHaveAttribute('data-status', 'running');
  }
  await audit(page);
  await page.screenshot({ path: info.outputPath(`data-platform-${id}-${info.project.name}.png`), fullPage: true, animations: 'disabled' });
  if (info.project.name === 'phone') {
    const canvas = page.getByRole('region', { name: 'Scrollable figure canvas', exact: true });
    await expect(canvas).toHaveAccessibleDescription(/Swipe or scroll sideways/);
    await canvas.focus(); await page.keyboard.press('ArrowRight');
    await expect.poll(() => canvas.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

for (const lesson of ['lesson', 'topology-and-run']) test(`data platform ${lesson}: two independent sibling Figure surfaces`, async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/?platform=${lesson}`);
  await expect(page.locator('svg[data-conceptmotion]')).toHaveCount(2);
  await fit(page);
  const aria = await page.locator('svg[data-conceptmotion]').evaluateAll(nodes => nodes.map(node => node.getAttribute('aria-labelledby')));
  expect(new Set(aria).size).toBe(2);
  if (lesson === 'lesson') {
    const key = page.locator('[data-asset-id="gold.fact_sales"] [data-column-id="sales_key"]');
    await key.press('Enter');
    await expect(key).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.dp-figure-player').nth(1).locator('[aria-pressed="true"]')).toHaveCount(0);
  } else {
    const diagram = page.locator('.dp-figure-player').first();
    const before = await diagram.locator('svg').innerHTML();
    await page.getByRole('button', { name: 'Next', exact: true }).press('Enter');
    await expect(page.locator('.dp-figure-player').nth(1)).toHaveAttribute('data-frame-index', '1');
    expect(await diagram.locator('svg').innerHTML()).toBe(before);
  }
  await page.getByText('Reasoning guide', { exact: true }).press('Enter');
  await expect(page.locator('details[open]')).toContainText(lesson === 'lesson' ? 'Product filters' : 'Publish remains');
  await audit(page);
  await page.screenshot({ path: info.outputPath(`data-platform-${lesson}-${info.project.name}.png`), fullPage: true, animations: 'disabled' });
  expect(errors).toEqual([]);
});
