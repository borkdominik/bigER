import { injectable } from "inversify";
import { ActionHandlerRegistry } from "sprotty";
import { Action, isAction } from 'sprotty-protocol';
import { VscodeLspEditDiagramServer } from "sprotty-vscode-webview/lib/lsp/editing";
import { ChangeNotationAction, CodeGenerateAction } from "./actions";

@injectable()
export class BigERDiagramServer extends VscodeLspEditDiagramServer {

    override initialize(registry: ActionHandlerRegistry): void {
        super.initialize(registry);
        registry.register(ChangeNotationAction.KIND, this);
        registry.register(CodeGenerateAction.KIND, this);
    }

    override handleLocally(action: Action): boolean {
        if (isAction(CodeGenerateAction.KIND)) {
            return true;
        } else if (isAction(ChangeNotationAction.KIND)) {
            return true;
        }
        return super.handleLocally(action);
    }
}