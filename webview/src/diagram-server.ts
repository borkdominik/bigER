import { ActionHandlerRegistry } from "sprotty";
import { Action, isAction } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from "sprotty-vscode-webview/lib/lsp/editing";
import { ChangeNotationAction } from "./actions";

export class BigERDiagramServer extends VscodeLspEditDiagramServer {
    initialize(registry: ActionHandlerRegistry) {
        super.initialize(registry);
        registry.register(ChangeNotationAction.KIND, this);
    }

    handleLocally(action: Action): boolean {
        if (isAction(ChangeNotationAction.KIND)) {
            return true;
        }
        return super.handleLocally(action);
    }
}