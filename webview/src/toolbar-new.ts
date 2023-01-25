import { inject, injectable } from "inversify";
import { AbstractUIExtension, codiconCSSClasses, IActionDispatcher, TYPES } from "sprotty";
import { vscodeApi } from 'sprotty-vscode-webview/lib/vscode-api';
import { createElement } from "./utils";
import { AddEntityButton, AddRelationshipButton, CollapseAllButton, ExpandAllButton, FitToScreenButton, GenerateButton, ToolButton, ToolDropdownButton } from "./buttons";

@injectable()
export class ToolBar extends AbstractUIExtension {
    
    static readonly ID = "toolbar-overlay";
    @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
    
    id(): string { 
        return ToolBar.ID; 
    }

    containerClass(): string { 
        return ToolBar.ID; 
    }

    protected initializeContents(containerElement: HTMLElement): void {
        containerElement.appendChild(this.createLeftSide());
        containerElement.appendChild(this.createRightSide());
    }

    protected createLeftSide(): HTMLElement {
        const leftSide = createElement("div", ["toolbar-left"]);
        leftSide.appendChild(this.createToolButton(new AddEntityButton()));
        leftSide.appendChild(this.createToolButton(new AddRelationshipButton()));
        leftSide.appendChild(this.createSeparator());
        leftSide.appendChild(this.createDropdownButton(new GenerateButton()));
        leftSide.appendChild(this.createSeparator());
        // TODO: Notation Panel
        leftSide.appendChild(this.createModelName());
        return leftSide;
    }

    protected createRightSide(): HTMLElement {
        const rightSide = createElement("div", ["toolbar-right"]);
        rightSide.appendChild(this.createToolButton(new FitToScreenButton()));
        rightSide.appendChild(this.createToolButton(new CollapseAllButton()));
        rightSide.appendChild(this.createToolButton(new ExpandAllButton()));
        rightSide.appendChild(this.createSeparator());
        // TODO: Help Panel
        return rightSide;
    }

    private createToolButton(toolButton: ToolButton): HTMLElement {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv) {
            const button = createElement("div", ["overlay-button"]);
            button.id = `${toolButton.id}-container`;
            const insertedDiv = baseDiv.insertBefore(button, baseDiv.firstChild);
            insertedDiv.appendChild(this.createIcon(toolButton.icon));
            insertedDiv.onclick = () => this.actionDispatcher.dispatch(toolButton.action);
            return button;
        }
        return createElement("div");
    }

    private createModelName(): HTMLElement {
        const nameElement = createElement("p");
        nameElement.id = "toolbar-modelName";
        return nameElement;
    }

    protected createIcon(codiconId: string): HTMLElement {
        const icon = document.createElement("i");
        icon.classList.add(...codiconCSSClasses(codiconId), "overlay-icon");
        return icon;
    }

    protected createChevronDownIcon(): HTMLElement {
        const icon = document.createElement("i");
        icon.classList.add(...codiconCSSClasses("chevron-down"));
        return icon;
    }

    protected createSeparator(): HTMLElement {
        const separator = document.createElement("div");
        separator.classList.add("vertical-separator");
        return separator;
    }

    protected createDropdownButton(toolDropdownButton: ToolDropdownButton): HTMLElement {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv) {
            const dropdown  = createElement("div", ["toolbar-dropdown", "overlay-button"]);
            dropdown.id = `${toolDropdownButton.id}-container`;
            baseDiv.insertBefore(dropdown, baseDiv.firstChild);
            dropdown.appendChild(this.createIcon(toolDropdownButton.icon));
            
            const dropDownContent = document.createElement("div");
            dropdown.appendChild(dropDownContent);
            dropDownContent.classList.add("dropdown-content");
            
            toolDropdownButton.buttons.forEach((value: string, key: string) => {
                const button = createElement("div");
                dropDownContent.appendChild(button);
                button.innerHTML = `<vscode-button id="btn_generate_${key}" appearance="secondary">${value}</vscode-button>`;
                button.onclick = () => vscodeApi.postMessage({ generateKind: key });
            })
            return dropdown;

        }
        return document.createElement("div");
    }
}