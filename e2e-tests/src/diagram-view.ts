import { FrameLocator, Locator, Page } from "@playwright/test";
import { delay } from "./utils";

export class DiagramView {

    readonly page: Page;
    readonly frameLocator: FrameLocator;
    readonly diagram: Locator;
    readonly modelName: Locator;
    readonly addEntityBtn: Locator;
    readonly centerBtn: Locator;
    readonly generateBtn: Locator;
    readonly modelElements: Locator;
    
    constructor(page: Page) {
        this.page = page;
        this.frameLocator = page.frameLocator('.webview').frameLocator('#active-frame').first();
        this.diagram = this.frameLocator.locator('#erdiagram-diagram_0');
        this.modelName = this.frameLocator.locator('#toolbar-modelName');
        this.addEntityBtn = this.frameLocator.locator('#btn_add_entity-container');
        this.centerBtn = this.frameLocator.locator('#btn_fit_to_screen-container');
        this.generateBtn = this.frameLocator.locator('#btn_dropdown_generate-container');
        this.modelElements = this.diagram.locator('g.entity');
    }

    async openDiagram() {
        await this.page.keyboard.press("Control+O");
        await delay(1000);
    }

    async centerDiagram() {
        await this.centerBtn.click();
        // wait for center animation
        await delay(1000);
    }

    async addEntity() {
        await this.addEntityBtn.click();
    }

    async renameEntity(name: string, newName: string) {
        const entity = this.diagram.getByText(name);
        await entity.focus();
        await entity.dblclick();
        const input = this.page.locator('#quickInput_message');
        await input.type(newName);
        await this.page.keyboard.press('Enter');
    }

    async deleteEntity(name: string) {
        const entity = this.diagram.getByText(name);
        await entity.focus();
        await entity.click();
        await this.page.keyboard.press('Control+Backspace');
    }

    async generateSql() {
        await this.generateBtn.hover();
        const dropDown = this.diagram.locator('.dropdown-content > div >  #btn_generate_sql');
        await dropDown.waitFor();
        await dropDown.click();
    }
}