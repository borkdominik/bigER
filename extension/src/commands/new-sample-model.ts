import { commands, Selection, window, workspace } from 'vscode';
export const command = 'erdiagram.model.newSample';

export default async function newSampleModel() {
    const fileUri = await window.showSaveDialog({
        saveLabel: 'Save as',
        filters: {
            "ER Diagram file": ["erd"]
        }
    });
    if (fileUri) {
        const sampleModel = [
            "erdiagram Model\n",
            "notation=default",
            "generate=off\n",
            "entity A {",
            "   id key",
            "}\n",
            "entity B {",
            "   id key",
            "}\n",
            "relationship Rel {",
            "   A -> B",
            "}"
        ].join("\n");
        const writeData = Buffer.from(sampleModel, 'utf8');
        await workspace.fs.writeFile(fileUri, writeData);
        const document = await workspace.openTextDocument(fileUri);
        const editor = await window.showTextDocument(fileUri);
        editor.selection = new Selection(document.positionAt(10), document.positionAt(16));
        commands.executeCommand('erdiagram.diagram.open');
    }
}