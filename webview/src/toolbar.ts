import { postConstruct, inject, injectable } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { IActionDispatcher, ILogger, ModelSource, TYPES } from 'sprotty';
import { CollapseExpandAllAction, FitToScreenAction } from 'sprotty-protocol';
import { AddEntityAction, AddRelationshipAction, CodeGenerateAction } from './actions';

@injectable()
export class ERDiagramWidget extends VscodeDiagramWidget {

    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;
    @inject(SprottyDiagramIdentifier) diagramIdentifier: SprottyDiagramIdentifier;
    @inject(TYPES.ModelSource) modelSource: ModelSource;
    @inject(TYPES.ILogger) protected logger: ILogger;
    
    @postConstruct()
    initialize(): void {
        super.initialize();
        this.addToolbar();
        this.addEventHandlers();
    }

    /**
     * Adds a toolbar to the Sprotty container
     */
    protected addToolbar(): void {
        const containerDiv = document.getElementById(this.diagramIdentifier.clientId + '_container');
        if (containerDiv) {
            const menu = document.createElement("div");
            menu.id = "biger-toolbar"
            menu.innerHTML = `
                <div id="toolbar-left">
                    <vscode-button id="add-entity-button" class="tooltip" appearance="icon" style="margin-left: 5px;">
                        <span class="action-label codicon codicon-debug-stop"></span>
                        <span class="tooltiptext">New Entity</span>
                    </vscode-button>
                    <vscode-button id="add-relationship-button" class="tooltip" appearance="icon">
                        <span class="codicon codicon-primitive-square rotated"></span>
                        <span class="tooltiptext">New Relationship</span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <vscode-button appearance="icon" class="tooltip" id="options-button">
                        <span class="codicon codicon-file-code"></span>
                        <span class="tooltiptext">Code Generator</span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <p id="toolbar-modelName"></p>
                </div>
                <div id="toolbar-right">
                    <div class="vertical-seperator"></div>
                    <vscode-button appearance="icon" id="fit-button" class="tooltip">
                        <span class="codicon codicon-screen-full"></span>
                        <span class="tooltiptext">Fit to Screen</span>
                    </vscode-button>
                    <vscode-button appearance="icon" id="collapseAll-button" class="tooltip">
                        <span class="codicon codicon-collapse-all"></span>
                        <span class="tooltiptext">Collapse All</span>
                    </vscode-button>
                    <vscode-button appearance="icon" id="expandAll-button" class="tooltip">
                        <span class="codicon codicon-expand-all"></span>
                        <span class="tooltiptext">Expand All</span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <vscode-link href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <vscode-button appearance="icon" class="tooltip-help" id="more-button" style="margin-right: 5px;">
                            <span class="codicon codicon-question"></span>
                            <span class="tooltiptext">Help</span>
                        </vscode-button>
                    </vscode-link>
                </div>`;

            const optionsPanel = document.createElement("div");
            optionsPanel.id = "toolbar-options-panel"
            optionsPanel.style.display = "none"
            optionsPanel.innerHTML = `
                <label style="margin: 5px 5px 5px 5px;">Generate:</label>
                <vscode-dropdown id="select-generate" position="below" style="height: 90%; margin: 5px 5px;">
                    <vscode-option value="off">off</vscode-option>
                    <vscode-option value="sql">sql</vscode-option>
                </vscode-dropdown>
            `;
            
            containerDiv.append(menu);
            containerDiv.append(optionsPanel);
        } 
    }
    
    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        document.getElementById('add-entity-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({kind: AddEntityAction.KIND});
        });
        document.getElementById('add-relationship-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({kind: AddRelationshipAction.KIND});
        });
        document.getElementById('fit-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });
        document.getElementById('expandAll-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: true}));
        });
        document.getElementById('collapseAll-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: false}));
        });
        document.getElementById('options-button')!.addEventListener('click', async () => {
            this.togglePanel('toolbar-options-panel')
        });
        document.getElementById('select-generate')!.addEventListener('change', async () => {
            var select = document.getElementById('select-generate') as HTMLSelectElement;
            if (select) {
                var value = select.options[select.selectedIndex].value;
                if (value === 'off' || value === 'sql') {
                    await this.actionDispatcher.dispatch(CodeGenerateAction.create(value));
                }
            }
        });
    }

    protected togglePanel(panelId: string): void {
        const panel = document.getElementById(panelId);
        if (panel) {
            if (panel.style.display === 'none') {
                panel.style.display = 'flex';
            } else {
                panel.style.display = 'none';
            }
        }
    }
}
