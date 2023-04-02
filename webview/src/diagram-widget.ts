import { postConstruct, injectable } from 'inversify';
import { VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { DiagramServerProxy, SetUIExtensionVisibilityAction } from 'sprotty';
import { FitToScreenAction } from 'sprotty-protocol';

@injectable()
export class ERDiagramWidget extends VscodeDiagramWidget {

    constructor() {
        super();
    }

    @postConstruct()
    override initialize(): void {
        super.initialize();
    }

    protected override initializeSprotty(): void {
        if (this.modelSource instanceof DiagramServerProxy) {
            this.modelSource.clientId = this.diagramIdentifier.clientId;
        }
        const model = this.requestModel();
        model.then(() => {
            // fit diagram to screen after model is loaded
            this.actionDispatcher.dispatch(FitToScreenAction.create([]));
        });
        // make toolbar visible
        this.actionDispatcher.dispatch(SetUIExtensionVisibilityAction.create({extensionId: "toolbar-overlay", visible: true }));
    }
}
