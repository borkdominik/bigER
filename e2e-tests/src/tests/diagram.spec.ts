import { test, expect, Page } from '@playwright/test';
import { DiagramView } from 'src/diagram-view';
import { TEST_WORKSPACE_URL } from 'src/utils';

test.describe.configure({ mode: 'serial' });
test.describe('E2E Test: Diagram', () => {
  
    let page: Page;
    let diagram: DiagramView;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(TEST_WORKSPACE_URL);
        const sampleFile = page.locator('div.monaco-tl-contents').getByTitle('~/workspace/test.erd');
        await sampleFile.click();
        diagram = new DiagramView(page);
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('should open diagram', async () => {
        await page.keyboard.press("Control+O");
        diagram = new DiagramView(page);
        await expect(diagram.modelName).toHaveText("Model");
        await expect(diagram.modelElements).toHaveCount(1);
    });

    test('should create element', async () => {
        await diagram.addEntity();
        await diagram.centerDiagram();
        await expect(diagram.modelElements).toHaveCount(2);
        await expect(diagram.diagram.getByText("Entity1")).toBeVisible();
    });

    test('should rename element', async () => {
        await diagram.renameEntity("Entity1", "TestName");
        await diagram.centerDiagram();
        await expect(diagram.modelElements).toHaveCount(2);
        await expect(diagram.diagram.getByText("Entity1")).not.toBeVisible();
        await expect(diagram.diagram.getByText("TestName")).toBeVisible();
    });

    test('should delete element', async () => {
        await diagram.deleteEntity("TestName");
        await diagram.centerDiagram();
        await expect(diagram.modelElements).toHaveCount(1);
    });
});