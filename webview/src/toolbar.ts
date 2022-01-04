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
            containerDiv.append(toolbar); 

            const menuButton = document.createElement("vscode-button");
            menuButton.id = "toolbar-button"
            menuButton.setAttribute("appearance","primary");
            menuButton.innerHTML = `<span class="fas fa-bars"/>`;
            toolbar.append(menuButton); 

            const toolbarOptions = document.createElement("div");
            toolbarOptions.id = "toolbar-options";
            toolbarOptions.innerHTML = `
                <vscode-button id="add-entity-button" appearance="secondary">Entity
                    <span slot="start" class="fas fa-plus"/>
                </vscode-button>
                <vscode-button id="add-relationship-button" appearance="secondary">Relationship
                    <span slot="start" class="fas fa-plus"/>
                </vscode-button>
                <vscode-dropdown id="dropDown-erNotations" position="below">
                    <vscode-option id="option-chen" style="text-align: center">Chen</vscode-option>
                    <vscode-option id="option-ideflx">IDEFlX</vscode-option>
                    <vscode-option id="option-bachman">Bachman</vscode-option>
                    <vscode-option id="option-martin">Martin/IE/Crow's Foot</vscode-option>
                    <vscode-option id="option-min-max">Min-Max</vscode-option>
                    <vscode-option id="option-uml">UML</vscode-option>
                </vscode-dropdown>
                <vscode-button id="expand-button" appearance="secondary">Expand/Collapse</vscode-button>
                <vscode-button id="center-diagram-button" appearance="secondary">Center</vscode-button>
                <vscode-button id="help-button" appearance="secondary" aria-label="Help">
                    <vscode-link href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <span class="fas fa-question"/>
                    </vscode-link>    
                </vscode-button>`;
                
            toolbar.append(toolbarOptions);    
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
