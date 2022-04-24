import { postConstruct, inject, injectable } from 'inversify';
import { SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { IActionDispatcher, ILogger, ModelSource, TYPES} from 'sprotty';
import { CollapseExpandAllAction, FitToScreenAction } from 'sprotty-protocol';
import { AddEntityAction, AddRelationshipAction, ChangeNotationAction } from './actions';

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
                <div id="notation-div">
                    <vscode-button id="toolbar-button">
                        <span class="fas fa-bars"/>
                    </vscode-button>
                    <div id="notationOptions" style="display: none;">
                        <vscode-option style="width:100%;" id="optionBachman" class="button">Bachman</vscode-option>
                        <vscode-option style="width:100%;" id="optionChen" class="button">Chen</vscode-option>
                        <vscode-option style="width:100%;" id="optionCrowsfoot" class="button">Crow's Foot</vscode-option>
                        <vscode-option style="width:100%;" id="optionMinMax" class="button">MinMax</vscode-option>
                        <vscode-option style="width:100%;" id="optionUml" class="button">UML</vscode-option>
                    </div>
                    <div id="help" style="display: none;">
                        <span class="helpText">Crows Foot</span>
                        <vscode-divider class="divider" role="separator"></vscode-divider>
                        <span class="helpText">Cardinality usage:</span>
                        <span class="helpText">[1]&nbsp&nbsp&nbsp one</span>
                        <span class="helpText">[1+]&nbsp one or more</span>
                        <span class="helpText">[0+]&nbsp zero or more</span>
                        <span class="helpText">[?]&nbsp&nbsp&nbsp zero ore one</span>
                    </div>
                    <div id="helpBachman" style="display: none;">
                        <span class="helpText">Bachman</span>
                        <vscode-divider class="divider" role="separator"></vscode-divider>
                        <span class="helpText">Cardinality usage:</span>
                        <span class="helpText">[0] zero</span>
                        <span class="helpText">[0+] zero or more</span>
                        <span class="helpText">[1] one</span>
                        <span class="helpText">[1+] one or more</span>
                    </div>
                    <div id="helpChen" style="display: none;">
                        <span class="helpText">Chen</span>
                        <vscode-divider class="divider" role="separator"></vscode-divider>
                        <span class="helpText">Cardinality usage:</span>
                        <span style="margin-top:10px;margin-left:10px;">[1] zero or one</span>
                        <span class="helpText">[M] zero or more</span>
                        <span class="helpText" style="margin-bottom:11px;">[N] zero or more</span>
                    </div>
                    <div id="helpMinMax" style="display: none;">
                        <span class="helpText">MinMax</span>
                        <vscode-divider class="divider" role="separator"></vscode-divider>
                        <span class="helpText">Cardinality usage:</span>
                        <span class="helpText">min: number</span>
                        <span class="helpText">max: number</span>
                        <span class="helpText">[min,max] min <= max</span>
                        <span class="helpText">[min,*] min or more</span>
                    </div>
                    <div id="helpUml" style="display: none;">
                        <span class="helpText">UML</span>
                        <vscode-divider class="divider" role="separator"></vscode-divider>
                        <span class="helpText">Cardinality usage:</span>
                        <span class="helpText">[num] or [type num] </span>
                        <span class="helpText">type: strong|weak</span>
                        <span class="helpText">[min..max] min <= max</span>
                        <span class="helpText">[min..*] min or more</span>
                    </div>
                </div>
                <div id = "toolbar-options">
                    <vscode-option id="add-entity-button" class="button">Entity
                        <span id="button-icon" slot="start" class="codicon codicon-chrome-maximize"/>
                    </vscode-option>
                    <vscode-option id="add-relationship-button" class="button">Relationship
                        <span id="button-icon" slot="start" class="codicon codicon-debug-breakpoint-log-unverified"/>
                    </vscode-option>
                    <vscode-divider class="divider" role="separator"></vscode-divider>
                    <vscode-option id="notationButton" class="button">Chen
                        <span id="button-icon" slot="start" class="fas fa-angle-left"/>
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
                    <vscode-link style="width:100%;" class="option" href="https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation">
                        <vscode-option id="helpButton" class="button">Help
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

        let notationBtnTimer:NodeJS.Timeout;
        let helpBtnTimer:NodeJS.Timeout;
        const delayEnter = 300
        const delayLeave = 100
        const noDelay = 0
        
        function showElement(elementName:string, dealy:number): NodeJS.Timeout{
            return setTimeout(function() {
                        var options = document.getElementById(elementName);
                        if(options){
                           options.style.display = "flex";
                        }
                    }, dealy);
        }

        function hideElement(elementName:string, dealy:number): NodeJS.Timeout{
            return setTimeout(function() {
                        var options = document.getElementById(elementName);
                        if(options){
                            options.style.display = "none";
                        }
            }, dealy);
        }

        document.getElementById('notationButton')!.addEventListener('mouseenter', async () => {
                clearTimeout(notationBtnTimer);
                notationBtnTimer = showElement('notationOptions', delayEnter)
        });

        document.getElementById('notationButton')!.addEventListener('mouseleave', async () => {
            clearTimeout(notationBtnTimer);
            notationBtnTimer = hideElement('notationOptions', delayLeave)
        });

        document.getElementById('notationOptions')!.addEventListener('mouseenter', async () => {
            clearTimeout(notationBtnTimer);
        });

        document.getElementById('notationOptions')!.addEventListener('mouseleave', async () => {
            clearTimeout(notationBtnTimer);
            hideElement('notationOptions', delayLeave)
        });

        function changeNotationBtn(notation:string){
            const option = document.getElementById('notationButton');
            if(option){
                option.innerHTML = notation+'<span id="button-icon" slot="start" class="fas fa-angle-left"/>'
                hideElement('notationOptions', noDelay)
            }
        }

        document.getElementById('optionBachman')!.addEventListener('click', async () => {
            changeNotationBtn('Bachman')
        });

        document.getElementById('optionChen')!.addEventListener('click', async () => {
            changeNotationBtn('Chen')
        });

        document.getElementById('optionCrowsfoot')!.addEventListener('click', async () => {
            changeNotationBtn('Crows Foot')
            await this.actionDispatcher.dispatch(ChangeNotationAction.create("crowsfoot"));
        });

        document.getElementById('optionMinMax')!.addEventListener('click', async () => {
            changeNotationBtn('MinMax')
        });

        document.getElementById('optionUml')!.addEventListener('click', async () => {
            changeNotationBtn('UML')
        });

        function hideOrShowElement(element:string, show:boolean){
            clearTimeout(helpBtnTimer)
            show ? helpBtnTimer = showElement(element, delayEnter) : hideElement(element, delayLeave)
        }

        function chooseNotation(show:boolean){
            var notationBtn = document.getElementById("notationButton");
            if(notationBtn){
                switch(notationBtn.innerText){
                    case 'Bachman' : 
                        hideOrShowElement('helpBachman', show)
                        break
                    case 'Chen' : 
                        hideOrShowElement('helpChen', show)
                        break
                    case 'MinMax' : 
                        hideOrShowElement('helpMinMax', show)
                        break
                    case 'UML' : 
                        hideOrShowElement('helpUml', show)
                        break
                    default : 
                        hideOrShowElement('help', show)
                        break
                }
            }
        }

        document.getElementById('helpButton')!.addEventListener('mouseenter', async () => {
            chooseNotation(true);
        });

        document.getElementById('helpButton')!.addEventListener('mouseleave', async () => {
            chooseNotation(false);
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
            await this.showAndHideExpandCollapse("none", "block")
        });

        document.getElementById('collapse-button')!.addEventListener('click', async () => {
            await this.showAndHideExpandCollapse("block", "none")
        });

        document.getElementById('center-diagram-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(FitToScreenAction.create([]));
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
            await this.actionDispatcher.dispatch(CollapseExpandAllAction.create({expand: this.elementsExpanded}));
    }
}
