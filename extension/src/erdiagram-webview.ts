import * as vscode from 'vscode';
import { Uri, Webview } from "vscode";
import { SprottyWebviewOptions } from "sprotty-vscode";
import { SprottyLspWebview } from "sprotty-vscode/lib/lsp";


export class ERDiagramWebview extends SprottyLspWebview {

    constructor(protected options: SprottyWebviewOptions) {
        super(options);
    }

    protected initializeWebview(webview: vscode.Webview, title?: string) {
        const extensionUri = this.extension.context.extensionUri;
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode/codicons', 'dist', 'codicon.css'));
        const toolkitUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'node_modules', '@vscode', 'webview-ui-toolkit', 'dist', 'toolkit.js'));
        webview.html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, height=device-height">
                    <title>${title}</title>
                    <link
                        rel="stylesheet" href="https://use.fontawesome.com/releases/v5.6.3/css/all.css"
                        integrity="sha384-UHRtZLI+pbxtHCWp1t77Bi1L4ZtiqrqD80Kn4Z8NTSRyMA2Fd33n5dQ8lWUE00s/"
                        crossorigin="anonymous">
                    <link href="${codiconsUri}" rel="stylesheet" />    
                    <script type="module" src="${toolkitUri}"></script>
                </head>
                <body>
                    <div id="${this.diagramIdentifier.clientId}_container" style="height: 100%;"></div>
                    <script src="${webview.asWebviewUri(this.scriptUri).toString()}"></script>
                </body>
            </html>`;
    }

    getUri(webview: Webview, extensionUri: Uri, ...pathList: string[]) {
        return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
    }
}