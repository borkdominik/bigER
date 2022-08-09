import * as path from 'path';
import * as vscode from 'vscode';
import { LspLabelEditActionHandler, SprottyLspEditVscodeExtension, WorkspaceEditActionHandler } from "sprotty-vscode/lib/lsp/editing";
import { LanguageClient, ServerOptions, LanguageClientOptions } from "vscode-languageclient/node";
import { SprottyWebview } from "sprotty-vscode/lib/sprotty-webview";
import { SprottyDiagramIdentifier, SprottyLspWebview } from "sprotty-vscode/lib/lsp";
import { ERDiagramWebview } from './erdiagram-webview';
import newEmptyModel from './commands/new-empty-model';
import newSampleModel from './commands/new-sample-model';

export class ERDiagramLspVscodeExtension extends SprottyLspEditVscodeExtension {

    constructor(context: vscode.ExtensionContext) {
        super('erdiagram', context);
    }

    protected registerCommands() {
        super.registerCommands();
        this.context.subscriptions.push(vscode.commands.registerCommand('erdiagram.model.newEmpty', (...commandArgs: any[]) => {
                newEmptyModel();
            }));
        this.context.subscriptions.push(vscode.commands.registerCommand('erdiagram.model.newSample', (...commandArgs: any[]) => {
                newSampleModel();
            }));
    }

    protected getDiagramType(commandArgs: any[]): string | undefined {
        if (commandArgs.length === 0 || (commandArgs[0] instanceof vscode.Uri && commandArgs[0].path.endsWith('.erd'))) {
            return 'erdiagram-diagram';
        }
    }

    createWebView(identifier: SprottyDiagramIdentifier): SprottyWebview {
        const webview = new ERDiagramWebview({
            extension: this,
            identifier,
            localResourceRoots: [this.getExtensionFileUri('pack'), this.getExtensionFileUri('node_modules')],
            scriptUri: this.getExtensionFileUri('pack', 'webview.js'),
            singleton: false
        }) as SprottyLspWebview;
        webview.addActionHandler(WorkspaceEditActionHandler);
        webview.addActionHandler(LspLabelEditActionHandler);
        return webview;
    }

    protected activateLanguageClient(context: vscode.ExtensionContext): LanguageClient {
        const executable = process.platform === 'win32' ? 'erdiagram-language-server.bat' : 'erdiagram-language-server';
        const languageServerPath = path.join('server', 'erdiagram-language-server', 'bin', executable);
        const serverLauncher = context.asAbsolutePath(languageServerPath);
        const serverOptions: ServerOptions = {
            run: {
                command: serverLauncher,
                args: ['-trace']
            },
            debug: {
                command: serverLauncher,
                args: ['-trace']
            }
        };
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{
                scheme: 'file',
                language: 'erdiagram'
            }]
        };
        const languageClient = new LanguageClient('erdiagramLanguageClient', 'ERDiagram Language Server', serverOptions, clientOptions);
        context.subscriptions.push(languageClient.start());
        return languageClient;
    }

}
