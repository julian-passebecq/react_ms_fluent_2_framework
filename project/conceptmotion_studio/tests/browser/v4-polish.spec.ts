import fs from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

test('V4 reasoning jumps keep the lesson route, keyboard focus and assessment answers', async ({ page }, info) => {
  for (const lesson of ['think-sql', 'think-python-de']) {
    const url = `http://127.0.0.1:4175/#/lesson/lesson.formation.${lesson}`;
    await page.goto(url);
    const picker = page.getByLabel('Jump to section', { exact: true });
    await expect(picker).toBeVisible();
    const targets = await picker.locator('option').evaluateAll(options => options.map(option => (option as HTMLOptionElement).value));
    expect(targets).toHaveLength(7);
    for (const targetId of targets) {
      await picker.selectOption(targetId);
      await page.getByRole('button', { name: 'Jump', exact: true }).press('Enter');
      const target = page.locator(`[id="${targetId}"]`);
      await expect(target).toBeFocused();
      expect(await target.evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0);
      expect(await target.evaluate(element => element.getBoundingClientRect().top)).toBeLessThan(200);
      await expect(page).toHaveURL(url);
      await target.getByRole('button', { name: 'Back to sections', exact: true }).press('Enter');
      await expect(picker).toBeFocused();
    }
    // Moving between explanations must not recreate the assessment or lose input.
    const assessment = page.locator('#formation-reasoning-assessment');
    const answer = assessment.getByRole('radio').first();
    await answer.check();
    await assessment.getByRole('button', { name: 'Back to sections', exact: true }).click();
    await picker.selectOption(targets[0]);
    await page.getByRole('button', { name: 'Jump', exact: true }).click();
    await page.locator(`[id="${targets[0]}"]`).getByRole('button', { name: 'Back to sections', exact: true }).click();
    await picker.selectOption('formation-reasoning-assessment');
    await page.getByRole('button', { name: 'Jump', exact: true }).click();
    await expect(answer).toBeChecked();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    const result = await new AxeBuilder({ page }).exclude('[data-tabster-dummy]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations.filter(issue => issue.impact === 'serious' || issue.impact === 'critical')).toEqual([]);
    await assessment.getByRole('button', { name: 'Back to sections', exact: true }).click();
    fs.mkdirSync('qa/v4-screenshots', { recursive: true });
    await page.screenshot({ path: `qa/v4-screenshots/v4-polish-${lesson}-navigation-${info.project.name}.png`, animations: 'disabled' });
  }
});

test('V4 consumer copy keeps internal terminology behind existing details', async ({ page }) => {
  test.setTimeout(120_000);
  const routes = [
    ['4175/#/catalog', 'Learn with structure.'],
    ['4175/#/lesson/lesson.dubreu.python-lists', 'List transformations'],
    ['4175/#/lesson/lesson.dubreu.sql-where', 'Filter rows with WHERE'],
    ['4175/#/lesson/lesson.dubreu.sql-window', 'Rank within a group'],
    ['4175/#/lesson/lesson.dubreu.pyspark-partitions', 'Understand partition movement'],
    ['4175/#/practice', 'Check your understanding'],
    ['4175/#/progress', 'Progress and review'],
    ['4176/#learn', 'A curriculum for working with data'],
    ['4176/#cheatsheets', 'Cheat Sheets'],
    ['4176/#practice', 'Build fluency, one transformation at a time.'],
    ['4176/#progress', 'Keep your practice moving'],
    ['4176/#challenge/f-variables', 'Variables'],
    ['4178/', 'See the invariant.'],
    ['4178/#/concept/algorithm-binary-search', 'Binary search: discard half'],
    ['4179/', 'One architecture. Several vocabularies.'],
  ];
  for (const [route, title] of routes) {
    await page.goto(`http://127.0.0.1:${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title);
    const visibleCopy = await page.locator('main').innerText();
    expect(visibleCopy, route).not.toMatch(/Dubreu|importer|semantic (?:scene|renderer|figure|objects|view)|source-preserved|source curriculum|original fixture|schema v\d|(?:source|figure|lesson|course|renderer) ID:/i);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), route).toBeLessThanOrEqual(1);
  }
  const details = page.locator('.architecture-source .dp-content-details');
  await expect(details).not.toHaveAttribute('open');
  await details.locator('summary').press('Enter');
  await expect(details).toContainText('Source reference:');
});
