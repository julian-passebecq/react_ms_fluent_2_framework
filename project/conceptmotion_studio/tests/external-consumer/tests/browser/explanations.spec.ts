import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const examples = ['sql-inner-join', 'sql-left-join', 'sql-grain', 'sql-group', 'sql-window-rank', 'sql-rows-between', 'algorithm-bubble-sort', 'algorithm-stable-sort', 'algorithm-binary-search', 'algorithm-dfs-worklist', 'de-hash', 'de-shuffle', 'de-skew', 'de-repartition', 'de-coalesce', 'de-retry', 'de-backfill'];
async function open(page: Page, id: string, motion: 'reduce' | 'no-preference' = 'reduce') {
  await page.emulateMedia({ reducedMotion: motion });
  await page.goto(`/?explanation=${id}`);
  await expect(page.locator('svg[data-conceptmotion]')).toBeVisible();
  await expect(page.locator('[data-conceptmotion-error], [data-renderer-error="true"]')).toHaveCount(0);
}
async function next(page: Page) { await page.getByRole('button', { name: 'Next', exact: true }).press('Enter'); }
async function audit(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  const axe = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').analyze();
  expect(axe.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')).toEqual([]);
}
async function fits(page: Page, id: string) {
  const overflow = await page.locator('svg[data-conceptmotion]').evaluate(node => {
    const svg = node as SVGSVGElement;
    const box = svg.getBBox();
    const taskBoxes = [...svg.querySelectorAll('[data-node-id]')].flatMap(node => {
      const background = node.querySelector(':scope > rect[data-role="background"]');
      return background ? [{ id: node.getAttribute('data-node-id'), rect: background.getBoundingClientRect() }] : [];
    });
    const nodeCollisions = taskBoxes.flatMap((a, i) => taskBoxes.slice(i + 1).flatMap(b => Math.min(a.rect.right, b.rect.right) > Math.max(a.rect.left, b.rect.left) && Math.min(a.rect.bottom, b.rect.bottom) > Math.max(a.rect.top, b.rect.top) ? [`${a.id}/${b.id}`] : []));
    const breadcrumb = svg.querySelector('[data-role="breadcrumb"]')?.getBoundingClientRect();
    if (breadcrumb) nodeCollisions.push(...taskBoxes.flatMap(task => Math.min(task.rect.right, breadcrumb.right) > Math.max(task.rect.left, breadcrumb.left) && Math.min(task.rect.bottom, breadcrumb.bottom) > Math.max(task.rect.top, breadcrumb.top) ? [`breadcrumb/${task.id}`] : []));
    const collisions = [...svg.querySelectorAll('[data-node-id]')].flatMap(node => {
      const kind = node.querySelector<SVGTextElement>(':scope > text[data-role="kind"]');
      const status = node.querySelector<SVGTextElement>(':scope > text[data-role="status"]');
      if (!kind?.textContent || !status?.textContent) return [];
      const a = kind.getBBox(); const b = status.getBBox();
      return Math.min(a.x + a.width, b.x + b.width) > Math.max(a.x, b.x) && Math.min(a.y + a.height, b.y + b.height) > Math.max(a.y, b.y) ? [node.getAttribute('data-node-id')] : [];
    });
    const labels = [...svg.querySelectorAll<SVGTextElement>('text')].filter(t => getComputedStyle(t).display !== 'none' && !t.closest('[aria-hidden="true"]')).flatMap(t => {
      const parent = t.parentElement;
      const rect = parent?.querySelector<SVGRectElement>(':scope > rect');
      if (!rect || !t.closest('[data-role="collection-item"], [data-role="collection-summary"], [data-role="explanation-code"], [data-role="explanation-state"]')) return [];
      const textBox = t.getBBox(); const rectBox = rect.getBBox();
      return textBox.x + textBox.width > rectBox.x + rectBox.width + 1 ? [t.textContent] : [];
    });
    return { left: -box.x, top: -box.y, right: box.x + box.width - svg.viewBox.baseVal.width, bottom: box.y + box.height - svg.viewBox.baseVal.height, labels, collisions, nodeCollisions };
  });
  expect(overflow.left, `${id}: SVG left edge`).toBeLessThanOrEqual(1);
  expect(overflow.top, `${id}: SVG top edge`).toBeLessThanOrEqual(1);
  expect(overflow.right, `${id}: SVG right edge`).toBeLessThanOrEqual(1);
  expect(overflow.bottom, `${id}: SVG bottom edge`).toBeLessThanOrEqual(1);
  expect(overflow.labels, `${id}: label containment`).toEqual([]);
  expect(overflow.collisions, `${id}: task type / execution status separation`).toEqual([]);
  expect(overflow.nodeCollisions, `${id}: distinct task bounds`).toEqual([]);
}

for (const id of examples) test(`${id}: every real runtime state is readable and keyboard operable`, async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await open(page, id);
  await expect(page.getByRole('button', { name: /^Play unavailable/ })).toBeDisabled();
  const states: string[] = [];
  do {
    states.push((await page.locator('[data-role="explanation"]').getAttribute('data-explanation-step'))!);
    await fits(page, `${id}:${states.length}`);
    if (states.length === 3 && ['sql-left-join', 'sql-group', 'sql-rows-between', 'algorithm-bubble-sort', 'de-shuffle', 'de-backfill'].includes(id)) await page.screenshot({ path: info.outputPath(`${id}-${info.project.name}.png`), fullPage: true, animations: 'disabled' });
    if (await page.getByRole('button', { name: 'Next', exact: true }).isDisabled()) break;
    await next(page);
  } while (states.length < 50);
  expect(states.length).toBeGreaterThan(1);
  expect(new Set(states).size).toBe(states.length);
  if (id === 'sql-left-join') {
    await expect(page.locator('[data-role="result-row"][data-null-extended="true"]')).toHaveAttribute('data-left-row-id', 'o4');
    await expect(page.locator('[data-role="result-row"][data-null-extended="true"]')).toContainText('NULL-EXTENDED');
    await expect(page.locator('[data-role="source-row"][data-side="left"][data-row-id="o4"]')).toBeAttached();
  }
  if (id === 'sql-grain') await expect(page.locator('[data-role="result-row"]')).toHaveCount(5);
  if (id === 'sql-group') {
    await expect(page.locator('[data-role="collection-summary"]')).toHaveCount(3);
    await expect(page.locator('[data-summary-id="total-A"]')).toContainText('SUM = 150');
    await expect(page.locator('[data-summary-id="total-A"]')).toHaveAttribute('data-source-items', 'o1 o2');
    await expect(page.locator('[data-state-key="outputRows"]')).toContainText('3');
  }
  if (id === 'sql-window-rank') {
    await expect(page.locator('[data-role="collection-item"]')).toHaveCount(4);
    await expect(page.locator('[data-role="collection-item"][data-container-id="partition-A"]')).toHaveCount(2);
    await expect(page.locator('[data-item-id="a-new"]')).toContainText('rank 1');
  }
  if (id === 'algorithm-stable-sort') {
    const positions = await page.locator('[data-role="item"]').evaluateAll(nodes => nodes.map(n => ({ value: n.querySelector('[data-role="value"]')!.textContent, x: new DOMMatrix(getComputedStyle(n).transform).e })).sort((a, b) => a.x - b.x));
    expect(positions.map(p => p.value)).toEqual(['1', '2', '3a', '3b']);
  }
  if (id === 'de-skew') {
    await expect(page.locator('[data-role="container"][data-container-id="reduce0"]')).toHaveAttribute('data-load', '5');
    await expect(page.locator('[data-role="container"][data-container-id="reduce1"]')).toHaveAttribute('data-load', '1');
    const widths = await page.locator('[data-role="container"] [data-role="load-bar"]').evaluateAll(nodes => nodes.map(n => Number(n.getAttribute('width'))));
    expect(widths[2]).toBeGreaterThan(widths[3] * 4);
  }
  await audit(page);
  await page.getByRole('button', { name: 'Previous', exact: true }).press('Enter');
  await expect(page.locator('[data-role="explanation"]')).toHaveAttribute('data-explanation-step', states.at(-2)!);
  await page.getByRole('button', { name: 'Reset', exact: true }).press('Enter');
  await expect(page.locator('[data-frame-index]')).toHaveAttribute('data-frame-index', '0');
  await expect(page.locator('[data-role="explanation"]')).toHaveAttribute('data-explanation-step', states[0]);
  if (info.project.name.includes('phone')) {
    const canvas = page.getByRole('region', { name: 'Scrollable figure canvas', exact: true });
    await expect(canvas).toHaveAccessibleDescription(/Swipe or scroll sideways/);
    await canvas.focus(); await page.keyboard.press('ArrowRight');
    await expect.poll(() => canvas.evaluate(el => el.scrollLeft)).toBeGreaterThan(0);
    await expect(page.locator('.dp-figure-player__caption')).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
});

test('pair-by-pair match and emit synchronize source focus, lineage, code and NULL extension', async ({ page }) => {
  await open(page, 'sql-left-join');
  await expect(page.locator('[data-role="result-row"]')).toHaveCount(0);
  await next(page);
  await expect(page.locator('[data-role="source-row"][data-explanation-focused="true"]')).toHaveCount(2);
  await expect(page.locator('[data-code-ref="match"]')).toHaveAttribute('data-focused', 'true');
  await expect(page.locator('[data-code-ref="match"]')).toContainText('LEFT JOIN customers');
  await expect(page.locator('[data-role="result-row"]')).toHaveCount(0);
  await next(page);
  await expect(page.locator('[data-role="result-row"]')).toHaveCount(1);
  await expect(page.locator('[data-role="lineage"][data-focused="true"]')).toHaveCount(2);
  await expect(page.locator('[data-code-ref="emit"]')).toHaveAttribute('data-focused', 'true');
  await expect(page.locator('[data-state-key="emitted"]')).toContainText('1');
  const row = page.locator('[data-role="result-row"]').first();
  await row.evaluate(el => el.setAttribute('data-proof-continuity', 'retained'));
  for (let i = 0; i < 6; i++) await next(page);
  await expect(page.locator('[data-proof-continuity]')).toHaveCount(1);
  await expect(page.locator('[data-code-ref="null"]')).toHaveAttribute('data-focused', 'true');
  await expect(page.locator('[data-role="lineage"][data-focused="true"]')).toHaveCount(1);
});

for (const [id, selector, skip, code] of [
  ['algorithm-bubble-sort', '[data-item-id="i0"]', 0, 'swap'],
  ['algorithm-stable-sort', '[data-item-id="i0"]', 1, 'shift'],
  ['de-shuffle', '[data-item-id="r1"]', 1, 'move'],
  ['sql-group', '[data-item-id="o1"]', 0, 'group'],
  ['sql-rows-between', '[data-role="window-frame"]', 1, 'frame'],
] as const) test(`${id}: the same item physically travels between states`, async ({ page }) => {
  await open(page, id, 'no-preference');
  for (let i = 0; i < skip; i++) await next(page);
  const before = await page.locator(selector).evaluate(node => {
    node.setAttribute('data-proof-continuity', 'retained');
    const matrix = new DOMMatrix(getComputedStyle(node).transform);
    return { x: matrix.e, y: matrix.f };
  });
  const sample = await page.evaluate(async ({ selector }) => {
    const item = document.querySelector(selector)!;
    (document.querySelector('button[aria-label="Next"]') as HTMLButtonElement).click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const transition = item.getAnimations().find(a => a instanceof CSSTransition && a.transitionProperty === 'transform');
    if (transition) { transition.pause(); transition.currentTime = Number(transition.effect!.getComputedTiming().duration) / 2; }
    const matrix = new DOMMatrix(getComputedStyle(item).transform);
    const result = { x: matrix.e, y: matrix.f, same: item === document.querySelector(selector), target: item.getAttribute('transform'), animated: Boolean(transition) };
    transition?.play();
    return result;
  }, { selector });
  expect(sample.same).toBe(true);
  expect(sample.animated).toBe(true);
  await expect(page.locator(selector)).toHaveAttribute('data-proof-continuity', 'retained');
  const target = sample.target!.match(/translate\(([-\d.]+) ([-\d.]+)\)/)!;
  const end = { x: Number(target[1]), y: Number(target[2]) };
  expect(end).not.toEqual(before);
  // A real intermediate CSS transform, not just rewritten membership attributes.
  const distance = (p: { x: number; y: number }) => Math.hypot(p.x - before.x, p.y - before.y);
  expect(distance(sample)).toBeLessThan(distance(end));
  expect(distance(sample)).toBeGreaterThan(0);
  await expect.poll(async () => page.locator(selector).evaluate(el => ({ x: new DOMMatrix(getComputedStyle(el).transform).e, y: new DOMMatrix(getComputedStyle(el).transform).f })) ).toEqual(end);
  await expect(page.locator(`[data-code-ref="${code}"]`)).toHaveAttribute('data-focused', 'true');
  if (id === 'algorithm-bubble-sort') await expect(page.locator('[data-state-key="swaps"]')).toContainText('1');
  if (id === 'de-shuffle') await expect(page.locator(selector)).toHaveAttribute('data-container-id', 'reduce0');
  await page.getByRole('button', { name: 'Previous', exact: true }).press('Enter');
  await expect(page.locator(selector)).toHaveAttribute('transform', `translate(${before.x} ${before.y})`);
  await page.getByRole('button', { name: 'Play', exact: true }).press('Enter');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await expect.poll(() => page.locator('[data-frame-index]').getAttribute('data-frame-index')).not.toBe(String(skip));
  await page.getByRole('button', { name: 'Pause', exact: true }).press('Enter');
  const paused = await page.locator('[data-frame-index]').getAttribute('data-frame-index');
  await page.waitForTimeout(1300);
  await expect(page.locator('[data-frame-index]')).toHaveAttribute('data-frame-index', paused!);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator(selector)).toHaveCSS('transition-property', 'none');
  expect(await page.locator(selector).evaluate(el => el.getAnimations().length)).toBe(0);
  await audit(page);
});

test('a new join result travels from its source row into the result column', async ({ page }) => {
  await open(page, 'sql-inner-join', 'no-preference');
  await next(page);
  const sample = await page.evaluate(async () => {
    (document.querySelector('button[aria-label="Next"]') as HTMLButtonElement).click();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const row = document.querySelector('[data-role="result-row"]')!;
    const transition = row.getAnimations().find(a => a instanceof CSSTransition && a.transitionProperty === 'transform');
    if (transition) { transition.pause(); transition.currentTime = Number(transition.effect!.getComputedTiming().duration) / 2; }
    const result = { x: new DOMMatrix(getComputedStyle(row).transform).e, target: Number(row.getAttribute('transform')!.match(/translate\(([-\d.]+)/)![1]), animated: Boolean(transition) };
    transition?.play();
    return result;
  });
  expect(sample.x).toBeGreaterThan(20);
  expect(sample.animated).toBe(true);
  expect(sample.x).toBeLessThan(sample.target);
  await expect(page.locator('[data-code-ref="emit"]')).toHaveAttribute('data-focused', 'true');
});

test('ROWS frame moves with the current row and recomputes its teaching sum', async ({ page }) => {
  await open(page, 'sql-rows-between');
  await next(page);
  const overlay = page.locator('[data-role="window-frame"]');
  const before = await overlay.getAttribute('transform');
  await next(page);
  await expect(overlay).not.toHaveAttribute('transform', before!);
  await expect(overlay).toHaveAttribute('data-member-row-ids', 'r2 r3');
  await expect(page.locator('[data-current-row="true"]')).toHaveAttribute('data-row-id', 'r3');
  await expect(page.locator('[data-state-key="sum"]')).toContainText('50');
  await expect(page.locator('[data-role="row"]')).toHaveCount(5);
});

test('WorkflowSpec retry, fan-out/fan-in and backfill keep task state and attempt scope', async ({ page }) => {
  await open(page, 'de-backfill');
  await next(page);
  await expect(page.locator('[data-node-id="day1"]')).toHaveAttribute('data-status', 'running');
  await expect(page.locator('[data-node-id="day2"]')).toHaveAttribute('data-status', 'running');
  const positions = await page.locator('[data-node-id]').evaluateAll(nodes => Object.fromEntries(nodes.map(node => { const box = node.getBoundingClientRect(); return [node.getAttribute('data-node-id'), { x: box.x, y: box.y }]; })));
  expect(positions.start.x).toBeLessThan(positions.day1.x);
  expect(positions.day1.x).toBeLessThan(positions.publish.x);
  expect(positions.day1.y).not.toBe(positions.day2.y);
  await next(page);
  await expect(page.locator('[data-node-id="day2"]')).toHaveAttribute('data-status', 'retrying');
  await expect(page.locator('[data-node-id="publish"]')).toHaveAttribute('data-status', 'pending');
  await expect(page.locator('[data-state-key="attempt"]')).toContainText('2');
  await next(page);
  await expect(page.locator('[data-node-id="publish"]')).toHaveAttribute('data-status', 'running');
  await expect(page.locator('[data-node-id="day1"]')).toHaveAttribute('data-status', 'success');
  await expect(page.locator('[data-node-id="day2"]')).toHaveAttribute('data-status', 'success');
});
