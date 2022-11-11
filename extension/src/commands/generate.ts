import { window, Uri, commands } from "vscode";

export async function generateSql(uri?: Uri) {
    // TODO: Merge with generate() function in erdiagram-webview.ts or improve this
    if (uri) {
        const response: string | undefined = await commands.executeCommand('erdiagram.generate.sql', uri.toString());
        if (response) {
            if (response.startsWith('Error')) {
                window.showErrorMessage(response);
            } else {
                window.showInformationMessage(response);
            }
        }
    } else {
        const activeEditor = window.activeTextEditor;
        if (activeEditor && activeEditor.document && activeEditor.document.languageId === 'erdiagram') {
            const uri = activeEditor.document.uri;
            if (uri instanceof Uri) {
                const response: string | undefined = await commands.executeCommand('erdiagram.generate.sql', uri.toString());
                if (response) {
                    if (response.startsWith('Error')) {
                        window.showErrorMessage(response);
                    } else {
                        window.showInformationMessage(response);
                    }
                }
            }
        }
    }
}