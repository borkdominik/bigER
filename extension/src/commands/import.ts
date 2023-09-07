import { window, Uri, commands, workspace } from "vscode";
import * as os from 'os';

export const IMPORT_COMMAND = "erdiagram.import.sql";

export const importSqlHandler = async () => {
    // verify .erd file is currently open
    const activeTextEditor = window.activeTextEditor;
    const erdFileUri = activeTextEditor?.document?.languageId === 'erdiagram' 
        ? activeTextEditor.document.uri
        : undefined;
    if (!erdFileUri || erdFileUri === undefined) {
        window.showErrorMessage("Error! ERD File has to be open");
        return;
    }

    // set up default URI for file selection
    const defaultUri = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
		? Uri.file(workspace.workspaceFolders[0].uri.fsPath)
		: Uri.file(os.homedir());
    
    // open file selection dialog
    const result = await window.showOpenDialog({
		canSelectFiles: true,
		canSelectFolders: false,
		canSelectMany: false,
		defaultUri,
		openLabel: 'Import SQL'
	});
	if (!result || result.length === 0) {
		return;
	}
    
    const sqlFileUri = result[0];
    // verify file extension of selected file
    if (!sqlFileUri?.fsPath.endsWith('sql')) {
        window.showErrorMessage("Error! Invalid file.");
        return;
    }
    
    // send command with .erd file URI (param 1) and .sql file URI (param 2) to server
    const response = await commands.executeCommand<string>(IMPORT_COMMAND, erdFileUri.toString(), sqlFileUri.toString());
    if (response === undefined) {
        window.showErrorMessage("Failed to execute command!");
    } else if (response.startsWith('Error')) {
        window.showErrorMessage(response);
    } else {
        window.showInformationMessage(response);
    }
};