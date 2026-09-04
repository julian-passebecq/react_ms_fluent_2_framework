import fs from 'node:fs';
import path from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

const consumer = 'http://127.0.0.1:4175';
const evidenceDir = path.resolve('qa/screenshots');

function collectMonacoRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    if (/(?:monaco-editor|MonacoSurfaces|monacoLoader|editor\.worker|json\.worker)/i.test(url)) requests.push(url);
  });
  return requests;
}

async function saveEvidence(page: Page, testInfo: TestInfo, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, `${name}-${testInfo.project.name}.png`),
    // Playwright's emulated-mobile full-page capture temporarily expands the
    // layout viewport; a viewport capture keeps subsequent interaction valid.
    fullPage: false,
    animations: 'disabled',
  });
}

async function expectNoPageOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    offenders: [...document.querySelectorAll<HTMLElement>('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ''}${element.className && typeof element.className === 'string' ? `.${element.className.trim().replace(/\s+/g, '.')}` : ''}`,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
        };
      })
      .filter(({ left, right }) => right > window.innerWidth + 1 || left < -1)
      .slice(0, 12),
  }));
  expect(dimensions.scrollWidth, JSON.stringify(dimensions.offenders, null, 2)).toBeLessThanOrEqual(dimensions.viewportWidth + 1);
}

async function expectNoSeriousAxeFindings(page: Page) {
  const results = await new AxeBuilder({ page })
    // Fluent's focusable Tabster sentinels are aria-hidden focus-management infrastructure.
    .exclude('[data-tabster-dummy]')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  const blocking = results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(blocking, blocking.map((violation) => `${violation.id}: ${violation.help}`).join('\n')).toEqual([]);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('Dubreu catalog and SQL lesson use structured contracts without notebook chrome', async ({ page }, testInfo) => {
  const monacoRequests = collectMonacoRequests(page);
  await page.goto(`${consumer}/#/catalog`);
  expect(await page.evaluate(() => window.innerWidth)).toBe(testInfo.project.name === 'phone-chrome' ? 390 : 1440);
  await expect(page.getByTestId('formation-catalog-page')).toBeVisible();
  await expect(page.getByText('The private Dubreu corpus was not supplied or imported.')).toBeVisible();
  await expect(page.getByText('In-site runtimes').locator('..').getByText('0')).toBeVisible();
  expect(monacoRequests).toEqual([]);
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);

  await page.goto(`${consumer}/#/lesson/lesson.dubreu.sql-where`);
  await expect(page.getByTestId('formation-lesson-page')).toHaveAttribute('data-lesson-id', 'lesson.dubreu.sql-where');
  await expect(page.getByText('See what the predicate changes')).toBeVisible();
  await expect(page.locator('[data-figure-id="figure.dubreu.sql-filter-stable-rows"]')).toBeVisible();
  await expect(page.getByText('Saved reference output').first()).toBeVisible();
  const sqlViewLines = page.locator('[data-cell-id="notebook.dubreu.sql-where.cell.where-example"] .view-lines');
  await expect(sqlViewLines).toContainText('SELECT');
  const sqlSource = await sqlViewLines.textContent();
  expect(sqlSource).toContain('SELECT');
  expect(sqlSource).not.toContain('_dntk.execute_sql');
  await expect(page.getByRole('button', { name: /run|execute/i })).toHaveCount(0);
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  expect(monacoRequests.length).toBeGreaterThan(0);
  await saveEvidence(page, testInfo, 'v2-dubreu-sql-lesson');

  await page.goto(`${consumer}/#/lesson/lesson.dubreu.python-lists`);
  await expect(page.locator('[data-notebook-id="notebook.dubreu.python-lists"]')).toBeVisible();
  await expect(page.getByText('[28, 56, 90]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download Python reference' })).toHaveAttribute('href', '/notebooks/dubreu_python_lists_reference.py');
  await expect(page.getByRole('button', { name: /run|execute/i })).toHaveCount(0);
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
});

test('advanced SQL follows Try to Hint to Reveal to Compare with no execution action', async ({ page }, testInfo) => {
  await page.goto(`${consumer}/#/lesson/lesson.dubreu.sql-window`);
  const exercise = page.locator('[data-notebook-id="notebook.dubreu.sql-window"] [data-exercise-id="challenge.dubreu.sql-window"]');
  await expect(exercise).toHaveAttribute('data-guided-step', 'try');
  await expect(exercise.locator('.monaco-editor')).toBeVisible();
  await exercise.getByRole('button', { name: 'Show hint' }).focus();
  await exercise.getByRole('button', { name: 'Show hint' }).press('Enter');
  await expect(exercise).toHaveAttribute('data-guided-step', 'hint');
  await expect(exercise.getByText(/ROW_NUMBER/)).toBeVisible();
  await exercise.getByRole('button', { name: 'Reveal solution' }).focus();
  await exercise.getByRole('button', { name: 'Reveal solution' }).press('Enter');
  await expect(exercise).toHaveAttribute('data-guided-step', 'reveal');
  await exercise.getByRole('button', { name: 'Compare' }).focus();
  await exercise.getByRole('button', { name: 'Compare' }).press('Enter');
  await expect(exercise).toHaveAttribute('data-guided-step', 'compare');
  await expect(exercise.locator('.monaco-diff-editor')).toBeVisible();
  await expect(exercise.getByRole('button', { name: /run|execute/i })).toHaveCount(0);
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  await saveEvidence(page, testInfo, 'v2-dubreu-advanced-sql-compare');
});

test('PySpark remains display-only and practice attempts persist through schema v2', async ({ page }, testInfo) => {
  await page.goto(`${consumer}/#/lesson/lesson.dubreu.pyspark-partitions`);
  await expect(page.getByTestId('pyspark-display-only')).toHaveAttribute('data-execution', 'none');
  await expect(page.getByText('Spark and Jupyter do not run in this site.')).toBeVisible();
  await expect(page.getByText('Saved reference output').first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Download PySpark notebook' })).toHaveAttribute('href', '/notebooks/dubreu_pyspark_partition_reference.ipynb');
  await expect(page.getByRole('button', { name: /run|execute/i })).toHaveCount(0);
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  await saveEvidence(page, testInfo, 'v2-dubreu-pyspark-display-only');

  await page.goto(`${consumer}/#/practice`);
  await page.getByLabel('WHERE active = TRUE AND price < 50').check();
  await expect(page.locator('[data-feedback-state="correct"]').first()).toBeVisible();
  await page.getByLabel('False').check();
  await page.getByLabel('Partition then order').check();
  await page.getByRole('button', { name: 'Submit assessment' }).click();
  await expect(page.getByText(/100%/).first()).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  const stored = await page.evaluate(() => window.localStorage.getItem('datapass:progress:v2'));
  expect(JSON.parse(stored ?? '{}')).toMatchObject({ schemaVersion: 2 });

  await page.goto(`${consumer}/#/progress`);
  await expect(page.getByText('Submitted attempts').locator('..').getByText('1')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Submitted attempts').locator('..').getByText('1')).toBeVisible();
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  await saveEvidence(page, testInfo, 'v2-dubreu-progress');
});

test('Project Hub is a URL-backed generic explorer with direct HTTPS destinations', async ({ page }, testInfo) => {
  await page.goto('/#/projects');
  await expect(page.getByTestId('project-hub-page')).toBeVisible();
  const search = page.getByRole('searchbox', { name: 'Search projects, features and technologies' });
  await search.fill('D3');
  await expect(page.getByText('D3 Visual Studio')).toBeVisible();
  await expect(page.getByText('Datapass Portfolio')).toHaveCount(0);
  await expect(page).toHaveURL(/q=D3/);
  await page.getByRole('button', { name: 'Table' }).click();
  await expect(page.getByRole('table', { name: 'Project Registry table' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Visit website: D3 Visual Studio/ })).toHaveAttribute('href', 'https://d3ecosite.netlify.app/sandbox/');
  await expectNoPageOverflow(page);
  await expectNoSeriousAxeFindings(page);
  await saveEvidence(page, testInfo, 'v2-project-hub-table');
});
