import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { ERDiagramLspVscodeExtension } from './erdiagram-lsp-extension';

let extension: SprottyLspVscodeExtension;

export function activate(context: vscode.ExtensionContext) {
    extension = new ERDiagramLspVscodeExtension(context);
    vscode.window.showInformationMessage('ER Extension is active.');
}

export function deactivate(): Thenable<void> {
    if (!extension) {
        return Promise.resolve(undefined);
    }
    
    return extension.deactivateLanguageClient();
}