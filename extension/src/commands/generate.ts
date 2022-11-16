import { window, Uri, commands } from "vscode";

export const sqlKind = "sql";
export const generateSqlServerCommand = "erdiagram.generate.sql";

export const handleGenerateMessage = async (generateKind: string, fileUri: Uri) => {
    if (generateKind === sqlKind) {
        generateSqlHandler(fileUri);
    } else {
        window.showErrorMessage("Unknown generateType '" + generateKind + "' in message.");
    }
};

export const generateSqlHandler = async (fileUri: Uri) => {
    const response: string | undefined = await commands.executeCommand(generateSqlServerCommand, fileUri.toString());
    if (response) {
        if (response.startsWith('Error')) {
            window.showErrorMessage(response);
        } else {
            // TODO: Check if generated file exists in folder and provide button to open file in info message
            window.showInformationMessage(response);
        }
    }
};