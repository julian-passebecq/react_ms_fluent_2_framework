import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const refined = ['sql-filter', 'sql-inner-join', 'sql-left-join', 'sql-grain', 'sql-group', 'sql-window-rank', 'algorithm-binary-search', 'algorithm-sliding-window', 'algorithm-two-pointers', 'algorithm-prefix-sum', 'de-retry'];
async function assertNodeTextFits(page: Page) {
  const overflow = await page.locator('[data-semantic-node="true"]').evaluateAll(nodes => nodes.flatMap(node => {
    const width = Number(node.querySelector('[data-role="background"]')!.getAttribute('width'));
    return [...node.querySelectorAll<SVGGraphicsElement>('text')].filter(text => { const box = text.getBBox(); return box.x < -1 || box.x + box.width > width + 1; }).map(text => `${node.getAttribute('data-node-id')}: ${text.textContent}`);
  }));
  expect(overflow, 'semantic text stays inside each node card').toEqual([]);
}
async function audit(page: Page, info: TestInfo, name: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.filter(issue => ['serious', 'critical'].includes(issue.impact ?? '')).map(issue => ({ id: issue.id, targets: issue.nodes.map(node => node.target) }))).toEqual([]);
  fs.mkdirSync('qa/v4-screenshots', { recursive: true });
  await page.screenshot({ path: `qa/v4-screenshots/${name}-${info.project.name}.png`, fullPage: true, animations: 'disabled' });
}

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('V4 eleven scenes synchronize operation, entity and state without clipped frames', async ({ page }, info) => {
  test.setTimeout(150_000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  let frameCount = 0;
  for (const id of refined) {
    await page.goto(`http://127.0.0.1:4178/#/concept/${id}`);
    const figure = page.locator(`[data-figure-id="${id}"]`);
    await expect(figure).toHaveAttribute('data-presentation-size', 'compact');
    const svg = figure.locator('svg[data-conceptmotion]');
    await expect(svg.locator('[data-role="explanation"]')).toBeVisible();
    const viewport = await svg.getAttribute('viewBox');
    const seen: string[] = [];
    while (true) {
      frameCount++;
      seen.push((await svg.locator('[data-role="explanation"]').getAttribute('data-explanation-step'))!);
      await expect(svg.locator('[data-role="explanation-code"][data-focused="true"]').first()).toBeVisible();
      await expect(svg.locator('[data-role="explanation-state"][data-focused="true"]').first()).toBeAttached();
      await expect(svg.locator('[data-explanation-focused="true"]').first()).toBeAttached();
      const box = await svg.evaluate(element => { const svg = element as SVGSVGElement; const bounds = svg.getBBox(); return { bottom: bounds.y + bounds.height, right: bounds.x + bounds.width, height: svg.viewBox.baseVal.height, width: svg.viewBox.baseVal.width }; });
      expect(box.bottom, `${id} step ${seen.length} bottom`).toBeLessThanOrEqual(box.height + 1);
      expect(box.right, `${id} step ${seen.length} right`).toBeLessThanOrEqual(box.width + 1);
      await expect(svg).toHaveAttribute('viewBox', viewport!);
      const next = figure.getByRole('button', { name: 'Next', exact: true });
      if (!(await next.isEnabled())) break;
      await next.click();
    }
    expect(new Set(seen).size).toBe(seen.length);
    if (['sql-window-rank', 'algorithm-binary-search', 'de-retry'].includes(id)) {
      await figure.getByRole('button', { name: 'Reset', exact: true }).click();
      await figure.scrollIntoViewIfNeeded();
      await audit(page, info, `v4-${id}`);
    }
  }
  expect(frameCount).toBe(34);
  expect(errors).toEqual([]);
});

test('V4 Architecture uses semantic icons and keyboard stage paths in both layouts', async ({ page }, info) => {
  await page.goto('http://127.0.0.1:4179');
  await page.getByLabel('Provider', { exact: true }).selectOption('fabric');
  await page.getByRole('button', { name: 'Process', exact: true }).press('Enter');
  const svg = page.locator('svg[data-conceptmotion]');
  await expect(svg.locator('[data-semantic-node="true"]')).toHaveCount(8);
  await expect(svg.locator('[data-role="port"]')).toHaveCount(0);
  await expect(svg.locator('[data-role="edge"][data-active="true"]')).toHaveCount(3);
  await expect(svg.locator('[data-node-id="process"] [data-role="icon"]')).toHaveAttribute('data-icon-resolved', 'data.process');
  await expect(svg.locator('[data-node-id="process"] [data-role="label"]')).toHaveAttribute('font-size', '14');
  await expect(svg.locator('[data-node-id="process"] [data-role="label"]')).toContainText('Fabric Spark');
  await assertNodeTextFits(page);
  await expect(page.locator('.architecture-source .dp-content-details')).not.toHaveAttribute('open');
  await audit(page, info, 'v4-architecture-layered');
  await page.locator('.architecture-canvas').screenshot({ path: `qa/v4-screenshots/v4-architecture-layered-figure-${info.project.name}.png`, animations: 'disabled' });
  await page.getByLabel('Layout', { exact: true }).selectOption('radial');
  expect(await svg.evaluate(element => (element as SVGSVGElement).viewBox.baseVal.height)).toBeGreaterThan(640);
  await svg.locator('[data-node-id="govern"]').press('Enter');
  await expect(page.getByRole('heading', { name: 'Stage Lens · Govern' })).toBeVisible();
  await expect(svg.locator('[data-edge-id="govern-store"][data-active="true"]').first()).toBeVisible();
  await assertNodeTextFits(page);
  await audit(page, info, 'v4-architecture-radial');
});

test('V4 Galaxy categories, public statuses and selected connection remain shared and accessible', async ({ page }, info) => {
  await page.goto('http://127.0.0.1:4180/#/projects');
  await page.getByRole('button', { name: 'Galaxy', exact: true }).click();
  const svg = page.locator('svg[data-conceptmotion]');
  await expect(svg.locator('[data-semantic-node="true"]')).toHaveCount(11);
  await expect(svg.locator('[data-role="category"]')).toHaveCount(10);
  await expect(svg.locator('[data-role="group"]')).toHaveCount(0);
  await expect(svg.locator('[data-role="port"]')).toHaveCount(0);
  await expect(svg.locator('[data-public-status="active"]')).toHaveCount(3);
  const bounds = await svg.evaluate(element => { const svg = element as SVGSVGElement; const box = svg.getBBox(); return { bottom: box.y + box.height, height: svg.viewBox.baseVal.height, right: box.x + box.width, width: svg.viewBox.baseVal.width }; });
  expect(bounds.height).toBeGreaterThan(640); expect(bounds.bottom).toBeLessThanOrEqual(bounds.height + 1); expect(bounds.right).toBeLessThanOrEqual(bounds.width + 1);
  await expect(page.getByLabel('Galaxy legend')).toContainText('Learning 6');
  await expect(page.getByLabel('Galaxy legend')).toContainText('Tools 2');
  await page.getByLabel('Select galaxy project').selectOption('project.formation');
  await expect(svg.locator('[data-role="edge"][data-edge-id="hub:project.formation"]')).toHaveAttribute('data-active', 'true');
  await expect(page.getByTestId('pilot-project-inspector')).toContainText('Formation');
  await assertNodeTextFits(page);
  const download = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Export SVG', exact: true }).click();
  const exportFile = await download;
  expect(fs.readFileSync((await exportFile.path())!, 'utf8')).toContain('data-public-status');
  await audit(page, info, 'v4-pilot-galaxy');
  await svg.screenshot({ path: `qa/v4-screenshots/v4-pilot-galaxy-figure-${info.project.name}.png`, animations: 'disabled', style: '.dp-top-bar { visibility: hidden !important; }' });
});
