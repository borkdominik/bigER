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
     * Adds a toolbar (including panels) to the Sprotty container
     */
    protected addToolbar(): void {
        const containerDiv = document.getElementById(this.diagramIdentifier.clientId + '_container');
        if (containerDiv) {
            const menu = document.createElement("div");
            menu.id = "biger-menubar"
            menu.innerHTML = `
                <div id="menubar-left">
                    <vscode-button appearance="icon" id="tools-button" style="margin-left: 5px;">
                        <span class="codicon codicon-tools"></span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <vscode-button appearance="icon" id="options-button">
                        <span class="codicon codicon-settings"></span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                </div>
                <div id="menubar-middle">
                    <p id="menubar-modelName"></p>
                </div>
                <div id="menubar-right">
                    <div class="vertical-seperator"></div>
                    <vscode-link href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <vscode-button appearance="icon" id="more-button" style="margin-right: 5px;">
                            <span class="codicon codicon-question"></span>
                        </vscode-button>
                    </vscode-link>
                </div>`;

            const toolsPanel = document.createElement("div");
            toolsPanel.id = "menubar-tools-panel"
            toolsPanel.style.display = "none";
            toolsPanel.innerHTML = `
                <vscode-button id="add-entity-button" appearance="icon">
                    <span class="codicon codicon-chrome-maximize"></span>
                </vscode-button>
                <vscode-button id="add-relationship-button" appearance="icon">
                    <span class="codicon codicon-debug-breakpoint-log-unverified"></span>
                </vscode-button>
                <div class="vertical-seperator"></div>
                <!-- TODO: Delete + Zoom In/Out
                <vscode-button id="delete-button" appearance="icon" disabled>
                    <span class="codicon codicon-trash"></span>
                </vscode-button>
                <div class="vertical-seperator"></div>
                <vscode-button appearance="icon" id="zoomIn-button">
                    <span class="codicon codicon-zoom-in"></span>
                </vscode-button>
                <vscode-button appearance="icon" id="zoomOut-button">
                    <span class="codicon codicon-zoom-out"></span>
                </vscode-button>
                <div class="vertical-seperator"></div>
                -->
                <vscode-button appearance="icon" id="fit-button">
                    <span class="codicon codicon-screen-full"></span>
                </vscode-button>
                <vscode-button appearance="icon" id="collapseAll-button">
                    <span class="codicon codicon-collapse-all"></span>
                </vscode-button>
                <vscode-button appearance="icon" id="expandAll-button">
                    <span class="codicon codicon-close-all"></span>
                </vscode-button>
            </div>`;

            const optionsPanel = document.createElement("div");
            optionsPanel.id = "menubar-options-panel"
            optionsPanel.style.display = "none"
            optionsPanel.innerHTML = `
                <label style="margin: 5px 5px 5px 5px;">Generate:</label>
                <vscode-dropdown id="select-generate" position="below" style="height: 90%; margin: 5px 5px;">
                    <vscode-option value="off">off</vscode-option>
                    <vscode-option value="sql">sql</vscode-option>
                </vscode-dropdown>
            `;
            
            containerDiv.append(menu); 
            containerDiv.append(toolsPanel);
            containerDiv.append(optionsPanel);
        } 
    }
    
    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        document.getElementById('tools-button')!.addEventListener('click', async () => {
            this.togglePanel('menubar-tools-panel')
        });

        document.getElementById('options-button')!.addEventListener('click', async () => {
            this.togglePanel('menubar-options-panel')
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
