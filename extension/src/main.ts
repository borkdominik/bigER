import * as vscode from 'vscode';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
import { ERDiagramLspVscodeExtension } from './erdiagram-lsp-extension';

let extension: SprottyLspVscodeExtension;

export function activate(context: vscode.ExtensionContext) {
    vscode.window.showInformationMessage('ER Diagram Extension activated');
    extension = new ERDiagramLspVscodeExtension(context);
}

export function deactivate(): Thenable<void> {
    if (!extension) {
        return Promise.resolve(undefined);
    }
    
    return extension.deactivateLanguageClient();
}