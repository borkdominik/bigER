import { inject, injectable } from "inversify";
import { IActionDispatcher, IActionHandler, TYPES } from "sprotty";
import { VscodeDiagramWidgetFactory } from "sprotty-vscode-webview";
import { Action, FitToScreenAction } from "sprotty-protocol";

export interface RefreshAction {
    kind: typeof RefreshAction.KIND;
}
export namespace RefreshAction {
    export const KIND = 'refresh';

    export function create(): RefreshAction {
        return {
            kind: KIND
        };
    }
}

@injectable()
export class RefreshActionHandler implements IActionHandler {
    @inject(VscodeDiagramWidgetFactory) diagramWidgetFactory: VscodeDiagramWidgetFactory;
    @inject(TYPES.IActionDispatcher) actionDispatcher: IActionDispatcher;

    handle(action: RefreshAction): void | Action {
        const model = this.diagramWidgetFactory().requestModel();
        model.then(() => {
            this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });
    }
}