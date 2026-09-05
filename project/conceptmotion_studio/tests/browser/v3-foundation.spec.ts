import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import fs from 'node:fs';

async function audit(page:Page){
  const result=await new AxeBuilder({page}).exclude('[data-tabster-dummy]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.filter(issue=>issue.impact==='serious'||issue.impact==='critical')).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}
test.beforeEach(async({page})=>page.emulateMedia({reducedMotion:'reduce'}));
test('Formation retains courses and adds shared reasoning figures, predictions and progress',async({page},info)=>{
  await page.goto('http://127.0.0.1:4175/#/catalog');
  await expect(page).toHaveTitle('Formation');
  fs.mkdirSync('qa/v4-screenshots',{recursive:true});
  await page.screenshot({path:`qa/v4-screenshots/v4-formation-catalog-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  const think=page.getByRole('button',{name:'Think in SQL',exact:true});
  await think.press('Enter');
  await expect(page.getByTestId('formation-reasoning')).toBeVisible();
  await expect(page.locator('[data-figure-id="sql-left-join"]')).toBeVisible();
  const first=page.locator('[data-figure-id="sql-left-join"]').locator('..');
  await expect(first.getByRole('button',{name:/Play unavailable/})).toBeDisabled();
  await page.getByRole('radio',{name:'One customer in one calendar month',exact:true}).check();
  await page.getByRole('radio',{name:'It produces three joined rows',exact:true}).check();
  await page.locator('[data-question-id="question.formation.sql-window"]').getByRole('radio',{name:'False',exact:true}).check();
  await page.getByRole('radio',{name:'value IS NULL',exact:true}).check();
  await page.getByRole('button',{name:'Submit assessment',exact:true}).click();
  await expect(page.locator('.dp-assessment-result')).toContainText('100%');
  await page.getByRole('button',{name:'Mark complete',exact:true}).click();
  await audit(page);
  fs.mkdirSync('qa/v4-screenshots',{recursive:true});
  await page.screenshot({path:`qa/v4-screenshots/v4-formation-thinking-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  await page.reload();
  await expect(page.getByRole('button',{name:'Completed',exact:true})).toBeVisible();
  await page.goto('http://127.0.0.1:4175/#/lesson/lesson.formation.think-python-de');
  await expect(page.locator('[data-figure-id="de-pure-transform"]')).toBeVisible();
  await expect(page.getByRole('button',{name:/run code|execute code/i})).toHaveCount(0);
  await audit(page);
});

test('Visual Sandbox edits real Figure contracts, retains valid preview on errors and exports',async({page},info)=>{
  await page.goto('/#/visual-sandbox');
  await expect(page.getByTestId('visual-sandbox-page')).toBeVisible();
  await expect(page.locator('.monaco-editor')).toBeVisible();
  await page.getByLabel('Figure example',{exact:true}).selectOption('algorithm-scan');
  await page.getByLabel('Preview width',{exact:true}).selectOption('390px');
  await expect(page.locator('[data-figure-id="algorithm-scan"]')).toBeVisible();
  const editor=page.getByRole('textbox',{name:'Figure JSON spec',exact:true});
  await editor.evaluate(element=>(element as HTMLElement).focus());
  await page.keyboard.press('ControlOrMeta+A'); await page.keyboard.insertText('{');
  await expect(page.getByTestId('sandbox-validation')).toContainText('Spec not applied');
  await expect(page.getByRole('button',{name:'Apply valid spec'})).toBeDisabled();
  await expect(page.locator('[data-figure-id="algorithm-scan"]')).toBeVisible();
  await page.getByRole('button',{name:'Reset example'}).click();
  await page.getByRole('button',{name:'Apply valid spec'}).click();
  await expect(page.getByTestId('sandbox-validation')).toContainText('Valid Figure applied');
  const download=page.waitForEvent('download');
  await page.getByRole('link',{name:'Export SVG',exact:true}).click();
  expect((await download).suggestedFilename()).toMatch(/\.svg$/);
  await audit(page);
  fs.mkdirSync('qa/v4-screenshots',{recursive:true});
  await page.screenshot({path:`qa/v4-screenshots/v4-visual-sandbox-${info.project.name}.png`,fullPage:true,animations:'disabled'});
  await page.getByLabel('Figure example',{exact:true}).selectOption('sandbox-unsupported');
  await expect(page.getByText('Figure unavailable.',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Apply valid spec'}).click();
  await expect(page.getByText('No adapter is registered for “future.chart”.')).toBeVisible();
});
