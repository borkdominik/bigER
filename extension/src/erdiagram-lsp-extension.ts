import * as path from 'path';
import * as vscode from 'vscode';
import { LspLabelEditActionHandler, SprottyLspEditVscodeExtension, WorkspaceEditActionHandler } from "sprotty-vscode/lib/lsp/editing";
import { LanguageClient, ServerOptions, LanguageClientOptions } from "vscode-languageclient/node";
import { SprottyWebview } from "sprotty-vscode/lib/sprotty-webview";
import { SprottyDiagramIdentifier } from "sprotty-vscode/lib/lsp";
import { ERDiagramWebview } from './erdiagram-webview';
import newEmptyModel from './commands/new-empty-model';
import newSampleModel from './commands/new-sample-model';
import { generateCassandraDbHandler, generateMongoDbHandler, generateNeo4jHandler, generateDb2Handler, generateMsSqlHandler, generateMySqlHandler, generateOracleHandler, generatePostgresHandler, generateSqlHandler } from './commands/generate';

export class ERDiagramLspVscodeExtension extends SprottyLspEditVscodeExtension {

    constructor(context: vscode.ExtensionContext) {
        super('erdiagram', context);
    }

    override registerCommands() {
        super.registerCommands();
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.model.newEmpty", (...commandArgs: any[]) => {
                newEmptyModel();
            }));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.model.newSample", (...commandArgs: any[]) => {
                newSampleModel();
            }));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.sql.proxy", generateSqlHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.mongodb.proxy", generateMongoDbHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.neo4j.proxy", generateNeo4jHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.cassandradb.proxy", generateCassandraDbHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.postgres.proxy", generatePostgresHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.oracle.proxy", generateOracleHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.mysql.proxy", generateMySqlHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.mssql.proxy", generateMsSqlHandler));
        this.context.subscriptions.push(vscode.commands.registerCommand("erdiagram.generate.db2.proxy", generateDb2Handler));
    }

    protected getDiagramType(commandArgs: any[]): string | undefined {
        if (commandArgs.length === 0 || (commandArgs[0] instanceof vscode.Uri && commandArgs[0].path.endsWith('.erd'))) {
            return "erdiagram-diagram";
        }
        return undefined;
    }

    createWebView(identifier: SprottyDiagramIdentifier): SprottyWebview {
        const webview = new ERDiagramWebview({
            extension: this,
            identifier,
            localResourceRoots: [this.getExtensionFileUri('pack'), this.getExtensionFileUri('node_modules')],
            scriptUri: this.getExtensionFileUri('pack', 'webview.js'),
            singleton: true
        });
        webview.addActionHandler(WorkspaceEditActionHandler);
        webview.addActionHandler(LspLabelEditActionHandler);
        this.singleton = webview;
        return webview;
    }

    protected activateLanguageClient(context: vscode.ExtensionContext): LanguageClient {
        const executable = process.platform === 'win32' ? 'erdiagram-language-server.bat' : 'erdiagram-language-server';
        const languageServerPath = path.join('server', 'erdiagram-language-server', 'bin', executable);
        let serverLauncher;
        if (process.platform === 'win32') {
            serverLauncher = '"' + context.asAbsolutePath(languageServerPath) + '"';
        } else {
            serverLauncher = context.asAbsolutePath(languageServerPath);
        }
        const serverOptions: ServerOptions = {
            run: {
                command: serverLauncher,
                args: ['-trace'],
                options: {
                    shell: process.platform === 'win32'
                }
            },
            debug: {
                command: serverLauncher,
                args: ['-trace'],
                options: {
                    shell: process.platform === 'win32'
                }
            }
        };
        const clientOptions: LanguageClientOptions = {
            documentSelector: [{
                scheme: 'file',
                language: 'erdiagram'
            }],
            synchronize: {
                fileEvents: vscode.workspace.createFileSystemWatcher('**/*.erd')
            }
        };
        const languageClient = new LanguageClient('erdiagramLanguageClient', 'ERDiagram Language Server', serverOptions, clientOptions);
        context.subscriptions.push(languageClient.start());
        return languageClient;
    }

}
