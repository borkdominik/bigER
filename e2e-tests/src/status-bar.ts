import { Locator, Page } from "@playwright/test";

export class StatusBar {

    readonly page: Page;
    readonly statusBar: Locator;
    readonly editorLanguage: Locator;
    
    constructor(page: Page) {
        this.statusBar = page.locator('footer[id="workbench.parts.statusbar"]');
        this.editorLanguage = this.statusBar.locator('div[id="status.editor.mode"] > a[class="statusbar-item-label"]')
    }
}