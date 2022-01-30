import { postConstruct, inject, injectable } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { CollapseExpandAllAction, FitToScreenAction, IActionDispatcher, ILogger, ModelSource, TYPES} from 'sprotty';
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

            const toolbar = document.createElement("div");
            toolbar.id = "biger-toolbar"
            toolbar.innerHTML = `
                <vscode-button id="toolbar-button">
                    <span class="fas fa-bars"/>
                </vscode-button>
                <div id = "toolbar-options">
                    <vscode-option id="add-entity-button" class="button">Entity
                        <span id="button-icon" slot="start" class="fas fa-plus"/>
                    </vscode-option>
                    <vscode-option id="add-relationship-button" class="button">Relationship
                        <span id="button-icon" slot="start" class="fas fa-plus"/>
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

            containerDiv.append(toolbar);   
            this.elementsExpanded = true;
        } 
    }
    
    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        
        document.getElementById('toolbar-button')!.addEventListener('click', async () => {
                var options = document.getElementById("toolbar-options");
                if(options){
                    if (options.style.display === "none") {
                        options.style.display = "flex";
                      } else {
                        options.style.display = "none";
                      }
                }
        });

        document.getElementById('add-entity-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({
                kind: AddEntityAction.KIND
            });
        });

        document.getElementById('add-relationship-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({
                kind: AddRelationshipAction.KIND
            });
        });
        
        document.getElementById('expand-button')!.addEventListener('click', async () => {
            await this.showAndHideExpandCollapse("none", "block")
        });

        document.getElementById('collapse-button')!.addEventListener('click', async () => {
            await this.showAndHideExpandCollapse("block", "none")
        });

        document.getElementById('center-diagram-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(new FitToScreenAction([]));
        });
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
            await this.actionDispatcher.dispatch(new CollapseExpandAllAction(this.elementsExpanded));
    }
}
