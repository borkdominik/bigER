import * as os from 'os';
// import * as path from 'path';
import { window, Uri, commands, workspace } from "vscode";

export const IMPORT_COMMAND = "erdiagram.import.sql";

export const importSqlHandler = async () => {
    const homeUri = Uri.file(os.homedir());
	const defaultUri = workspace.workspaceFolders && workspace.workspaceFolders.length > 0
		? Uri.file(workspace.workspaceFolders[0].uri.fsPath)
		: homeUri;

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

	const fileUri = result[0];
    
    if (!fileUri || !fileUri.fsPath.endsWith('sql')) {
        window.showErrorMessage("Error! Invalid file.");
        return;
    }

    // await commands.executeCommand(IMPORT_COMMAND, fileUri.toString());

    const response: string | undefined = await commands.executeCommand(IMPORT_COMMAND, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            window.showInformationMessage(response);
        }
    }
    
};