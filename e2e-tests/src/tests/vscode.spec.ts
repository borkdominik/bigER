import { test, expect, Page } from '@playwright/test';
import { StatusBar } from 'src/status-bar';
import { TEST_WORKSPACE_URL } from 'src/utils';

test.describe.configure({ mode: 'serial' });
test.describe('E2E Test: VS Code instance', () => {

    let page: Page;

    test.beforeAll(async ({ browser }) => {
        page = await browser.newPage();
        await page.goto(TEST_WORKSPACE_URL);
    });

    test.afterAll(async () => {
        await page.close();
    });

    test('bigER extension should be installed', async () => {
        const extensionBtn = page.locator('.codicon-extensions-view-icon');
        await extensionBtn.click();
        const extension = page.locator('div.extensions-viewlet[id="workbench.view.extensions"] .monaco-list-row[data-extension-id="bigmodelingtools.erdiagram"]');
        await expect(extension).toBeVisible();
    });

    test('sample .erd file should be present', async () => {
        await page.keyboard.press("Control+Shift+E")
        const sampleFile = page.locator('div.monaco-tl-contents').getByTitle('~/workspace/test.erd');
        await expect(sampleFile).toBeVisible();
    });
      
    test('status bar should show language when .erd file opened', async () => {
        await page.locator('div.monaco-tl-contents').getByTitle('~/workspace/test.erd').click();
        const statusBar = new StatusBar(page);
        await expect(statusBar.editorLanguage).toHaveText("ER Language");
    });
});