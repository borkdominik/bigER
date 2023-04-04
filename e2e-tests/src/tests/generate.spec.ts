import { test, expect, Page } from '@playwright/test';
import { DiagramView } from 'src/diagram-view';
import { TEST_WORKSPACE_URL } from 'src/utils';

test.describe.configure({ mode: 'serial' });
test.describe('E2E Test: Generate SQL', () => {
  
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(TEST_WORKSPACE_URL);
    const sampleFile = page.locator('div.monaco-tl-contents').getByTitle('~/workspace/test.erd');
    await sampleFile.click();
  });

  test.afterEach(async () => {
    // TODO: delete generated SQL file from test cases
    await page.close();
  });

  test('diagram toolbar should generate SQL file', async () => {
    await page.keyboard.press("Control+O");
    const diagram = new DiagramView(page);
    await expect(diagram.modelName).toHaveText("Model");
    await diagram.generateSql();
    await page.locator('div.monaco-tl-contents').getByTitle('~/workspace/generated').click();
    await expect(page.locator('div.monaco-tl-contents').getByTitle('~/workspace/generated/Model.sql')).toBeVisible();
  });

  test('editor menu should generate SQL file', async () => {
    // TODO
  });
});