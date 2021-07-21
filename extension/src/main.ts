import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { ERDiagramLspVscodeExtension } from './erdiagram-lsp-extension';

let extension: SprottyLspVscodeExtension;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('ER Diagram Extension activated');
    extension = new ERDiagramLspVscodeExtension(context);
    
    //const provider = new ERViewProvider(context.extensionUri);
    //context.subscriptions.push(
	//	vscode.window.registerWebviewViewProvider(ERViewProvider.viewType, provider));
}

export function deactivate(): Thenable<void> {
    if (!extension)
       return Promise.resolve(undefined);
    return extension.deactivateLanguageClient();
}

/**
 * TODO: Remove this
class ERViewProvider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'erd.explorer';

    //private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        
            //this._view = webviewView;

            webviewView.webview.options = {
                enableScripts: true,
                localResourceRoots: [
                    this._extensionUri
                ]
            };

            webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

		    webviewView.webview.onDidReceiveMessage(data => {
			    switch (data.type) {
				    case 'colorSelected':
					{
						vscode.window.activeTextEditor?.insertSnippet(new vscode.SnippetString(`#${data.value}`));
						break;
					}
			    }
		    });
    }
    
    private getHtmlForWebview(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

        // Do the same for the stylesheet.
        //const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
        //const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'view.css'));

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                    Use a content security policy to only allow loading images from https or from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                
                <title>ER Diagram Menu</title>
            </head>
            <body>
                <ul class="color-list">
                </ul>
                <button class="add-color-button">Fit to Screen</button>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }



}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
 */