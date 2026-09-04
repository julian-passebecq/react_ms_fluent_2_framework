import { expect, test, type Page } from '@playwright/test';

function collectMonacoRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (request: { url(): string }) => {
    const url = request.url();
    if (/(?:monaco-editor|MonacoSurfaces|monacoLoader|editor\.worker|json\.worker)/i.test(url)) requests.push(url);
  });
  return requests;
}

test('Catalog, Knowledge and Workflow run mode do not request Monaco', async ({ page }) => {
  const monacoRequests = collectMonacoRequests(page);

  await page.goto('/#/catalog');
  await expect(page.getByTestId('catalog-page')).toBeVisible();
  await page.goto('/#/knowledge');
  await expect(page.getByTestId('knowledge-page')).toBeVisible();
  await page.goto('/#/workflow');
  await expect(page.getByTestId('workflow-page')).toBeVisible();
  expect(monacoRequests).toEqual([]);

  await page.getByRole('tab', { name: 'Spec playground' }).click();
  await expect(page.locator('.spec-editor .monaco-editor')).toBeVisible();
  expect(monacoRequests.length).toBeGreaterThan(0);
});

test('Challenge requests Monaco when its code surface opens', async ({ page }) => {
  const monacoRequests = collectMonacoRequests(page);
  await page.goto('/#/catalog');
  await expect(page.getByTestId('catalog-page')).toBeVisible();
  expect(monacoRequests).toEqual([]);

  await page.goto('/#/challenge');
  await expect(page.getByTestId('challenge-page')).toBeVisible();
  await expect(page.locator('.challenge-editor-pane .monaco-editor')).toBeVisible();
  expect(monacoRequests.length).toBeGreaterThan(0);
});
