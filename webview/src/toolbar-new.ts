import { inject, injectable } from "inversify";
import { AbstractUIExtension, codiconCSSClasses, IActionDispatcher, TYPES } from "sprotty";
import { vscodeApi } from 'sprotty-vscode-webview/lib/vscode-api';
import { createElement, togglePanel } from "./utils";
import { AddEntityButton, AddRelationshipButton, CollapseAllButton, ExpandAllButton, FitToScreenButton, GenerateButton, ToolButton, ToolDropdownButton } from "./buttons";
import { ChangeNotationAction } from "./actions";

@injectable()
export class ToolBar extends AbstractUIExtension {

    @inject(TYPES.IActionDispatcher) protected readonly actionDispatcher: IActionDispatcher;
    static readonly ID = "toolbar-overlay";

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
        // TODO: improve notation panel (similar to dropdown button)
        leftSide.appendChild(this.createNotationButtonPanel());
        leftSide.appendChild(this.createSeparator());
        // TODO: improve model name (-> model name is currently set in the view)
        leftSide.appendChild(this.createModelName());
        return leftSide;
    }

    protected createRightSide(): HTMLElement {
        const rightSide = createElement("div", ["toolbar-right"]);
        rightSide.appendChild(this.createSeparator());
        rightSide.appendChild(this.createToolButton(new FitToScreenButton()));
        rightSide.appendChild(this.createToolButton(new CollapseAllButton()));
        rightSide.appendChild(this.createToolButton(new ExpandAllButton()));
        rightSide.appendChild(this.createSeparator());
        rightSide.appendChild(this.createHelpButton());
        return rightSide;
    }

    private createToolButton(toolButton: ToolButton): HTMLElement {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv) {
            const button = createElement("div", ["overlay-button", "tooltip"]);
            button.id = `${toolButton.id}-container`;
            const insertedDiv = baseDiv.insertBefore(button, baseDiv.firstChild);
            insertedDiv.appendChild(this.createIcon(toolButton.icon));

            const tooltiptext = createElement("span", ["tooltiptext"]);
            tooltiptext.innerText = toolButton.label;
            insertedDiv.appendChild(tooltiptext);

            insertedDiv.onclick = () => this.actionDispatcher.dispatch(toolButton.action);
            return button;
        }
        return createElement("div");
    }

    protected createDropdownButton(toolDropdownButton: ToolDropdownButton): HTMLElement {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv) {
            // dropdown container
            const dropdown = createElement("div", ["toolbar-dropdown", "overlay-button"]);
            dropdown.id = `${toolDropdownButton.id}-container`;
            baseDiv.insertBefore(dropdown, baseDiv.firstChild);
            dropdown.appendChild(this.createDropdownIcon(toolDropdownButton.icon));

            // dropdown menu items
            const dropDownContent = createElement("div", ["dropdown-content"]);
            dropdown.appendChild(dropDownContent);
            toolDropdownButton.buttons.forEach((value: string, key: string) => {
                const button = createElement("div");
                dropDownContent.appendChild(button);
                button.innerHTML = `
                    <vscode-button id="btn_generate_${key}" class="dropdown-item" appearance="secondary">
                        ${value}
                    </vscode-button>`;
                button.onclick = () => vscodeApi.postMessage({ generateKind: key });
            });
            return dropdown;
        }
        return document.createElement("div");
    }

    private createNotationButtonPanel(): HTMLElement {
        const container = createElement("div");

        // button to activate notation panel
        const button = createElement("div", ["overlay-button"]);
        button.appendChild(this.createDropdownIcon("settings"));
        container.appendChild(button);

        // notation panel
        const panel = createElement("div");
        panel.id = "notation-panel";
        panel.style.display = "none";
        button.onmouseenter = () => togglePanel(panel.id);
        panel.onmouseleave = () => togglePanel(panel.id);

        // label
        const label = createElement("label", ["panel-label"]);
        label.innerText = "Notation:";
        panel.appendChild(label);

        // TODO: improve this
        const dropdownSelect = createElement("vscode-dropdown", ["dropdownSelect"]) as HTMLSelectElement;
        dropdownSelect.setAttribute("position", "below");
        dropdownSelect.innerHTML = `
            <vscode-option value="default">Default</vscode-option>
            <vscode-option value="bachman">Bachman</vscode-option>
            <vscode-option value="chen">Chen</vscode-option>
            <vscode-option value="crowsfoot">Crows Foot</vscode-option>
        `;
        dropdownSelect.onchange = () => {
            const value = dropdownSelect.options[dropdownSelect.selectedIndex].value;
            this.actionDispatcher.dispatch(ChangeNotationAction.create(value));
        };
        panel.appendChild(dropdownSelect);
        container.appendChild(panel);
        return container;
    }

    private createModelName(): HTMLElement {
        const nameElement = createElement("p");
        nameElement.id = "toolbar-modelName";
        return nameElement;
    }

    private createHelpButton(): HTMLElement {
        const baseDiv = document.getElementById(this.options.baseDiv);
        if (baseDiv) {
            const button = createElement("div", ["overlay-button", "link-button", "tooltip-help"]);
            const insertedDiv = baseDiv.insertBefore(button, baseDiv.firstChild);
            insertedDiv.appendChild(this.createIcon("question"));

            // tooltip
            const tooltiptext = createElement("span", ["tooltiptext"]);
            tooltiptext.innerText = "Open Help";
            insertedDiv.appendChild(tooltiptext);

            const link = createElement("vscode-link");
            link.appendChild(insertedDiv);
            link.setAttribute("href", "https://github.com/borkdominik/bigER/wiki/Language");
            return link;
        }
        return createElement("div");
    }

    protected createSeparator(): HTMLElement {
        return createElement("div", ["vertical-separator"]);
    }

    protected createIcon(codiconId: string): HTMLElement {
        return createElement("i", [...codiconCSSClasses(codiconId), "tool-icon"]);
    }

    protected createDropdownIcon(codiconId: string): HTMLElement {
        const container = createElement("div", ["dropdown-icon-container"]);
        const toolIcon = createElement("i", [...codiconCSSClasses(codiconId), "dropdown-icon"]);
        const chevronIcon = createElement("i", [...codiconCSSClasses("chevron-down"), "dropdown-icon"]);
        container.appendChild(toolIcon);
        container.appendChild(chevronIcon);
        return container;
    }
}