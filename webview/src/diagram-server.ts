import { ActionHandlerRegistry } from "sprotty";
import { Action, isAction } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from "sprotty-vscode-webview/lib/lsp/editing";
import { CodeGenerateAction } from "./actions";

export class BigERDiagramServer extends VscodeLspEditDiagramServer {
    initialize(registry: ActionHandlerRegistry) {
        super.initialize(registry);
        registry.register(CodeGenerateAction.KIND, this);
    }

    handleLocally(action: Action): boolean {
        if (isAction(CodeGenerateAction.KIND)) {
            return true;
        }
        return super.handleLocally(action);
    }
}