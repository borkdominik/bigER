import { commands, Selection, window, workspace } from 'vscode';
export const command = 'erdiagram.model.new';

export default async function newModel() {
    const fileUri = await window.showSaveDialog({
        saveLabel: 'Save as',
        filters: {
            "ER Diagram file": ["erd"]
        }
    });
    if (fileUri) {
        const writeData = Buffer.from('erdiagram Model', 'utf8');
        await workspace.fs.writeFile(fileUri, writeData);
        const document = await workspace.openTextDocument(fileUri);
        const editor = await window.showTextDocument(fileUri);
        editor.selection = new Selection(document.positionAt(10),
            document.positionAt(17));
        commands.executeCommand('erdiagram.diagram.open');
    }


}