import 'reflect-metadata';
import 'sprotty-vscode-webview/css/sprotty-vscode.css';
import '../css/menu-bar.css'
import { Container } from 'inversify';
import { SprottyLspEditStarter} from 'sprotty-vscode-webview/lib/lsp/editing';
import { createDiagramContainer } from './di.config';
import { SprottyDiagramIdentifier, VscodeDiagramWidget} from 'sprotty-vscode-webview'
import { load as loadLibavoidRouter } from 'sprotty-routing-libavoid';
import { ERDiagramWidget } from './toolbar';
import { configureCommand } from 'sprotty';
import { AddEntityCommand, AddRelationshipCommand } from './actions';


export class ERDiagramSprottyStarter extends SprottyLspEditStarter {
    
    createContainer(diagramIdentifier: SprottyDiagramIdentifier) {
        return createDiagramContainer(diagramIdentifier.clientId);
    }

    protected addVscodeBindings(container: Container, diagramIdentifier: SprottyDiagramIdentifier): void {
        super.addVscodeBindings(container, diagramIdentifier);
        container.rebind(VscodeDiagramWidget).to(ERDiagramWidget).inSingletonScope();
        configureCommand(container, AddEntityCommand);
        configureCommand(container, AddRelationshipCommand);
    }
}

loadLibavoidRouter().then(() => {
    new ERDiagramSprottyStarter();
});
