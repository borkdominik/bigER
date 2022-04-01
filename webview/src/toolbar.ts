import { postConstruct, inject, injectable } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { IActionDispatcher, ILogger, ModelSource, TYPES } from 'sprotty';
import { CollapseExpandAllAction, FitToScreenAction } from 'sprotty-protocol';
import { AddEntityAction, AddRelationshipAction } from './actions';

@injectable()
export class ERDiagramWidget extends VscodeDiagramWidget {

    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;
    @inject(SprottyDiagramIdentifier) diagramIdentifier: SprottyDiagramIdentifier;
    @inject(TYPES.ModelSource) modelSource: ModelSource;
    @inject(TYPES.ILogger) protected logger: ILogger;
    
    protected elementsExpanded: boolean;
    
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

            /*
            const menu = document.createElement("div");
            menu.id = "biger-toolbar"
            menu.innerHTML = `
                <vscode-button appearance="icon" aria-label="Menu" id="toolbar-button">
	                <span class="codicon codicon-menu"></span>
                </vscode-button>
                <div id="toolbar-options">
                    <vscode-option id="add-entity-button" class="button">Entity
                        <span id="button-icon" slot="start" class="codicon codicon-chrome-maximize"/>
                    </vscode-option>
                    <vscode-option id="add-relationship-button" class="button">Relationship
                        <span id="button-icon" slot="start" class="codicon codicon-debug-breakpoint-log-unverified"/>
                    </vscode-option>
                    <vscode-divider class="divider" role="separator"></vscode-divider>
                    <div id="expand-div" style="display:none">
                        <vscode-option style="width:140px;" id="expand-button" class="button">Expand</vscode-option>
                    </div>
                    <div id="collapse-div">
                        <vscode-option style="width:140px;" id="collapse-button" class="button">Collapse</vscode-option>
                    </div>
                    <vscode-option id="center-diagram-button" class="button">Center</vscode-option>
                    <vscode-divider class="divider" role="separator"/></vscode-divider>
                    <vscode-link class="option" href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <vscode-option id="help-button" class="button">Help
                            <span id="button-icon" slot="start" class="fas fa-question"/>
                        </vscode-option>
                    </vscode-link>
                </div>`; 
            */

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
            toolsPanel.innerHTML = `
                <vscode-button id="add-entity-button" appearance="icon">
                    <span class="codicon codicon-chrome-maximize"></span>
                </vscode-button>
                <vscode-button id="add-relationship-button" appearance="icon">
                    <span class="codicon codicon-debug-breakpoint-log-unverified"></span>
                </vscode-button>
                <div class="vertical-seperator"></div>
                <!-- TODO
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
            optionsPanel.innerHTML = `
                <label style="margin: 5px 5px 5px 5px;">Generate:</label>
                <vscode-dropdown position="below" style="height: 90%; margin: 5px 5px;">
                    <vscode-option>Off</vscode-option>
                    <vscode-option>SQL</vscode-option>
                </vscode-dropdown>
            `;
            
            containerDiv.append(menu); 
            containerDiv.append(toolsPanel);
            containerDiv.append(optionsPanel);
            this.elementsExpanded = true;
        } 
    }
    
    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        document.getElementById('tools-button')!.addEventListener('click', async () => {
            const tools = document.getElementById('menubar-tools-panel');
            if (tools) {
                if (tools.style.display === "none") {
                    tools.style.display = "flex";
                } else {
                    tools.style.display = "none";
                }
            }
        });
        document.getElementById('options-button')!.addEventListener('click', async () => {
            const morePanel = document.getElementById('menubar-options-panel');
            if (morePanel) {
                if (morePanel.style.display === "none") {
                    morePanel.style.display = "flex";
                } else {
                    morePanel.style.display = "none";
                }
            }
        });

        document.getElementById('add-entity-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({kind: AddEntityAction.KIND});
        });

        document.getElementById('add-relationship-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({kind: AddRelationshipAction.KIND});
        });
        
        document.getElementById('expandAll-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: true}));
        });

        document.getElementById('collapseAll-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: false}));
        });
    
        document.getElementById('fit-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });

        /*
        document.getElementById('expand-button')!.addEventListener('click', async () => {
            await this.showAndHideExpandCollapse("none", "block")
        });
        document.getElementById('collapse-button')!.addEventListener('click', async () => {
            await this.showAndHideExpandCollapse("block", "none")
        });
        document.getElementById('center-diagram-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        }); 
        */
    }

    
    async showAndHideExpandCollapse(expandStyle:string, collapseStyle:string) {
        var expand = document.getElementById("expand-div");
            if(expand){
                expand.style.display = expandStyle;
            }
            var collapse = document.getElementById("collapse-div");
            if(collapse){
                collapse.style.display = collapseStyle;
            }
            if(expandStyle === "none"){
                this.elementsExpanded = true;
            }else{
                this.elementsExpanded = false;
            }
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: this.elementsExpanded}));
    }
}
