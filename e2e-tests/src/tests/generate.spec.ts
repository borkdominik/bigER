import { test, expect } from '@playwright/test';
import { DiagramView } from 'src/diagram-view';

test('Generate SQL Test', async ({ page }) => {
  // open workspace
  await page.goto('http://localhost:3000/?folder=/home/workspace/workspace');

  // open erd file
  await page.locator('div.monaco-tl-contents').getByTitle('~/workspace/test.erd').click();
  
  // open diagram
  await page.keyboard.press("Control+O");
  //await page.locator('.action-item menu-entry')
  //await page.locator('.editor-actions > div:nth-child(1) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(1)').click();
  
  // Diagram Page Object
  const diagram = new DiagramView(page);
  
  // 1. check toolbar model name
  await expect(diagram.toolbarModelName).toHaveText("Model");
  // expect 1 entity in diagram
  await expect(diagram.modelElements).toHaveCount(1);

  // 2. generate SQL
  await diagram.generateSql();


  // 3. Open generated file
  await page.locator('div.monaco-tl-contents').getByTitle('~/workspace/generated').click();
  await page.locator('div.monaco-tl-contents').getByTitle('~/workspace/generated/Model.sql').click();

  // 4. Verify content

  const editor = page.locator('div.split-view-container > div:nth-child(2)');
  const tabs = editor.getByRole('tab');
  await expect(tabs).toHaveCount(2);
  
  const editorTab = tabs.getByTitle('~/workspace/test.erd');
  await editorTab.locator('div.tab-actions').getByRole('button').click();
  await expect(tabs).toHaveCount(1);

  const sqlTab = tabs.getByTitle('~/workspace/generated/Model.sql');
  await sqlTab.click();

  //await expect(editor.getByRole('tab'))

  //const lines = page.locator('div.view-lines.monaco-mouse-cursor-text > div.view-line');
  //await expect(lines).toHaveCount(5);
  //await expect(lines.first().locator('span > span:nth-child(1)')).toContainText('CREATE');
  //await expect(lines.first().locator('span > span:nth-child(3)')).toContainText('TABLE');

  
});