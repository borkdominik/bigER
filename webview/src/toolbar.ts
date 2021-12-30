import { postConstruct, inject, injectable } from 'inversify';
import {  SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import {  CollapseExpandAllAction, FitToScreenAction,  IActionDispatcher, ILogger, ModelSource, TYPES} from 'sprotty';
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
            toolbar.id = "biger-toolbar";
            toolbar.innerHTML = `
                <vscode-button id="add-entity-button">
                    Entity
                    <span slot="start" class="fas fa-plus"></span>
                </vscode-button>
                <vscode-button id="add-relationship-button">
                    Relationship
                    <span slot="start" class="fas fa-plus"></span>
                </vscode-button>
                <vscode-button id="expand-button">
                    Expand/Collapse
                </vscode-button>
                <vscode-button id="center-diagram-button"">
                    Center
                </vscode-button>
                <vscode-button id="help-button" appearance="icon" aria-label="Help">
                    <vscode-link href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <span class="fas fa-question"></span>
                    </vscode-link>    
                </vscode-button>
                `;
                
            containerDiv.append(toolbar);    
            this.elementsExpanded = true;
        } 
    }
    
    /**
     * Adds event handlers to the buttons, by dispatching corresponding events
     */
    protected addEventHandlers(): void {
        
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
            this.elementsExpanded = !this.elementsExpanded;
            await this.actionDispatcher.dispatch(new CollapseExpandAllAction(this.elementsExpanded));
               
        });
        
        document.getElementById('center-diagram-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(new FitToScreenAction([]));
        });
    }
}
