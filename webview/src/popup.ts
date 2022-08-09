import { EditLabelAction, EMPTY_ROOT, IActionDispatcher, ILogger, MouseListener, TYPES } from "sprotty";
import { inject } from "inversify";
import { PopupButton } from "./model";
import { Action, SelectAction, SelectAllAction, SetPopupModelAction, SModelElement } from "sprotty-protocol";
import { DeleteWithWorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';


export class PopupButtonListener extends MouseListener {

    @inject(TYPES.ILogger) protected logger: ILogger;
    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;

    mouseDown(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        const actions: Action[] = [];
        if (target instanceof PopupButton) {
            switch (target.kind) {
                case 'delete': {
                    const elementIds: string[] = [];
                    elementIds.push(target.target);
                    // deselect all elements and only re-select current element to assure single deletion
                    this.actionDispatcher.dispatch(SelectAllAction.create({ select: false }));
                    this.actionDispatcher.dispatch(SelectAction.create({ selectedElementsIDs: elementIds }));
                    this.actionDispatcher.dispatch({ kind: DeleteWithWorkspaceEditAction.KIND });
                    break;
                }
                case 'edit': {
                    actions.push(EditLabelAction.create(target.target));
                    break;
                }
            }
            // return [this.getWorkspaceEditAction(target)];
            actions.push(SetPopupModelAction.create(EMPTY_ROOT));
            return actions;
        }
        return [];
    }
}