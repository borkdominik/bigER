import { EditLabelAction, EMPTY_ROOT, MouseListener } from "sprotty";
import { Action, SelectAction, SelectAllAction, SetPopupModelAction, SModelElement } from "sprotty-protocol";
import { DeleteWithWorkspaceEditAction } from 'sprotty-vscode-protocol/lib/lsp/editing';
import { PopupButton } from "./model";
import { AddAttributeAction } from "./actions";

export class PopupButtonListener extends MouseListener {

    override mouseDown(target: SModelElement, event: MouseEvent): (Action | Promise<Action>)[] {
        if (!(target instanceof PopupButton)) {
            return [];
        }

        const actions: Action[] = [];
        actions.push(SetPopupModelAction.create(EMPTY_ROOT));
        switch (target.kind) {
            case 'delete': {
                this.handleDelete(target, actions);
                break;
            }
            case 'edit': {
                actions.push(EditLabelAction.create(target.target));
                break;
            }
            case 'addAttribute': {
                actions.push(AddAttributeAction.create(target.target));
                break;
            }
        }
        return actions;
    }

    private handleDelete(target: PopupButton, actions: Action[]): void {
        const elementIds = [target.target];
        // de-select all elements first, before selecting the element to delete
        actions.push(SelectAllAction.create({ select: false }));
        actions.push(SelectAction.create({ selectedElementsIDs: elementIds }));
        actions.push({ kind: DeleteWithWorkspaceEditAction.KIND });
    }
}