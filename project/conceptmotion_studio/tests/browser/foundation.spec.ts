import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const evidenceDir = path.resolve('qa/screenshots');

async function expectNoPageOverflow(page: Page) {
  await expect.poll(() => page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))).toEqual(expect.objectContaining({
    client: expect.any(Number),
    scroll: expect.any(Number),
  }));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'page-level horizontal overflow').toBeLessThanOrEqual(1);
}

async function saveEvidence(page: Page, testInfo: TestInfo, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, `${name}-${testInfo.project.name}.png`),
    fullPage: true,
    animations: 'disabled',
  });
}

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    // Fluent's intentionally focusable Tabster sentinels are aria-hidden focus-management infrastructure.
    .exclude('[data-tabster-dummy]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious.map(({ id, impact, help, nodes }) => ({ id, impact, help, targets: nodes.map((node) => node.target) }))).toEqual([]);
}

async function replaceMonacoText(page: Page, editorLabel: string, value: string) {
  const editContext = page.getByRole('textbox', { name: editorLabel });
  await editContext.evaluate((element) => (element as HTMLElement).focus());
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText(value);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('catalog, semantic table and all explainer families render', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/');
  await expect(page.getByTestId('catalog-page')).toBeVisible();
  await expect.poll(() => page.locator('.dp-app-shell__body').evaluate((element) => getComputedStyle(element).display)).toBe('grid');
  await expect(page.getByRole('heading', { name: '15 surfaces' })).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeViolations(page);
  await saveEvidence(page, testInfo, 'catalog');

  await page.getByTestId('nav-workbench').click();
  await expect(page).toHaveURL(/#\/workbench$/);
  await expect(page.locator('main')).toBeFocused();
  await expect(page.getByTestId('table-scene').locator('svg')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('FILTER status = late', { exact: true }).first()).toBeVisible();
  await page.getByLabel('Timeline step').fill('2');
  await expect(page.getByText('3 of 3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('button', { name: /Play unavailable while reduced motion/i })).toBeDisabled();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  await expect(page.getByText('1 of 3', { exact: true })).toBeVisible();
  await expect(page.getByText('Reduced motion · step mode')).toBeVisible();
  await expectNoSeriousAxeViolations(page);
  await expect(page.getByTestId('table-scene')).toHaveScreenshot(`table-scene-${testInfo.project.name}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.01 });

  await page.getByTestId('nav-explainers').click();
  await expect(page.getByTestId('explainers-page')).toBeVisible();
  await page.getByRole('tab', { name: 'Loop + state' }).click();
  for (let index = 0; index < 4; index += 1) await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('5 of 5', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Regression' }).click();
  await expect(page.getByLabel('Regression slope')).toBeVisible();
  await page.getByRole('tab', { name: 'Data flow' }).click();
  await expect(page.getByTestId('explainer-pipeline').locator('svg')).toBeVisible();
  await page.getByRole('tab', { name: 'Data model' }).click();
  await expect(page.getByTestId('explainer-model').locator('svg')).toBeVisible();
  await page.getByRole('tab', { name: 'Column lineage' }).click();
  await expect(page.getByTestId('explainer-column-lineage').locator('svg')).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeViolations(page);
  expect(runtimeErrors).toEqual([]);
});

test('workflow presets, run state, selection and spec validation stay synchronized', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/#/workflow');
  await expect(page.getByTestId('workflow-scene').locator('svg')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText(/RUNNING 1/i)).toBeVisible();

  const publishNode = page.locator('[data-node-id="publish"]');
  await publishNode.focus();
  await expect(publishNode).toBeFocused();
  await publishNode.press('Enter');
  await expect(page.getByRole('heading', { name: 'Publish gold' })).toBeVisible();

  const preset = page.getByRole('combobox', { name: 'Presentation preset' });
  await preset.press('ArrowDown');
  await preset.press('ArrowDown');
  await preset.press('Enter');
  await preset.press('Escape');
  await expect(page.getByRole('heading', { name: /Fabric \/ ADF · synthetic run/ })).toBeVisible();
  await preset.press('ArrowDown');
  await preset.press('ArrowDown');
  await preset.press('Enter');
  await preset.press('Escape');
  await expect(page.getByRole('heading', { name: /Lakeflow · synthetic run/ })).toBeVisible();

  await page.getByRole('tab', { name: 'Spec playground' }).click();
  await expect(page.getByText('Valid WorkflowSpec. Live preview updated.')).toBeVisible();
  await replaceMonacoText(page, 'WorkflowSpec JSON editor', '{}');
  await expect(page.getByText(/validation issues?/i).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: /Lakeflow · topology/ })).toBeVisible();
  await page.getByTestId('spec-playground').getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByText('Valid WorkflowSpec. Live preview updated.')).toBeVisible();

  await expectNoPageOverflow(page);
  await expectNoSeriousAxeViolations(page);
  await expect(page.getByTestId('workflow-scene').first()).toHaveScreenshot(`workflow-scene-${testInfo.project.name}.png`, { animations: 'disabled', maxDiffPixelRatio: 0.01 });
  await saveEvidence(page, testInfo, 'workflow-spec');
  expect(runtimeErrors).toEqual([]);
});

test('challenge drafts, hints, status, solution and compare are local and persistent', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/#/challenge');
  await expect(page.getByTestId('challenge-page')).toBeVisible();
  await replaceMonacoText(page, 'Learner draft editor', 'SELECT 42;');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('datapass:challenge-drafts:v1.1'))).toContain('SELECT 42;');

  await page.getByRole('tab', { name: 'Hints' }).click();
  await page.getByRole('button', { name: 'Reveal hint 1' }).click();
  await expect(page.getByText('Keep customers without orders by starting with a LEFT JOIN.')).toBeVisible();
  await page.getByRole('tab', { name: 'Visualize' }).click();
  await expect(page.locator('.challenge-visualization svg[data-conceptmotion]')).toBeVisible();

  await page.getByRole('tab', { name: 'Solution' }).click();
  await page.getByRole('button', { name: 'Reveal reference solution' }).click();
  await expect(page.locator('.challenge-editor-pane .monaco-editor')).toHaveCount(1);
  await page.getByRole('tab', { name: 'Compare' }).click();
  await expect(page.locator('.challenge-editor-pane .monaco-diff-editor')).toBeVisible();

  await page.getByRole('button', { name: 'Mark mastered' }).click();
  await page.getByRole('button', { name: 'Flag' }).click();
  await page.getByRole('button', { name: 'Add to review' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mastered', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Flagged', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'In review', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('datapass:challenge-drafts:v1.1'))).toContain('SELECT 42;');

  await page.getByRole('button', { name: 'Next' }).last().click();
  await expect(page.getByRole('heading', { name: 'Summarize even values' })).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeViolations(page);
  await saveEvidence(page, testInfo, 'challenge');
  expect(runtimeErrors).toEqual([]);
});

test('Knowledge Atlas preserves routes, freshness impact and locale metadata', async ({ page }, testInfo) => {
  const runtimeErrors: string[] = [];
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/#/knowledge');
  await expect(page.getByTestId('knowledge-page')).toBeVisible();
  await expect(page.getByText('Needs review', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('featureId: fabric.runtime')).toBeVisible();
  await expect(page.getByRole('link', { name: /Apache Spark runtime in Fabric/ })).toHaveAttribute('href', /^https:\/\/learn\.microsoft\.com\//);
  await page.getByRole('link', { name: 'Medallion mental model' }).click();
  await expect(page).toHaveURL(/#\/knowledge\/mental-model$/);
  await expect(page.getByTestId('knowledge-page')).toBeVisible();

  await page.getByTestId('knowledge-review-toggle').click();
  await expect(page.getByText('Current', { exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'NO', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'nb');
  await expect(page.getByRole('heading', { name: 'Behandle kjøretiden som en versjonert avhengighet' })).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeViolations(page);
  await saveEvidence(page, testInfo, 'knowledge');
  expect(runtimeErrors).toEqual([]);
});
