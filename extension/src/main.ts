import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { ERDiagramLspVscodeExtension } from './erdiagram-lsp-extension';

let extension: SprottyLspVscodeExtension;

/**
 * Called when the VS code extension is activated.
 * Creates a new Sprotty LSP edit extension and opens an information message.
 *
 * @param context extension context
 */
export function activate(context: vscode.ExtensionContext) {
    extension = new ERDiagramLspVscodeExtension(context);
    const openHelp = 'Open Help';
    vscode.window.showInformationMessage('ER Extension is active.', ...[openHelp])
        .then((selection) => {
            if (selection === openHelp) {
                vscode.env.openExternal(vscode.Uri.parse('https://github.com/borkdominik/bigER/wiki/Language'));
            }
        });
}

export function deactivate(): Thenable<void> {
    if (!extension) {
        return Promise.resolve(undefined);
    }

    return extension.deactivateLanguageClient();
}