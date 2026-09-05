import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical')).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

test('Code Sandbox catalog contains long native select options with narrow fallback-font metrics', async ({ page }) => {
  await page.goto('http://127.0.0.1:4176/');
  await expect(page.getByText('323 of 323 practice items', { exact: true })).toBeVisible();
  // Linux lacks Segoe UI. Exercise wider fallback metrics as well as the default theme.
  await page.addStyleTag({ content: '.dp-search-filter-bar, .dp-search-filter-bar * { font-family: Arial, sans-serif !important; font-size: 16px !important; }' });
  const tracks = page.getByRole('combobox', { name: 'Domain / track', exact: true });
  const longest = await tracks.locator('option').evaluateAll(options => [...options].sort((a, b) => (b.textContent?.length ?? 0) - (a.textContent?.length ?? 0))[0].value);
  for (const width of [390, 360, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await tracks.selectOption(longest);
    await expect(tracks).toHaveValue(longest);
    const geometry = await page.evaluate(() => {
      const bar = document.querySelector('.dp-search-filter-bar')!.getBoundingClientRect();
      return { overflow: document.documentElement.scrollWidth - window.innerWidth, controls: [...document.querySelectorAll('.dp-search-filter-bar select')].map(select => ({ label: select.getAttribute('aria-label'), right: select.getBoundingClientRect().right, limit: bar.right })) };
    });
    expect(geometry.overflow, JSON.stringify({ width, ...geometry })).toBeLessThanOrEqual(1);
    for (const control of geometry.controls) expect(control.right, `${width}px ${control.label}`).toBeLessThanOrEqual(control.limit);
  }
  await accessible(page);
});

test('Code Sandbox preserves corpus, URL filters, lazy editor, variants, notes and backup', async ({ page }, info) => {
  const editorRequests: string[] = [];
  page.on('request', request => { if (/(monaco-editor|MonacoSurfaces|monacoLoader|editor\.worker|json\.worker)/iu.test(request.url())) editorRequests.push(request.url()); });
  await page.goto('http://127.0.0.1:4176/');
  await expect(page.getByText('323 of 323 practice items', { exact: true })).toBeVisible();
  expect(editorRequests).toEqual([]);
  await accessible(page);
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-sandbox-catalog-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('searchbox', { name: 'Search practice' }).fill('Filter active records');
  await expect(page).toHaveURL(/q=Filter/);
  await expect(page.getByRole('row').filter({ hasText: 'Filter active records' }).getByText('Visualize available')).toBeVisible();
  await page.getByRole('row').filter({ hasText: 'Filter active records' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Filter active records', exact: true })).toBeVisible();
  await expect(page.locator('.monaco-editor').first()).toBeVisible();
  expect(editorRequests.length).toBeGreaterThan(0);
  expect(await page.locator('body').innerText()).not.toMatch(/a3bff6|source\.leetcodedataeng|Source ID/);
  await expect(page.getByRole('button', { name: 'Visualize this challenge', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Practice code editor', exact: true }).focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.insertText('SELECT 42;');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('datapass:code-sandbox:v3'))).toContain('SELECT 42;');
  await page.getByRole('tab', { name: 'Hints', exact: true }).click();
  await page.getByRole('button', { name: 'Reveal next hint' }).click();
  await expect(page.getByText('Find the row-filter operation for the selected engine.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Visualize this challenge', exact: true }).click();
  await expect(page.locator('[data-figure-renderer="table.transform"] svg[data-conceptmotion]')).toBeVisible();
  await page.locator('.dp-figure-player').getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-frame-index', '1');
  await expect(page.locator('.dp-figure-player').getByRole('button', { name: /Play unavailable/ })).toBeDisabled();
  await page.locator('.dp-figure-player').scrollIntoViewIfNeeded();
  await expect(page.locator('.dp-figure-player')).toHaveAttribute('data-pannable', 'true');
  const figureWidth = await page.locator('[data-figure-renderer="table.transform"] svg[data-conceptmotion]').evaluate(element => element.getBoundingClientRect().width);
  expect(figureWidth, 'Explicit compact figure keeps native-scale labels in the half-pane and phone canvas').toBeGreaterThanOrEqual(959);
  await accessible(page);
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-sandbox-visual-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('tab', { name: 'Notes', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your reasoning notes' }).fill('Keep row grain; filter only.');
  await page.getByRole('combobox', { name: 'Language / engine', exact: true }).selectOption('pyspark');
  await expect(page.getByText('PySpark: display, explanation and external practice only. No Spark session or Jupyter kernel.')).toBeVisible();
  await page.getByRole('tab', { name: 'Solution', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Reference explanation', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Compare', exact: true }).click();
  await expect(page.locator('.monaco-diff-editor')).toBeVisible();
  await page.getByRole('button', { name: 'Mastered', exact: true }).click();
  await page.getByRole('button', { name: 'Flag', exact: true }).click();
  await accessible(page);
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-sandbox-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await page.getByText('Backup & restore', { exact: true }).click();
  await page.getByRole('button', { name: 'Export backup' }).click();
  await expect(page.getByRole('textbox', { name: 'Workspace JSON' })).toHaveValue(/Keep row grain; filter only\./);
  await page.reload();
  await page.getByText('Backup & restore', { exact: true }).click();
  await page.getByRole('button', { name: 'Export backup' }).click();
  await expect(page.getByRole('textbox', { name: 'Workspace JSON' })).toHaveValue(/eng-filter-active/);
  await expect(page.getByRole('textbox', { name: 'Workspace JSON' })).toHaveValue(/SELECT 42;/);
});

test('Code Interview uses distinct sessions, submission review, flags and domain progress', async ({ page }, info) => {
  const editorRequests: string[] = [];
  page.on('request', request => { if (/(monaco-editor|MonacoSurfaces|monacoLoader)/iu.test(request.url())) editorRequests.push(request.url()); });
  await page.goto('http://127.0.0.1:4177/');
  await expect(page.getByRole('heading', { name: 'Practice the conversation, not just the answer.' })).toBeVisible();
  expect(editorRequests).toEqual([]);
  await accessible(page);
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-interview-sessions-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: /Quick · 12 minutes/ }).press('Enter');
  await expect(page.getByRole('timer')).toBeVisible();
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-interview-reasoning-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Pause timer' }).click();
  await page.getByRole('textbox', { name: 'Your interview reasoning', exact: true }).fill('Choose the business grain, document ties, and validate the result.');
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem('datapass:code-interview:v3'))).toContain('interview.quick.sql.reasoning');
  await expect(page.getByRole('heading', { name: 'Strong-answer points' })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Sort the whole table and keep only its first row.', exact: true }).check();
  await page.getByRole('radio', { name: 'Option B', exact: true }).check();
  await page.getByRole('radio', { name: 'Equal timestamps require a stable, documented tie-breaker.', exact: true }).check();
  await page.getByRole('button', { name: 'Flag question 1', exact: true }).click();
  await page.getByRole('button', { name: 'Submit assessment' }).click();
  await expect(page.getByText('2 / 4', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Strong-answer points' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Trade-offs to discuss' })).toBeVisible();
  expect(editorRequests).toEqual([]);
  await expect(page.getByRole('textbox', { name: 'Your interview reasoning', exact: true })).toHaveAttribute('readonly');
  await expect(page.getByRole('textbox', { name: 'Your interview reasoning', exact: true })).toHaveValue('Choose the business grain, document ties, and validate the result.');
  const submittedRadios = page.getByRole('radio');
  await expect(submittedRadios).toHaveCount(6);
  for (const radio of await submittedRadios.all()) await expect(radio).toBeDisabled();
  const answerLabels = page.locator('.dp-assessment-question .fui-Radio__label');
  await expect(answerLabels).toHaveCount(6);
  // V4 shared ink-primary is #102d43; disabled review text must retain that full contrast.
  for (const label of await answerLabels.all()) await expect(label).toHaveCSS('color', 'rgb(16, 45, 67)');
  await accessible(page);
  await page.locator('.interview-reasoning-review').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `qa/v4-screenshots/v4-code-interview-${info.project.name}.png`, animations: 'disabled' });
  await page.getByRole('button', { name: 'Progress', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Progress by domain', exact: true })).toBeVisible();
  await expect(page.getByText('2 / 4 correct · 50%', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Sessions', exact: true }).click();
  await page.getByRole('button', { name: /Review mistakes/ }).click();
  await expect(page.locator('[data-question-id="interview.sql.concept"]')).toBeVisible();
  await expect(page.getByRole('button', { name: /Run|Execute/ })).toHaveCount(0);
});
