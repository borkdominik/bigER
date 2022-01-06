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
                    <vscode-option id="add-entity-button" class="button">Add Entity</vscode-option>
                    <vscode-option id="add-relationship-button" class="button">Add Relationship</vscode-option>
                    <vscode-divider class="divider" role="separator"></vscode-divider>
                    <vscode-dropdown id="dropDown-erNotations" position="below">
                        <vscode-option id="option-chen" class="option">Chen</vscode-option>
                        <vscode-option id="option-ideflx" class="option">IDEFlX</vscode-option>
                        <vscode-option id="option-bachman" class="option">Bachman</vscode-option>
                        <vscode-option id="option-martin" class="option">Martin/IE/Crow's Foot</vscode-option>
                        <vscode-option id="option-min-max" class="option">Min-Max</vscode-option>
                        <vscode-option id="option-uml" class="option">UML</vscode-option>
                    </vscode-dropdown>
                    <vscode-divider class="divider" role="separator"></vscode-divider>
                    <vscode-option id="expand-button" class="button">Expand/Collapse</vscode-option>
                    <vscode-option id="center-diagram-button" class="button">Center</vscode-option>
                    <vscode-divider class="divider" role="separator"/></vscode-divider>
                    <vscode-link class="option" href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <vscode-option id="help-button" class="button" style="width:140px">
                            Help
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

        document.getElementById('option-chen')!.addEventListener('click', async () => {
            const option = document.getElementById('option-chen');
            if(option){
                console.log(option.innerText);
            }
        });

        document.getElementById('option-ideflx')!.addEventListener('click', async () => {
            const option = document.getElementById('option-ideflx');
            if(option){
                console.log(option.innerText);
            }
        });

        document.getElementById('option-bachman')!.addEventListener('click', async () => {
            const option = document.getElementById('option-bachman');
            if(option){
                console.log(option.innerText);
            }
        });

        document.getElementById('option-martin')!.addEventListener('click', async () => {
            const option = document.getElementById('option-martin');
            if(option){
                console.log(option.innerText);
            }
        });

        document.getElementById('option-min-max')!.addEventListener('click', async () => {
            const option = document.getElementById('option-min-max');
            if(option){
                console.log(option.innerText);
            }
        });

        document.getElementById('option-uml')!.addEventListener('click', async () => {
            const option = document.getElementById('option-uml');
            if(option){
                console.log(option.innerText);
            }
        });
        
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
            this.elementsExpanded = !this.elementsExpanded;
            await this.actionDispatcher.dispatch(new CollapseExpandAllAction(this.elementsExpanded));
               
        });
        
        document.getElementById('center-diagram-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(new FitToScreenAction([]));
        });
    }
}
