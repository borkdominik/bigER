import { postConstruct, injectable } from 'inversify';
import { VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { DiagramServerProxy } from 'sprotty';
import { CollapseExpandAllAction, FitToScreenAction } from 'sprotty-protocol';
import { ChangeNotationAction, CreateElementEditAction } from './actions';
import { DiagramTypes } from './utils';
import { vscodeApi } from 'sprotty-vscode-webview/lib/vscode-api';


@injectable()
export class ERDiagramWidget extends VscodeDiagramWidget {

    constructor() {
        super();
    }

    @postConstruct()
    override initialize(): void {
        super.initialize();
        this.addToolbar();
        this.addEventHandlers();
    }

    protected override initializeSprotty(): void {
        if (this.modelSource instanceof DiagramServerProxy) {
            this.modelSource.clientId = this.diagramIdentifier.clientId;
        }
        const model = this.requestModel();
        model.then(res => {
            this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });
    }

    /**
     * Adds a toolbar to the Sprotty container
     * TODO: Refactor to {@link AbstractUiExtension} ?
     */
    protected addToolbar(): void {
        const containerDiv = document.getElementById(this.diagramIdentifier.clientId + '_container');
        if (containerDiv) {
            const menu = document.createElement("div");
            menu.id = "biger-toolbar";
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
                    <div class="generate-dropdown">
                        <vscode-button id="generate-dropdown-button" appearance="icon">
                            <span class="codicon codicon-file-code"></span>
                            <span class="codicon codicon-chevron-down"></span>
                        </vscode-button>
                        <div class="dropdown-content">
                            <vscode-button id="generate-sql-button" appearance="secondary">Generate SQL</vscode-button>
                            <vscode-button id="generate-mongodb-button" appearance="secondary">Generate MongoDb</vscode-button>
                            <vscode-button id="generate-neo4j-button" appearance="secondary">Generate Neo4j</vscode-button>
                            <vscode-button id="generate-cassandradb-button" appearance="secondary">Generate CassandraDb</vscode-button>
                        </div>
                    </div>
                    <div class="vertical-seperator"></div>
                    <vscode-button appearance="icon" class="tooltip" id="notation-button">
                        <span class="codicon codicon-settings"></span>
                        <span class="tooltiptext">Select ER Notation</span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <p id="toolbar-modelName"></p>
                </div>
                <div id="toolbar-right">
                    <div class="vertical-seperator"></div>
                    <vscode-button appearance="icon" id="refresh-button" class="tooltip">
                        <span class="codicon codicon-refresh"></span>
                        <span class="tooltiptext">Refresh Diagram</span>
                    </vscode-button>
                    <vscode-button appearance="icon" id="fit-button" class="tooltip">
                        <span class="codicon codicon-screen-full"></span>
                        <span class="tooltiptext">Fit to Screen</span>
                    </vscode-button>
                    <vscode-button appearance="icon" id="collapseAll-button" class="tooltip">
                        <span class="codicon codicon-collapse-all"></span>
                        <span class="tooltiptext">Collapse All</span>
                    </vscode-button>
                    <vscode-button appearance="icon" id="expandAll-button" class="tooltip-help">
                        <span class="codicon codicon-expand-all"></span>
                        <span class="tooltiptext">Expand All</span>
                    </vscode-button>
                    <div class="vertical-seperator"></div>
                    <vscode-link href="https://github.com/borkdominik/bigER/wiki/Language">
                        <vscode-button appearance="icon" class="tooltip-help" id="more-button" style="margin-right: 5px;">
                            <span class="codicon codicon-question"></span>
                            <span class="tooltiptext">Help</span>
                        </vscode-button>
                    </vscode-link>
                </div>`;

            const notationPanel = document.createElement("div");
            notationPanel.id = "toolbar-notation-panel";
            notationPanel.style.display = "none";
            notationPanel.innerHTML = `
                <label style="margin: 5px 5px 5px 5px;">Notation:</label>
                <vscode-dropdown id="select-notation" position="below" style="height: 90%; margin: 5px 30px;">
                    <vscode-option value="default">Default</vscode-option>
                    <vscode-option value="bachman">Bachman</vscode-option>
                    <vscode-option value="chen">Chen</vscode-option>
                    <vscode-option value="crowsfoot">Crows Foot</vscode-option>
                </vscode-dropdown>
            `;

            containerDiv.append(menu);
            containerDiv.append(notationPanel);
        }
    }

    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        (document.getElementById('add-entity-button') as HTMLElement).addEventListener('click', async () => {
            this.actionDispatcher.dispatch(CreateElementEditAction.create('entity'));
        });
        (document.getElementById('add-relationship-button') as HTMLElement).addEventListener('click', async () => {
            this.actionDispatcher.dispatch(CreateElementEditAction.create('relationship'));
        });
        (document.getElementById('generate-sql-button') as HTMLElement).addEventListener('click', async () => {
            await vscodeApi.postMessage({ generateKind: 'sql' });
        });
        (document.getElementById('generate-mongodb-button') as HTMLElement).addEventListener('click', async () => {
            await vscodeApi.postMessage({ generateKind: 'mongodb' });
        });
        (document.getElementById('generate-neo4j-button') as HTMLElement).addEventListener('click', async () => {
            await vscodeApi.postMessage({ generateKind: 'neo4j' });
        });
        (document.getElementById('generate-cassandradb-button') as HTMLElement).addEventListener('click', async () => {
            await vscodeApi.postMessage({ generateKind: 'cassandradb' });
        });
        (document.getElementById('fit-button') as HTMLElement).addEventListener('click', async () => {
            this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });
        (document.getElementById('refresh-button') as HTMLElement).addEventListener('click', async () => {
            await this.requestModel().then(res => {
                this.actionDispatcher.dispatch(FitToScreenAction.create([]));
            });
        });
        (document.getElementById('expandAll-button') as HTMLElement).addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: true}));
        });
        (document.getElementById('collapseAll-button') as HTMLElement).addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: false}));
        });
        (document.getElementById('notation-button') as HTMLElement).addEventListener('click', async () => {
            this.togglePanel('toolbar-notation-panel');
        });
        (document.getElementById('select-notation') as HTMLElement).addEventListener('change', async () => {
            const select = document.getElementById('select-notation') as HTMLSelectElement;
            if (select) {
                const value = select.options[select.selectedIndex].value;
                if (value === DiagramTypes.DEFAULT_NOTATION || value === DiagramTypes.BACHMAN_NOTATION ||
                    value === DiagramTypes.CHEN_NOTATION || value === DiagramTypes.CROWSFOOT_NOTATION
                ) {
                    await this.actionDispatcher.dispatch(ChangeNotationAction.create(value));
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
