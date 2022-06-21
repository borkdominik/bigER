import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';
import '../css/menu-bar.css';
import { Container } from 'inversify';
import { SprottyLspEditStarter } from 'sprotty-vscode-webview/lib/lsp/editing';
import { createDiagramContainer } from './di.config';
import { SprottyDiagramIdentifier } from 'sprotty-vscode-protocol';
import { VscodeDiagramServer, VscodeDiagramWidget } from 'sprotty-vscode-webview';
import { load as loadLibavoidRouter } from 'sprotty-routing-libavoid';
import { ERDiagramWidget } from './toolbar';
import { configureCommand, configureModelElement, TYPES } from 'sprotty';
import { AddEntityCommand, AddRelationshipCommand } from './actions';
import { BigERDiagramServer } from './diagram-server';
import { PopupButton } from './model';
import { PopupButtonView } from './views';
import { PopupButtonListener } from './popup';


export class ERDiagramSprottyStarter extends SprottyLspEditStarter {

    createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createDiagramContainer(diagramIdentifier.clientId);
    }

    protected addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        container.rebind(VscodeDiagramServer).to(BigERDiagramServer);
        container.rebind(VscodeDiagramWidget).to(ERDiagramWidget).inSingletonScope();
        container.bind(TYPES.PopupMouseListener).to(PopupButtonListener);
        configureCommand(container, AddEntityCommand);
        configureCommand(container, AddRelationshipCommand);
        configureModelElement(container, 'button:delete', PopupButton, PopupButtonView);
        configureModelElement(container, 'button:edit', PopupButton, PopupButtonView);
    }
}

loadLibavoidRouter().then(() => {
    new ERDiagramSprottyStarter();
});
