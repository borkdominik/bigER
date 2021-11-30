import { postConstruct, inject, injectable } from 'inversify';
import {  SprottyDiagramIdentifier, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import {  Action, CollapseExpandAllAction, Command, CommandExecutionContext, CommandReturn, FitToScreenAction,  IActionDispatcher, ILogger, ModelSource, TYPES} from 'sprotty';
import { WorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import {  CodeActionProvider } from 'sprotty-vscode-webview/lib/lsp/editing';
import { CodeAction } from 'vscode-languageserver-protocol';
import { getRange } from 'sprotty-vscode-webview/lib/lsp/editing/traceable';


@injectable()
export class ERDiagramWidget extends VscodeDiagramWidget {

    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;
    @inject(SprottyDiagramIdentifier) diagramIdentifier: SprottyDiagramIdentifier;
    @inject(TYPES.ModelSource) modelSource: ModelSource;
    @inject(TYPES.ILogger) protected logger: ILogger;
    
    protected menubar: HTMLDivElement;
    protected elementsExpanded: boolean;
    
    @postConstruct()
    initialize(): void {
        super.initialize();
        this.initializeMenu();
        this.addEventHandlers();
    }

    // adds a menu bar with buttons (work in progress)
    protected initializeMenu(): void {
        const containerDiv = document.getElementById(this.diagramIdentifier.clientId + '_container');
        if (containerDiv) {
            const menubar = document.createElement("div");
            menubar.id = "menu-bar";
            document.body.appendChild(menubar);

            /*
            const menuicon = document.createElement("div");
            menuicon.classList.add("menu-bar-icon")
            const icon = document.createElement("div");
            icon.classList.add("fa")
            icon.classList.add("fa-palette")            
            menuicon.appendChild(icon);
            menubar.appendChild(menuicon);
            */
            
            const dropDown = document.createElement("div");
            dropDown.id = "dropdown-button"
            dropDown.classList.add("menu-bar-item");
            dropDown.innerText = "Add  "

            const dropdownIcon = document.createElement("div");
            dropdownIcon.classList.add("fa");
            dropdownIcon.classList.add("fa-caret-down");
            dropDown.appendChild(dropdownIcon);

            const dropdownContent = document.createElement("div");
            dropdownContent.id = "add-dropdown"
            dropdownContent.classList.add("dropdown-content");

            const entityButton = document.createElement("div");
            entityButton.id = "entity-button"
            entityButton.innerText = "New Entity"
            dropdownContent.appendChild(entityButton)

            const relationshipButton = document.createElement("div");
            relationshipButton.id = "relationship-button"
            relationshipButton.innerText = "New Relationship"
            dropdownContent.appendChild(relationshipButton)

            dropDown.appendChild(dropdownContent)
            menubar.appendChild(dropDown);
            
            const expandAll = document.createElement("div");
            expandAll.id = "expand-button"
            expandAll.classList.add("menu-bar-item")
            expandAll.innerText = "Expand/Collapse all" 
            menubar.appendChild(expandAll) 

            const zoom = document.createElement("div");
            zoom.id = "zoom-button"
            zoom.classList.add("menu-bar-item")
            zoom.innerText = "Restore View"
            menubar.appendChild(zoom)

            const helpIcon = document.createElement("a");
            helpIcon.classList.add("menu-bar-icon")
            helpIcon.href = "https://github.com/borkdominik/bigER/wiki/%F0%9F%93%96-Language-Documentation"
            const help = document.createElement("div");
            help.classList.add("far");
            help.classList.add("fa-question-circle");
            helpIcon.appendChild(help);
            menubar.appendChild(helpIcon);


            this.menubar = menubar;
            this.elementsExpanded = true;
        }
    }

    protected addEventHandlers(): void {
        document.getElementById('zoom-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(new FitToScreenAction([]));
        });
        document.getElementById('expand-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch(new CollapseExpandAllAction(!this.elementsExpanded));
            this.elementsExpanded = !this.elementsExpanded;   
        });
        document.getElementById('entity-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({
                kind: AddWithWorkspaceEditAction.KIND
            });
        });
        document.getElementById('relationship-button')!.addEventListener('click', async () => {
            await this.actionDispatcher.dispatch({
                kind: AddRelationshipWithWorkspaceEditAction.KIND
            });
        });
        document.getElementById('dropdown-button')!.addEventListener('click', async () => {
            document.getElementById("add-dropdown")!.classList.toggle("show");
        });
        window.addEventListener('click', function(event) {
            const target = event.target as HTMLElement;
            if (!target.matches('#dropdown-button')) {
                var dropdown = document.getElementById("add-dropdown");
                if (dropdown?.classList.contains('show')) {
                    dropdown.classList.remove('show');
                }
            }  
        });
    }
}

/**
 * Action for adding new elements (WIP)
 * TODO: Merge both actions into one (load codeactions once add dropdown is clicked)
 */
export interface AddWithWorkspaceEditAction extends Action { }

export namespace AddWithWorkspaceEditAction {
    export const KIND = 'addWithWorkspaceEdit';

    export function is(action: Action): action is AddWithWorkspaceEditAction {
        return action.kind === KIND;
    }
}

export interface AddRelationshipWithWorkspaceEditAction extends Action { }

export namespace AddRelationshipWithWorkspaceEditAction {
    export const KIND = 'addRelationshipWithWorkspaceEdit';

    export function is(action: Action): action is AddRelationshipWithWorkspaceEditAction {
        return action.kind === KIND;
    }
}

@injectable()
export class AddWithWorkspaceEditCommand extends Command {
    static readonly KIND = AddWithWorkspaceEditAction.KIND;

    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;
    @inject(CodeActionProvider) codeActionProvider: CodeActionProvider;

    constructor(@inject(TYPES.Action) readonly action: AddWithWorkspaceEditAction) {
        super();
    }

    codeactions: CodeAction[];
    
    async getCodeAction(context: CommandExecutionContext) {
        const root = context.root;
        const range = getRange(root);
        if (range) {
            const codeActions = await this.codeActionProvider.getCodeActions(range, 'sprotty.create');
            if (codeActions) {
                codeActions.forEach(codeAction => {
                    if (CodeAction.is(codeAction)) {
                        this.codeactions.push(codeAction);
                    }
                });
            }
        }
    }
    
    execute(context: CommandExecutionContext): CommandReturn {
        this.codeactions = [];
        this.getCodeAction(context).then(() => {
            this.actionDispatcher.dispatch(<WorkspaceEditAction> {
                kind: WorkspaceEditAction.KIND,
                workspaceEdit: this.codeactions[0].edit
            } as Action);
        });
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return context.root;
    }
}

@injectable()
export class AddRelationshipWithWorkspaceEditCommand extends Command {
    static readonly KIND = AddRelationshipWithWorkspaceEditAction.KIND;

    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;
    @inject(CodeActionProvider) codeActionProvider: CodeActionProvider;

    constructor(@inject(TYPES.Action) readonly action: AddRelationshipWithWorkspaceEditAction) {
        super();
    }

    codeactions: CodeAction[];
    
    async getCodeAction(context: CommandExecutionContext) {
        const root = context.root;
        const range = getRange(root);
        if (range) {
            const codeActions = await this.codeActionProvider.getCodeActions(range, 'sprotty.create');
            if (codeActions) {
                codeActions.forEach(codeAction => {
                    if (CodeAction.is(codeAction)) {
                        this.codeactions.push(codeAction);
                    }
                });
            }
        }
    }
    
    execute(context: CommandExecutionContext): CommandReturn {
        this.codeactions = [];
        this.getCodeAction(context).then(() => {
            this.actionDispatcher.dispatch(<WorkspaceEditAction> {
                kind: WorkspaceEditAction.KIND,
                workspaceEdit: this.codeactions[1].edit
            } as Action);
        });
        return context.root;
    }

    undo(context: CommandExecutionContext): CommandReturn {
        return context.root;
    }

    redo(context: CommandExecutionContext): CommandReturn {
        return context.root;
    }
}
