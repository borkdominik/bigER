import { FrameLocator, Locator, Page } from "@playwright/test";

export class DiagramView {

    readonly page: Page;
    readonly frameLocator: FrameLocator;
    readonly diagram: Locator;
    readonly toolbarModelName: Locator;
    readonly addEntityBtn: Locator;
    readonly centerBtn: Locator;
    readonly generateBtn: Locator;
    readonly modelElements: Locator;

    
    constructor(page: Page) {
        this.page = page;
        this.frameLocator = page.frameLocator('.webview').frameLocator('#active-frame').first();
        this.diagram = this.frameLocator.locator('#erdiagram-diagram_0');
        this.toolbarModelName = this.frameLocator.locator('#toolbar-modelName');
        this.addEntityBtn = this.frameLocator.locator('#btn_add_entity-container');
        this.centerBtn = this.frameLocator.locator('#btn_fit_to_screen-container');
        this.generateBtn = this.frameLocator.locator('#btn_dropdown_generate-container');
        this.modelElements = this.diagram.locator('g.entity');
    }

    async centerDiagram() {
        await this.centerBtn.click();
    }

    async addEntity() {
        await this.addEntityBtn.click();
    }

    async renameEntityByName(name: string, newName: string) {
        const entity = this.diagram.getByText(name);
        if (entity) {
            await entity.focus();
            await entity.dblclick();
            await this.page.locator('#quickInput_message').type(newName);
            //await this.page.keyboard.insertText(newName);
            await this.page.keyboard.press('Enter');
        }
    }

    async deleteEntityByName(entityName: string) {
        //const entity = this.diagram.locator('#erdiagram-diagram_0_' + entityName + ' > rect.sprotty-node');
        //const entity = this.diagram.locator('#erdiagram-diagram_0_' + entityName);
        const entity = this.diagram.getByText(entityName);
        if (entity) {
            await entity.focus();
            await entity.click({ force: true });
            await this.page.keyboard.press('Control+Backspace');
        }
    }

    async generateSql() {
        await this.generateBtn.hover();
        const dropDown = this.diagram.locator('.dropdown-content > div >  #btn_generate_sql');
        await dropDown.waitFor();
        await dropDown.click();
    }
}