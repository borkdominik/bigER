import { test, expect } from '@playwright/test';
import { DiagramView } from 'src/diagram-view';

test('Diagram Test', async ({ page }) => {
  // open workspace
  await page.goto('http://localhost:3000/?folder=/home/workspace/workspace');

  // open erd file
  await page.locator('.explorer-item').click();
  await expect(page.locator('.mtk5')).toHaveText('erdiagram');
  
  // open diagram
  await page.locator('.editor-actions > div:nth-child(1) > div:nth-child(1) > ul:nth-child(1) > li:nth-child(1)').click();
  
  // Diagram Page Object
  const diagram = new DiagramView(page);
  
  // 1. check toolbar model name
  await expect(diagram.toolbarModelName).toHaveText("Model");
  // expect 1 entity in diagram
  await expect(diagram.modelElements).toHaveCount(1);

  // 2. Rename Element
  await diagram.renameEntityByName("E1", "NewName");


  // 3. Create Element
  await diagram.addEntity();
  await expect(diagram.modelElements).toHaveCount(2);

  await diagram.centerDiagram();

  // 4. Delete Element
  await diagram.deleteEntityByName("Entity1");
  await expect(diagram.modelElements).toHaveCount(1);

  //await diagram.generateSql();
  
});